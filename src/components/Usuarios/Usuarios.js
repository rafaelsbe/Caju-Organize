import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
} from "../../services/usuarioService";
import Modal from "../Common/Modal";
import "./Usuarios.css";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "cliente",
    empresa: "",
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const result = await listarUsuarios();
      if (result.success) {
        setUsuarios(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (editingUsuario) {
        result = await atualizarUsuario(editingUsuario.id, formData);
      } else {
        result = await criarUsuario(formData);
      }

      if (result.success) {
        setShowModal(false);
        setEditingUsuario(null);
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          tipo: "cliente",
          empresa: "",
        });
        carregarUsuarios();
        toast.success(editingUsuario ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!");
      } else {
        toast.error("Erro: " + result.error);
      }
    } catch (error) {
      toast.error("Erro ao salvar usuário: " + error.message);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome || "",
      email: usuario.email || "",
      telefone: usuario.telefone || "",
      tipo: usuario.tipo || "cliente",
      empresa: usuario.empresa || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      const result = await deletarUsuario(id);
      if (result.success) {
        carregarUsuarios();
        toast.success("Usuário deletado com sucesso!");
      } else {
        toast.error("Erro ao deletar: " + result.error);
      }
    }
  };

  const handleNew = () => {
    setEditingUsuario(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      tipo: "cliente",
      empresa: "",
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  return (
    <div className="usuarios-container">
      <div className="page-header">
        <h2>Gerenciamento de Usuários</h2>
        <button className="btn-primary" onClick={handleNew}>
          + Novo Usuário
        </button>
      </div>

      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Tipo</th>
              <th>Empresa</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefone}</td>
                <td>
                  <span className="tipo-badge">{usuario.tipo}</span>
                </td>
                <td>{usuario.empresa || "-"}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(usuario)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(usuario.id)}
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuarios.length === 0 && (
        <p className="no-data">Nenhum usuário cadastrado</p>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>{editingUsuario ? "Editar Usuário" : "Novo Usuário"}</h3>
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
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone:</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
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
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="form-group">
              <label>Empresa:</label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) =>
                  setFormData({ ...formData, empresa: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingUsuario ? "Atualizar" : "Criar"}
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

export default Usuarios;
