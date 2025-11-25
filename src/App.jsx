import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Licitacoes from "./pages/Licitacoes";
import LicitacaoDetalhe from "./pages/LicitacaoDetalhe";
import Interesses from "./pages/Interesses";
import AcompanhamentoLicitacao from "./pages/AcompanhamentoLicitacao";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  const isLogged = !!localStorage.getItem("radar_token");

  return (
    <BrowserRouter>
      <div className="flex">
        
        {/* Sidebar só aparece se estiver logado */}
        {isLogged && <Sidebar />}

        <div className="flex-1">
          <Routes>

            {/* LOGIN (rota pública) */}
            <Route path="/login" element={<Login />} />

            {/* ROTA HOME → Dashboard protegida */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Licitações PNCP */}
            <Route
              path="/licitacoes"
              element={
                <PrivateRoute>
                  <Licitacoes />
                </PrivateRoute>
              }
            />

            {/* Detalhes */}
            <Route
              path="/licitacao/:id"
              element={
                <PrivateRoute>
                  <LicitacaoDetalhe />
                </PrivateRoute>
              }
            />

            {/* Favoritos / Salvos */}
            <Route
              path="/interesses"
              element={
                <PrivateRoute>
                  <Interesses />
                </PrivateRoute>
              }
            />

            {/* Acompanhamento */}
            <Route
              path="/acompanhamento/:id"
              element={
                <PrivateRoute>
                  <AcompanhamentoLicitacao />
                </PrivateRoute>
              }
            />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
