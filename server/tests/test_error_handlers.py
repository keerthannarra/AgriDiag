import asyncio
import io
import json
import unittest

from fastapi.exceptions import RequestValidationError
from PIL import Image
from starlette.exceptions import HTTPException
from starlette.requests import Request

from app.errors import (
    DiagnosisFailedError,
    InvalidImageError,
    ModelUnavailableError,
    UnsupportedImageError,
    agridiag_error_handler,
    database_error_handler,
    http_error_handler,
    unexpected_error_handler,
    validation_error_handler,
)
from app.ml.preprocessing import validate_image
from sqlalchemy.exc import SQLAlchemyError


def make_request(path="/api/test"):
    encoded_path = path.encode()
    request = Request({
        "type": "http",
        "http_version": "1.1",
        "method": "POST",
        "scheme": "http",
        "path": path,
        "raw_path": encoded_path,
        "query_string": b"",
        "headers": [],
        "client": ("test", 1234),
        "server": ("test", 80),
        "state": {"request_id": "test-request-id"},
    })
    return request


def response_json(response):
    return json.loads(response.body)


class ErrorHandlerTests(unittest.TestCase):
    def test_internal_http_exception_is_safe_and_status_is_preserved(self):
        response = asyncio.run(http_error_handler(
            make_request(),
            HTTPException(
                status_code=500,
                detail="SQL failure at /private/database/path with internal details",
            ),
        ))

        body = response_json(response)
        self.assertEqual(response.status_code, 500)
        self.assertEqual(body["code"], "SERVER_ERROR")
        self.assertIn("Please try again", body["detail"])
        self.assertNotIn("/private/database/path", response.body.decode())
        self.assertEqual(body["request_id"], "test-request-id")

    def test_login_and_validation_errors_are_actionable(self):
        login_response = asyncio.run(http_error_handler(
            make_request("/api/auth/login"),
            HTTPException(status_code=401, detail="Invalid email or password"),
        ))
        validation_response = asyncio.run(validation_error_handler(
            make_request(),
            RequestValidationError([{
                "loc": ("body", "email"),
                "msg": "invalid email value",
                "type": "value_error",
            }]),
        ))

        self.assertEqual(login_response.status_code, 401)
        self.assertEqual(response_json(login_response)["code"], "INVALID_CREDENTIALS")
        validation_body = response_json(validation_response)
        self.assertEqual(validation_response.status_code, 422)
        self.assertEqual(validation_body["errors"], {"email": "Please check this field."})
        self.assertNotIn("invalid email value", validation_response.body.decode())

    def test_domain_and_unexpected_errors_do_not_leak_exception_text(self):
        domain_response = asyncio.run(agridiag_error_handler(
            make_request(),
            DiagnosisFailedError(),
        ))
        unexpected_response = asyncio.run(unexpected_error_handler(
            make_request(),
            RuntimeError("secret path /srv/model and traceback details"),
        ))

        self.assertEqual(response_json(domain_response)["code"], "DIAGNOSIS_FAILED")
        self.assertEqual(unexpected_response.status_code, 500)
        self.assertNotIn("/srv/model", unexpected_response.body.decode())
        self.assertNotIn("traceback details", unexpected_response.body.decode())

    def test_image_and_model_failures_have_distinct_safe_codes(self):
        invalid_image = asyncio.run(agridiag_error_handler(make_request(), InvalidImageError()))
        unsupported_image = asyncio.run(agridiag_error_handler(make_request(), UnsupportedImageError()))
        unavailable_model = asyncio.run(agridiag_error_handler(
            make_request(),
            ModelUnavailableError(),
        ))

        self.assertEqual(response_json(invalid_image)["code"], "INVALID_IMAGE")
        self.assertEqual(response_json(unsupported_image)["code"], "UNSUPPORTED_FILE_TYPE")
        self.assertEqual(response_json(unavailable_model)["code"], "MODEL_UNAVAILABLE")
        self.assertNotIn("model path", unavailable_model.body.decode())

    def test_image_validation_distinguishes_corrupt_and_unsupported_files(self):
        with self.assertRaises(InvalidImageError):
            validate_image(b"not an image")

        unsupported_image = io.BytesIO()
        Image.new("RGB", (2, 2)).save(unsupported_image, format="BMP")
        with self.assertRaises(UnsupportedImageError):
            validate_image(unsupported_image.getvalue())

    def test_database_failure_is_not_returned_to_client(self):
        response = asyncio.run(database_error_handler(
            make_request(),
            SQLAlchemyError("query secret /private/database.sql"),
        ))

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response_json(response)["code"], "SERVICE_UNAVAILABLE")
        self.assertNotIn("/private/database.sql", response.body.decode())


if __name__ == "__main__":
    unittest.main()
