import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const API = "https://radar-backend-c3p5.onrender.com";

export default function LicitacaoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [licitacao, setLicitacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchLicitacao = async () => {
      try {
        const res = await axios.get(`${API}/licitacoes/listar_banco?id=${id}`);
        const dados = res.data?.dados || [];
        if (!dados.length) {
          setErro("Licitação não encontrada.");
        } else {
          setLicitacao(dados[0]);
        }
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar detalhes da licitação.");
      }
      setLoading(false);
    };
    fetchLicitacao();
  }, [id]);

  if (loading) {
    return (
      <Layout titulo="Detalhes da Licitação">
        <div className="text-center text-gray-500 mt-10">
          Carregando detalhes...
        </div>
      </Layout>
    );
  }

  if (erro || !licitacao) {
    return (
      <Layout titulo="Detalhes da Licitação">
        <div className="flex flex-col items-center gap-4 mt-10 text-center">
          <p className="text-gray-600 text-sm">{erro || "Licitação não encontrada."}</p>
          <button
            onClick={() => navigate("/licitacoes")}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Voltar para Licitações
          </button>
        </div>
      </Layout>
    );
  }

  const raw = licitacao.json_raw || {};
  const orgaoEntidade = raw.orgaoEntidade || {};
  const unidadeOrgao = raw.unidadeOrgao || {};
  const amparoLegal = raw.amparoLegal || {};

  const dataPublicacao = raw.dataPublicacaoPncp
    ? new Date(raw.dataPublicacaoPncp).toLocaleString("pt-BR")
    : licitacao.data_publicacao
    ? new Date(licitacao.data_publicacao).toLocaleString("pt-BR")
    : "—";

  const dataAbertura = raw.dataAberturaProposta
    ? new Date(raw.dataAberturaProposta).toLocaleString("pt-BR")
    : licitacao.data_abertura
    ? new Date(licitacao.data_abertura).toLocaleString("pt-BR")
    : "—";

  const dataEncerramento = raw.dataEncerramentoProposta
    ? new Date(raw.dataEncerramentoProposta).toLocaleString("pt-BR")
    : "—";

  const valorTotalEstimado = raw.valorTotalEstimado
    ? `R$ ${raw.valorTotalEstimado.toLocaleString("pt-BR")}`
    : "—";

  const itens = raw.itens || [];
  const anexos = raw.anexos || [];

  return (
    <Layout titulo="Detalhes da Licitação">
      {/* Breadcrumb / Cabeçalho */}
      <div className="mb-6 text-sm text-gray-500">
        <button
          onClick={() => navigate("/licitacoes")}
          className="text-indigo-600 hover:underline"
        >
          Licitações
        </button>{" "}
        / <span className="font-medium">{orgaoEntidade.razaoSocial || licitacao.orgao}</span>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {orgaoEntidade.razaoSocial || licitacao.orgao}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              CNPJ: {orgaoEntidade.cnpj || "—"}
            </p>
            <p className="text-sm text-gray-700 mt-3">
              {raw.objetoCompra || licitacao.objeto}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
              {raw.modalidadeNome || licitacao.modalidade || "Modalidade não informada"}
            </span>
            <span className="text-xs text-gray-500">
              Situação:{" "}
              <span className="font-medium">
                {raw.situacaoCompraNome || "—"}
              </span>
            </span>
            <button
              className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              onClick={() => {
                if (licitacao.url_externa) {
                  window.open(licitacao.url_externa, "_blank");
                } else if (raw.linkSistemaOrigem) {
                  window.open(raw.linkSistemaOrigem, "_blank");
                }
              }}
            >
              Ver edital / página oficial
            </button>
          </div>
        </div>
      </div>

      {/* Grid de informações principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Município / UF
          </div>
          <div className="text-gray-800">
            {unidadeOrgao.municipioNome || licitacao.municipio || "—"}{" "}
            { (unidadeOrgao.ufSigla || licitacao.uf) && (
              <>/ {unidadeOrgao.ufSigla || licitacao.uf}</>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Código IBGE: {unidadeOrgao.codigoIbge || "—"}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Datas
          </div>
          <div className="text-gray-800">
            Publicação: <span className="font-medium">{dataPublicacao}</span>
          </div>
          <div className="text-gray-800">
            Abertura: <span className="font-medium">{dataAbertura}</span>
          </div>
          <div className="text-gray-800">
            Encerramento: <span className="font-medium">{dataEncerramento}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Identificação
          </div>
          <div className="text-gray-800">
            Número da compra: <span className="font-medium">{raw.numeroCompra || licitacao.numero}</span>
          </div>
          <div className="text-gray-800">
            ID PNCP: <span className="font-medium">{raw.numeroControlePNCP || licitacao.id_externo}</span>
          </div>
          <div className="text-gray-800">
            Valor estimado: <span className="font-medium">{valorTotalEstimado}</span>
          </div>
        </div>
      </div>

      {/* Amparo legal */}
      {amparoLegal?.nome && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Amparo legal
          </div>
          <div className="text-gray-800">{amparoLegal.nome}</div>
          <div className="text-xs text-gray-500 mt-1">
            {amparoLegal.descricao}
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      {raw.informacaoComplementar && raw.informacaoComplementar.trim() !== "" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Informações adicionais
          </div>
          <p className="text-gray-700 whitespace-pre-line">
            {raw.informacaoComplementar}
          </p>
        </div>
      )}

      {/* Itens */}
      {itens.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Itens da licitação
            </h2>
          </div>
          <div className="space-y-2">
            {itens.map((it, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-3 bg-gray-50"
              >
                <div className="font-semibold text-gray-800 mb-1">
                  Item {it.numeroItem || it.numero || idx + 1}
                </div>
                <div className="text-gray-700">
                  {it.descricaoItem || it.descricao || "Descrição não informada"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {it.quantidade && <>Quantidade: {it.quantidade} </>}
                  {it.unidade && <>• Unidade: {it.unidade}</>}
                  {it.valorUnitario && (
                    <>
                      {" "}
                      • Valor unitário: R${" "}
                      {Number(it.valorUnitario).toLocaleString("pt-BR")}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anexos */}
      {anexos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Anexos
          </h2>
          <ul className="list-disc list-inside text-indigo-700">
            {anexos.map((ax, idx) => (
              <li key={idx} className="mb-1">
                {ax.url ? (
                  <a
                    href={ax.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {ax.nomeArquivo || ax.nome || `Anexo ${idx + 1}`}
                  </a>
                ) : (
                  ax.nomeArquivo || ax.nome || `Anexo ${idx + 1}`
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => navigate("/licitacoes")}
        >
          Voltar
        </button>
        <button
  className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
  onClick={async () => {
    try {
      const res = await axios.post(
        `${API}/interesses/adicionar`,
        null,
        { params: { licitacao_id: id } }
      );
      alert(res.data.mensagem);
    } catch (e) {
      alert("Erro ao salvar.");
    }
  }}
>
  ⭐ Salvar licitação
</button>
      </div>
    </Layout>
  );
}

