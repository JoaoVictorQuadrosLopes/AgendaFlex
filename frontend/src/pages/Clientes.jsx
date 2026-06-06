import React from "react";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", documento: "", observacoes: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await api.get("/clientes");
    setClientes(data);
  }

  async function salvar(event) {
    event.preventDefault();
    if (editingId) {
      await api.put(`/clientes/${editingId}`, form);
    } else {
      await api.post("/clientes", form);
    }
    limparFormulario();
    carregar();
  }

  function editar(cliente) {
    setEditingId(cliente.id);
    setForm({
      nome: cliente.nome || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      documento: cliente.documento || "",
      observacoes: cliente.observacoes || ""
    });
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este cliente? Os agendamentos antigos serao mantidos sem o vinculo.")) {
      return;
    }

    await api.delete(`/clientes/${id}`);
    carregar();
  }

  function limparFormulario() {
    setEditingId(null);
    setForm({ nome: "", telefone: "", email: "", documento: "", observacoes: "" });
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="split-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>{editingId ? "Editar cliente" : "Novo cliente"}</h2>
          {editingId && (
            <button className="icon-button" type="button" onClick={limparFormulario} title="Cancelar edicao">
              <X size={18} />
            </button>
          )}
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
          {editingId ? "Atualizar cliente" : "Salvar cliente"}
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
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => editar(cliente)} title="Editar cliente">
                    <Pencil size={17} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => excluir(cliente.id)} title="Excluir cliente">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
