import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

const API = "https://radar-backend-c3p5.onrender.com";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/notificacoes/listar`, {
        params: { apenas_nao_lidas: apenasNaoLidas },
      });
      setNotificacoes(res.data.dados || []);
    } catch (e) {
      console.error("Erro ao carregar notificações", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, [apenasNaoLidas]);

  const marcarComoLida = async (id) => {
    try {
      await axios.patch(`${API}/notificacoes/marcar_lida/${id}`);
      carregar();
    } catch (e) {
      console.error(e);
      alert("Erro ao marcar como lida.");
    }
  };

  const remover = async (id) => {
    if (!window.confirm("Remover esta notificação?")) return;
    try {
      await axios.delete(`${API}/notificacoes/remover/${id}`);
      carregar();
    } catch (e) {
      console.error(e);
      alert("Erro ao remover notificação.");
    }
  };

  const formatarData = (valor) => {
    if (!valor) return "—";
    try {
      return new Date(valor).toLocaleString("pt-BR");
    } catch {
      return valor;
    }
  };

  return (
    <Layout titulo="Notificações">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
            <p className="text-sm text-gray-500">
              Alertas gerados automaticamente pelo Radar Inteligente.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={apenasNaoLidas}
              onChange={(e) => setApenasNaoLidas(e.target.checked)}
            />
            Mostrar apenas não lidas
          </label>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Carregando notificações...</p>
        ) : notificacoes.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nenhuma notificação {apenasNaoLidas ? "não lida" : ""} no momento.
          </p>
        ) : (
          <div className="space-y-3">
            {notificacoes.map((n) => (
              <div
                key={n.id}
                className={`border rounded-xl p-4 flex justify-between items-start ${
                  n.lida ? "bg-gray-50" : "bg-indigo-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm ${
                      n.lida ? "text-gray-700" : "text-gray-900 font-semibold"
                    }`}
                  >
                    {n.mensagem}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatarData(n.criado_em)}
                  </p>
                  {n.licitacao_id && (
                    <button
                      className="mt-2 text-xs text-indigo-600 hover:underline"
                      onClick={() =>
                        (window.location.href = `/licitacao/${n.licitacao_id}`)
                      }
                    >
                      Ver licitação relacionada
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {!n.lida && (
                    <button
                      className="text-xs px-3 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => marcarComoLida(n.id)}
                    >
                      Marcar como lida
                    </button>
                  )}
                  <button
                    className="text-xs px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                    onClick={() => remover(n.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
