import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Licitacoes from "./pages/Licitacoes";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <Routes>
            <Route path="/licitacoes" element={<Licitacoes />} />
            <Route path="/" element={<Licitacoes />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
