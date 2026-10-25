import logging
from uuid import uuid4

from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("agridiag.errors")


class AgriDiagError(Exception):
    def __init__(self, code: str, message: str, status_code: int):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


class InvalidImageError(AgriDiagError):
    def __init__(self):
        super().__init__(
            "INVALID_IMAGE",
            "We couldn't read this image. Please choose a clear JPEG or PNG image.",
            400,
        )


class UnsupportedImageError(AgriDiagError):
    def __init__(self):
        super().__init__(
            "UNSUPPORTED_FILE_TYPE",
            "This file type isn't supported. Please upload a JPEG or PNG image.",
            400,
        )


class ModelUnavailableError(AgriDiagError):
    def __init__(self):
        super().__init__(
            "MODEL_UNAVAILABLE",
            "Plant disease analysis is temporarily unavailable. Please try again later.",
            503,
        )


class DiagnosisFailedError(AgriDiagError):
    def __init__(self):
        super().__init__(
            "DIAGNOSIS_FAILED",
            "We couldn't complete the plant analysis. Please try again.",
            503,
        )


def _http_error_message(status_code: int, detail: object, path: str) -> tuple[str, str]:
    text = str(detail).lower() if isinstance(detail, (str, int)) else ""

    if status_code == 401:
        if path.endswith("/auth/login") or "invalid email or password" in text:
            return "INVALID_CREDENTIALS", "Incorrect email or password. Please try again."
        return "AUTHENTICATION_REQUIRED", "Your session has expired. Please sign in again."
    if status_code == 403:
        return "FORBIDDEN", "You don't have permission to perform this action."
    if status_code == 404:
        return "NOT_FOUND", "We couldn't find what you're looking for."
    if status_code == 409 or "email already registered" in text or "already exists" in text:
        return "DUPLICATE_RESOURCE", "An account with these details may already exist."
    if status_code == 413 or "too large" in text or "maximum size" in text:
        return "FILE_TOO_LARGE", "This file is too large. Please choose a smaller file."
    if status_code == 415 or "unsupported file type" in text or "unsupported format" in text:
        return "UNSUPPORTED_FILE_TYPE", "This file type isn't supported. Please upload a JPEG or PNG image."
    if status_code == 429:
        return "RATE_LIMITED", "You've made too many requests. Please wait a moment and try again."
    if status_code == 422:
        return "VALIDATION_ERROR", "Please check the highlighted fields and correct the information."
    if status_code == 400:
        if "unsupported file type" in text or "unsupported format" in text:
            return "UNSUPPORTED_FILE_TYPE", "This file type isn't supported. Please upload a JPEG or PNG image."
        if "invalid or corrupted image" in text or "empty file" in text:
            return "INVALID_IMAGE", "We couldn't read this image. Please choose a clear JPEG or PNG image."
        if "rating" in text:
            return "VALIDATION_ERROR", "Please choose a rating from 1 to 5."
        return "INVALID_REQUEST", "Please check your information and try again."
    if status_code >= 500:
        return "SERVER_ERROR", "Something went wrong on our end. Please try again shortly."
    return "REQUEST_FAILED", "We couldn't complete that request. Please try again."


def _error_response(request: Request, status_code: int, code: str, message: str, **extra) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None) or str(uuid4())
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder({
            "detail": message,
            "code": code,
            "request_id": request_id,
            **extra,
        }),
        headers={"X-Request-ID": request_id},
    )


async def agridiag_error_handler(request: Request, exc: AgriDiagError) -> JSONResponse:
    if exc.status_code >= 500:
        logger.error(
            "AgriDiag operation failed request_id=%s code=%s",
            getattr(request.state, "request_id", "unknown"),
            exc.code,
            exc_info=(type(exc), exc, exc.__traceback__),
        )
    return _error_response(request, exc.status_code, exc.code, exc.message)


async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    if exc.status_code >= 500:
        logger.error(
            "HTTP server error request_id=%s status=%s",
            getattr(request.state, "request_id", "unknown"),
            exc.status_code,
            exc_info=(type(exc), exc, exc.__traceback__),
        )
    code, message = _http_error_message(exc.status_code, exc.detail, request.url.path)
    response = _error_response(request, exc.status_code, code, message)
    if exc.headers:
        response.headers.update(exc.headers)
    return response


def _field_errors(errors: list[dict]) -> dict[str, str]:
    fields: dict[str, str] = {}
    for error in errors:
        location = error.get("loc", ())
        field = next((str(part) for part in reversed(location) if part != "body"), "form")
        fields[field] = "Please check this field."
    return fields


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    return _error_response(
        request,
        422,
        "VALIDATION_ERROR",
        "Please check the highlighted fields and correct the information.",
        errors=_field_errors(errors),
    )


async def database_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.error(
        "Database operation failed request_id=%s",
        getattr(request.state, "request_id", "unknown"),
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return _error_response(
        request,
        503,
        "SERVICE_UNAVAILABLE",
        "We couldn't access your information right now. Please try again shortly.",
    )


async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unexpected API failure request_id=%s",
        getattr(request.state, "request_id", "unknown"),
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return _error_response(
        request,
        500,
        "SERVER_ERROR",
        "Something went wrong on our end. Please try again shortly.",
    )
