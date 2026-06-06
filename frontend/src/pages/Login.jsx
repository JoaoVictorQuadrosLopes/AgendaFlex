import React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import FormField from "../components/FormField.jsx";

export default function Login() {
  const { autenticado, login, register } = useAuth();
  const [modo, setModo] = useState("login");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    email: "",
    senha: "",
    nome: "",
    empresaNome: "",
    tipoNegocio: "Beleza",
    telefone: ""
  });

  if (autenticado) {
    return <Navigate to="/app" replace />;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErro("");

    try {
      if (modo === "login") {
        await login(form.email, form.senha);
      } else {
        await register({
          empresa: {
            nome: form.empresaNome,
            tipo_negocio: form.tipoNegocio,
            telefone: form.telefone
          },
          usuario: {
            nome: form.nome,
            email: form.email,
            senha: form.senha
          }
        });
      }
    } catch (error) {
      setErro(error.response?.data?.mensagem || "Nao foi possivel concluir a autenticacao");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="auth-logo">
            <CalendarCheck size={28} />
            <strong>AgendaFlex</strong>
          </div>
          <h1>Agendamentos para qualquer tipo de atendimento.</h1>
          <p>
            Controle clientes, profissionais, servicos e horarios em uma agenda simples para
            negocios de saude, beleza, consultoria, oficinas, educacao e servicos tecnicos.
          </p>
          <div className="segment-list">
            <span>Clinicas</span>
            <span>Saloes</span>
            <span>Oficinas</span>
            <span>Consultorias</span>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="segmented-control">
            <button type="button" className={modo === "login" ? "active" : ""} onClick={() => setModo("login")}>
              Entrar
            </button>
            <button type="button" className={modo === "register" ? "active" : ""} onClick={() => setModo("register")}>
              Criar conta
            </button>
          </div>

          {modo === "register" && (
            <>
              <FormField label="Nome da empresa">
                <input value={form.empresaNome} onChange={(e) => update("empresaNome", e.target.value)} required />
              </FormField>
              <div className="form-grid two">
                <FormField label="Tipo de negocio">
                  <select value={form.tipoNegocio} onChange={(e) => update("tipoNegocio", e.target.value)}>
                    <option>Saude</option>
                    <option>Beleza</option>
                    <option>Educacao</option>
                    <option>Servicos tecnicos</option>
                    <option>Consultoria</option>
                    <option>Pet</option>
                    <option>Juridico</option>
                    <option>Outro</option>
                  </select>
                </FormField>
                <FormField label="Telefone">
                  <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
                </FormField>
              </div>
              <FormField label="Seu nome">
                <input value={form.nome} onChange={(e) => update("nome", e.target.value)} required />
              </FormField>
            </>
          )}

          <FormField label="E-mail">
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </FormField>
          <FormField label="Senha">
            <input type="password" value={form.senha} onChange={(e) => update("senha", e.target.value)} required />
          </FormField>

          {erro && <div className="alert-error">{erro}</div>}

          <button className="primary-button" disabled={loading} type="submit">
            {loading && <Loader2 className="spin" size={18} />}
            {modo === "login" ? "Entrar no sistema" : "Criar empresa"}
          </button>
        </form>
      </section>
    </main>
  );
}
