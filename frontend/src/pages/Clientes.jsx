import React from "react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", documento: "", observacoes: "" });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await api.get("/clientes");
    setClientes(data);
  }

  async function salvar(event) {
    event.preventDefault();
    await api.post("/clientes", form);
    setForm({ nome: "", telefone: "", email: "", documento: "", observacoes: "" });
    carregar();
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="split-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>Novo cliente</h2>
        </div>
        <FormField label="Nome">
          <input value={form.nome} onChange={(e) => update("nome", e.target.value)} required />
        </FormField>
        <FormField label="Telefone">
          <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
        </FormField>
        <FormField label="E-mail">
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </FormField>
        <FormField label="CPF/CNPJ">
          <input value={form.documento} onChange={(e) => update("documento", e.target.value)} />
        </FormField>
        <FormField label="Observacoes">
          <textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} rows="4" />
        </FormField>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          Salvar cliente
        </button>
      </form>

      <section className="panel">
        <div className="panel-header">
          <h2>Clientes cadastrados</h2>
          <span className="count-pill">{clientes.length}</span>
        </div>
        {clientes.length === 0 ? (
          <EmptyState title="Nenhum cliente ainda" description="Cadastre o primeiro cliente para iniciar a agenda." />
        ) : (
          <div className="data-list">
            {clientes.map((cliente) => (
              <article className="list-row" key={cliente.id}>
                <div>
                  <strong>{cliente.nome}</strong>
                  <span>{cliente.email || "Sem e-mail"}</span>
                </div>
                <span>{cliente.telefone || "Sem telefone"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
