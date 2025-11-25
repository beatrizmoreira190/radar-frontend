import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg h-screen p-6 flex flex-col justify-between">
      {/* TOPO */}
      <div>
        <h1 className="text-xl font-bold mb-8">Radar Inteligente</h1>

        <nav className="flex flex-col gap-4">
          <Link to="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>

          <Link to="/licitacoes" className="hover:text-blue-600">
            Licitações PNCP
          </Link>

          <Link to="/interesses" className="hover:text-blue-600">
            Licitações Salvas
          </Link>

          <Link to="/catalogo" className="hover:text-blue-600">
            Catálogo
          </Link>

          <Link to="/relatorios" className="hover:text-blue-600">
            Relatórios
          </Link>

          <Link to="/notificacoes" className="hover:text-blue-600">
            Notificações
          </Link>
        </nav>
      </div>

      {/* BOTÃO DE SAIR — EMBAIXO */}
      <button
        onClick={() => {
          localStorage.removeItem("radar_token");
          window.location.href = "/login";
        }}
        className="text-red-600 hover:text-red-800 text-sm font-medium mt-6"
      >
        Sair
      </button>
    </div>
  );
}
