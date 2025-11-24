// src/pages/AcompanhamentoLicitacao.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const API = "https://radar-backend-c3p5.onrender.com";

export default function AcompanhamentoLicitacao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [licitacao, setLicitacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Acompanhamento
  const [acompanhamentoAtivo, setAcompanhamentoAtivo] = useState(false);
  const [status, setStatus] = useState("interessado");
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefaTitulo, setNovaTarefaTitulo] = useState("");
  const [novaTarefaDescricao, setNovaTarefaDescricao] = useState("");
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [salvandoTarefa, setSalvandoTarefa] = useState(false);

  const statusOptions = [
    { value: "interessado", label: "Interessado" },
    { value: "estudando_editais", label: "Estudando edital" },
    { value: "documentacao_pronta", label: "Documentação pronta" },
    { value: "proposta_enviada", label: "Proposta enviada" },
    { value: "aguardando_resultado", label: "Aguardando resultado" },
    { value: "encerrado", label: "Encerrado" },
  ];

  const formatarData = (valor) => {
    if (!valor) return "—";
    try {
      return new Date(valor).toLocaleString("pt-BR");
    } catch {
      return valor;
    }
  };

  // Progresso simples: % de tarefas concluídas
  const progresso = useMemo(() => {
    if (!tarefas.length) return 0;
    const concluidas = tarefas.filter((t) => t.concluido).length;
    return Math.round((concluidas / tarefas.length) * 100);
  }, [tarefas]);

  // ==============================
  // 1) Carregar licitação
  // ==============================
  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        // versão mais eficiente: backend já aceita ?id=
        const res = await axios.get(`${API}/licitacoes/listar_banco`, {
          params: { id },
        });

        const lic = res.data?.dados?.[0];
        if (!lic) {
          setErro("Licitação não encontrada.");
        } else {
          setLicitacao(lic);
        }
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar licitação.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  // ==============================
  // 2) Carregar acompanhamento
  // ==============================
  const carregarAcompanhamento = async () => {
    try {
      // Verifica se já existe interesse/acompanhamento
      const fav = await axios.get(`${API}/interesses/verificar`, {
        params: { licitacao_id: id },
      });

      const ativo = !!fav.data?.salvo;
      setAcompanhamentoAtivo(ativo);

      if (!ativo) {
        setTarefas([]);
        return;
      }

      // Tarefas
      const resT = await axios.get(`${API}/acompanhamento/tarefas`, {
        params: { licitacao_id: id },
      });
      setTarefas(resT.data?.tarefas || []);

      // Status (pegando via interesses/listar)
      const resI = await axios.get(`${API}/interesses/listar`);
      const item = resI.data?.dados?.find((d) => String(d.id) === String(id));
      if (item?.status) {
        setStatus(item.status);
      }
    } catch (err) {
      console.error("Erro ao carregar acompanhamento", err);
    }
  };

  useEffect(() => {
    if (licitacao) {
      carregarAcompanhamento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licitacao?.id]);

  // ==============================
  // 3) Iniciar acompanhamento
  // ==============================
  const iniciarAcompanhamento = async () => {
    try {
      await axios.post(`${API}/acompanhamento/iniciar`, null, {
        params: { licitacao_id: id },
      });
      await carregarAcompanhamento();
      alert("Acompanhamento iniciado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar acompanhamento.");
    }
  };

  // ==============================
  // 4) Alterar status
  // ==============================
  const handleStatusChange = async (novo) => {
    setStatus(novo);
    setSalvandoStatus(true);
    try {
      await axios.patch(`${API}/acompanhamento/status`, null, {
        params: { licitacao_id: id, status: novo },
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status.");
    } finally {
      setSalvandoStatus(false);
    }
  };

  // ==============================
  // 5) Criar tarefa
  // ==============================
  const handleCriarTarefa = async () => {
    if (!novaTarefaTitulo.trim()) return;
    setSalvandoTarefa(true);
    try {
      await axios.post(`${API}/acompanhamento/tarefas/adicionar`, null, {
        params: {
          licitacao_id: id,
          titulo: novaTarefaTitulo,
          descricao: novaTarefaDescricao,
        },
      });
      setNovaTarefaTitulo("");
      setNovaTarefaDescricao("");
      await carregarAcompanhamento();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar tarefa.");
    } finally {
      setSalvandoTarefa(false);
    }
  };

  // ==============================
  // 6) Concluir / Remover tarefa
  // ==============================
  const concluirTarefa = async (tarefaId) => {
    try {
      await axios.patch(
        `${API}/acompanhamento/tarefas/concluir/${tarefaId}`
      );
      await carregarAcompanhamento();
    } catch (err) {
      console.error(err);
      alert("Erro ao concluir tarefa.");
    }
  };

  const removerTarefa = async (tarefaId) => {
    if (!window.confirm("Remover esta tarefa?")) return;
    try {
      await axios.delete(
        `${API}/acompanhamento/tarefas/remover/${tarefaId}`
      );
      await carregarAcompanhamento();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover tarefa.");
    }
  };

  // ==============================
  // RENDER
  // ==============================
  if (loading) {
    return (
      <Layout titulo="Acompanhamento da Licitação">
        <div className="mt-10 text-center text-gray-500">
          Carregando dados da licitação...
        </div>
      </Layout>
    );
  }

  if (erro || !licitacao) {
    return (
      <Layout titulo="Acompanhamento da Licitação">
        <div className="flex flex-col items-center gap-4 mt-10 text-center">
          <p className="text-gray-600 text-sm">
            {erro || "Licitação não encontrada."}
          </p>
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

  const tituloOrgao = orgaoEntidade.razaoSocial || licitacao.orgao;
  const municipioUf = orgaoEntidade.municipio
    ? `${orgaoEntidade.municipio} / ${orgaoEntidade.uf || licitacao.uf || ""}`
    : licitacao.municipio && licitacao.uf
    ? `${licitacao.municipio} / ${licitacao.uf}`
    : "—";

  const dataPublicacao =
    raw.dataPublicacaoPncp || licitacao.data_publicacao || null;
  const dataAbertura =
    raw.dataAberturaProposta || licitacao.data_abertura || null;
  const dataEncerramento = raw.dataEncerramentoProposta || null;

  const modalidade =
    raw.modalidadeLicitacao || licitacao.modalidade || "Não informado";

  const urlOficial =
    raw?.linkSistemaOrigem || licitacao.url_externa || null;

  return (
    <Layout titulo="Acompanhamento da Licitação">
      {/* BARRA SUPERIOR / BREADCRUMB */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-500">
          <button
            onClick={() => navigate("/licitacoes")}
            className="text-indigo-600 hover:underline"
          >
            Licitações
          </button>{" "}
          /{" "}
          <button
            onClick={() => navigate(`/licitacao/${id}`)}
            className="text-indigo-600 hover:underline"
          >
            Detalhes
          </button>{" "}
          / <span className="font-medium text-gray-700">Acompanhamento</span>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => navigate(`/licitacao/${id}`)}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs md:text-sm border hover:bg-gray-200"
          >
            Voltar para detalhes
          </button>
          {urlOficial && (
            <a
              href={urlOficial}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs md:text-sm font-medium hover:bg-indigo-700"
            >
              Ver edital / página oficial
            </a>
          )}
        </div>
      </div>

      {/* CABEÇALHO PREMIUM */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              ÓRGÃO RESPONSÁVEL
            </p>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
              {tituloOrgao}
            </h1>
            <p className="text-gray-600 text-sm md:text-base mb-2">
              {licitacao.objeto}
            </p>

            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                Modalidade: {modalidade}
              </span>
              {municipioUf !== "—" && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                  {municipioUf}
                </span>
              )}
              {unidadeOrgao?.nomeUnidade && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                  {unidadeOrgao.nomeUnidade}
                </span>
              )}
            </div>
          </div>

          {/* Painel rápido de status */}
          <div className="w-full lg:w-72 bg-gray-50 rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Status do acompanhamento</p>
              <select
                disabled={!acompanhamentoAtivo || salvandoStatus}
                className="w-full border rounded-xl px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {!acompanhamentoAtivo && (
                <p className="text-[11px] text-orange-600 mt-1">
                  Inicie o acompanhamento para alterar o status.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Progresso do checklist</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progresso}% concluído ({tarefas.filter((t) => t.concluido).length} de{" "}
                {tarefas.length || 0} tarefas)
              </p>
            </div>

            <button
              onClick={iniciarAcompanhamento}
              disabled={acompanhamentoAtivo}
              className={`w-full mt-1 px-4 py-2 rounded-xl text-sm font-semibold ${
                acompanhamentoAtivo
                  ? "bg-gray-200 text-gray-500 cursor-default"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {acompanhamentoAtivo ? "Acompanhamento ativo" : "Iniciar acompanhamento"}
            </button>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: CHECKLIST */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD CHECKLIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Checklist da licitação
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Organize todos os passos necessários: documentos, certidões, prazos,
                  conferência de itens etc.
                </p>
              </div>
              {acompanhamentoAtivo && (
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Acompanhamento em andamento
                </span>
              )}
            </div>

            {!acompanhamentoAtivo && (
              <div className="border border-dashed border-amber-300 rounded-xl p-4 mb-4 bg-amber-50">
                <p className="text-sm text-amber-800 mb-2">
                  Para usar o checklist, primeiro ative o acompanhamento desta licitação.
                </p>
                <button
                  onClick={iniciarAcompanhamento}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                >
                  Ativar acompanhamento agora
                </button>
              </div>
            )}

            {/* LISTA DE TAREFAS */}
            {tarefas.length === 0 && acompanhamentoAtivo && (
              <p className="text-sm text-gray-500 mb-3">
                Nenhuma tarefa criada ainda. Comece adicionando os passos principais
                (ex.: “Ler edital completo”, “Separar certidões negativas”, “Calcular
                proposta financeira”).
              </p>
            )}

            {tarefas.length > 0 && (
              <div className="space-y-2 mb-4">
                {tarefas.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50"
                  >
                    <div className="flex-1 mr-3">
                      <p
                        className={
                          t.concluido
                            ? "text-sm text-gray-400 line-through"
                            : "text-sm text-gray-800"
                        }
                      >
                        {t.titulo}
                      </p>
                      {t.descricao && (
                        <p className="text-xs text-gray-500 mt-1">{t.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!t.concluido && (
                        <button
                          className="text-xs px-3 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => concluirTarefa(t.id)}
                        >
                          Concluir
                        </button>
                      )}
                      <button
                        className="text-xs px-3 py-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
                        onClick={() => removerTarefa(t.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FORM NOVA TAREFA */}
            {acompanhamentoAtivo && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">
                  Adicione tarefas específicas desta licitação: envio de proposta,
                  reuniões internas, conferência de documentos etc.
                </p>
                <div className="flex flex-col md:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Título da tarefa (obrigatório)"
                    className="flex-1 border rounded-xl px-3 py-2 text-sm"
                    value={novaTarefaTitulo}
                    onChange={(e) => setNovaTarefaTitulo(e.target.value)}
                  />
                  <button
                    onClick={handleCriarTarefa}
                    disabled={salvandoTarefa || !novaTarefaTitulo.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {salvandoTarefa ? "Salvando..." : "+ Adicionar tarefa"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  placeholder="Descrição (opcional): detalhes, links, responsáveis, prazos internos..."
                  value={novaTarefaDescricao}
                  onChange={(e) => setNovaTarefaDescricao(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* CARD FUTURO: DOCUMENTAÇÃO / REQUISITOS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Documentação e requisitos (beta)
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Nesta seção, o Radar Inteligente poderá listar automaticamente os
              documentos obrigatórios, requisitos de habilitação e etapas
              críticas da licitação, a partir da leitura do edital.
            </p>
            <p className="text-xs text-gray-400">
              *Para o MVP, você pode usar o checklist acima para registrar os
              documentos necessários manualmente.
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO & METADADOS */}
        <div className="space-y-6">
          {/* RESUMO DA LICITAÇÃO */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Resumo da licitação
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Órgão</p>
                <p className="text-gray-800">{tituloOrgao || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Município / UF</p>
                <p className="text-gray-800">{municipioUf}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Modalidade</p>
                <p className="text-gray-800">{modalidade}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data de publicação</p>
                <p className="text-gray-800">
                  {formatarData(dataPublicacao)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Abertura das propostas</p>
                <p className="text-gray-800">{formatarData(dataAbertura)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Encerramento</p>
                <p className="text-gray-800">
                  {formatarData(dataEncerramento)}
                </p>
              </div>
              {licitacao.numero && (
                <div>
                  <p className="text-xs text-gray-500">Número da compra</p>
                  <p className="text-gray-800">{licitacao.numero}</p>
                </div>
              )}
              {licitacao.id_externo && (
                <div>
                  <p className="text-xs text-gray-500">ID PNCP</p>
                  <p className="text-gray-800">{licitacao.id_externo}</p>
                </div>
              )}
            </div>
          </div>

          {/* LINKS ÚTEIS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Links e ações rápidas
            </h3>
            <div className="space-y-2 text-sm">
              {urlOficial ? (
                <a
                  href={urlOficial}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Abrir página oficial do edital
                </a>
              ) : (
                <p className="text-xs text-gray-500">
                  Nenhum link oficial foi informado pelo PNCP.
                </p>
              )}

              <Link
                to={`/licitacao/${id}`}
                className="block w-full text-center px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
              >
                Ver todos os detalhes da licitação
              </Link>
            </div>
          </div>

          {/* NOTAS INTERNAS FUTURAS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Estratégia comercial (em breve)
            </h3>
            <p className="text-sm text-gray-500">
              Espaço reservado para registrar a estratégia da editora nesta
              licitação: livros sugeridos, margens, concorrentes, combinação de
              títulos etc. No MVP você pode usar o checklist para isso.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
