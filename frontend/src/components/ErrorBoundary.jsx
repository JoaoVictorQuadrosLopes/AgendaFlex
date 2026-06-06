import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-page">
          <section className="error-panel">
            <span className="eyebrow">AgendaFlex</span>
            <h1>O frontend encontrou um erro.</h1>
            <p>{this.state.error.message || "Recarregue a pagina e tente novamente."}</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                localStorage.removeItem("agendaflex:usuario");
                localStorage.removeItem("agendaflex:token");
                window.location.href = "/login";
              }}
            >
              Voltar para o login
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
