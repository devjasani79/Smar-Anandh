import { Component, ReactNode } from "react";
import { TactileButton } from "./TactileButton";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
          <span className="text-6xl mb-6">😔</span>
          <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {this.props.fallbackMessage || "Kuch galat ho gaya"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">Chinta mat karein, wapas jaayein</p>
          <TactileButton
            variant="primary"
            size="large"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/app';
            }}
          >
            🏠 Ghar Wapas Jaayein
          </TactileButton>
        </div>
      );
    }
    return this.props.children;
  }
}
