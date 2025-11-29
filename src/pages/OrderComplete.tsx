import React from "react";

export default function OrderComplete() {
  return (
    <div style={{padding: 32}}>
      <h1 style={{color: "white"}}>Order Confirmed</h1>
      <p style={{color: "lavender"}}>
        Thanks! Your custom print is being prepared. You can close this tab or start a new portrait.
      </p>
      <a
        href="/"
        style={{display: "inline-block", marginTop: 16, padding: "12px 18px", background: "#F4953E", color: "#111", borderRadius: 12, fontWeight: 800, textDecoration: "none"}}
      >
        Back to Home
      </a>
    </div>
  );
}