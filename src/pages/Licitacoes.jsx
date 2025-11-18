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
      .get(`${API}/licitacoes/coletar_licitacoes`)
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

  const filtrados = dados.filter((item) => {
    const texto =
      `${item.objeto || ""} ${item.orgaoEntidade || ""} ${
        item.modalidadeNome || ""
      }`.toLowerCase();

    const buscaOK = texto.includes(busca.toLowerCase());
    const modOK = modalidade ? item.modalidadeNome === modalidade : true;
    const ufOK = uf ? item.uf === uf : true;

    return buscaOK && modOK && ufOK;
  });

  return (
    <Layout titulo="Licitações">

      {/* BUSCA */}
      <input
        type="text"
        placeholder="Buscar palavra-chave (ex: livros)"
        className="border p-2 rounded w-full mb-4"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {/* FILTROS */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value)}
        >
          <option value="">Todas Modalidades</option>
          <option value="Pregão Eletrônico">Pregão Eletrônico</option>
          <option value="Concorrência">Concorrência</option>
        </select>

        <select
          className="border p-2 rounded"
          value={uf}
          onChange={(e) => setUf(e.target.value)}
        >
          <option value="">UF</option>
          <option value="SP">SP</option>
          <option value="RJ">RJ</option>
          <option value="MG">MG</option>
        </select>
      </div>

      {/* TABELA */}
      <table className="w-full bg-white shadow rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Órgão</th>
            <th className="p-3 text-left">Objeto</th>
            <th className="p-3 text-left">Modalidade</th>
            <th className="p-3 text-left">Publicação</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((l, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-3">{l.orgaoEntidade}</td>
              <td className="p-3">{l.objeto}</td>
              <td className="p-3">{l.modalidadeNome}</td>
              <td className="p-3">{l.dataPublicacaoPncp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtrados.length === 0 && (
        <p className="text-gray-500 mt-4">Nenhuma licitação encontrada.</p>
      )}
    </Layout>
  );
}
