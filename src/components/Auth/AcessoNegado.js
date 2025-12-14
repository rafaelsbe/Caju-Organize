import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AcessoNegado.css";

const AcessoNegado = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="acesso-negado-container">
      <div className="acesso-negado-box">
        <div className="icon">🚫</div>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta área.</p>
        <p className="subtitle">
          Apenas administradores podem acessar esta funcionalidade.
        </p>
        <div className="actions">
          <button onClick={() => navigate("/")} className="btn-primary">
            Voltar ao Dashboard
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Fazer Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcessoNegado;
