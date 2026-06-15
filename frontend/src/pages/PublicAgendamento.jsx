import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound
} from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import { getApiErrorMessage, isPlanLimitError } from "../utils/apiErrors.js";

const hoje = new Date().toISOString().slice(0, 10);

const formInicial = {
  cliente_nome: "",
  cliente_telefone: "",
  cliente_email: "",
  observacoes: ""
};

function moedaBR(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataBR(valor) {
  if (!valor) return "";
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
}

export default function PublicAgendamento() {
  const { empresaId } = useParams();
  const [dados, setDados] = useState(null);
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [data, setData] = useState(hoje);
  const [horarios, setHorarios] = useState([]);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [form, setForm] = useState(formInicial);
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmado, setConfirmado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const servicoSelecionado = useMemo(
    () => dados?.servicos.find((servico) => String(servico.id) === String(servicoId)),
    [dados, servicoId]
  );

  const profissionalSelecionado = useMemo(
    () => dados?.profissionais.find((profissional) => String(profissional.id) === String(profissionalId)),
    [dados, profissionalId]
  );

  const temBaseParaAgendar = Boolean(dados?.servicos.length && dados?.profissionais.length);
  const horarioSelecionado = horarios.find((horario) => horario.hora_inicio === horaSelecionada);

  useEffect(() => {
    async function carregar() {
      try {
        const { data: response } = await api.get(`/public/agendar/${empresaId}`);
        setDados(response);
        setServicoId(response.servicos[0]?.id || "");
        setProfissionalId(response.profissionais[0]?.id || "");
      } catch (error) {
        setErro(error.response?.data?.mensagem || "Nao foi possivel carregar esta agenda.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [empresaId]);

  useEffect(() => {
    async function carregarHorarios() {
      if (!servicoId || !profissionalId || !data) {
        setHorarios([]);
        return;
      }

      setLoadingHorarios(true);
      setHoraSelecionada("");
      setErro("");

      try {
        const { data: response } = await api.get(`/public/agendar/${empresaId}/horarios`, {
          params: {
            servico_id: servicoId,
            profissional_id: profissionalId,
            data
          }
        });
        setHorarios(response);
      } catch (error) {
        setErro(error.response?.data?.mensagem || "Nao foi possivel carregar os horarios.");
      } finally {
        setLoadingHorarios(false);
      }
    }

    carregarHorarios();
  }, [empresaId, servicoId, profissionalId, data]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErro("");
  }

  async function agendar(event) {
    event.preventDefault();
    setErro("");

    if (!temBaseParaAgendar) {
      setErro("Esta agenda ainda nao esta pronta para receber reservas online.");
      return;
    }

    if (!horaSelecionada) {
      setErro("Escolha um horario para continuar.");
      return;
    }

    setSalvando(true);

    try {
      const { data: response } = await api.post(`/public/agendar/${empresaId}/agendamentos`, {
        ...form,
        servico_id: servicoId,
        profissional_id: profissionalId,
        data_agendamento: data,
        hora_inicio: horaSelecionada
      });
      setConfirmado(response.agendamento);
    } catch (error) {
      if (isPlanLimitError(error)) {
        setErro("A agenda online desta empresa atingiu o limite mensal. Entre em contato para reservar seu horario.");
        return;
      }

      setErro(getApiErrorMessage(error, "Nao foi possivel criar o agendamento."));
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <main className="public-schedule">
        <section className="public-schedule-card">
          <div className="empty-state">
            <strong>Carregando agenda</strong>
            <span>Preparando os horarios disponiveis.</span>
          </div>
        </section>
      </main>
    );
  }

  if (!dados) {
    return (
      <main className="public-schedule">
        <section className="public-schedule-card">
          <div className="alert-error">{erro}</div>
        </section>
      </main>
    );
  }

  if (confirmado) {
    return (
      <main className="public-schedule">
        <section className="public-confirmation">
          <CheckCircle2 size={44} />
          <span className="eyebrow">Agendamento recebido</span>
          <h1>{dados.empresa.nome}</h1>
          <p>
            {confirmado.cliente_nome}, seu horario foi reservado para {dataBR(data)} as{" "}
            {String(confirmado.hora_inicio).slice(0, 5)}.
          </p>
          <div className="confirmation-summary">
            <strong>{confirmado.servico_nome}</strong>
            <span>{confirmado.profissional_nome}</span>
          </div>
          <button className="ghost-button" type="button" onClick={() => setConfirmado(null)}>
            <ArrowLeft size={18} />
            Fazer outro agendamento
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="public-schedule">
      <section className="public-schedule-hero">
        <div>
          <span className="eyebrow">Agendamento online</span>
          <h1>{dados.empresa.nome}</h1>
          <p>
            Reserve seu horario em poucos passos, com servicos, profissionais e disponibilidade atualizados pela
            empresa.
          </p>
          <div className="public-hero-meta">
            {dados.empresa.endereco && (
              <span>
                <MapPin size={16} />
                {dados.empresa.endereco}
              </span>
            )}
            {dados.empresa.telefone && (
              <span>
                <Phone size={16} />
                {dados.empresa.telefone}
              </span>
            )}
          </div>
        </div>
        <div className="public-company-chip">
          <Sparkles size={18} />
          {dados.empresa.tipo_negocio}
        </div>
      </section>

      <form className="public-booking-shell" onSubmit={agendar}>
        <section className="public-schedule-card">
          {erro && <div className="alert-error">{erro}</div>}

          {!temBaseParaAgendar && (
            <div className="soft-alert">
              Esta empresa ainda precisa cadastrar servicos e profissionais para liberar o agendamento online.
            </div>
          )}

          <div className="public-section">
            <div className="public-section-title">
              <CalendarDays size={20} />
              <h2>Escolha o atendimento</h2>
            </div>
            <div className="public-choice-grid">
              {dados.servicos.map((servico) => (
                <button
                  className={`public-choice-card ${String(servico.id) === String(servicoId) ? "selected" : ""}`}
                  key={servico.id}
                  type="button"
                  onClick={() => setServicoId(servico.id)}
                >
                  <strong>{servico.nome}</strong>
                  <span>{servico.duracao_minutos || 30} min</span>
                  <small>{moedaBR(servico.valor)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="public-section">
            <div className="public-section-title">
              <UserRound size={20} />
              <h2>Escolha {dados.empresa.termo_profissional || "profissional"}</h2>
            </div>
            <div className="public-choice-grid professional">
              {dados.profissionais.map((profissional) => (
                <button
                  className={`public-choice-card ${String(profissional.id) === String(profissionalId) ? "selected" : ""}`}
                  key={profissional.id}
                  type="button"
                  onClick={() => setProfissionalId(profissional.id)}
                >
                  <strong>{profissional.nome}</strong>
                  <span>{profissional.funcao || dados.empresa.termo_profissional || "Atendimento"}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="public-section">
            <div className="public-section-title">
              <Clock size={20} />
              <h2>Data e horario</h2>
            </div>
            <div className="public-grid date-grid">
              <label>
                <span>Data</span>
                <input type="date" min={hoje} value={data} onChange={(event) => setData(event.target.value)} />
              </label>
            </div>
            <div className="time-grid">
              {loadingHorarios ? (
                <span className="muted">Carregando horarios...</span>
              ) : horarios.length === 0 ? (
                <span className="muted">Nenhum horario para esta combinacao.</span>
              ) : (
                horarios.map((horario) => (
                  <button
                    key={horario.hora_inicio}
                    className={`time-option ${horaSelecionada === horario.hora_inicio ? "selected" : ""}`}
                    type="button"
                    disabled={!horario.disponivel}
                    onClick={() => setHoraSelecionada(horario.hora_inicio)}
                  >
                    {horario.hora_inicio}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="public-section">
            <div className="public-section-title">
              <Mail size={20} />
              <h2>Seus dados</h2>
            </div>
            <div className="public-grid">
              <label>
                <span>Nome</span>
                <input value={form.cliente_nome} onChange={(event) => update("cliente_nome", event.target.value)} />
              </label>
              <label>
                <span>Telefone</span>
                <input
                  value={form.cliente_telefone}
                  onChange={(event) => update("cliente_telefone", event.target.value)}
                />
              </label>
              <label>
                <span>E-mail opcional</span>
                <input
                  type="email"
                  value={form.cliente_email}
                  onChange={(event) => update("cliente_email", event.target.value)}
                />
              </label>
            </div>
            <label className="public-textarea">
              <span>Observacoes</span>
              <textarea
                rows="3"
                value={form.observacoes}
                onChange={(event) => update("observacoes", event.target.value)}
              />
            </label>
          </div>

          <button className="primary-button public-submit" type="submit" disabled={salvando}>
            {salvando ? "Reservando..." : "Reservar horario"}
          </button>
        </section>

        <aside className="public-summary-card">
          <span className="eyebrow">Resumo</span>
          <h2>{servicoSelecionado?.nome || "Escolha um servico"}</h2>
          <div className="public-summary-list">
            <div>
              <Clock size={18} />
              <span>
                {servicoSelecionado?.duracao_minutos || 30} min - {moedaBR(servicoSelecionado?.valor)}
              </span>
            </div>
            <div>
              <UserRound size={18} />
              <span>{profissionalSelecionado?.nome || "Escolha um profissional"}</span>
            </div>
            <div>
              <CalendarDays size={18} />
              <span>
                {dataBR(data)} - {horarioSelecionado?.hora_inicio || "Escolha um horario"}
              </span>
            </div>
          </div>
          <p>Depois de reservar, a empresa recebe seu pedido na agenda e pode confirmar o atendimento.</p>
        </aside>
      </form>
    </main>
  );
}
