@import "tailwindcss";

:root {
  /* RESTORED: Original Color Palette */
  --brand-dark-purple: #351B41;
  --brand-accent-orange: #F4953E;
  --brand-soft-white: #FFFAFF;
  --brand-muted-lavender: #87799E;
  --brand-pale-rose: #513369;

  /* Fonts */
  --font-heading: "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: "Lato", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --radius-card: 18px;
  --shadow-soft: 0 18px 45px rgba(0, 0, 0, 0.2);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--brand-dark-purple);
  /* RESTORED: Original Radial Gradient Background */
  background: radial-gradient(circle at top left, #4a2b57 0%, var(--brand-dark-purple) 60%);
  color: var(--brand-soft-white);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6, .font-heading {
  font-family: var(--font-heading);
  font-weight: 800;
}

/* RESTORED: 3D Hover Effects (Standard CSS to avoid Tailwind conflicts) */
.interactive-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.interactive-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(244, 149, 62, 0.4); /* Orange glow */
  filter: brightness(1.1);
  z-index: 10;
}

.interactive-card:active {
  transform: scale(0.98);
  filter: brightness(0.95);
}

/* Generic Card Style */
.app-card {
  background: rgba(255, 250, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
  color: var(--brand-soft-white);
}