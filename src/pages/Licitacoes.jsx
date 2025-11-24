import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

export default function Licitacoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtros
  const [busca, setBusca] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [uf, setUf] = useState("");
  const [situacao, setSituacao] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [viewMode, setViewMode] = useState("table");
  const [selecionada, setSelecionada] = useState(null);

  // paginação somente no frontend
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const API = "https://radar-backend-c3p5.onrender.com";

  // ===== FUNÇÃO DE BUSCA (LENDO DO BANCO) =====
  const buscarLicitacoes = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (modalidade) params.append("modalidade", modalidade);
      if (busca) params.append("busca", busca);
      if (uf) params.append("uf", uf);

      const res = await axios.get(
        `${API}/licitacoes/listar_banco?` + params.toString()
      );
      const lista = res.data?.dados || [];
      setDados(lista);
      setPagina(1); // reset na página ao buscar
    } catch (err) {
      console.error("Erro ao carregar licitações:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    buscarLicitacoes();
  }, []);

  // ====== CONVERSÃO DOS DADOS (USANDO json_raw) ======
  const dadosConvertidos = dados.map((item) => {
    const raw = item.json_raw || {};

    const orgaoEntidade = raw.orgaoEntidade || {};
    const unidadeOrgao = raw.unidadeOrgao || {};
    const amparoLegal = raw.amparoLegal || {};

    const situacaoCompraNome = raw.situacaoCompraNome || "—";
    const modalidadeNome = raw.modalidadeNome || item.modalidade || "—";
    const modoDisputaNome = raw.modoDisputaNome || "—";

    const dataPublicacaoPncp = raw.dataPublicacaoPncp || item.data_publicacao;
    const dataAberturaProposta =
      raw.dataAberturaProposta || item.data_abertura;
    const dataEncerramentoProposta = raw.dataEncerramentoProposta || null;

    const valorTotalEstimado = raw.valorTotalEstimado || null;

    return {
      orgao: orgaoEntidade.razaoSocial || item.orgao || "—",
      cnpj: orgaoEntidade.cnpj || "—",
      unidade: unidadeOrgao.nomeUnidade || "—",
      municipio: unidadeOrgao.municipioNome || item.municipio || "—",
      ufSigla: unidadeOrgao.ufSigla || item.uf || "—",
      ibge: unidadeOrgao.codigoIbge || null,

      objeto: raw.objetoCompra || item.objeto || "—",

      numeroCompra: raw.numeroCompra || item.numero || "—",
      processo: raw.processo || null,
      idPNCP: raw.numeroControlePNCP || item.id_externo || "—",

      modalidadeNome,
      situacao: situacaoCompraNome,
      disputa: modoDisputaNome,

      amparoLegal,
      srp: raw.srp || false,

      // Datas formatadas para EXIBIR
      dataPublicacao: dataPublicacaoPncp
        ? new Date(dataPublicacaoPncp).toLocaleString("pt-BR")
        : "—",
      dataAbertura: dataAberturaProposta
        ? new Date(dataAberturaProposta).toLocaleString("pt-BR")
        : "—",
      dataEncerramento: dataEncerramentoProposta
        ? new Date(dataEncerramentoProposta).toLocaleString("pt-BR")
        : "—",

      valorEstimado: valorTotalEstimado
        ? `R$ ${valorTotalEstimado.toLocaleString("pt-BR")}`
        : "—",

      link: raw.linkSistemaOrigem || item.url_externa || null,
      informacaoComplementar: raw.informacaoComplementar || null,

      itens: raw.itens || [],
      anexos: raw.anexos || [],

      // Guardamos o raw caso precise
      raw,

      // ⭐ CAMPO NOVO: data bruta que veio do backend
      data_publicacao_bruta: item.data_publicacao,
    };
  });

  // ====== FILTROS LOCAIS ======
  const filtrados = dadosConvertidos.filter((item) => {
    const texto = `${item.objeto} ${item.orgao} ${item.modalidadeNome} ${item.municipio}`.toLowerCase();
    const buscaOK = busca ? texto.includes(busca.toLowerCase()) : true;

    const modOK = modalidade
      ? item.modalidadeNome.toLowerCase().includes(modalidade.toLowerCase())
      : true;

    const ufOK = uf ? item.ufSigla === uf : true;

    const situacaoOK = situacao
      ? item.situacao &&
        item.situacao.toLowerCase().includes(situacao.toLowerCase())
      : true;

    // filtro por período de publicação (usando data_publicacao_bruta)
    let dataOK = true;
    if (dataIni || dataFim) {
      const d = item.data_publicacao_bruta
        ? new Date(item.data_publicacao_bruta)
        : null;

      if (d) {
        if (dataIni) {
          const di = new Date(`${dataIni}T00:00:00`);
          if (d < di) dataOK = false;
        }
        if (dataFim) {
          const df = new Date(`${dataFim}T23:59:59`);
          if (d > df) dataOK = false;
        }
      }
    }

    return buscaOK && modOK && ufOK && situacaoOK && dataOK;
  });

  // ====== PAGINAÇÃO FRONT: ordenar antes, paginar depois ======

  // 1. Ordenar os dados filtrados por data bruta
  const ordenados = [...filtrados].sort((a, b) => {
    const dataA = a.data_publicacao_bruta
      ? new Date(a.data_publicacao_bruta)
      : 0;
    const dataB = b.data_publicacao_bruta
      ? new Date(b.data_publicacao_bruta)
      : 0;
    return dataB - dataA; // mais recente primeiro
  });

  // 2. Calcular total
  const totalRegistros = ordenados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / porPagina));

  // 3. Não alterar state aqui, só corrigir visualmente
  const paginaCorrigida = Math.min(pagina, totalPaginas);

  // 4. Cortar apenas os itens da página correta
  const inicio = (paginaCorrigida - 1) * porPagina;
  const fim = inicio + porPagina;
  const paginaAtual = ordenados.slice(inicio, fim);

  // 5. Botão para mudar de página
  const mudarPagina = (p) => {
    if (p >= 1 && p <= totalPaginas) {
      setPagina(p);
    }
  };

  // gera lista de páginas para o controle (janela)
  const getPaginasVisiveis = () => {
    const max = 5; // quantos botões mostrar
    const pages = [];
    if (totalPaginas <= max) {
      for (let i = 1; i <= totalPaginas; i++) pages.push(i);
    } else {
      if (paginaCorrigida <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPaginas);
      } else if (paginaCorrigida >= totalPaginas - 2) {
        pages.push(
          1,
          "...",
          totalPaginas - 3,
          totalPaginas - 2,
          totalPaginas - 1,
          totalPaginas
        );
      } else {
        pages.push(
          1,
          "...",
          paginaCorrigida - 1,
          paginaCorrigida,
          paginaCorrigida + 1,
          "...",
          totalPaginas
        );
      }
    }
    return pages;
  };

  // ====== MÉTRICAS ======
  const totalPregao = filtrados.filter((d) =>
    d.modalidadeNome.toLowerCase().includes("pregão")
  ).length;
  const totalOutras = totalRegistros - totalPregao;

  const limparFiltros = () => {
    setBusca("");
    setModalidade("");
    setUf("");
    setSituacao("");
    setDataIni("");
    setDataFim("");
    setPagina(1);
  };

  return (
    <Layout titulo="Licitações">
      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="text-xs font-medium text-gray-500">
            Licitações encontradas
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {totalRegistros}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="text-xs font-medium text-gray-500">
            Pregões eletrônicos
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {totalPregao}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="text-xs font-medium text-gray-500">
            Outras modalidades
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {totalOutras}
          </div>
        </div>
      </div>

      {/* BUSCA / FILTROS / MODO VISUALIZAÇÃO */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por termo, órgão, modalidade..."
              className="border border-gray-200 p-3 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="border border-gray-200 p-3 rounded-xl shadow-sm bg-white text-sm"
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
            >
              <option value="">Todas Modalidades</option>
              <option value="pregão">Pregão</option>
              <option value="concorrência">Concorrência</option>
            </select>

            <select
              className="border border-gray-200 p-3 rounded-xl shadow-sm bg-white text-sm"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
            >
              <option value="">UF</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AM">AM</option>
              <option value="AP">AP</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MG">MG</option>
              <option value="MS">MS</option>
              <option value="MT">MT</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="RS">RS</option>
              <option value="SC">SC</option>
              <option value="SE">SE</option>
              <option value="SP">SP</option>
              <option value="TO">TO</option>
            </select>

            <select
              className="border border-gray-200 p-3 rounded-xl shadow-sm bg-white text-sm"
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
            >
              <option value="">Todas Situações</option>
              <option value="divulgada">Divulgada no PNCP</option>
              <option value="aberta">Aberta</option>
              <option value="homologada">Homologada / Encerrada</option>
            </select>

            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 text-sm"
              onClick={buscarLicitacoes}
            >
              Buscar
            </button>
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

        {/* FILTRO POR PERÍODO + LIMPAR / ITENS POR PÁGINA */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-500">Publicação:</span>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
              value={dataIni}
              onChange={(e) => {
                setDataIni(e.target.value);
                setPagina(1);
              }}
            />
            <span>até</span>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
              value={dataFim}
              onChange={(e) => {
                setDataFim(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          <button
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Exibir por página:</span>
            <select
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
              value={porPagina}
              onChange={(e) => {
                setPorPagina(Number(e.target.value));
                setPagina(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTAGEM */}
      {loading ? (
        <div className="text-center text-gray-500 text-sm py-12">
          Carregando licitações...
        </div>
      ) : paginaAtual.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 text-sm">
          Nenhuma licitação encontrada com os filtros atuais.
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                <th className="px-4 py-3">Órgão</th>
                <th className="px-4 py-3">Município / UF</th>
                <th className="px-4 py-3">Objeto</th>
                <th className="px-4 py-3">Modalidade</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3 whitespace-nowrap">Abertura</th>
                <th className="px-4 py-3 whitespace-nowrap">Valor Estimado</th>
              </tr>
            </thead>
            <tbody>
              {paginaAtual.map((l, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelecionada(l)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {l.orgao}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {l.municipio} / {l.ufSigla}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xl truncate">
                    {l.objeto}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {l.modalidadeNome}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{l.situacao}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {l.dataAbertura}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {l.valorEstimado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // CARDS
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginaAtual.map((l, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm 
                         hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer
                         px-6 py-5 flex flex-col gap-4"
              onClick={() => setSelecionada(l)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-lg text-gray-500">🏛️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {l.orgao}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {l.municipio} • {l.ufSigla}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {l.objeto}
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                  {l.modalidadeNome}
                </span>

                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Abertura:{" "}
                  <span className="font-medium">{l.dataAbertura}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINAÇÃO FRONT MODERNA */}
      {totalPaginas > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6 text-xs">
          <div className="text-gray-500">
            Mostrando{" "}
            <span className="font-semibold">
              {totalRegistros === 0 ? 0 : inicio + 1}–
              {Math.min(fim, totalRegistros)}
            </span>{" "}
            de <span className="font-semibold">{totalRegistros}</span> licitações
          </div>

          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-40"
              onClick={() => mudarPagina(1)}
              disabled={paginaCorrigida === 1}
            >
              «
            </button>
            <button
              className="px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-40"
              onClick={() => mudarPagina(paginaCorrigida - 1)}
              disabled={paginaCorrigida === 1}
            >
              ‹
            </button>

            {getPaginasVisiveis().map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  className={`px-3 py-1 rounded border text-xs ${
                    p === paginaCorrigida
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                  onClick={() => mudarPagina(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-40"
              onClick={() => mudarPagina(paginaCorrigida + 1)}
              disabled={paginaCorrigida === totalPaginas}
            >
              ›
            </button>
            <button
              className="px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-40"
              onClick={() => mudarPagina(totalPaginas)}
              disabled={paginaCorrigida === totalPaginas}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO (igual ao seu) */}
      {selecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setSelecionada(null)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {selecionada.orgao}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              CNPJ: {selecionada.cnpj}
            </p>

            <p className="text-sm text-gray-700 mb-4">
              {selecionada.objeto}
            </p>

            {/* GRID DE DETALHES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Unidade
                </div>
                <div>{selecionada.unidade}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Município / UF
                </div>
                <div>
                  {selecionada.municipio} / {selecionada.ufSigla}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Modalidade
                </div>
                <div>{selecionada.modalidadeNome}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Situação PNCP
                </div>
                <div>{selecionada.situacao}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Número da compra
                </div>
                <div>{selecionada.numeroCompra}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  ID PNCP
                </div>
                <div>{selecionada.idPNCP}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Data publicação
                </div>
                <div>{selecionada.dataPublicacao}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Abertura
                </div>
                <div>{selecionada.dataAbertura}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Encerramento
                </div>
                <div>{selecionada.dataEncerramento}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Valor estimado
                </div>
                <div>{selecionada.valorEstimado}</div>
              </div>

              {selecionada.amparoLegal?.nome && (
                <div className="md:col-span-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Amparo legal
                  </div>
                  <div>{selecionada.amparoLegal.nome}</div>
                  <div className="text-xs text-gray-500">
                    {selecionada.amparoLegal.descricao}
                  </div>
                </div>
              )}
            </div>

            {/* INFORMACOES COMPLEMENTARES */}
            {selecionada.informacaoComplementar && (
              <div className="mb-6 text-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Informações adicionais
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {selecionada.informacaoComplementar}
                </p>
              </div>
            )}

            {/* ITENS */}
            {selecionada.itens && selecionada.itens.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Itens da licitação
                </h3>
                <div className="space-y-2 text-sm">
                  {selecionada.itens.map((it, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-3 bg-gray-50"
                    >
                      <div className="font-semibold text-gray-800 mb-1">
                        Item {it.numeroItem || it.numero || idx + 1}
                      </div>
                      <div className="text-gray-700">
                        {it.descricaoItem ||
                          it.descricao ||
                          "Descrição não informada"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {it.quantidade && <>Quantidade: {it.quantidade} </>}
                        {it.unidade && <>• Unidade: {it.unidade}</>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANEXOS */}
            {selecionada.anexos && selecionada.anexos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Anexos
                </h3>
                <ul className="list-disc list-inside text-sm text-indigo-700">
                  {selecionada.anexos.map((ax, idx) => (
                    <li key={idx}>
                      {ax.url ? (
                        <a
                          href={ax.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {ax.nomeArquivo ||
                            ax.nome ||
                            `Anexo ${idx + 1}`}
                        </a>
                      ) : (
                        ax.nomeArquivo || ax.nome || `Anexo ${idx + 1}`
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* LINK OFICIAL */}
            {selecionada.link && (
              <div className="mb-6 text-sm">
                <a
                  href={selecionada.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Ver edital / página oficial
                </a>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
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
