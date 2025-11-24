import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Licitacoes from "./pages/Licitacoes";
import LicitacaoDetalhe from "./pages/LicitacaoDetalhe";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <Routes>
            <Route path="/licitacoes" element={<Licitacoes />} />
            <Route path="/" element={<Licitacoes />} />
            <Route path="/licitacao/:id" element={<LicitacaoDetalhe />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
