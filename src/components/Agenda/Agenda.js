import React, { useState, useEffect } from "react";
import { listarReservas } from "../../services/reservaService";
import { listarEspacos } from "../../services/espacoService";
import "./Agenda.css";

const Agenda = () => {
  const [reservas, setReservas] = useState([]);
  const [espacos, setEspacos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [espacoFiltro, setEspacoFiltro] = useState("todos");

  useEffect(() => {
    carregarDados();
  }, [dataSelecionada, espacoFiltro]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [reservasResult, espacosResult] = await Promise.all([
        listarReservas(),
        listarEspacos(),
      ]);

      if (espacosResult.success) {
        setEspacos(espacosResult.data);
      }

      if (reservasResult.success) {
        let reservasFiltradas = reservasResult.data;

        if (dataSelecionada) {
          const dataSelecionadaInicio = new Date(dataSelecionada + "T00:00:00");
          const dataSelecionadaFim = new Date(
            dataSelecionada + "T23:59:59.999",
          );

          reservasFiltradas = reservasFiltradas.filter((reserva) => {
            if (!reserva.dataInicio || !reserva.dataFim) return false;
            const dataInicio = new Date(reserva.dataInicio);
            const dataFim = new Date(reserva.dataFim);

            return (
              dataInicio <= dataSelecionadaFim &&
              dataFim > dataSelecionadaInicio
            );
          });
        }

        if (espacoFiltro !== "todos") {
          reservasFiltradas = reservasFiltradas.filter(
            (reserva) => reserva.espacoId === espacoFiltro,
          );
        }

        const reservasEnriquecidas = reservasFiltradas.map((reserva) => {
          const espaco = espacosResult.success
            ? espacosResult.data.find((e) => e.id === reserva.espacoId)
            : null;
          return {
            ...reserva,
            espacoNome: espaco?.nome || "N/A",
            espacoTipo: espaco?.tipo || "N/A",
          };
        });

        setReservas(reservasEnriquecidas);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const gerarHorarios = () => {
    const horarios = [];
    for (let hora = 8; hora < 22; hora++) {
      horarios.push(`${hora.toString().padStart(2, "0")}:00`);
    }
    return horarios;
  };

  const obterReservasPorHorario = (horario) => {
    if (!Array.isArray(reservas)) return [];
    return reservas.filter((reserva) => {
      if (!reserva.dataInicio || !reserva.dataFim) return false;

      const [horaStr, minutoStr = "00"] = horario.split(":");
      const hora = parseInt(horaStr, 10);
      const minutos = parseInt(minutoStr, 10);

      const blocoDate = new Date(
        `${dataSelecionada}T${horaStr}:${minutoStr}:00`,
      );

      const inicio = new Date(reserva.dataInicio);
      const fim = new Date(reserva.dataFim);

      return inicio <= blocoDate && fim > blocoDate;
    });
  };

  if (loading) {
    return <div className="loading">Carregando agenda...</div>;
  }

  return (
    <div className="agenda-container">
      <div className="page-header">
        <h2>Agenda de Ocupação</h2>
      </div>

      <div className="agenda-filters">
        <div className="filter-group">
          <label>Data:</label>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Espaço:</label>
          <select
            value={espacoFiltro}
            onChange={(e) => setEspacoFiltro(e.target.value)}
          >
            <option value="todos">Todos os Espaços</option>
            {espacos.map((espaco) => (
              <option key={espaco.id} value={espaco.id}>
                {espaco.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="agenda-timeline">
        <div className="timeline-header">
          <div className="timeline-hour">Horário</div>
          <div className="timeline-content">Reservas</div>
        </div>

        {gerarHorarios().map((horario) => {
          const reservasHorario = obterReservasPorHorario(horario);
          return (
            <div key={horario} className="timeline-row">
              <div className="timeline-hour">{horario}</div>
              <div className="timeline-content">
                {reservasHorario.length > 0 ? (
                  <div className="reservas-horario">
                    {reservasHorario.map((reserva) => (
                      <div
                        key={reserva.id}
                        className={`reserva-badge status-${reserva.status}`}
                        title={`${reserva.espacoNome} - ${new Date(reserva.dataInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(reserva.dataFim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                      >
                        <strong>{reserva.espacoNome}</strong>
                        <span className="reserva-time">
                          {new Date(reserva.dataInicio).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}{" "}
                          -{" "}
                          {new Date(reserva.dataFim).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sem-reserva">Livre</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {reservas.length === 0 && (
        <div className="no-reservas">
          <p>Nenhuma reserva encontrada para esta data e espaço.</p>
        </div>
      )}

      <div className="agenda-legend">
        <h3>Legenda:</h3>
        <div className="legend-items">
          <span className="legend-item">
            <span className="legend-color status-pendente"></span>
            Pendente
          </span>
          <span className="legend-item">
            <span className="legend-color status-confirmada"></span>
            Confirmada
          </span>
          <span className="legend-item">
            <span className="legend-color status-cancelada"></span>
            Cancelada
          </span>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
