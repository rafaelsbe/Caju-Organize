import React, { useState, useEffect } from "react";
import { listarEspacos } from "../../services/espacoService";
import { criarReserva } from "../../services/reservaService";
import "./Reservar.css";

const Reservar = () => {
  const [espacos, setEspacos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    espacoId: "",
    dataInicio: "",
    dataFim: "",
    observacoes: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    carregarEspacos();
  }, []);

  const carregarEspacos = async () => {
    setLoading(true);
    try {
      const result = await listarEspacos();
      if (result.success) {
        setEspacos(result.data.filter((e) => e.disponivel !== false));
      }
    } catch (error) {
      console.error("Erro ao carregar espaços:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    
    if (
      !formData.nome ||
      !formData.email ||
      !formData.espacoId ||
      !formData.dataInicio ||
      !formData.dataFim
    ) {
      setMessage({
        type: "error",
        text: "Preencha todos os campos obrigatórios",
      });
      setSubmitting(false);
      return;
    }

    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);
    if (fim <= inicio) {
      setMessage({
        type: "error",
        text: "A data de fim deve ser posterior à data de início",
      });
      setSubmitting(false);
      return;
    }

    try {
      const reservaData = {
        ...formData,
        usuarioId: `temp_${Date.now()}`,
        status: "pendente",
      };

      const result = await criarReserva(reservaData);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Solicitação de reserva enviada com sucesso! Aguarde a confirmação do administrador.",
        });

        setFormData({
          nome: "",
          email: "",
          telefone: "",
          espacoId: "",
          dataInicio: "",
          dataFim: "",
          observacoes: "",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao criar reserva",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro inesperado. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="reservar-container">
        <div className="loading">Carregando espaços disponíveis...</div>
      </div>
    );
  }

  return (
    <div className="reservar-container">
      <div className="reservar-header">
        <h1>CAJUHUB Organize</h1>
        <p>Reserve seu espaço de forma rápida e fácil</p>
      </div>

      <div className="reservar-content">
        <div className="reservar-form-container">
          <h2>Nova Reserva</h2>

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit} className="reservar-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label>Espaço Desejado *</label>
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
                    {espaco.nome} - {espaco.tipo} ({espaco.capacidade} pessoas)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data e Hora de Início *</label>
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
                <label>Data e Hora de Fim *</label>
                <input
                  type="datetime-local"
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                rows="4"
                placeholder="Informações adicionais sobre sua reserva..."
              />
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Solicitar Reserva"}
            </button>
          </form>
        </div>

        <div className="espacos-preview">
          <h3>Espaços Disponíveis</h3>
          <div className="espacos-grid">
            {espacos.map((espaco) => (
              <div key={espaco.id} className="espaco-preview-card">
                <h4>{espaco.nome}</h4>
                <p className="espaco-tipo">{espaco.tipo}</p>
                <p>
                  <strong>Capacidade:</strong> {espaco.capacidade} pessoas
                </p>
                {espaco.localizacao && (
                  <p>
                    <strong>Localização:</strong> {espaco.localizacao}
                  </p>
                )}
                {espaco.descricao && (
                  <p className="espaco-desc">{espaco.descricao}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservar;
