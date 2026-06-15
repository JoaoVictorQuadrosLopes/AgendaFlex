import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Download, FilterX, MessageCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import FormField from "../components/FormField.jsx";
import OriginBadge from "../components/OriginBadge.jsx";
import PlanLimitAlert from "../components/PlanLimitAlert.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getApiErrorMessage, isPlanLimitError } from "../utils/apiErrors.js";

const statusOptions = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO", "NAO_COMPARECEU"];
const origemOptions = ["MANUAL", "ONLINE", "WHATSAPP"];

const emptyForm = {
  cliente_id: "",
  profissional_id: "",
  servico_id: "",
  data_agendamento: hojeISO(),
  hora_inicio: "09:00",
  observacoes: ""
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function dataLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function adicionarDias(dataISO, dias) {
  const [year, month, day] = dataISO.split("-").map(Number);
  const date = new Date(year, month - 1, day + dias);
  return dataLocalISO(date);
}

function inicioSemana(dataISO) {
  const [year, month, day] = dataISO.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return dataLocalISO(date);
}

function somarMinutos(hora, minutos) {
  const [hours, mins] = hora.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + Number(minutos), 0, 0);
  return date.toTimeString().slice(0, 5);
}

function valorCsv(valor) {
  const texto = String(valor ?? "").replace(/"/g, '""');
  return `"${texto}"`;
}

function moedaBR(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default function Agenda() {
  const [abaAgenda, setAbaAgenda] = useState("agenda");
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [statusFiltro, setStatusFiltro] = useState("");
  const [origemFiltro, setOrigemFiltro] = useState("");
  const [buscaFiltro, setBuscaFiltro] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosSemana, setAgendamentosSemana] = useState([]);
  const [agendamentosDia, setAgendamentosDia] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usarNovoCliente, setUsarNovoCliente] = useState(false);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState("");
  const [limitError, setLimitError] = useState(null);
  const [sucesso, setSucesso] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    email: ""
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
    carregarSemana();
  }, [dataSelecionada, statusFiltro, origemFiltro, buscaAplicada]);

  useEffect(() => {
    carregarAgendamentosDia(form.data_agendamento);
  }, [form.data_agendamento]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBuscaAplicada(buscaFiltro.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [buscaFiltro]);

  const servicoSelecionado = useMemo(
    () => servicos.find((servico) => String(servico.id) === String(form.servico_id)),
    [form.servico_id, servicos]
  );
  const profissionalSelecionado = useMemo(
    () => profissionais.find((profissional) => String(profissional.id) === String(form.profissional_id)),
    [form.profissional_id, profissionais]
  );
  const clienteSelecionado = useMemo(
    () => clientes.find((cliente) => String(cliente.id) === String(form.cliente_id)),
    [form.cliente_id, clientes]
  );
  const resumoAgendamento = useMemo(() => {
    const duracao = Number(servicoSelecionado?.duracao_minutos || 30);

    return {
      cliente: usarNovoCliente ? novoCliente.nome || "Novo cliente" : clienteSelecionado?.nome || "Cliente",
      profissional: profissionalSelecionado?.nome || "Profissional",
      servico: servicoSelecionado?.nome || "Servico",
      duracao,
      horaFim: somarMinutos(form.hora_inicio, duracao),
      valor: moedaBR(servicoSelecionado?.valor)
    };
  }, [clienteSelecionado, form.hora_inicio, novoCliente.nome, profissionalSelecionado, servicoSelecionado, usarNovoCliente]);
  const diasSemana = useMemo(() => {
    const inicio = inicioSemana(dataSelecionada);

    return Array.from({ length: 7 }, (_, index) => {
      const data = adicionarDias(inicio, index);
      const date = new Date(`${data}T12:00:00`);

      return {
        data,
        label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        dia: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      };
    });
  }, [dataSelecionada]);

  async function carregarAgenda() {
    const params = new URLSearchParams();
    params.set("data", dataSelecionada);

    if (statusFiltro) {
      params.set("status", statusFiltro);
    }

    if (origemFiltro) {
      params.set("origem", origemFiltro);
    }

    if (buscaAplicada) {
      params.set("busca", buscaAplicada);
    }

    const { data } = await api.get(`/agendamentos?${params.toString()}`);
    setAgendamentos(data);
  }

  async function carregarSemana() {
    const inicio = inicioSemana(dataSelecionada);
    const requests = Array.from({ length: 7 }, (_, index) => {
      const params = new URLSearchParams();
      params.set("data", adicionarDias(inicio, index));

      if (statusFiltro) {
        params.set("status", statusFiltro);
      }

      if (origemFiltro) {
        params.set("origem", origemFiltro);
      }

      if (buscaAplicada) {
        params.set("busca", buscaAplicada);
      }

      return api.get(`/agendamentos?${params.toString()}`);
    });
    const responses = await Promise.all(requests);
    setAgendamentosSemana(responses.flatMap((response) => response.data));
  }

  async function carregarAgendamentosDia(dataAgenda) {
    const { data } = await api.get(`/agendamentos?data=${dataAgenda}`);
    setAgendamentosDia(data);
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateNovoCliente(field, value) {
    setNovoCliente((current) => ({ ...current, [field]: value }));
  }

  function limparFormulario() {
    setForm(emptyForm);
    setNovoCliente({ nome: "", telefone: "", email: "" });
    setUsarNovoCliente(false);
    setEditandoId(null);
  }

  function iniciarEdicao(agendamento) {
    setErro("");
    setLimitError(null);
    setSucesso("");
    setUsarNovoCliente(false);
    setAbaAgenda("form");
    setEditandoId(agendamento.id);
    setForm({
      cliente_id: agendamento.cliente_id || "",
      profissional_id: agendamento.profissional_id || "",
      servico_id: agendamento.servico_id || "",
      data_agendamento: String(agendamento.data_agendamento || "").slice(0, 10),
      hora_inicio: String(agendamento.hora_inicio || "").slice(0, 5),
      observacoes: agendamento.observacoes || ""
    });
  }

  function limparFiltros() {
    setDataSelecionada(hojeISO());
    setStatusFiltro("");
    setOrigemFiltro("");
    setBuscaFiltro("");
    setBuscaAplicada("");
  }

  function exportarCsv() {
    const cabecalho = ["Data", "Inicio", "Fim", "Cliente", "Telefone", "Servico", "Profissional", "Status", "Origem"];
    const linhas = agendamentos.map((item) => [
      String(item.data_agendamento || "").slice(0, 10),
      String(item.hora_inicio || "").slice(0, 5),
      String(item.hora_fim || "").slice(0, 5),
      item.cliente_nome,
      item.cliente_telefone,
      item.servico_nome,
      item.profissional_nome,
      item.status,
      item.origem || "MANUAL"
    ]);
    const csv = [cabecalho, ...linhas].map((linha) => linha.map(valorCsv).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `agenda-${dataSelecionada}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const horaFim = somarMinutos(form.hora_inicio, servicoSelecionado?.duracao_minutos || 30);

    try {
      let clienteId = form.cliente_id;

      if (usarNovoCliente && !editandoId) {
        if (!novoCliente.nome.trim()) {
          setErro("Informe o nome do novo cliente.");
          return;
        }

        const { data: clienteCriado } = await api.post("/clientes", {
          nome: novoCliente.nome,
          telefone: novoCliente.telefone,
          email: novoCliente.email,
          observacoes: "Criado durante um agendamento"
        });

        clienteId = clienteCriado.id;
        setClientes((current) => [...current, clienteCriado].sort((a, b) => a.nome.localeCompare(b.nome)));
      }

      const payload = {
        ...form,
        cliente_id: clienteId,
        hora_fim: horaFim
      };

      if (editandoId) {
        await api.put(`/agendamentos/${editandoId}`, payload);
      } else {
        await api.post("/agendamentos", payload);
      }

      limparFormulario();
      setAbaAgenda("agenda");
      setDataSelecionada(form.data_agendamento);
      setSucesso(editandoId ? "Agendamento atualizado com sucesso." : "Agendamento criado com sucesso.");
      carregarAgenda();
      carregarSemana();
      carregarAgendamentosDia(form.data_agendamento);
    } catch (error) {
      if (isPlanLimitError(error)) {
        setLimitError(error);
      }
      setErro(getApiErrorMessage(error, "Nao foi possivel salvar o agendamento"));
    }
  }

  async function alterarStatus(id, status) {
    await api.patch(`/agendamentos/${id}/status`, { status });
    carregarAgenda();
    carregarSemana();
    carregarAgendamentosDia(form.data_agendamento);
  }

  async function enviarConfirmacaoWhatsapp(id) {
    setErro("");
    setSucesso("");

    try {
      await api.post(`/agendamentos/${id}/whatsapp-confirmacao`);
      setSucesso("Mensagem de confirmacao enviada pelo WhatsApp.");
    } catch (error) {
      setErro(error.response?.data?.mensagem || "Nao foi possivel enviar a confirmacao pelo WhatsApp.");
    }
  }

  async function excluirAgendamento(id) {
    if (!window.confirm("Excluir este agendamento?")) {
      return;
    }

    await api.delete(`/agendamentos/${id}`);
    carregarAgenda();
    carregarSemana();
    carregarAgendamentosDia(form.data_agendamento);
  }

  const resumoDia = useMemo(() => {
    const confirmados = agendamentos.filter((item) => item.status === "CONFIRMADO").length;
    const cancelados = agendamentos.filter((item) => item.status === "CANCELADO").length;
    const online = agendamentos.filter((item) => item.origem === "ONLINE").length;
    return { total: agendamentos.length, confirmados, cancelados, online };
  }, [agendamentos]);
  const conflitoPrevisto = useMemo(() => {
    if (!form.profissional_id || !form.data_agendamento || !form.hora_inicio) {
      return null;
    }

    const inicio = form.hora_inicio;
    const fim = resumoAgendamento.horaFim;

    return agendamentosDia.find((item) => {
      if (editandoId && String(item.id) === String(editandoId)) return false;
      if (String(item.profissional_id) !== String(form.profissional_id)) return false;
      if (["CANCELADO", "NAO_COMPARECEU"].includes(item.status)) return false;

      const itemInicio = String(item.hora_inicio || "").slice(0, 5);
      const itemFim = String(item.hora_fim || "").slice(0, 5);
      return inicio < itemFim && fim > itemInicio;
    });
  }, [agendamentosDia, editandoId, form.data_agendamento, form.hora_inicio, form.profissional_id, resumoAgendamento.horaFim]);
  const agendamentosPorDia = useMemo(() => {
    return diasSemana.reduce((acc, dia) => {
      acc[dia.data] = agendamentosSemana
        .filter((item) => String(item.data_agendamento || "").slice(0, 10) === dia.data)
        .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)));
      return acc;
    }, {});
  }, [agendamentosSemana, diasSemana]);

  return (
    <section className="content-stack agenda-clean-view">
      <div className="view-switcher">
        <div className="segmented-control">
          <button type="button" className={abaAgenda === "agenda" ? "active" : ""} onClick={() => setAbaAgenda("agenda")}>
            Agenda
          </button>
          <button type="button" className={abaAgenda === "form" ? "active" : ""} onClick={() => setAbaAgenda("form")}>
            {editandoId ? "Editar" : "Novo"}
          </button>
        </div>
        <button
          className="primary-button compact-action"
          type="button"
          onClick={() => {
            limparFormulario();
            setAbaAgenda("form");
          }}
        >
          <Plus size={18} />
          Novo agendamento
        </button>
      </div>

      {abaAgenda === "form" && (
      <form className="panel compact-form agenda-form-panel" onSubmit={salvar}>
        <div className="panel-header">
          <h2>{editandoId ? "Editar agendamento" : "Novo agendamento"}</h2>
          {editandoId && (
            <button className="icon-button" type="button" onClick={limparFormulario} title="Cancelar edicao">
              <X size={18} />
            </button>
          )}
        </div>
        {!editandoId && (
          <div className="segmented-toggle" role="group" aria-label="Tipo de cliente">
            <button type="button" className={!usarNovoCliente ? "active" : ""} onClick={() => setUsarNovoCliente(false)}>
              Cliente existente
            </button>
            <button type="button" className={usarNovoCliente ? "active" : ""} onClick={() => setUsarNovoCliente(true)}>
              Novo cliente
            </button>
          </div>
        )}

        {usarNovoCliente && !editandoId ? (
          <div className="quick-client-box">
            <FormField label="Nome do cliente">
              <input value={novoCliente.nome} onChange={(e) => updateNovoCliente("nome", e.target.value)} required />
            </FormField>
            <FormField label="Telefone">
              <input value={novoCliente.telefone} onChange={(e) => updateNovoCliente("telefone", e.target.value)} />
            </FormField>
            <FormField label="E-mail">
              <input type="email" value={novoCliente.email} onChange={(e) => updateNovoCliente("email", e.target.value)} />
            </FormField>
          </div>
        ) : (
          <FormField label="Cliente">
            <select value={form.cliente_id} onChange={(e) => update("cliente_id", e.target.value)} required={!usarNovoCliente}>
              <option value="">Selecione</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </FormField>
        )}
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
        <div className="appointment-preview">
          <span>Resumo</span>
          <strong>{resumoAgendamento.horaFim ? `${form.hora_inicio} - ${resumoAgendamento.horaFim}` : form.hora_inicio}</strong>
          <div>
            <small>{resumoAgendamento.cliente}</small>
            <small>{resumoAgendamento.servico} com {resumoAgendamento.profissional}</small>
            <small>{resumoAgendamento.duracao} min · {resumoAgendamento.valor}</small>
          </div>
        </div>
        {conflitoPrevisto && (
          <div className="conflict-preview">
            <strong>Horario em conflito</strong>
            <span>
              {conflitoPrevisto.profissional_nome} ja atende {conflitoPrevisto.cliente_nome || "um cliente"} das{" "}
              {String(conflitoPrevisto.hora_inicio).slice(0, 5)} as {String(conflitoPrevisto.hora_fim).slice(0, 5)}.
            </span>
          </div>
        )}
        {limitError && <PlanLimitAlert error={limitError} />}
        {erro && !limitError && <div className="alert-error">{erro}</div>}
        {sucesso && <div className="soft-alert">{sucesso}</div>}
        <button className="primary-button" type="submit" disabled={Boolean(conflitoPrevisto)}>
          <Plus size={18} />
          {editandoId ? "Salvar alteracoes" : "Agendar"}
        </button>
      </form>
      )}

      {abaAgenda === "agenda" && (
      <section className="panel agenda-board-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Agenda do dia</span>
            <h2>{dataSelecionada}</h2>
            <div className="agenda-summary">
              <span>{resumoDia.total} agendamentos</span>
              <span>{resumoDia.confirmados} confirmados</span>
              <span>{resumoDia.cancelados} cancelados</span>
              <span>{resumoDia.online} online</span>
            </div>
          </div>
          <div className="agenda-filters">
            <div className="agenda-search">
              <Search size={17} />
              <input
                type="search"
                value={buscaFiltro}
                onChange={(e) => setBuscaFiltro(e.target.value)}
                placeholder="Buscar cliente, telefone, servico..."
                aria-label="Buscar agendamento"
              />
            </div>
            <input className="date-filter" type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} aria-label="Filtrar por status">
              <option value="">Todos os status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select value={origemFiltro} onChange={(e) => setOrigemFiltro(e.target.value)} aria-label="Filtrar por origem">
              <option value="">Todas as origens</option>
              {origemOptions.map((origem) => (
                <option key={origem} value={origem}>
                  {origem}
                </option>
              ))}
            </select>
            <button className="icon-button" type="button" onClick={limparFiltros} title="Limpar filtros">
              <FilterX size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={exportarCsv}
              disabled={agendamentos.length === 0}
              title="Exportar agenda filtrada"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
        <div className="weekly-calendar">
          {diasSemana.map((dia) => {
            const itens = agendamentosPorDia[dia.data] || [];
            const ativo = dia.data === dataSelecionada;

            return (
              <article className={`calendar-day ${ativo ? "active" : ""}`} key={dia.data}>
                <button type="button" className="calendar-day-head" onClick={() => setDataSelecionada(dia.data)}>
                  <span>{dia.label}</span>
                  <strong>{dia.dia}</strong>
                </button>

                <div className="calendar-day-body">
                  {itens.length === 0 ? (
                    <span className="calendar-empty">Livre</span>
                  ) : (
                    itens.map((item) => (
                      <button
                        type="button"
                        className={`calendar-event status-line-${item.status}`}
                        key={item.id}
                        onClick={() => iniciarEdicao(item)}
                        title="Editar agendamento"
                      >
                        <strong>{String(item.hora_inicio).slice(0, 5)}</strong>
                        <span>{item.cliente_nome || "Cliente"}</span>
                        <small>{item.servico_nome || "Servico"}</small>
                      </button>
                    ))
                  )}
                </div>
              </article>
            );
          })}
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
                  <div className="badge-row">
                    <OriginBadge origem={item.origem} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="schedule-actions">
                  <select value={item.status} onChange={(e) => alterarStatus(item.id, e.target.value)} aria-label="Alterar status">
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => enviarConfirmacaoWhatsapp(item.id)}
                    title="Enviar confirmacao pelo WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button className="icon-button" type="button" onClick={() => iniciarEdicao(item)} title="Editar agendamento">
                    <Pencil size={18} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => excluirAgendamento(item.id)} title="Excluir agendamento">
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
              ))}
            </div>
        )}
      </section>
      )}
    </section>
  );
}
