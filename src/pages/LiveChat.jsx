import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LiveChat.css';

const QUICK_PROMPTS = [
  'How do I check a plant?',
  'What does the confidence score mean?',
  'Where can I find treatment advice?',
];

const WELCOME_MESSAGE = name => ({
  id: 'welcome',
  from: 'assistant',
  text: `Hello${name ? `, ${name}` : ''}. I can help you find your way around AgriDiag, understand a diagnosis, or learn how to get a clearer plant-health check. What would you like to know?`,
  time: new Date(),
});

function getAssistantReply(message) {
  const text = message.trim().toLowerCase();

  if (/^(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
    return 'Hello! What would you like help with today? I can explain plant checks, diagnosis results, treatment information, or your account tools.';
  }
  if (/\b(diagnos|upload|image|photo|picture)\b/.test(text) || /\b(check|scan)\b.*\b(plant|leaf)\b/.test(text)) {
    return 'For a plant-health check, open Diagnose a Plant and upload a clear JPEG or PNG image of one affected leaf. Use natural light, keep the leaf in focus, and include the full affected area. The result is an AI-assisted suggestion, not a confirmed diagnosis.';
  }
  if (/\b(disease|symptom|plant database|plant library)\b/.test(text)) {
    return 'The Plant Library contains plant profiles and common disease information, including symptoms, causes, treatment, and prevention. Browse it to compare what you are seeing with the available guidance.';
  }
  if (/\b(history|past|previous|record)\b/.test(text)) {
    return 'Your diagnosis history keeps your previous plant checks together. Open History to search and review saved results.';
  }
  if (/\b(confidence|score|percent|accuracy|certain)\b/.test(text)) {
    return 'The confidence score describes how strongly the image model matched its prediction. It is not a guarantee of accuracy. A low score can mean the image is unclear or the plant condition is outside the model’s coverage; try a sharper photo and consult an agricultural professional before making important decisions.';
  }
  if (/\b(treat|treatment|cure|remedy|fix|manage|preven)\b/.test(text)) {
    return 'Open the diagnosis result or browse the Plant Library for available treatment and prevention information. Recommendations depend on the identified plant and condition. Confirm any chemical or high-impact treatment with local agricultural guidance.';
  }
  if (/\b(help|support|guide|what can you)\b/.test(text)) {
    return 'I can help you navigate plant checks, diagnosis confidence, saved history, and disease information. Choose one of the suggested questions or describe what you are trying to do.';
  }
  return 'I can help with AgriDiag features and general plant-health guidance, but I may not know the answer to every crop question. Try the Plant Library, or run an AI-assisted check with a clear leaf photo. For urgent or high-impact decisions, speak with a qualified agricultural professional.';
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function LiveChat() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0] || '';
  const [messages, setMessages] = useState([WELCOME_MESSAGE(firstName)]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const sendMessage = async message => {
    const text = message.trim();
    if (!text || typing) return;

    setMessages(current => [
      ...current,
      { id: `user-${Date.now()}`, from: 'user', text, time: new Date() },
    ]);
    setInput('');
    setTyping(true);

    await new Promise(resolve => window.setTimeout(resolve, 450));

    setMessages(current => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        from: 'assistant',
        text: getAssistantReply(text),
        time: new Date(),
      },
    ]);
    setTyping(false);
    inputRef.current?.focus();
  };

  const handleSubmit = event => {
    event.preventDefault();
    sendMessage(input);
  };

  const startOver = () => {
    setMessages([WELCOME_MESSAGE(firstName)]);
    setInput('');
    setTyping(false);
    inputRef.current?.focus();
  };

  return (
    <main className="support-page">
      <div className="support-container">
        <header className="support-heading">
          <div>
            <span className="support-kicker">GROWER SUPPORT</span>
            <h1>Let’s figure it out.</h1>
            <p>Quick guidance for plant health questions and using AgriDiag.</p>
          </div>
          <div className="support-service-note">
            <span className="support-availability-dot" />
            <span>Automated guide · Available now</span>
          </div>
        </header>

        <div className="support-layout">
          <section className="conversation-panel" aria-label="AgriDiag assistant conversation">
            <header className="conversation-header">
              <div className="conversation-agent-mark" aria-hidden="true">A</div>
              <div className="conversation-agent">
                <strong>AgriDiag guide</strong>
                <span>Answers about plant checks and the platform</span>
              </div>
              <button type="button" className="conversation-reset" onClick={startOver} disabled={typing}>
                Start over
              </button>
            </header>

            <div className="conversation-messages" aria-live="polite">
              <div className="conversation-date-divider"><span>Today</span></div>
              {messages.map(message => (
                <article
                  key={message.id}
                  className={`conversation-message ${message.from === 'user' ? 'from-user' : 'from-assistant'}`}
                >
                  {message.from === 'assistant' && (
                    <span className="conversation-message-mark" aria-hidden="true">A</span>
                  )}
                  <div className="conversation-message-body">
                    {message.from === 'assistant' && (
                      <span className="conversation-sender">AgriDiag guide</span>
                    )}
                    <p>{message.text}</p>
                    <time dateTime={message.time.toISOString()}>{formatTime(message.time)}</time>
                  </div>
                </article>
              ))}
              {typing && (
                <div className="conversation-message from-assistant" role="status" aria-label="Guide is replying">
                  <span className="conversation-message-mark" aria-hidden="true">A</span>
                  <div className="conversation-typing" aria-hidden="true">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="conversation-prompts">
              <span className="conversation-prompts-label">NOT SURE WHERE TO START?</span>
              <div className="conversation-prompt-list">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    type="button"
                    key={prompt}
                    className="conversation-prompt"
                    disabled={typing}
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form className="conversation-composer" onSubmit={handleSubmit}>
              <label className="support-visually-hidden" htmlFor="chat-input">Message the AgriDiag guide</label>
              <textarea
                ref={inputRef}
                id="chat-input"
                rows="1"
                maxLength={1000}
                placeholder="Ask a question about your plants…"
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                type="submit"
                className="conversation-send"
                disabled={!input.trim() || typing}
                aria-label="Send message"
              >
                <span>Send</span><span aria-hidden="true">↗</span>
              </button>
              <span className="conversation-composer-hint">Enter to send · Shift + Enter for a new line</span>
            </form>
          </section>

          <aside className="support-sidebar">
            <section className="support-sidebar-card support-sidebar-intro">
              <span className="support-kicker">HERE TO HELP</span>
              <h2>A useful next step starts with a good question.</h2>
              <p>
                Get help finding the right AgriDiag tool, understanding a result, or learning
                what information to check next.
              </p>
            </section>

            <section className="support-sidebar-card">
              <span className="support-kicker">EXPLORE AGRIDIAG</span>
              <Link className="support-resource-link" to="/diagnose">
                <span><strong>Check a plant</strong><small>Upload a leaf photo</small></span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link className="support-resource-link" to="/plants">
                <span><strong>Browse the plant library</strong><small>Symptoms and care guidance</small></span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link className="support-resource-link" to="/history">
                <span><strong>Review your history</strong><small>Return to saved results</small></span>
                <span aria-hidden="true">↗</span>
              </Link>
            </section>

            <p className="support-disclaimer">
              This guide uses automated, topic-based replies and is not a live expert service.
              AI-assisted information is not a confirmed diagnosis. Consult a qualified
              agricultural professional about important crop decisions.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
