import React from "react";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";
import { canPerform } from "../config/permissions.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Servicos() {
  const { usuario } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [form, setForm] = useState({ nome: "", descricao: "", duracao_minutos: 30, valor: 0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await api.get("/servicos");
    setServicos(data);
  }

  async function salvar(event) {
    event.preventDefault();
    if (editingId) {
      await api.put(`/servicos/${editingId}`, { ...form, ativo: true });
    } else {
      await api.post("/servicos", form);
    }
    limparFormulario();
    carregar();
  }

  function editar(servico) {
    setEditingId(servico.id);
    setForm({
      nome: servico.nome || "",
      descricao: servico.descricao || "",
      duracao_minutos: servico.duracao_minutos || 30,
      valor: servico.valor || 0
    });
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este servico? Os agendamentos antigos serao mantidos sem o vinculo.")) {
      return;
    }

    await api.delete(`/servicos/${id}`);
    carregar();
  }

  function limparFormulario() {
    setEditingId(null);
    setForm({ nome: "", descricao: "", duracao_minutos: 30, valor: 0 });
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  const canCreateService = canPerform(usuario?.tipo, "servicos:create");
  const canUpdateService = canPerform(usuario?.tipo, "servicos:update");
  const canDeleteService = canPerform(usuario?.tipo, "servicos:delete");
  const canManageService = canCreateService || canUpdateService;

  return (
    <section className={`split-view ${!canManageService ? "read-only" : ""}`}>
      {canManageService && (
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>{editingId ? "Editar servico" : "Novo servico"}</h2>
          {editingId && (
            <button className="icon-button" type="button" onClick={limparFormulario} title="Cancelar edicao">
              <X size={18} />
            </button>
          )}
        </div>
        <FormField label="Nome">
          <input value={form.nome} onChange={(e) => update("nome", e.target.value)} required />
        </FormField>
        <FormField label="Descricao">
          <textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows="3" />
        </FormField>
        <div className="form-grid two">
          <FormField label="Duracao">
            <input type="number" min="5" value={form.duracao_minutos} onChange={(e) => update("duracao_minutos", Number(e.target.value))} required />
          </FormField>
          <FormField label="Valor">
            <input type="number" min="0" step="0.01" value={form.valor} onChange={(e) => update("valor", Number(e.target.value))} />
          </FormField>
        </div>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          {editingId ? "Atualizar servico" : "Salvar servico"}
        </button>
      </form>
      )}

      <section className="panel">
        <div className="panel-header">
          <h2>Servicos</h2>
          <span className="count-pill">{servicos.length}</span>
        </div>
        {servicos.length === 0 ? (
          <EmptyState title="Nenhum servico ainda" description="Cadastre os atendimentos vendidos pela empresa." />
        ) : (
          <div className="data-list">
            {servicos.map((servico) => (
              <article className="list-row" key={servico.id}>
                <div>
                  <strong>{servico.nome}</strong>
                  <span>{servico.duracao_minutos} min</span>
                </div>
                <span>R$ {servico.valor}</span>
                {(canUpdateService || canDeleteService) && (
                <div className="row-actions">
                  {canUpdateService && (
                  <button className="icon-button" type="button" onClick={() => editar(servico)} title="Editar servico">
                    <Pencil size={17} />
                  </button>
                  )}
                  {canDeleteService && (
                  <button className="icon-button danger" type="button" onClick={() => excluir(servico.id)} title="Excluir servico">
                    <Trash2 size={17} />
                  </button>
                  )}
                </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
