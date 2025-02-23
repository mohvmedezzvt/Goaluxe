"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  FallbackComponent: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) {
        return (
          <this.props.FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: null })}
          />
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
