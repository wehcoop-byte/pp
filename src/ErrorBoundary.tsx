// src/ErrorBoundary.tsx
import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // TODO: push to your logger (Sentry, GCP, whatever)
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black/80 text-white p-8">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-white/70 mb-6">{this.state.message || "An unexpected error occurred."}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="px-4 py-2 rounded-xl bg-[var(--brand-accent-orange,#F4953E)] text-black font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
