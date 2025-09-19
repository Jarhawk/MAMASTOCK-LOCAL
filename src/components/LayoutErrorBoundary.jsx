import { Component } from "react";

export default class LayoutErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LayoutErrorBoundary captured an error:", error, errorInfo);
  }

  handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = "#/";
    }
  };

  render() {
    const { hasError } = this.state;
    const {
      title = "Une erreur est survenue",
      message = "Impossible d'afficher cette page pour le moment. Veuillez réessayer ou revenir en arrière.",
      children,
    } = this.props;

    if (hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="max-w-md text-sm text-foreground/70">{message}</p>
          <button
            type="button"
            onClick={this.handleBack}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/10"
          >
            Retour
          </button>
        </div>
      );
    }

    return children;
  }
}
