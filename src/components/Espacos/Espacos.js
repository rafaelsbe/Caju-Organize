import React, { useState, useEffect } from "react";
import {
  listarEspacos,
  criarEspaco,
  atualizarEspaco,
  deletarEspaco,
  filtrarEspacosPorTipo,
} from "../../services/espacoService";
import Modal from "../Common/Modal";
import "./Espacos.css";

const Espacos = () => {
  const [espacos, setEspacos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEspaco, setEditingEspaco] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "sala",
    capacidade: "",
    descricao: "",
    localizacao: "",
  });

  useEffect(() => {
    carregarEspacos();
  }, [filtroTipo]);

  const carregarEspacos = async () => {
    setLoading(true);
    try {
      let result;
      if (filtroTipo === "todos") {
        result = await listarEspacos();
      } else {
        result = await filtrarEspacosPorTipo(filtroTipo);
      }

      if (result.success) {
        setEspacos(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar espaços:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (editingEspaco) {
        result = await atualizarEspaco(editingEspaco.id, formData);
      } else {
        result = await criarEspaco(formData);
      }

      if (result.success) {
        setShowModal(false);
        setEditingEspaco(null);
        setFormData({
          nome: "",
          tipo: "sala",
          capacidade: "",
          descricao: "",
          preco: "",
          localizacao: "",
        });
        carregarEspacos();
      } else {
        alert("Erro: " + result.error);
      }
    } catch (error) {
      alert("Erro ao salvar espaço: " + error.message);
    }
  };

  const handleEdit = (espaco) => {
    setEditingEspaco(espaco);
    const tipoNormalizado = espaco.tipo ? espaco.tipo.toLowerCase() : "sala";
    setFormData({
      nome: espaco.nome || "",
      tipo: tipoNormalizado,
      capacidade: espaco.capacidade || "",
      descricao: espaco.descricao || "",
      localizacao: espaco.localizacao || espaco.localização || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este espaço?")) {
      const result = await deletarEspaco(id);
      if (result.success) {
        carregarEspacos();
      } else {
        alert("Erro ao deletar: " + result.error);
      }
    }
  };

  const handleNew = () => {
    setEditingEspaco(null);
    setFormData({
      nome: "",
      tipo: "sala",
      capacidade: "",
      descricao: "",
      localizacao: "",
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Carregando espaços...</div>;
  }

  return (
    <div className="espacos-container">
      <div className="page-header">
        <h2>Gerenciamento de Espaços</h2>
        <button className="btn-primary" onClick={handleNew}>
          + Novo Espaço
        </button>
      </div>

      <div className="filters">
        <label>
          Filtrar por tipo:
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="sala">Sala</option>
            <option value="auditorio">Auditório</option>
            <option value="laboratorio">Laboratório</option>
            <option value="coworking">Coworking</option>
          </select>
        </label>
      </div>

      <div className="espacos-grid">
        {espacos.map((espaco) => (
          <div key={espaco.id} className="espaco-card">
            <div className="espaco-header">
              <h3>{espaco.nome}</h3>
              <span className="tipo-badge">
                {espaco.tipo
                  ? espaco.tipo.charAt(0).toUpperCase() +
                    espaco.tipo.slice(1).toLowerCase()
                  : "N/A"}
              </span>
            </div>
            <div className="espaco-body">
              <p>
                <strong>Capacidade:</strong> {espaco.capacidade} pessoas
              </p>
              <p>
                <strong>Localização:</strong>{" "}
                {espaco.localizacao || espaco.localização}
              </p>
              {espaco.descricao && (
                <p className="descricao">{espaco.descricao}</p>
              )}
            </div>
            <div className="espaco-actions">
              <button className="btn-edit" onClick={() => handleEdit(espaco)}>
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(espaco.id)}
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {espacos.length === 0 && (
        <p className="no-data">Nenhum espaço cadastrado</p>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>{editingEspaco ? "Editar Espaço" : "Novo Espaço"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo:</label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                required
              >
                <option value="sala">Sala</option>
                <option value="auditorio">Auditório</option>
                <option value="laboratorio">Laboratório</option>
                <option value="coworking">Coworking</option>
              </select>
            </div>

            <div className="form-group">
              <label>Capacidade:</label>
              <input
                type="number"
                value={formData.capacidade}
                onChange={(e) =>
                  setFormData({ ...formData, capacidade: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Localização:</label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={(e) =>
                  setFormData({ ...formData, localizacao: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingEspaco ? "Atualizar" : "Criar"}
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

export default Espacos;
