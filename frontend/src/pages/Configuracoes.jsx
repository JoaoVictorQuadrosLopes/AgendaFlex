import React, { useEffect, useMemo, useState } from "react";
import { Bell, Building2, Cloud, MessageSquareText, Save, ShieldCheck } from "lucide-react";
import FormField from "../components/FormField.jsx";
import api from "../services/api.js";

const initialForm = {
  nome: "",
  tipo_negocio: "Beleza",
  documento: "",
  telefone: "",
  endereco: "",
  termo_cliente: "Cliente",
  termo_profissional: "Profissional",
  termo_servico: "Servico",
  confirmar_whatsapp: true,
  lembrete_email: false,
  whatsapp_phone_number_id: ""
};

const segmentos = [
  "Saude",
  "Beleza",
  "Educacao",
  "Servicos tecnicos",
  "Consultoria",
  "Pet",
  "Juridico",
  "Outro"
];

export default function Configuracoes() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const resumo = useMemo(
    () => [
      { label: "Segmento", value: form.tipo_negocio || "Nao definido" },
      { label: "Agenda chama clientes de", value: form.termo_cliente || "Cliente" },
      { label: "Agenda chama profissionais de", value: form.termo_profissional || "Profissional" },
      { label: "Agenda chama servicos de", value: form.termo_servico || "Servico" },
      { label: "WhatsApp", value: form.confirmar_whatsapp ? "Confirmacao ativa" : "Desativado" },
      { label: "Phone Number ID", value: form.whatsapp_phone_number_id || "Nao vinculado" },
      { label: "E-mail", value: form.lembrete_email ? "Lembretes ativos" : "Desativado" }
    ],
    [form]
  );

  useEffect(() => {
    let mounted = true;

    async function carregarEmpresa() {
      try {
        const { data } = await api.get("/empresa");

        if (!mounted) return;

        setForm({
          nome: data.nome || "",
          tipo_negocio: data.tipo_negocio || "Beleza",
          documento: data.documento || "",
          telefone: data.telefone || "",
          endereco: data.endereco || "",
          termo_cliente: data.termo_cliente || "Cliente",
          termo_profissional: data.termo_profissional || "Profissional",
          termo_servico: data.termo_servico || "Servico",
          confirmar_whatsapp: Boolean(data.confirmar_whatsapp),
          lembrete_email: Boolean(data.lembrete_email),
          whatsapp_phone_number_id: data.whatsapp_phone_number_id || ""
        });
      } catch (error) {
        if (mounted) {
          setErro(error.response?.data?.mensagem || "Nao foi possivel carregar as configuracoes.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    carregarEmpresa();

    return () => {
      mounted = false;
    };
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErro("");
    setSucesso("");
  }

  async function salvar(event) {
    event.preventDefault();
    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const { data } = await api.put("/empresa", form);

      setForm({
        nome: data.nome || "",
        tipo_negocio: data.tipo_negocio || "Beleza",
        documento: data.documento || "",
        telefone: data.telefone || "",
        endereco: data.endereco || "",
        termo_cliente: data.termo_cliente || "Cliente",
        termo_profissional: data.termo_profissional || "Profissional",
        termo_servico: data.termo_servico || "Servico",
        confirmar_whatsapp: Boolean(data.confirmar_whatsapp),
        lembrete_email: Boolean(data.lembrete_email),
        whatsapp_phone_number_id: data.whatsapp_phone_number_id || ""
      });
      setSucesso("Configuracoes salvas com sucesso.");
    } catch (error) {
      setErro(error.response?.data?.mensagem || "Nao foi possivel salvar as configuracoes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="empty-state">
          <strong>Carregando configuracoes</strong>
          <span>Buscando os dados da empresa.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="split-view settings-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <div>
            <span className="eyebrow">Empresa</span>
            <h2>Dados e linguagem da agenda</h2>
          </div>
        </div>

        {erro && <div className="alert-error">{erro}</div>}
        {sucesso && <div className="soft-alert">{sucesso}</div>}

        <FormField label="Nome da empresa">
          <input value={form.nome} onChange={(event) => update("nome", event.target.value)} />
        </FormField>

        <FormField label="Segmento">
          <select value={form.tipo_negocio} onChange={(event) => update("tipo_negocio", event.target.value)}>
            {segmentos.map((segmento) => (
              <option key={segmento} value={segmento}>
                {segmento}
              </option>
            ))}
          </select>
        </FormField>

        <div className="form-grid two">
          <FormField label="Documento">
            <input value={form.documento} onChange={(event) => update("documento", event.target.value)} />
          </FormField>
          <FormField label="Telefone">
            <input value={form.telefone} onChange={(event) => update("telefone", event.target.value)} />
          </FormField>
        </div>

        <FormField label="Endereco">
          <textarea rows="3" value={form.endereco} onChange={(event) => update("endereco", event.target.value)} />
        </FormField>

        <div className="form-grid two">
          <FormField label="Nome para cliente">
            <input value={form.termo_cliente} onChange={(event) => update("termo_cliente", event.target.value)} />
          </FormField>
          <FormField label="Nome para profissional">
            <input
              value={form.termo_profissional}
              onChange={(event) => update("termo_profissional", event.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Nome para servico">
          <input value={form.termo_servico} onChange={(event) => update("termo_servico", event.target.value)} />
        </FormField>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.confirmar_whatsapp}
            onChange={(event) => update("confirmar_whatsapp", event.target.checked)}
          />
          <span>Usar confirmacao por WhatsApp</span>
        </label>

        <FormField label="Phone Number ID do WhatsApp Cloud API">
          <input
            value={form.whatsapp_phone_number_id}
            onChange={(event) => update("whatsapp_phone_number_id", event.target.value)}
            placeholder="Ex: 123456789012345"
          />
        </FormField>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.lembrete_email}
            onChange={(event) => update("lembrete_email", event.target.checked)}
          />
          <span>Preparar lembretes por e-mail</span>
        </label>

        <button className="primary-button" type="submit" disabled={saving}>
          <Save size={18} />
          {saving ? "Salvando..." : "Salvar configuracoes"}
        </button>
      </form>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Operacao</span>
            <h2>Como o AgendaFlex vai se comportar</h2>
          </div>
        </div>

        <div className="principle-list">
          {resumo.map((item) => (
            <article key={item.label}>
              <Building2 size={21} />
              <div>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            </article>
          ))}

          <article>
            <ShieldCheck size={21} />
            <div>
              <strong>Dados separados por empresa</strong>
              <span>Clientes, profissionais, servicos e agenda ficam vinculados ao seu cadastro.</span>
            </div>
          </article>
          <article>
            <MessageSquareText size={21} />
            <div>
              <strong>Comunicacao pronta para evoluir</strong>
              <span>Confirmacoes usam a WhatsApp Cloud API oficial da Meta.</span>
            </div>
          </article>
          <article>
            <Bell size={21} />
            <div>
              <strong>Rotina sem retrabalho</strong>
              <span>Status, lembretes e relatorios ajudam a reduzir processos manuais.</span>
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
