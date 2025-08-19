import React from 'react';

interface ErrorBoundaryWrapperState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  componentName?: string;
}

export class ErrorBoundaryWrapper extends React.Component<
  ErrorBoundaryWrapperProps,
  ErrorBoundaryWrapperState
> {
  constructor(props: ErrorBoundaryWrapperProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryWrapperState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error en ${this.props.componentName || 'componente'}:`, error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <div style={{
          padding: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          color: '#d63031',
          margin: '10px 0'
        }}>
          <h3>Error en {this.props.componentName || 'componente'}</h3>
          <p>Ocurrió un error inesperado. La aplicación seguirá funcionando con funcionalidad limitada.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Detalles técnicos</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.message}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={this.handleRetry}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#d63031',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
