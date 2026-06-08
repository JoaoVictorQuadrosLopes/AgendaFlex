import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Phone, Sparkles, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";

const hoje = new Date().toISOString().slice(0, 10);

const formInicial = {
  cliente_nome: "",
  cliente_telefone: "",
  cliente_email: "",
  observacoes: ""
};

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
      setErro(error.response?.data?.mensagem || "Nao foi possivel criar o agendamento.");
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
            {confirmado.cliente_nome}, seu horario foi reservado para {data} as{" "}
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
            Escolha um servico, selecione um horario disponivel e deixe seus dados para reservar o atendimento.
          </p>
        </div>
        <div className="public-company-chip">
          <Sparkles size={18} />
          {dados.empresa.tipo_negocio}
        </div>
      </section>

      <form className="public-schedule-card" onSubmit={agendar}>
        {erro && <div className="alert-error">{erro}</div>}

        <div className="public-section">
          <div className="public-section-title">
            <CalendarDays size={20} />
            <h2>Escolha o atendimento</h2>
          </div>
          <div className="public-grid">
            <label>
              <span>{dados.empresa.termo_servico || "Servico"}</span>
              <select value={servicoId} onChange={(event) => setServicoId(event.target.value)}>
                {dados.servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{dados.empresa.termo_profissional || "Profissional"}</span>
              <select value={profissionalId} onChange={(event) => setProfissionalId(event.target.value)}>
                {dados.profissionais.map((profissional) => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Data</span>
              <input type="date" min={hoje} value={data} onChange={(event) => setData(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="public-section">
          <div className="public-section-title">
            <Clock size={20} />
            <h2>Horario disponivel</h2>
          </div>
          <div className="time-grid">
            {loadingHorarios ? (
              <span className="muted">Carregando horarios...</span>
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
            <UserRound size={20} />
            <h2>Seus dados</h2>
          </div>
          <div className="public-grid">
            <label>
              <span>Nome</span>
              <input value={form.cliente_nome} onChange={(event) => update("cliente_nome", event.target.value)} />
            </label>
            <label>
              <span>Telefone</span>
              <input value={form.cliente_telefone} onChange={(event) => update("cliente_telefone", event.target.value)} />
            </label>
            <label>
              <span>E-mail opcional</span>
              <input type="email" value={form.cliente_email} onChange={(event) => update("cliente_email", event.target.value)} />
            </label>
          </div>
          <label className="public-textarea">
            <span>Observacoes</span>
            <textarea rows="3" value={form.observacoes} onChange={(event) => update("observacoes", event.target.value)} />
          </label>
        </div>

        <aside className="public-resume">
          <Phone size={19} />
          <div>
            <strong>{servicoSelecionado?.nome || "Servico"}</strong>
            <span>
              {profissionalSelecionado?.nome || "Profissional"} · {data} · {horaSelecionada || "Escolha um horario"}
            </span>
          </div>
        </aside>

        <button className="primary-button public-submit" type="submit" disabled={salvando}>
          {salvando ? "Reservando..." : "Reservar horario"}
        </button>
      </form>
    </main>
  );
}
