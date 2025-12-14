import React, { useState, useEffect } from "react";
import { listarEspacos } from "../../services/espacoService";
import { listarUsuarios } from "../../services/usuarioService";
import {
  listarReservas,
  obterEstatisticasReservas,
} from "../../services/reservaService";
import "./Dashboard.css";

const Dashboard = () => {
  const [estatisticas, setEstatisticas] = useState({
    totalEspacos: 0,
    totalUsuarios: 0,
    totalReservas: 0,
    reservasPendentes: 0,
    reservasConfirmadas: 0,
    reservasCanceladas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReservas, setRecentReservas] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const espacosResult = await listarEspacos();
      const totalEspacos = espacosResult.success
        ? espacosResult.data.length
        : 0;

      const usuariosResult = await listarUsuarios();
      const totalUsuarios = usuariosResult.success
        ? usuariosResult.data.length
        : 0;

      const reservasResult = await listarReservas();
      const totalReservas = reservasResult.success
        ? reservasResult.data.length
        : 0;
      const recentes = reservasResult.success
        ? reservasResult.data.slice(0, 5)
        : [];

      const statsResult = await obterEstatisticasReservas();
      const stats = statsResult.success ? statsResult.data : {};

      setEstatisticas({
        totalEspacos,
        totalUsuarios,
        totalReservas,
        reservasPendentes: stats.pendentes || 0,
        reservasConfirmadas: stats.confirmadas || 0,
        reservasCanceladas: stats.canceladas || 0,
      });

      setRecentReservas(recentes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-espacos" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M18 21V22C18.5523 22 19 21.5523 19 21H18ZM6 21H5C5 21.5523 5.44772 22 6 22V21ZM17.454 3.10899L17 4L17.454 3.10899ZM17.891 3.54601L17 4L17.891 3.54601ZM6.54601 3.10899L7 4L6.54601 3.10899ZM6.10899 3.54601L7 4L6.10899 3.54601ZM9 6C8.44772 6 8 6.44772 8 7C8 7.55228 8.44772 8 9 8V6ZM10 8C10.5523 8 11 7.55228 11 7C11 6.44772 10.5523 6 10 6V8ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V9ZM10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9V11ZM14 9C13.4477 9 13 9.44772 13 10C13 10.5523 13.4477 11 14 11V9ZM15 11C15.5523 11 16 10.5523 16 10C16 9.44772 15.5523 9 15 9V11ZM14 12C13.4477 12 13 12.4477 13 13C13 13.5523 13.4477 14 14 14V12ZM15 14C15.5523 14 16 13.5523 16 13C16 12.4477 15.5523 12 15 12V14ZM9 12C8.44772 12 8 12.4477 8 13C8 13.5523 8.44772 14 9 14V12ZM10 14C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12V14ZM14 6C13.4477 6 13 6.44772 13 7C13 7.55228 13.4477 8 14 8V6ZM15 8C15.5523 8 16 7.55228 16 7C16 6.44772 15.5523 6 15 6V8ZM7.6 4H16.4V2H7.6V4ZM17 4.6V21H19V4.6H17ZM18 20H6V22H18V20ZM7 21V4.6H5V21H7ZM16.4 4C16.6965 4 16.8588 4.00078 16.9754 4.0103C17.0803 4.01887 17.0575 4.0293 17 4L17.908 2.21799C17.6366 2.07969 17.3668 2.03562 17.1382 2.01695C16.9213 1.99922 16.6635 2 16.4 2V4ZM19 4.6C19 4.33647 19.0008 4.07869 18.9831 3.86177C18.9644 3.63318 18.9203 3.36344 18.782 3.09202L17 4C16.9707 3.94249 16.9811 3.91972 16.9897 4.02463C16.9992 4.14122 17 4.30347 17 4.6H19ZM17 4L18.782 3.09202C18.5903 2.7157 18.2843 2.40973 17.908 2.21799L17 4ZM7.6 2C7.33647 2 7.07869 1.99922 6.86177 2.01695C6.63318 2.03562 6.36344 2.07969 6.09202 2.21799L7 4C6.94249 4.0293 6.91972 4.01887 7.02463 4.0103C7.14122 4.00078 7.30347 4 7.6 4V2ZM7 4.6C7 4.30347 7.00078 4.14122 7.0103 4.02463C7.01887 3.91972 7.0293 3.94249 7 4L5.21799 3.09202C5.07969 3.36344 5.03562 3.63318 5.01695 3.86177C4.99922 4.07869 5 4.33647 5 4.6H7ZM6.09202 2.21799C5.71569 2.40973 5.40973 2.71569 5.21799 3.09202L7 4L6.09202 2.21799ZM9 8H10V6H9V8ZM9 11H10V9H9V11ZM14 11H15V9H14V11ZM14 14H15V12H14V14ZM9 14H10V12H9V14ZM14 8H15V6H14V8ZM13 18V21H15V18H13ZM11 21V18H9V21H11ZM12 17C12.5523 17 13 17.4477 13 18H15C15 16.3431 13.6569 15 12 15V17ZM12 15C10.3431 15 9 16.3431 9 18H11C11 17.4477 11.4477 17 12 17V15Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>{estatisticas.totalEspacos}</h3>
            <p>Espaços Cadastrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-usuarios" aria-hidden="true">
            <svg
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z"
                fill="currentColor"
              />
              <path
                d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>{estatisticas.totalUsuarios}</h3>
            <p>Usuários Cadastrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-reservas" aria-hidden="true">
            <svg
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <g fill="currentColor">
                <rect x="119.256" y="222.607" width="50.881" height="50.885" />
                <rect x="341.863" y="222.607" width="50.881" height="50.885" />
                <rect x="267.662" y="222.607" width="50.881" height="50.885" />
                <rect x="119.256" y="302.11" width="50.881" height="50.885" />
                <rect x="267.662" y="302.11" width="50.881" height="50.885" />
                <rect x="193.46" y="302.11" width="50.881" height="50.885" />
                <rect x="341.863" y="381.612" width="50.881" height="50.885" />
                <rect x="267.662" y="381.612" width="50.881" height="50.885" />
                <rect x="193.46" y="381.612" width="50.881" height="50.885" />
              </g>
              <path
                d="M439.277,55.046h-41.376v39.67c0,14.802-12.195,26.84-27.183,26.84h-54.025c-14.988,0-27.182-12.038-27.182-26.84v-39.67h-67.094v39.297c0,15.008-12.329,27.213-27.484,27.213h-53.424c-15.155,0-27.484-12.205-27.484-27.213V55.046H72.649c-26.906,0-48.796,21.692-48.796,48.354v360.246c0,26.661,21.89,48.354,48.796,48.354h366.628c26.947,0,48.87-21.692,48.87-48.354V103.4C488.147,76.739,466.224,55.046,439.277,55.046z M453.167,462.707c0,8.56-5.751,14.309-14.311,14.309H73.144c-8.56,0-14.311-5.749-14.311-14.309V178.089h394.334V462.707z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>{estatisticas.totalReservas}</h3>
            <p>Total de Reservas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-pendentes" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M15 18H9M14 6H10M20 3H19M19 3H5M19 3C19 5.51022 17.7877 7.86592 15.7451 9.32495L12 12M5 3H4M5 3C5 5.51022 6.21228 7.86592 8.25493 9.32495L12 12M20 21H19M19 21H5M19 21C19 18.4898 17.7877 16.1341 15.7451 14.675L12 12M5 21H4M5 21C5 18.4898 6.21228 16.1341 8.25493 14.675L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>{estatisticas.reservasPendentes}</h3>
            <p>Reservas Pendentes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-confirmadas" aria-hidden="true">
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="m16 0c8.836556 0 16 7.163444 16 16s-7.163444 16-16 16-16-7.163444-16-16 7.163444-16 16-16zm0 2c-7.7319865 0-14 6.2680135-14 14s6.2680135 14 14 14 14-6.2680135 14-14-6.2680135-14-14-14zm5.7279221 9 1.4142135 1.4142136-8.4852814 8.4852813-5.6568542-5.6568542 1.4142136-1.4142136 4.2419335 4.2419336z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>{estatisticas.reservasConfirmadas}</h3>
            <p>Reservas Confirmadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-canceladas" aria-hidden="true">
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM16 6c-5.522 0-10 4.478-10 10s4.478 10 10 10c5.523 0 10-4.478 10-10s-4.477-10-10-10zM20.537 19.535l-1.014 1.014c-0.186 0.186-0.488 0.186-0.675 0l-2.87-2.87-2.87 2.87c-0.187 0.186-0.488 0.186-0.675 0l-1.014-1.014c-0.186-0.186-0.186-0.488 0-0.675l2.871-2.869-2.871-2.87c-0.186-0.187-0.186-0.489 0-0.676l1.014-1.013c0.187-0.187 0.488-0.187 0.675 0l2.87 2.87 2.87-2.87c0.187-0.187 0.489-0.187 0.675 0l1.014 1.013c0.186 0.187 0.186 0.489 0 0.676l-2.871 2.87 2.871 2.869c0.186 0.187 0.186 0.49 0 0.675z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>{estatisticas.reservasCanceladas}</h3>
            <p>Reservas Canceladas</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Reservas Recentes</h3>
        {recentReservas.length > 0 ? (
          <div className="recent-reservas">
            {recentReservas.map((reserva) => (
              <div key={reserva.id} className="reserva-item">
                <div className="reserva-info">
                  <strong>{reserva.espacoNome || "Espaço"}</strong>
                  <span className={`status-badge status-${reserva.status}`}>
                    {reserva.status}
                  </span>
                </div>
                <div className="reserva-details">
                  <p>
                    {reserva.dataInicio &&
                      new Date(reserva.dataInicio).toLocaleString("pt-BR")}
                  </p>
                  <p>{reserva.usuarioNome || "Usuário"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Nenhuma reserva encontrada</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
