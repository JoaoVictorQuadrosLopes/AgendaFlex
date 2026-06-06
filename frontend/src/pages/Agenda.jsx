import React from "react";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const statusOptions = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO", "NAO_COMPARECEU"];

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function somarMinutos(hora, minutos) {
  const [hours, mins] = hora.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + Number(minutos), 0, 0);
  return date.toTimeString().slice(0, 5);
}

export default function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    cliente_id: "",
    profissional_id: "",
    servico_id: "",
    data_agendamento: hojeISO(),
    hora_inicio: "09:00",
    observacoes: ""
  });

  useEffect(() => {
    Promise.all([api.get("/clientes"), api.get("/profissionais"), api.get("/servicos")]).then(
      ([clientesRes, profissionaisRes, servicosRes]) => {
        setClientes(clientesRes.data);
        setProfissionais(profissionaisRes.data);
        setServicos(servicosRes.data);
      }
    );
  }, []);

  useEffect(() => {
    carregarAgenda();
  }, [dataSelecionada]);

  const servicoSelecionado = useMemo(
    () => servicos.find((servico) => String(servico.id) === String(form.servico_id)),
    [form.servico_id, servicos]
  );

  async function carregarAgenda() {
    const { data } = await api.get(`/agendamentos?data=${dataSelecionada}`);
    setAgendamentos(data);
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");

    const horaFim = somarMinutos(form.hora_inicio, servicoSelecionado?.duracao_minutos || 30);

    try {
      await api.post("/agendamentos", {
        ...form,
        hora_fim: horaFim
      });
      setForm((current) => ({ ...current, cliente_id: "", profissional_id: "", servico_id: "", observacoes: "" }));
      setDataSelecionada(form.data_agendamento);
      carregarAgenda();
    } catch (error) {
      setErro(error.response?.data?.mensagem || "Nao foi possivel criar o agendamento");
    }
  }

  async function alterarStatus(id, status) {
    await api.patch(`/agendamentos/${id}/status`, { status });
    carregarAgenda();
  }

  async function excluirAgendamento(id) {
    if (!window.confirm("Excluir este agendamento?")) {
      return;
    }

    await api.delete(`/agendamentos/${id}`);
    carregarAgenda();
  }

  function whatsappLink(item) {
    const telefone = (item.cliente_telefone || "").replace(/\D/g, "");
    const mensagem = `Ola ${item.cliente_nome}, seu atendimento de ${item.servico_nome} esta marcado para ${item.data_agendamento} as ${item.hora_inicio}.`;
    return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  }

  const resumoDia = useMemo(() => {
    const confirmados = agendamentos.filter((item) => item.status === "CONFIRMADO").length;
    const cancelados = agendamentos.filter((item) => item.status === "CANCELADO").length;
    return { total: agendamentos.length, confirmados, cancelados };
  }, [agendamentos]);

  return (
    <section className="split-view agenda-view">
      <form className="panel compact-form" onSubmit={salvar}>
        <div className="panel-header">
          <h2>Novo agendamento</h2>
        </div>
        <FormField label="Cliente">
          <select value={form.cliente_id} onChange={(e) => update("cliente_id", e.target.value)} required>
            <option value="">Selecione</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Profissional">
          <select value={form.profissional_id} onChange={(e) => update("profissional_id", e.target.value)} required>
            <option value="">Selecione</option>
            {profissionais.map((profissional) => (
              <option key={profissional.id} value={profissional.id}>
                {profissional.nome}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Servico">
          <select value={form.servico_id} onChange={(e) => update("servico_id", e.target.value)} required>
            <option value="">Selecione</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome} - {servico.duracao_minutos} min
              </option>
            ))}
          </select>
        </FormField>
        <div className="form-grid two">
          <FormField label="Data">
            <input type="date" value={form.data_agendamento} onChange={(e) => update("data_agendamento", e.target.value)} required />
          </FormField>
          <FormField label="Horario">
            <input type="time" value={form.hora_inicio} onChange={(e) => update("hora_inicio", e.target.value)} required />
          </FormField>
        </div>
        <FormField label="Observacoes">
          <textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} rows="3" />
        </FormField>
        {erro && <div className="alert-error">{erro}</div>}
        <button className="primary-button" type="submit">
          <Plus size={18} />
          Agendar
        </button>
      </form>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Agenda do dia</span>
            <h2>{dataSelecionada}</h2>
            <div className="agenda-summary">
              <span>{resumoDia.total} agendamentos</span>
              <span>{resumoDia.confirmados} confirmados</span>
              <span>{resumoDia.cancelados} cancelados</span>
            </div>
          </div>
          <input className="date-filter" type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
        </div>
        {agendamentos.length === 0 ? (
          <EmptyState title="Sem agendamentos" description="Os atendimentos do dia selecionado aparecerao aqui." />
        ) : (
          <div className="schedule-list">
            {agendamentos.map((item) => (
              <article className="schedule-item" key={item.id}>
                <div className="time-block">
                  <strong>{item.hora_inicio?.slice(0, 5)}</strong>
                  <span>{item.hora_fim?.slice(0, 5)}</span>
                </div>
                <div className="schedule-info">
                  <div>
                    <strong>{item.cliente_nome}</strong>
                    <span>{item.servico_nome} com {item.profissional_nome}</span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="schedule-actions">
                  <select value={item.status} onChange={(e) => alterarStatus(item.id, e.target.value)} aria-label="Alterar status">
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <a className="icon-button" href={whatsappLink(item)} target="_blank" rel="noreferrer" title="Enviar WhatsApp">
                    <MessageCircle size={18} />
                  </a>
                  <button className="icon-button danger" type="button" onClick={() => excluirAgendamento(item.id)} title="Excluir agendamento">
                    <Trash2 size={18} />
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
