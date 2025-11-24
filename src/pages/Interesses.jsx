import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://radar-backend-c3p5.onrender.com";

export default function Interesses() {
  const [dados, setDados] = useState([]);
  const navigate = useNavigate();

  const carregar = async () => {
    const r = await axios.get(`${API}/interesses/listar`);
    setDados(r.data.dados || []);
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout titulo="Licitações Salvas">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          Licitações salvas ⭐
        </h1>

        {dados.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma licitação salva ainda.</p>
        ) : (
          <div className="space-y-3">
            {dados.map((lic) => (
              <div
                key={lic.id}
                className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/licitacao/${lic.id}`)}
              >
                <div>
                  <p className="font-semibold text-gray-900">{lic.orgao}</p>
                  <p className="text-sm text-gray-600">{lic.objeto}</p>
                  <p className="text-xs text-gray-400">
                    {lic.municipio} / {lic.uf} — {lic.data_publicacao}
                  </p>
                </div>

                <span className="text-yellow-500 text-lg">⭐</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
