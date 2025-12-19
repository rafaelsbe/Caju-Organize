import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";
import AcessoNegado from "./components/Auth/AcessoNegado";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Espacos from "./components/Espacos/Espacos";
import Usuarios from "./components/Usuarios/Usuarios";
import Reservas from "./components/Reservas/Reservas";
import Agenda from "./components/Agenda/Agenda";
import Relatorios from "./components/Relatorios/Relatorios";
import Reservar from "./components/Reservar/Reservar";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/espacos"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Espacos />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Usuarios />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Reservas />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Agenda />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Relatorios />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/acesso-negado" element={<AcessoNegado />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
