import { Component, ErrorInfo, ReactNode } from "react";
import { AbsoluteFill } from "remotion";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches React rendering errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <AbsoluteFill
                    style={{
                        backgroundColor: "#0a0a0a",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 40,
                    }}
                >
                    <div
                        style={{
                            color: "#FF6B35",
                            fontSize: 48,
                            fontWeight: 900,
                            marginBottom: 20,
                        }}
                    >
                        ⚠️ Render Error
                    </div>
                    <div
                        style={{
                            color: "#FFFFFF",
                            fontSize: 24,
                            fontWeight: 600,
                            marginBottom: 30,
                            textAlign: "center",
                        }}
                    >
                        {this.state.error?.message || "An unexpected error occurred"}
                    </div>
                    <div
                        style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: 16,
                            maxWidth: 800,
                            fontFamily: "monospace",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: 20,
                            borderRadius: 8,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {this.state.error?.stack}
                    </div>
                </AbsoluteFill>
            );
        }

        return this.props.children;
    }
}
