import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CalendarCheck,
  Check,
  ClipboardList,
  Cloud,
  CreditCard,
  LineChart,
  MessageCircle,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { plans } from "../data/plans.js";
import heroImage from "../assets/agendaflex-hero.png";

const features = [
  {
    title: "Agendamento prático",
    text: "Organize atendimentos por dia, profissional e serviço, com bloqueio de horários conflitantes.",
    icon: CalendarCheck
  },
  {
    title: "Confirmação pelo WhatsApp",
    text: "Gere mensagens prontas para confirmar, remarcar ou lembrar o cliente sobre o atendimento.",
    icon: MessageCircle
  },
  {
    title: "Cadastro completo",
    text: "Centralize clientes, profissionais, serviços, valores, duração e observações em um só lugar.",
    icon: ClipboardList
  },
  {
    title: "Sistema multiárea",
    text: "Adapte a linguagem para saúde, beleza, educação, oficinas, consultorias, pet shops e mais.",
    icon: Sparkles
  },
  {
    title: "Acesso seguro",
    text: "Login individual, dados separados por empresa e base pronta para permissões por cargo.",
    icon: ShieldCheck
  },
  {
    title: "100% online",
    text: "Use pelo navegador com banco na nuvem, sem precisar instalar servidor de banco no computador.",
    icon: Cloud
  }
];

const segments = ["Clínicas", "Barbearias", "Salões", "Oficinas", "Consultorias", "Aulas", "Pet shops", "Estética"];

export default function Landing() {
  return (
    <main className="landing-page">
      <header className="site-header">
        <a className="site-brand" href="#topo">
          <div className="site-brand-mark">
            <CalendarCheck size={22} />
          </div>
          <strong>AgendaFlex</strong>
        </a>

        <nav className="site-nav" aria-label="Navegação do site">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#segmentos">Segmentos</a>
          <a href="#planos">Planos</a>
          <Link to="/agendar/agendaflex">Agendar online</Link>
          <a href="#seguranca">Segurança</a>
        </nav>

        <div className="site-actions">
          <Link className="ghost-link" to="/agendar/agendaflex">Agendar</Link>
          <Link className="ghost-link" to="/login">Entrar</Link>
          <Link className="site-button" to="/login">Experimente grátis</Link>
        </div>
      </header>

      <section className="landing-hero" id="topo">
        <div className="hero-copy">
          <span className="hero-kicker">Agenda, clientes e confirmações em um só lugar</span>
          <h1>Transforme horários soltos em uma operação organizada.</h1>
          <p>
            O AgendaFlex ajuda negócios de atendimento a vender, agendar,
            confirmar e acompanhar serviços com uma experiência simples para a equipe.
          </p>
          <div className="hero-actions">
            <Link className="site-button big" to="/agendar/agendaflex">Agendar horario</Link>
            <Link className="outline-button big" to="/login">Acessar painel</Link>
            <a className="ghost-link big" href="#planos">Ver planos</a>
          </div>
          <div className="hero-metrics" aria-label="Resumo de benefícios">
            <article>
              <strong>24h</strong>
              <span>agenda online</span>
            </article>
            <article>
              <strong>+WhatsApp</strong>
              <span>confirmações rápidas</span>
            </article>
            <article>
              <strong>multiárea</strong>
              <span>adaptável por segmento</span>
            </article>
          </div>
        </div>

        <div className="hero-product" aria-label="Prévia visual do painel AgendaFlex">
          <img src={heroImage} alt="Painel do AgendaFlex com agenda, clientes, indicadores e confirmações por WhatsApp" />
          <div className="floating-card floating-card-one">
            <MessageCircle size={18} />
            <div>
              <strong>Confirmação enviada</strong>
              <span>WhatsApp pronto para o cliente</span>
            </div>
          </div>
          <div className="floating-card floating-card-two">
            <LineChart size={18} />
            <div>
              <strong>87%</strong>
              <span>retenção dos atendimentos</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-band audience-band">
        <div className="audience-copy">
          <span className="eyebrow">Para quem atende com hora marcada</span>
          <h2>Da primeira conversa ao atendimento finalizado.</h2>
        </div>
        <div className="journey-grid">
          <article>
            <MousePointerClick size={22} />
            <strong>Cadastre</strong>
            <span>clientes, profissionais e serviços por segmento.</span>
          </article>
          <article>
            <CalendarCheck size={22} />
            <strong>Agende</strong>
            <span>com controle de duração, valor e profissional.</span>
          </article>
          <article>
            <MessageCircle size={22} />
            <strong>Confirme</strong>
            <span>envie a mensagem pelo WhatsApp sem retrabalho.</span>
          </article>
          <article>
            <CreditCard size={22} />
            <strong>Acompanhe</strong>
            <span>planos, indicadores, status e relatórios.</span>
          </article>
        </div>
      </section>

      <section className="landing-band feature-section" id="funcionalidades">
        <div className="section-heading">
          <span className="eyebrow">Funcionalidades</span>
          <h2>Menos planilha, menos mensagem perdida, mais previsibilidade.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card" key={feature.title}>
                <Icon size={24} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-band segment-section" id="segmentos">
        <div className="section-heading">
          <span className="eyebrow">Personalizável por área</span>
          <h2>Uma base para vários tipos de negócio, sem prender o sistema em um só nicho.</h2>
        </div>
        <div className="segment-cloud">
          {segments.map((segment) => (
            <span key={segment}>{segment}</span>
          ))}
        </div>
      </section>

      <section className="landing-band" id="planos">
        <div className="section-heading">
          <span className="eyebrow">Assinatura</span>
          <h2>Comece pequeno e evolua para uma operação completa.</h2>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card ${plan.highlighted ? "highlighted" : ""}`} key={plan.id}>
              {plan.highlighted && <span className="plan-tag">Mais escolhido</span>}
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={17} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link className={plan.highlighted ? "site-button full" : "outline-button full"} to="/login">
                Assinar plano
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-band trust-section" id="seguranca">
        <article>
          <BadgeCheck size={28} />
          <div>
            <h2>SaaS online, seguro e preparado para crescer.</h2>
            <p>
              O AgendaFlex separa os dados por empresa, usa autenticação com token
              e já está conectado a banco em nuvem. A próxima etapa pode incluir
              cargos, permissões, pagamentos e automações reais de mensagens.
            </p>
          </div>
        </article>
        <article>
          <Users size={28} />
          <div>
            <h2>Feito para equipes pequenas e médias.</h2>
            <p>
              Ideal para quem quer sair da agenda manual e ter uma operação mais
              clara, com indicadores, status de atendimento e histórico organizado.
            </p>
          </div>
        </article>
      </section>

      <footer className="site-footer">
        <strong>AgendaFlex</strong>
        <span>Sistema web multiárea para gestão de agendamentos.</span>
        <Link to="/login">Acessar sistema</Link>
      </footer>
    </main>
  );
}
