import React, { useState } from "react";
import { Bell, Building2, Cloud, MessageSquareText, Save, ShieldCheck } from "lucide-react";
import FormField from "../components/FormField.jsx";

export default function Configuracoes() {
  const [form, setForm] = useState({
    segmento: "Beleza",
    termoCliente: "Cliente",
    termoProfissional: "Profissional",
    termoServico: "Serviço",
    confirmarWhatsapp: true,
    lembreteEmail: false
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="split-view settings-view">
      <form className="panel compact-form">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Personalização</span>
            <h2>Configure a linguagem do segmento</h2>
          </div>
        </div>

        <FormField label="Segmento">
          <select value={form.segmento} onChange={(event) => update("segmento", event.target.value)}>
            <option>Saúde</option>
            <option>Beleza</option>
            <option>Educação</option>
            <option>Serviços técnicos</option>
            <option>Consultoria</option>
            <option>Pet</option>
            <option>Jurídico</option>
            <option>Outro</option>
          </select>
        </FormField>

        <div className="form-grid two">
          <FormField label="Nome para cliente">
            <input value={form.termoCliente} onChange={(event) => update("termoCliente", event.target.value)} />
          </FormField>
          <FormField label="Nome para profissional">
            <input value={form.termoProfissional} onChange={(event) => update("termoProfissional", event.target.value)} />
          </FormField>
        </div>

        <FormField label="Nome para serviço">
          <input value={form.termoServico} onChange={(event) => update("termoServico", event.target.value)} />
        </FormField>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.confirmarWhatsapp}
            onChange={(event) => update("confirmarWhatsapp", event.target.checked)}
          />
          <span>Usar confirmação por WhatsApp</span>
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.lembreteEmail}
            onChange={(event) => update("lembreteEmail", event.target.checked)}
          />
          <span>Preparar lembretes por e-mail</span>
        </label>

        <button className="primary-button" type="button">
          <Save size={18} />
          Salvar preferências
        </button>
      </form>

      <section className="panel">
        <div className="panel-header">
          <h2>Princípios da operação</h2>
        </div>

        <div className="principle-list">
          <article>
            <Building2 size={21} />
            <div>
              <strong>Multiempresa</strong>
              <span>Cada cadastro pertence a uma empresa, mantendo dados separados por organização.</span>
            </div>
          </article>
          <article>
            <ShieldCheck size={21} />
            <div>
              <strong>Permissões por função</strong>
              <span>Base pronta para evoluir com cargos, telas liberadas e ações permitidas.</span>
            </div>
          </article>
          <article>
            <MessageSquareText size={21} />
            <div>
              <strong>Comunicação simples</strong>
              <span>Confirmação começa pelo WhatsApp e pode avançar para automações completas.</span>
            </div>
          </article>
          <article>
            <Bell size={21} />
            <div>
              <strong>Rotina sem retrabalho</strong>
              <span>Status, lembretes e relatórios ajudam a reduzir processos manuais.</span>
            </div>
          </article>
          <article>
            <Cloud size={21} />
            <div>
              <strong>100% online</strong>
              <span>Banco em nuvem com Neon e acesso pelo navegador, sem servidor local de banco.</span>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
