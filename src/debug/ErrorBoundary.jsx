import { Component } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { log } from "../tauriLog";
import { isTauri } from "@/tauriEnv";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  async componentDidCatch(error, info) {
    log.error(`[ErrorBoundary] ${error?.stack || error}`);
    console.error(error, info);
  }

  openDevTools() {
    if (!isTauri()) {
      return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    }
    try {
      getCurrentWebviewWindow().openDevtools();
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
