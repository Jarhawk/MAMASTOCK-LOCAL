import React from "react";import { isTauri } from "@/lib/tauriEnv";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Log somewhere if needed
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui" }}>
          <h2>Une erreur est survenue</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.error)}
          </pre>
        </div>);

    }
    return this.props.children;
  }
}