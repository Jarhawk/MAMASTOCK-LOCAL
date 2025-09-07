import { Component } from "react";
import { getCurrent } from "@tauri-apps/api/window";
import { appendLog } from "./logger";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  async componentDidCatch(error, info) {
    await appendLog(`[ErrorBoundary] ${error?.stack || error}`);
    console.error(error, info);
  }

  openDevTools() {
    try {
      getCurrent().openDevtools();
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-4 p-4 text-center">
          <h1 className="text-lg font-bold">Une erreur est survenue</h1>
          <p>Ouvrez les DevTools pour plus de détails.</p>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => this.openDevTools()}
          >
            Ouvrir DevTools
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
