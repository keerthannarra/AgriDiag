import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BOT_RESPONSES = {
  hello: "Hello! I'm AgriBot 🌿, your agricultural assistant. I can help with plant disease questions, diagnosis guidance, and platform support. What would you like to know?",
  diagnose: "To diagnose a plant: Go to the **Diagnose** page, upload a clear photo of the affected leaf, and click Analyze. Results appear in under 30 seconds!",
  disease: "For disease information, check our **Plant Database** — it contains detailed info on symptoms, causes, treatment, and prevention for 38+ diseases.",
  history: "You can view, search, and delete all your previous diagnoses in the **History** page.",
  confidence: "The confidence score shows how certain the AI is. Scores above 80% are generally reliable. Below 60% — we recommend uploading a clearer image or consulting an expert.",
  treatment: "Treatment recommendations are shown on your **Results** page after diagnosis. We also have detailed treatment info in the Plant Database.",
  help: "I can help with:\n• How to diagnose a plant 🔬\n• Understanding disease results 📊\n• Treatment recommendations 💊\n• Account and navigation help 🧭\n\nWhat would you like to know?",
  default: "I understand you're asking about plant health. For the most accurate advice, I recommend uploading a leaf image for AI diagnosis, or checking our Plant Database. Would you like guidance on either?",
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.match(/hi|hello|hey/)) return BOT_RESPONSES.hello;
  if (lower.match(/diagnos|upload|image|photo/)) return BOT_RESPONSES.diagnose;
  if (lower.match(/disease|symptom|plant database/)) return BOT_RESPONSES.disease;
  if (lower.match(/history|past|previous/)) return BOT_RESPONSES.history;
  if (lower.match(/confidence|score|percent|accuracy/)) return BOT_RESPONSES.confidence;
  if (lower.match(/treat|cure|remedy|fix/)) return BOT_RESPONSES.treatment;
  if (lower.match(/help|support|guide/)) return BOT_RESPONSES.help;
  return BOT_RESPONSES.default;
}

export default function LiveChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm AgriBot, your agricultural assistant. How can I help you today?`, time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const reply = getBotReply(input);
    setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: reply, time: new Date() }]);
    setTyping(false);
  };

  const fmtTime = d => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const QUICK = ['How do I diagnose a plant?', 'What does confidence mean?', 'Help with treatment info'];

  return (
    <div className="page page-sm">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page-hero" style={{ paddingBottom: 'var(--sp-8)' }}>
          <span className="section-label">Support</span>
          <h1>Live Chat</h1>
          <p>AI-assisted agricultural support. Ask about diagnoses, plant diseases, or platform help.</p>
        </div>

        <div className="card-glass" style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: 'var(--sp-4) var(--sp-6)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', background: 'var(--bg-card)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌿</div>
            <div>
              <div style={{ fontWeight: 700 }}>AgriBot</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)' }}>● AI Assistant · Online</div>
            </div>
            <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>AI Powered</span>
          </div>

          {/* Messages */}
          <div style={{ height: 420, overflowY: 'auto', padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', background: 'rgba(0,0,0,0.1)' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-bubble ${m.from}`}>{m.text}</div>
                <div className="chat-meta">{fmtTime(m.time)}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <div className="chat-bubble bot" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
                  <span style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => <span key={i} style={{ width:7,height:7,borderRadius:'50%',background:'var(--text-muted)',animation:'pulse 1.2s ease infinite',animationDelay:`${i*0.2}s`,display:'inline-block' }} />)}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: 'var(--sp-3) var(--sp-5)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', background: 'var(--bg-card)' }}>
            {QUICK.map(q => (
              <button key={q} className="btn btn-outline btn-sm" onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: 'var(--sp-4) var(--sp-5)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-3)', background: 'var(--bg-card)' }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              id="chat-input"
              placeholder="Type your message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            />
            <button className="btn btn-primary" onClick={send} disabled={!input.trim() || typing} id="chat-send">
              Send →
            </button>
          </div>
        </div>

        <div className="alert alert-info mt-6">
          <span>ℹ️</span>
          <div>AgriBot is an AI assistant. For critical crop decisions, always consult a qualified agricultural expert.</div>
        </div>
      </div>
    </div>
  );
}
