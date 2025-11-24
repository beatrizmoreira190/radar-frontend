import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Licitacoes from "./pages/Licitacoes";
import LicitacaoDetalhe from "./pages/LicitacaoDetalhe";
import Interesses from "./pages/Interesses";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        

        <div className="flex-1">
          <Routes>
            <Route path="/licitacoes" element={<Licitacoes />} />
            <Route path="/" element={<Licitacoes />} />
            <Route path="/licitacao/:id" element={<LicitacaoDetalhe />} />
            <Route path="/interesses" element={<Interesses />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
