import React from "react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", funcao: "" });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await api.get("/profissionais");
    setProfissionais(data);
  }

  async function salvar(event) {
    event.preventDefault();
    await api.post("/profissionais", form);
    setForm({ nome: "", telefone: "", email: "", funcao: "" });
    carregar();
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="split-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>Novo profissional</h2>
        </div>
        <FormField label="Nome">
          <input value={form.nome} onChange={(e) => update("nome", e.target.value)} required />
        </FormField>
        <FormField label="Funcao">
          <input value={form.funcao} onChange={(e) => update("funcao", e.target.value)} placeholder="Barbeiro, mecanico, professor..." />
        </FormField>
        <FormField label="Telefone">
          <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
        </FormField>
        <FormField label="E-mail">
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </FormField>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          Salvar profissional
        </button>
      </form>

      <section className="panel">
        <div className="panel-header">
          <h2>Profissionais</h2>
          <span className="count-pill">{profissionais.length}</span>
        </div>
        {profissionais.length === 0 ? (
          <EmptyState title="Nenhum profissional ainda" description="Cadastre quem realiza os atendimentos." />
        ) : (
          <div className="data-list">
            {profissionais.map((profissional) => (
              <article className="list-row" key={profissional.id}>
                <div>
                  <strong>{profissional.nome}</strong>
                  <span>{profissional.funcao || "Funcao nao informada"}</span>
                </div>
                <span>{profissional.telefone || "Sem telefone"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
