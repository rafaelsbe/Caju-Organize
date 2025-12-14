import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userRole, logout, isAdmin } = useAuth();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen((s) => !s);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>Cajuhub Organize</h1>
          <p>Sistema de Gerenciamento de Espaços</p>
        </div>

        <button
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          aria-expanded={menuOpen}
          aria-label="Abrir menu"
          onClick={toggleMenu}
        >
          <span className="hamburger" />
        </button>

        <ul className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={closeMenu} className={isActive("/")}>
              Dashboard
            </Link>
          </li>
          {isAdmin() && (
            <>
              <li>
                <Link
                  to="/espacos"
                  onClick={closeMenu}
                  className={isActive("/espacos")}
                >
                  Espaços
                </Link>
              </li>
              <li>
                <Link
                  to="/usuarios"
                  onClick={closeMenu}
                  className={isActive("/usuarios")}
                >
                  Usuários
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              to="/reservas"
              onClick={closeMenu}
              className={isActive("/reservas")}
            >
              Reservas
            </Link>
          </li>
          {isAdmin() && (
            <>
              <li>
                <Link
                  to="/agenda"
                  onClick={closeMenu}
                  className={isActive("/agenda")}
                >
                  Agenda
                </Link>
              </li>
              <li>
                <Link
                  to="/relatorios"
                  onClick={closeMenu}
                  className={isActive("/relatorios")}
                >
                  Relatórios
                </Link>
              </li>
            </>
          )}
          <li className="user-info">
            <span className="user-name">{currentUser?.email || "Usuário"}</span>
            <span className="user-role">
              ({userRole === "admin" ? "Admin" : "Cliente"})
            </span>
            <button
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              className="btn-logout"
            >
              Sair
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
