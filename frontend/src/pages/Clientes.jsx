import React from "react";
import { useEffect, useMemo, useState } from "react";
import { FileText, Mail, Pencil, Phone, Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";
import { canPerform } from "../config/permissions.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Clientes() {
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", documento: "", observacoes: "" });
  const [editingId, setEditingId] = useState(null);
  const [busca, setBusca] = useState("");

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

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      return [cliente.nome, cliente.telefone, cliente.email, cliente.documento]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termo));
    });
  }, [busca, clientes]);

  const clientesComContato = useMemo(() => {
    return clientes.filter((cliente) => cliente.telefone || cliente.email).length;
  }, [clientes]);
  const canCreateClient = canPerform(usuario?.tipo, "clientes:create");
  const canUpdateClient = canPerform(usuario?.tipo, "clientes:update");
  const canDeleteClient = canPerform(usuario?.tipo, "clientes:delete");
  const canManageClient = canCreateClient || canUpdateClient;

  return (
    <section className="content-stack clients-workspace">
      <section className="client-command-panel">
        <div>
          <span className="eyebrow">Base de clientes</span>
          <h2>Cadastre, encontre e atualize clientes sem perder contexto.</h2>
          <p>Use essa tela como a agenda de contatos da operacao: telefone, e-mail, documento e observacoes em um unico lugar.</p>
        </div>
        <div className="client-kpis" aria-label="Resumo de clientes">
          <article>
            <strong>{clientes.length}</strong>
            <span>clientes</span>
          </article>
          <article>
            <strong>{clientesComContato}</strong>
            <span>com contato</span>
          </article>
          <article>
            <strong>{clientes.length - clientesComContato}</strong>
            <span>incompletos</span>
          </article>
        </div>
      </section>

      <section className={`client-layout ${!canManageClient ? "read-only" : ""}`}>
        {canManageClient && (
        <form className="panel client-form-card" onSubmit={salvar}>
          <div className="panel-header">
            <div>
              <span className="eyebrow">{editingId ? "Atualizacao" : "Novo cadastro"}</span>
              <h2>{editingId ? "Editar cliente" : "Adicionar cliente"}</h2>
            </div>
            {editingId && (
              <button className="icon-button" type="button" onClick={limparFormulario} title="Cancelar edicao">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="client-form-section">
            <div className="client-section-title">
              <UserPlus size={18} />
              <strong>Identificacao</strong>
            </div>
            <FormField label="Nome completo">
              <input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex.: Ana Beatriz" required />
            </FormField>
            <FormField label="CPF/CNPJ">
              <input value={form.documento} onChange={(e) => update("documento", e.target.value)} placeholder="Opcional" />
            </FormField>
          </div>

          <div className="client-form-section">
            <div className="client-section-title">
              <Phone size={18} />
              <strong>Contato</strong>
            </div>
            <div className="form-grid two">
              <FormField label="Telefone">
                <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="WhatsApp ou celular" />
              </FormField>
              <FormField label="E-mail">
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="cliente@email.com" />
              </FormField>
            </div>
          </div>

          <div className="client-form-section">
            <div className="client-section-title">
              <FileText size={18} />
              <strong>Historico interno</strong>
            </div>
            <FormField label="Observacoes">
              <textarea
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                rows="4"
                placeholder="Preferencias, restricoes, observacoes de atendimento..."
              />
            </FormField>
          </div>

          <div className="client-form-actions">
            {editingId && (
              <button className="outline-button" type="button" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
            <button className="primary-button" type="submit">
              <Plus size={18} />
              {editingId ? "Atualizar cliente" : "Salvar cliente"}
            </button>
          </div>
        </form>
        )}

        <section className="panel client-list-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Clientes cadastrados</span>
              <h2>{clientesFiltrados.length} encontrados</h2>
            </div>
            <span className="count-pill">{clientes.length}</span>
          </div>

          <div className="client-search">
            <Search size={18} />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, telefone, e-mail ou documento"
              aria-label="Buscar cliente"
            />
          </div>

          {clientes.length === 0 ? (
            <EmptyState title="Nenhum cliente ainda" description="Cadastre o primeiro cliente para iniciar a agenda." />
          ) : clientesFiltrados.length === 0 ? (
            <EmptyState title="Nenhum resultado" description="Tente buscar por outro nome, telefone ou e-mail." />
          ) : (
            <div className="client-list">
              {clientesFiltrados.map((cliente) => (
                <article className="client-row" key={cliente.id}>
                  <div className="client-avatar" aria-hidden="true">
                    {String(cliente.nome || "C").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="client-main">
                    <strong>{cliente.nome}</strong>
                    <div className="client-contact-line">
                      <span>
                        <Phone size={14} />
                        {cliente.telefone || "Sem telefone"}
                      </span>
                      <span>
                        <Mail size={14} />
                        {cliente.email || "Sem e-mail"}
                      </span>
                    </div>
                    {cliente.documento && <small>Documento: {cliente.documento}</small>}
                  </div>
                  {(canUpdateClient || canDeleteClient) && (
                  <div className="row-actions">
                    {canUpdateClient && (
                    <button className="icon-button" type="button" onClick={() => editar(cliente)} title="Editar cliente">
                      <Pencil size={17} />
                    </button>
                    )}
                    {canDeleteClient && (
                    <button className="icon-button danger" type="button" onClick={() => excluir(cliente.id)} title="Excluir cliente">
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
    </section>
  );
}
