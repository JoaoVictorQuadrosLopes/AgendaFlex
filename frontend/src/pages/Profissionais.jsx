import React from "react";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";
import PlanLimitAlert from "../components/PlanLimitAlert.jsx";
import { getApiErrorMessage, isPlanLimitError } from "../utils/apiErrors.js";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", funcao: "" });
  const [editingId, setEditingId] = useState(null);
  const [erro, setErro] = useState("");
  const [limitError, setLimitError] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await api.get("/profissionais");
    setProfissionais(data);
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setLimitError(null);

    try {
      if (editingId) {
        await api.put(`/profissionais/${editingId}`, { ...form, ativo: true });
      } else {
        await api.post("/profissionais", form);
      }
      limparFormulario();
      carregar();
    } catch (error) {
      if (isPlanLimitError(error)) {
        setLimitError(error);
      }
      setErro(getApiErrorMessage(error, "Nao foi possivel salvar o profissional."));
    }
  }

  function editar(profissional) {
    setEditingId(profissional.id);
    setForm({
      nome: profissional.nome || "",
      telefone: profissional.telefone || "",
      email: profissional.email || "",
      funcao: profissional.funcao || ""
    });
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este profissional? Os agendamentos antigos serao mantidos sem o vinculo.")) {
      return;
    }

    await api.delete(`/profissionais/${id}`);
    carregar();
  }

  function limparFormulario() {
    setEditingId(null);
    setForm({ nome: "", telefone: "", email: "", funcao: "" });
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="split-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>{editingId ? "Editar profissional" : "Novo profissional"}</h2>
          {editingId && (
            <button className="icon-button" type="button" onClick={limparFormulario} title="Cancelar edicao">
              <X size={18} />
            </button>
          )}
        </div>
        {limitError && <PlanLimitAlert error={limitError} />}
        {erro && !limitError && <div className="alert-error">{erro}</div>}
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
          {editingId ? "Atualizar profissional" : "Salvar profissional"}
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
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => editar(profissional)} title="Editar profissional">
                    <Pencil size={17} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => excluir(profissional.id)} title="Excluir profissional">
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
