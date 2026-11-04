"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message === "Already subscribed" ? "You're already subscribed." : "Subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to subscribe. Try again.");
    }
  }

  return (
    <div className="subscribe-box">
      <div className="subscribe-label">DAILY NEWSLETTER</div>
      {status === "success" ? (
        <div className="subscribe-success">{message}</div>
      ) : (
        <form onSubmit={handleSubmit} className="subscribe-form">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            className="subscribe-input"
            required
          />
          <button
            type="submit"
            className="subscribe-btn"
            disabled={status === "loading"}
          >
            {status === "loading" ? "..." : "SUBSCRIBE"}
          </button>
        </form>
      )}
      {status === "error" && <div className="subscribe-error">{message}</div>}
    </div>
  );
}
