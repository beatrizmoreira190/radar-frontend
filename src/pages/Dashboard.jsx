import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "https://radar-backend-c3p5.onrender.com";

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [ufs, setUfs] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [prazos, setPrazos] = useState([]);

  const [loading, setLoading] = useState(true);

  const carregarDashboard = async () => {
    try {
      const r1 = await axios.get(`${API}/dashboard/resumo`);
      const r2 = await axios.get(`${API}/dashboard/estatisticas_uf`);
      const r3 = await axios.get(`${API}/dashboard/oportunidades_recentes`);
      const r4 = await axios.get(`${API}/dashboard/proximos_prazos`);

      setResumo(r1.data);
      setUfs(r2.data.dados || []);
      setRecentes(r3.data.dados || []);
      setPrazos(r4.data.proximos_prazos || []);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  if (loading) {
    return (
      <Layout titulo="Dashboard">
        <div className="text-center text-gray-500 mt-10">
          Carregando dashboard...
        </div>
      </Layout>
    );
  }

  return (
    <Layout titulo="Dashboard">
      {/* CARDS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* TOTAL DE LICITAÇÕES */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total de licitações</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {resumo.total_licitacoes}
          </h2>
        </div>

        {/* 24h */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Últimas 24h</p>
          <h2 className="text-2xl font-bold text-indigo-600 mt-1">
            {resumo.novas_24h}
          </h2>
        </div>

        {/* 7 dias */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Últimos 7 dias</p>
          <h2 className="text-2xl font-bold text-blue-600 mt-1">
            {resumo.novas_7dias}
          </h2>
        </div>

        {/* acompanhamentos ativos */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Acompanhamentos ativos</p>
          <h2 className="text-2xl font-bold text-emerald-600 mt-1">
            {resumo.acompanhamentos}
          </h2>
        </div>
      </div>

      {/* GRAFICOS + LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LICITAÇÕES POR UF */}
        <div className="lg:col-span-1 bg-white border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Licitações por UF
          </h3>

          {ufs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum dado disponível.</p>
          ) : (
            <ul className="space-y-2">
              {ufs.map((u) => (
                <li
                  key={u.uf}
                  className="flex justify-between border-b pb-2 text-sm"
                >
                  <span className="font-medium">{u.uf}</span>
                  <span className="text-gray-600">{u.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* OPORTUNIDADES RECENTES */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Oportunidades recentes
          </h3>

          {recentes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma licitação recente.</p>
          ) : (
            <div className="space-y-3">
              {recentes.map((l) => (
                <div
                  key={l.id}
                  className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => (window.location = `/licitacao/${l.id}`)}
                >
                  <p className="font-semibold text-gray-900">{l.orgao}</p>
                  <p className="text-sm text-gray-600">{l.objeto}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Publicado em:{" "}
                    {new Date(l.data_publicacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRÓXIMOS PRAZOS */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          Próximos prazos importantes
        </h3>

        {prazos.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum prazo encontrado.</p>
        ) : (
          <ul className="space-y-3">
            {prazos.map((p) => (
              <li
                key={p.id + p.tipo}
                className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => (window.location = `/licitacao/${p.id}`)}
              >
                <p className="font-medium text-gray-900">{p.objeto}</p>
                <p className="text-sm text-gray-600">
                  {p.tipo === "abertura"
                    ? "Abertura das propostas:"
                    : "Encerramento:"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.data).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
