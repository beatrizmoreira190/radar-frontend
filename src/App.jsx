import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Licitacoes from "./pages/Licitacoes";
import LicitacaoDetalhe from "./pages/LicitacaoDetalhe";
import Interesses from "./pages/Interesses";
import AcompanhamentoLicitacao from "./pages/AcompanhamentoLicitacao";
import Notificacoes from "./pages/Notificacoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login: página pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas usando AppLayout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/licitacoes"
          element={
            <PrivateRoute>
              <AppLayout>
                <Licitacoes />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/licitacao/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <LicitacaoDetalhe />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/interesses"
          element={
            <PrivateRoute>
              <AppLayout>
                <Interesses />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/acompanhamento/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <AcompanhamentoLicitacao />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/notificacoes"
          element={
            <PrivateRoute>
              <AppLayout>
                <Notificacoes />
              </AppLayout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
