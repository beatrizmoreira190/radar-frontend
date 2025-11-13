import { useEffect, useState } from "react";
import axios from "axios";

export default function Licitacoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [uf, setUf] = useState("");

  useEffect(() => {
    axios
      .get("https://radar-backend-c3p5.onrender.com/licitacoes/coletar")
      .then((r) => {
        setDados(r.data.dados || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregando licitações...</p>;

  // 🔍 FILTRO DE BUSCA
  const filtrados = dados.filter((item) => {
    const texto = `${item.objeto} ${item.orgao} ${item.modalidade}`.toLowerCase();
    const buscaOk = texto.includes(busca.toLowerCase());
    const modalidadeOk = modalidade ? item.modalidade === modalidade : true;
    const ufOk = uf ? item.uf === uf : true;
    return buscaOk && modalidadeOk && ufOk;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Licitações</h1>

      {/* 🔎 Barra de busca */}
      <input
        type="text"
        placeholder="Buscar por palavra-chave..."
        className="border p-2 rounded w-full mb-4"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {/* Filtros */}
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
          <option value="">Todas UF</option>
          <option value="SP">SP</option>
          <option value="RJ">RJ</option>
          <option value="MG">MG</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded shadow p-4">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Órgão</th>
              <th className="p-2">Objeto</th>
              <th className="p-2">Modalidade</th>
              <th className="p-2">Publicação</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((l, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{l.orgao}</td>
                <td className="p-2">{l.objeto}</td>
                <td className="p-2">{l.modalidade}</td>
                <td className="p-2">{l.dataPublicacao}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className="text-gray-600 mt-4">Nenhuma licitação encontrada.</p>
        )}
      </div>
    </div>
  );
}
