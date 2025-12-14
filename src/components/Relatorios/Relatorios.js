import React, { useState, useEffect } from "react";
import {
  listarReservas,
  obterEstatisticasReservas,
} from "../../services/reservaService";
import { listarEspacos } from "../../services/espacoService";
import { listarUsuarios } from "../../services/usuarioService";
import "./Relatorios.css";

const Relatorios = () => {
  const [estatisticas, setEstatisticas] = useState({});
  const [reservas, setReservas] = useState([]);
  const [espacos, setEspacos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [reservasResult, espacosResult, usuariosResult, statsResult] =
        await Promise.all([
          listarReservas(),
          listarEspacos(),
          listarUsuarios(),
          obterEstatisticasReservas(),
        ]);

      if (reservasResult.success) {
        let reservasFiltradas = reservasResult.data;

        const agora = new Date();
        const filtroData = new Date();

        if (periodo === "semana") {
          filtroData.setDate(agora.getDate() - 7);
        } else if (periodo === "mes") {
          filtroData.setMonth(agora.getMonth() - 1);
        } else if (periodo === "ano") {
          filtroData.setFullYear(agora.getFullYear() - 1);
        }

        if (periodo !== "todos") {
          reservasFiltradas = reservasFiltradas.filter((reserva) => {
            if (!reserva.dataInicio) return false;
            return new Date(reserva.dataInicio) >= filtroData;
          });
        }

        setReservas(reservasFiltradas);
      }

      if (espacosResult.success) {
        setEspacos(espacosResult.data);
      }

      if (usuariosResult.success) {
        setUsuarios(usuariosResult.data);
      }

      if (statsResult.success) {
        setEstatisticas(statsResult.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularReceitaEstimada = () => {
    return 0;
  };

  const obterEspacoMaisReservado = () => {
    const contagem = {};
    reservas.forEach((reserva) => {
      if (reserva.espacoId) {
        contagem[reserva.espacoId] = (contagem[reserva.espacoId] || 0) + 1;
      }
    });

    const maisReservado = Object.entries(contagem).sort(
      (a, b) => b[1] - a[1],
    )[0];
    if (maisReservado) {
      const espaco = espacos.find((e) => e.id === maisReservado[0]);
      return { espaco, quantidade: maisReservado[1] };
    }
    return null;
  };

  const obterTaxaOcupacao = () => {
    const reservasConfirmadas = reservas.filter(
      (r) => r.status === "confirmada",
    ).length;
    const totalEspacos = espacos.length;
    if (totalEspacos === 0) return 0;
    return ((reservasConfirmadas / totalEspacos) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="loading">Carregando relatórios...</div>;
  }

  const espacoMaisReservado = obterEspacoMaisReservado();

  return (
    <div className="relatorios-container">
      <div className="page-header">
        <h2>Relatórios e Estatísticas</h2>
        <div className="periodo-selector">
          <label>Período:</label>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="ano">Último Ano</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </div>

      <div className="relatorios-grid">
        <div className="relatorio-card">
          <h3>Resumo Geral</h3>
          <div className="relatorio-stats">
            <div className="stat-item">
              <span className="stat-label">Total de Reservas:</span>
              <span className="stat-value">{reservas.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reservas Confirmadas:</span>
              <span className="stat-value">
                {estatisticas.confirmadas || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reservas Pendentes:</span>
              <span className="stat-value">{estatisticas.pendentes || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reservas Canceladas:</span>
              <span className="stat-value">{estatisticas.canceladas || 0}</span>
            </div>
          </div>
        </div>

        <div className="relatorio-card">
          <h3>Taxa de Ocupação</h3>
          <div className="ocupacao-display">
            <div className="ocupacao-value">{obterTaxaOcupacao()}%</div>
            <div className="ocupacao-bar">
              <div
                className="ocupacao-fill"
                style={{ width: `${obterTaxaOcupacao()}%` }}
              ></div>
            </div>
            <p>Baseado em {espacos.length} espaços cadastrados</p>
          </div>
        </div>

        <div className="relatorio-card">
          <h3>Espaço Mais Reservado</h3>
          {espacoMaisReservado ? (
            <div className="espaco-destaque">
              <div className="espaco-nome">
                {espacoMaisReservado.espaco?.nome || "N/A"}
              </div>
              <div className="espaco-quantidade">
                {espacoMaisReservado.quantidade} reservas
              </div>
            </div>
          ) : (
            <p className="no-data">Nenhum dado disponível</p>
          )}
        </div>

        <div className="relatorio-card full-width">
          <h3>Distribuição por Status</h3>
          <div className="distribuicao-chart">
            <div className="chart-item">
              <div className="chart-bar-container">
                <div
                  className="chart-bar confirmada"
                  style={{
                    height: `${((estatisticas.confirmadas || 0) / reservas.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span>Confirmadas</span>
            </div>
            <div className="chart-item">
              <div className="chart-bar-container">
                <div
                  className="chart-bar pendente"
                  style={{
                    height: `${((estatisticas.pendentes || 0) / reservas.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span>Pendentes</span>
            </div>
            <div className="chart-item">
              <div className="chart-bar-container">
                <div
                  className="chart-bar cancelada"
                  style={{
                    height: `${((estatisticas.canceladas || 0) / reservas.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span>Canceladas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
