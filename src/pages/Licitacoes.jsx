import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

export default function Licitacoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [uf, setUf] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selecionada, setSelecionada] = useState(null);

  const API = "https://radar-backend-c3p5.onrender.com";

  useEffect(() => {
    axios
      .get(`${API}/licitacoes/coletar`)
      .then((res) => {
        const lista = res.data?.dados || [];
        setDados(lista);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar licitações:", err);
        setLoading(false);
      });
  }, []);

  // SKELETON
  if (loading) {
    return (
      <Layout titulo="Licitações">
        <div className="space-y-4">
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  // 🔄 Conversão dos dados do PNCP
  const dadosConvertidos = dados.map((item) => ({
    orgao: item.orgaoEntidade?.razaoSocial || "—",
    objeto: item.descricao || "—",
    modalidade:
      item.modalidade == 6
        ? "Pregão Eletrônico"
        : item.modalidade == 1
        ? "Concorrência"
        : "Outras",
    dataPublicacao: item.dataPublicacaoPncp
      ? new Date(item.dataPublicacaoPncp).toLocaleDateString("pt-BR")
      : "—",
    uf: item.orgaoEntidade?.uf || "",
    raw: item,
  }));

  // MÉTRICAS
  const total = dadosConvertidos.length;
  const totalPregao = dadosConvertidos.filter(
    (d) => d.modalidade === "Pregão Eletrônico"
  ).length;
  const totalConcorrencia = dadosConvertidos.filter(
    (d) => d.modalidade === "Concorrência"
  ).length;

  // FILTROS
  const filtrados = dadosConvertidos.filter((item) => {
    const texto = `${item.objeto} ${item.orgao} ${item.modalidade}`.toLowerCase();
    const buscaOK = texto.includes(busca.toLowerCase());
    const modOK = modalidade ? item.modalidade === modalidade : true;
    const ufOK = uf ? item.uf === uf : true;
    return buscaOK && modOK && ufOK;
  });

  return (
    <Layout titulo="Licitações">
      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="text-xs font-medium text-gray-500">
            Licitações encontradas
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{total}</div>
          <div className="text-xs text-gray-400 mt-1">
            Base PNCP – parâmetros atuais
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="text-xs font-medium text-gray-500">
            Pregões eletrônicos
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {totalPregao}
          </div>
          <div className="text-xs text-gray-400 mt-1">Modalidade 6 – PNCP</div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="text-xs font-medium text-gray-500">
            Concorrências / Outras
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {totalConcorrencia}{" "}
            <span className="text-sm font-medium text-gray-400">
              / {total - totalPregao}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Inclui outras modalidades
          </div>
        </div>
      </div>

      {/* BUSCA / FILTROS / TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por termo, órgão, modalidade..."
            className="border border-gray-200 p-3 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <select
            className="border border-gray-200 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          >
            <option value="">Todas Modalidades</option>
            <option value="Pregão Eletrônico">Pregão Eletrônico</option>
            <option value="Concorrência">Concorrência</option>
            <option value="Outras">Outras</option>
          </select>

          <select
            className="border border-gray-200 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
          >
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
          </select>
        </div>

        <div className="flex bg-gray-100 rounded-full p-1 text-xs font-medium">
          <button
            className={`px-4 py-2 rounded-full transition ${
              viewMode === "table"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("table")}
          >
            Tabela
          </button>
          <button
            className={`px-4 py-2 rounded-full transition ${
              viewMode === "cards"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("cards")}
          >
            Cards
          </button>
        </div>
      </div>

      {/* TABELA OU CARDS */}
      {filtrados.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 text-sm">
          Nenhuma licitação encontrada com os filtros atuais.
        </div>
      ) : viewMode === "table" ? (
        /* === TABELA === */
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Órgão
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Objeto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Modalidade
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Publicação
                </th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((l, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelecionada(l)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {l.orgao}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xl truncate">
                    {l.objeto}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          l.modalidade === "Pregão Eletrônico"
                            ? "bg-blue-100 text-blue-700"
                            : l.modalidade === "Concorrência"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {l.modalidade}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {l.dataPublicacao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* === CARDS FIGMA PREMIUM === */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrados.map((l, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm 
                           hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer
                           px-6 py-5 flex flex-col gap-4"
                onClick={() => setSelecionada(l)}
              >
                {/* HEADER */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-lg text-gray-500">🏛️</span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {l.orgao}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Publicado via PNCP
                    </p>
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {l.objeto !== "—" ? l.objeto : "Descrição não informada"}
                </div>

                <div className="w-full h-px bg-gray-100" />

                {/* FOOTER */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        l.modalidade === "Pregão Eletrônico"
                          ? "bg-blue-100 text-blue-700"
                          : l.modalidade === "Concorrência"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {l.modalidade}
                  </span>

                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Publicação:{" "}
                    <span className="font-medium">{l.dataPublicacao}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL DE DETALHES */}
      {selecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setSelecionada(null)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {selecionada.orgao}
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              {selecionada.objeto}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Modalidade
                </div>
                <div className="mt-1">{selecionada.modalidade}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Publicação
                </div>
                <div className="mt-1">{selecionada.dataPublicacao}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelecionada(null)}
              >
                Fechar
              </button>
              <button className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                Salvar licitação
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
