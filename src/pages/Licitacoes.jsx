import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

export default function Licitacoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [uf, setUf] = useState("");

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

  if (loading) {
    return (
      <Layout titulo="Licitações">
        <p>Carregando licitações...</p>
      </Layout>
    );
  }

  // 🔄 CONVERSÃO DOS CAMPOS DO PNCP → CAMPOS DO FRONTEND
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
  }));

  // 🔎 FILTROS
  const filtrados = dadosConvertidos.filter((item) => {
    const texto = `${item.objeto} ${item.orgao} ${item.modalidade}`.toLowerCase();
    const buscaOK = texto.includes(busca.toLowerCase());
    const modOK = modalidade ? item.modalidade === modalidade : true;
    const ufOK = uf ? item.uf === uf : true;
    return buscaOK && modOK && ufOK;
  });

  return (
    <Layout titulo="Licitações">
      {/* BUSCA */}
      <input
        type="text"
        placeholder="Buscar palavra-chave (ex: livros)"
        className="border p-3 rounded-lg w-full mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {/* FILTROS */}
      <div className="flex gap-4 mb-6">
        <select
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value)}
        >
          <option value="">Todas Modalidades</option>
          <option value="Pregão Eletrônico">Pregão Eletrônico</option>
          <option value="Concorrência">Concorrência</option>
        </select>

        <select
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
          value={uf}
          onChange={(e) => setUf(e.target.value)}
        >
          <option value="">UF</option>
          <option value="SP">SP</option>
          <option value="RJ">RJ</option>
          <option value="MG">MG</option>
        </select>
      </div>

      {/* TABELA ESTILO FIGMA */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Órgão
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Objeto
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Modalidade
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Publicação
              </th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((l, i) => (
              <tr
                key={i}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {l.orgao}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
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
                      }
                    `}
                  >
                    {l.modalidade}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {l.dataPublicacao}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className="text-gray-500 text-center py-6">
            Nenhuma licitação encontrada.
          </p>
        )}
      </div>
    </Layout>
  );
}
