import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
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

function PrivateRoute({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="profissionais" element={<Profissionais />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="modulos" element={<Modulos />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="assinatura" element={<Assinatura />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
