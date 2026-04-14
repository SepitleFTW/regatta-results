import { useState } from 'react';

const PRESETS = ["20", "50", "100", "200"];
const MERCHANT_ID = "34560187";
const MERCHANT_KEY = "a1ae0boxxeipe";
const ITEM_NAME = "Regatta Results SA Donation";

function submitPayFast(amount) {
  const fields = {
    merchant_id: MERCHANT_ID,
    merchant_key: MERCHANT_KEY,
    amount: parseFloat(amount).toFixed(2),
    item_name: ITEM_NAME,
    return_url: window.location.origin + '/?donated=1',
    cancel_url: window.location.origin + '/#donate',
  };
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.payfast.co.za/eng/process';
  form.target = '_blank';
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export default function DonateSection() {
  const [amount, setAmount] = useState("50");
  const [custom, setCustom] = useState("");

  const final = amount === "custom" ? custom : amount;
  const valid = final && !isNaN(parseFloat(final)) && parseFloat(final) >= 5;

  function handleDonate() {
    if (!valid) return;
    submitPayFast(final);
  }

  return (
    <section id="donate" style={{
      background: "#030a03", borderTop: "1px solid #1a3a1a",
      padding: "80px 24px", textAlign: "center"
    }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <span style={{ color: "#d4a017", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Keep the oars moving</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#f5f0e0", fontSize: "clamp(2rem,5vw,3rem)", margin: "16px 0 16px" }}>Support Regatta Results</h2>
        <p style={{ color: "#6b7c6b", lineHeight: 1.8, marginBottom: 40, fontFamily: "'DM Sans', sans-serif" }}>
          This platform is maintained by volunteers passionate about South African rowing. Your donation helps keep it free, fast, and up to date for clubs, parents, coaches, and athletes across the country.
        </p>

        <div style={{ background: "#0f220f", border: "1px solid #1a3a1a", borderRadius: 20, padding: "36px" }}>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {PRESETS.map(p => (
              <button key={p} onClick={() => { setAmount(p); setCustom(""); }} style={{
                background: amount === p ? "#d4a017" : "#0a1a0a",
                color: amount === p ? "#030a03" : "#8a9e8a",
                border: `1px solid ${amount === p ? "#d4a017" : "#1a3a1a"}`,
                borderRadius: 10, padding: "10px 22px", fontSize: 15,
                fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s"
              }}>R{p}</button>
            ))}
            <button onClick={() => setAmount("custom")} style={{
              background: amount === "custom" ? "#d4a017" : "#0a1a0a",
              color: amount === "custom" ? "#030a03" : "#8a9e8a",
              border: `1px solid ${amount === "custom" ? "#d4a017" : "#1a3a1a"}`,
              borderRadius: 10, padding: "10px 22px", fontSize: 15,
              fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s"
            }}>Custom</button>
          </div>

          {amount === "custom" && (
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="Enter amount (ZAR)"
              style={{
                background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 10,
                padding: "10px 16px", color: "#e8e0c8", fontSize: 15,
                fontFamily: "'DM Mono', monospace", width: "100%", marginBottom: 20,
                outline: "none", boxSizing: "border-box",
              }}
            />
          )}

          <button
            onClick={handleDonate}
            disabled={!valid}
            style={{
              background: valid ? "linear-gradient(135deg, #92400e, #d4a017)" : "#1a3a1a",
              color: valid ? "#fff" : "#4a6b4a",
              border: "none", borderRadius: 12,
              padding: "16px 40px", fontSize: 16, fontWeight: 700,
              cursor: valid ? "pointer" : "default",
              fontFamily: "'DM Sans', sans-serif",
              width: "100%", marginTop: 8,
              boxShadow: valid ? "0 8px 32px rgba(212,160,23,0.2)" : "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (valid) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(212,160,23,0.3)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = valid ? "0 8px 32px rgba(212,160,23,0.2)" : "none"; }}
          >
            {valid ? `Donate R${final} via PayFast` : "Select an amount"}
          </button>

          <p style={{ color: "#2d5a1b", fontSize: 12, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
            Secure payment · Cards, EFT, SnapScan & more · Minimum R5
          </p>
        </div>
      </div>
    </section>
  );
}
