import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://radar-backend-c3p5.onrender.com";

export default function Interesses() {
  const [dados, setDados] = useState([]);
  const navigate = useNavigate();

  // =============================
  // Carregar lista de favoritos
  // =============================
  const carregar = async () => {
    try {
      const r = await axios.get(`${API}/interesses/listar`);
      setDados(r.data.dados || []);
    } catch (e) {
      console.error("Erro ao carregar interesses", e);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // =============================
  // Remover favorito
  // =============================
  const removerFavorito = async (id) => {
    if (!window.confirm("Remover esta licitação dos favoritos?")) return;

    try {
      await axios.delete(`${API}/interesses/remover/${id}`);
      carregar(); // atualiza a lista
    } catch (e) {
      console.error(e);
      alert("Erro ao remover favorito.");
    }
  };

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
                className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                {/* Clicar aqui abre detalhes */}
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => navigate(`/licitacao/${lic.id}`)}
                >
                  <p className="font-semibold text-gray-900">{lic.orgao}</p>
                  <p className="text-sm text-gray-600">{lic.objeto}</p>
                  <p className="text-xs text-gray-400">
                    {lic.municipio} / {lic.uf} — {lic.data_publicacao}
                  </p>
                </div>

                {/* Botão de remover favorito */}
                <button
                  className="text-yellow-500 hover:text-yellow-600 text-xl ml-4"
                  onClick={(e) => {
                    e.stopPropagation(); // impede que abra os detalhes
                    removerFavorito(lic.id);
                  }}
                >
                  ⭐
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
