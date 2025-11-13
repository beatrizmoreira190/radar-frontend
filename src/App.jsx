import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [licitacoes, setLicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://radar-backend-c3p5.onrender.com/licitacoes/coletar")
      .then((res) => {
        setLicitacoes(res.data.dados || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">Radar Inteligente 📚</h1>

      {loading ? (
        <p className="text-gray-600">Carregando licitações...</p>
      ) : (
        <div>
          <p className="mb-4">
            Total encontrado: <strong>{licitacoes.length}</strong>
          </p>

          {licitacoes.slice(0, 20).map((item, index) => (
            <div key={index} className="border p-4 rounded-lg mb-3">
              <h2 className="font-semibold">{item.objeto || "Sem objeto"}</h2>
              <p>Órgão: {item.orgaoEntidade || "Não informado"}</p>
              <p>Modalidade: {item.modalidadeNome}</p>
              <p>Publicação: {item.dataPublicacaoPncp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
