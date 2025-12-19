import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  listarReservas,
  criarReserva,
  atualizarReserva,
  cancelarReserva,
  deletarReserva,
  aceitarReserva,
  rejeitarReserva,
} from "../../services/reservaService";
import { listarEspacos } from "../../services/espacoService";
import { listarUsuarios } from "../../services/usuarioService";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../Common/Modal";
import "./Reservas.css";

const Reservas = () => {
  const { currentUser, isAdmin } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [espacos, setEspacos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [formData, setFormData] = useState({
    espacoId: "",
    usuarioId: "",
    dataInicio: "",
    dataFim: "",
    observacoes: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [reservasResult, espacosResult, usuariosResult] = await Promise.all(
        [listarReservas(), listarEspacos(), listarUsuarios()],
      );

      if (reservasResult.success) {
        const reservasEnriquecidas = reservasResult.data.map((reserva) => {
          const espaco = espacosResult.success
            ? espacosResult.data.find((e) => e.id === reserva.espacoId)
            : null;
          const usuario = usuariosResult.success
            ? usuariosResult.data.find((u) => u.id === reserva.usuarioId)
            : null;

          return {
            ...reserva,
            espacoNome: espaco?.nome || "N/A",
            usuarioNome: usuario?.nome || "N/A",
          };
        });
        setReservas(reservasEnriquecidas);
      }

      if (espacosResult.success) {
        setEspacos(espacosResult.data);
      }

      if (usuariosResult.success) {
        setUsuarios(usuariosResult.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      const reservaData = {
        ...formData,
        usuarioId: isAdmin() ? formData.usuarioId : currentUser.uid,
      };

      if (editingReserva) {
        result = await atualizarReserva(editingReserva.id, reservaData);
      } else {
        result = await criarReserva(reservaData);
      }

      if (result.success) {
        setShowModal(false);
        setEditingReserva(null);
        setFormData({
          espacoId: "",
          usuarioId: isAdmin() ? "" : currentUser.uid,
          dataInicio: "",
          dataFim: "",
          observacoes: "",
        });
        carregarDados();
        toast.success(
          isAdmin()
            ? "Reserva criada com sucesso!"
            : "Solicitação de reserva enviada! Aguarde a confirmação do administrador.",
        );
      } else {
        toast.error("Erro: " + result.error);
      }
    } catch (error) {
      toast.error("Erro ao salvar reserva: " + error.message);
    }
  };

  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    setFormData({
      espacoId: reserva.espacoId || "",
      usuarioId: reserva.usuarioId || "",
      dataInicio: reserva.dataInicio
        ? new Date(reserva.dataInicio).toISOString().slice(0, 16)
        : "",
      dataFim: reserva.dataFim
        ? new Date(reserva.dataFim).toISOString().slice(0, 16)
        : "",
      observacoes: reserva.observacoes || "",
    });
    setShowModal(true);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar esta reserva?")) {
      const result = await cancelarReserva(id);
      if (result.success) {
        carregarDados();
        toast.success("Reserva cancelada com sucesso!");
      } else {
        toast.error("Erro ao cancelar: " + result.error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta reserva?")) {
      const result = await deletarReserva(id);
      if (result.success) {
        carregarDados();
        toast.success("Reserva deletada com sucesso!");
      } else {
        toast.error("Erro ao deletar: " + result.error);
      }
    }
  };

  const handleNew = () => {
    setEditingReserva(null);
    setFormData({
      espacoId: "",
      usuarioId: isAdmin() ? "" : currentUser.uid,
      dataInicio: "",
      dataFim: "",
      observacoes: "",
    });
    setShowModal(true);
  };

  const handleAccept = async (id) => {
    if (window.confirm("Deseja aceitar esta reserva?")) {
      const result = await aceitarReserva(id);
      if (result.success) {
        carregarDados();
        toast.success("Reserva aceita com sucesso!");
      } else {
        toast.error("Erro ao aceitar: " + result.error);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Deseja rejeitar esta reserva?")) {
      const result = await rejeitarReserva(id);
      if (result.success) {
        carregarDados();
        toast.success("Reserva rejeitada.");
      } else {
        toast.error("Erro ao rejeitar: " + result.error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Carregando reservas...</div>;
  }

  return (
    <div className="reservas-container">
      <div className="page-header">
        <h2>Gerenciamento de Reservas</h2>
        <button className="btn-primary" onClick={handleNew}>
          + Nova Reserva
        </button>
      </div>

      <div className="reservas-list">
        {reservas.map((reserva) => (
          <div key={reserva.id} className="reserva-card">
            <div className="reserva-header">
              <div>
                <h3>{reserva.espacoNome}</h3>
                <p className="usuario-info">Cliente: {reserva.usuarioNome}</p>
              </div>
              <span className={`status-badge status-${reserva.status}`}>
                {reserva.status}
              </span>
            </div>
            <div className="reserva-body">
              <div className="reserva-datetime">
                <p>
                  <strong>Início:</strong>{" "}
                  {reserva.dataInicio &&
                    new Date(reserva.dataInicio).toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Fim:</strong>{" "}
                  {reserva.dataFim &&
                    new Date(reserva.dataFim).toLocaleString("pt-BR")}
                </p>
              </div>
              {reserva.observacoes && (
                <p className="observacoes">
                  <strong>Observações:</strong> {reserva.observacoes}
                </p>
              )}
            </div>
            <div className="reserva-actions">
              {isAdmin() && reserva.status === "pendente" && (
                <>
                  <button
                    className="btn-accept"
                    onClick={() => handleAccept(reserva.id)}
                  >
                    ✓ Aceitar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(reserva.id)}
                  >
                    ✗ Rejeitar
                  </button>
                </>
              )}
              {!isAdmin() && reserva.status !== "cancelada" && (
                <>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(reserva)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancel(reserva.id)}
                  >
                    Cancelar
                  </button>
                </>
              )}
              {isAdmin() && (
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(reserva.id)}
                >
                  Deletar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {reservas.length === 0 && (
        <p className="no-data">Nenhuma reserva encontrada</p>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>{editingReserva ? "Editar Reserva" : "Nova Reserva"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Espaço:</label>
              <select
                value={formData.espacoId}
                onChange={(e) =>
                  setFormData({ ...formData, espacoId: e.target.value })
                }
                required
              >
                <option value="">Selecione um espaço</option>
                {espacos.map((espaco) => (
                  <option key={espaco.id} value={espaco.id}>
                    {espaco.nome} - {espaco.tipo}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin() && (
              <div className="form-group">
                <label>Usuário:</label>
                <select
                  value={formData.usuarioId}
                  onChange={(e) =>
                    setFormData({ ...formData, usuarioId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um usuário</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome} - {usuario.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Data e Hora de Início:</label>
              <input
                type="datetime-local"
                value={formData.dataInicio}
                onChange={(e) =>
                  setFormData({ ...formData, dataInicio: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Data e Hora de Fim:</label>
              <input
                type="datetime-local"
                value={formData.dataFim}
                onChange={(e) =>
                  setFormData({ ...formData, dataFim: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Observações:</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingReserva ? "Atualizar" : "Criar"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Reservas;
