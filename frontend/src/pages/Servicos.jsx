import React from "react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [form, setForm] = useState({ nome: "", descricao: "", duracao_minutos: 30, valor: 0 });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await api.get("/servicos");
    setServicos(data);
  }

  async function salvar(event) {
    event.preventDefault();
    await api.post("/servicos", form);
    setForm({ nome: "", descricao: "", duracao_minutos: 30, valor: 0 });
    carregar();
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="split-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>Novo servico</h2>
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
          Salvar servico
        </button>
      </form>

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
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
