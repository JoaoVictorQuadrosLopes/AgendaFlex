import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem("agendaflex:usuario");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("agendaflex:usuario");
      localStorage.removeItem("agendaflex:token");
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("agendaflex:token"));

  async function login(email, senha) {
    const { data } = await api.post("/auth/login", { email, senha });
    persistirSessao(data);
    return data;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    persistirSessao(data);
    return data;
  }

  async function atualizarSessao() {
    if (!token) {
      return null;
    }

    const { data } = await api.get("/auth/me");
    localStorage.setItem("agendaflex:usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function atualizarUsuario(usuarioAtualizado) {
    localStorage.setItem("agendaflex:usuario", JSON.stringify(usuarioAtualizado));
    setUsuario(usuarioAtualizado);
  }

  function persistirSessao(data) {
    localStorage.setItem("agendaflex:token", data.token);
    localStorage.setItem("agendaflex:usuario", JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
  }

  function logout() {
    localStorage.removeItem("agendaflex:token");
    localStorage.removeItem("agendaflex:usuario");
    setToken(null);
    setUsuario(null);
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (!mounted) return;
        localStorage.setItem("agendaflex:usuario", JSON.stringify(data.usuario));
        setUsuario(data.usuario);
      })
      .catch(() => {
        if (!mounted) return;
        logout();
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({ usuario, token, autenticado: Boolean(token), login, register, logout, atualizarSessao, atualizarUsuario }),
    [usuario, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
