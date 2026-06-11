import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import AccessDenied from "./components/AccessDenied.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Agenda from "./pages/Agenda.jsx";
import Clientes from "./pages/Clientes.jsx";
import Profissionais from "./pages/Profissionais.jsx";
import Servicos from "./pages/Servicos.jsx";
import Modulos from "./pages/Modulos.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Assinatura from "./pages/Assinatura.jsx";
import PublicAgendamento from "./pages/PublicAgendamento.jsx";
import { canAccess, firstAllowedPath } from "./config/permissions.js";

function PrivateRoute({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" replace />;
}

function PermissionRoute({ path, children }) {
  const { usuario } = useAuth();
  return canAccess(usuario?.tipo, path) ? children : <AccessDenied />;
}

function AppIndexRedirect() {
  const { usuario } = useAuth();
  if (canAccess(usuario?.tipo, "/app")) {
    return <Dashboard />;
  }

  return <Navigate to={firstAllowedPath(usuario?.tipo)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/agendar/:empresaId" element={<PublicAgendamento />} />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AppIndexRedirect />} />
        <Route path="agenda" element={<PermissionRoute path="/app/agenda"><Agenda /></PermissionRoute>} />
        <Route path="clientes" element={<PermissionRoute path="/app/clientes"><Clientes /></PermissionRoute>} />
        <Route path="profissionais" element={<PermissionRoute path="/app/profissionais"><Profissionais /></PermissionRoute>} />
        <Route path="servicos" element={<PermissionRoute path="/app/servicos"><Servicos /></PermissionRoute>} />
        <Route path="modulos" element={<PermissionRoute path="/app/modulos"><Modulos /></PermissionRoute>} />
        <Route path="relatorios" element={<PermissionRoute path="/app/relatorios"><Relatorios /></PermissionRoute>} />
        <Route path="configuracoes" element={<PermissionRoute path="/app/configuracoes"><Configuracoes /></PermissionRoute>} />
        <Route path="assinatura" element={<PermissionRoute path="/app/assinatura"><Assinatura /></PermissionRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
