"use client";

import { useState } from "react";
import { profile } from "../lib/profile";

export function ContactDetails() {
  const [status, setStatus] = useState("");
  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus("Copy unavailable. Select the address to copy it manually.");
    }
  }
  return (
    <div className="contact-details">
      <h2>Contact</h2>
      <dl>
        {profile.links.map(({ label, href }) => {
          const value = href.replace(/^mailto:/, "");
          return (
            <div className="contact-detail" key={label}>
              <dt>{label}</dt>
              <dd>
                <a href={href}>{value}</a>
                <button
                  type="button"
                  aria-label={`Copy ${label}`}
                  onClick={() => void copy(label, value)}
                >
                  Copy
                </button>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="contact-copy-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
