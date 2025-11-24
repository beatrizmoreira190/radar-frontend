import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

import { motion } from "framer-motion";
import {
  BarChart3,
  Star,
  Target,
  Timer,
  Building2,
  ArrowRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API = "https://radar-backend-c3p5.onrender.com";
const RADAR_BLUE = "#0412CD";
const RADAR_BLUE_LIGHT = "#3B5BFF";
const COLORS = ["#0412CD", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#A855F7"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState(null);
  const [ufs, setUfs] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [prazos, setPrazos] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDashboard = async () => {
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        axios.get(`${API}/dashboard/resumo`),
        axios.get(`${API}/dashboard/estatisticas_uf`),
        axios.get(`${API}/dashboard/oportunidades_recentes`),
        axios.get(`${API}/dashboard/proximos_prazos`),
      ]);

      const resumoData = r1.data;
      setResumo(resumoData);
      setUfs(r2.data.dados || []);
      setRecentes(r3.data.dados || []);
      setPrazos(r4.data.proximos_prazos || []);

      const st = Object.entries(resumoData.status_acompanhamentos || {}).map(
        ([status, total]) => ({
          name: status.replace(/_/g, " "),
          value: total,
        })
      );
      setStatusData(st);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  if (loading || !resumo) {
    return (
      <Layout titulo="Dashboard">
        <div className="space-y-6">
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Skeleton gráfico + lista */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </div>

          <SkeletonBlock className="h-40" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout titulo="Dashboard">
      {/* Headerzinho extra opcional */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Visão geral das oportunidades
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Panorama das licitações de livros e materiais pedagógicos monitoradas pelo Radar Inteligente.
          </p>
        </div>
        <button
          onClick={() => navigate("/licitacoes")}
          className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
        >
          Ver todas as licitações
          <ArrowRight size={14} />
        </button>
      </div>

      {/* CARDS PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Licitações no sistema"
          value={resumo.total_licitacoes}
          icon={Building2}
          subtitle="Monitoradas no período escolhido"
          gradientFrom={RADAR_BLUE}
          gradientTo={RADAR_BLUE_LIGHT}
        />
        <StatCard
          title="Novas nas últimas 24h"
          value={resumo.novas_24h}
          icon={Star}
          subtitle="Publicadas nas últimas 24 horas"
          gradientFrom="#1D4ED8"
          gradientTo="#3B82F6"
        />
        <StatCard
          title="Novas nos últimos 7 dias"
          value={resumo.novas_7dias}
          icon={Target}
          subtitle="Fluxo recente de oportunidades"
          gradientFrom="#4C1D95"
          gradientTo="#7C3AED"
        />
        <StatCard
          title="Acompanhamentos ativos"
          value={resumo.acompanhamentos}
          icon={Timer}
          subtitle="Licitações em acompanhamento"
          gradientFrom="#047857"
          gradientTo="#10B981"
        />
      </div>

      {/* GRÁFICOS E LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Licitações por UF */}
        <SectionCard title="Distribuição por UF">
          {ufs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum dado disponível.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ufs.slice(0, 12)}>
                  <XAxis dataKey="uf" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      borderColor: "#E5E7EB",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[6, 6, 0, 0]}
                    fill={`url(#radarGradient)`}
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RADAR_BLUE} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={RADAR_BLUE_LIGHT} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        {/* Status dos acompanhamentos */}
        <SectionCard title="Status dos acompanhamentos">
          {statusData.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Nenhum acompanhamento cadastrado ainda.
            </p>
          ) : (
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        {/* Oportunidades recentes */}
        <SectionCard title="Oportunidades recentes">
          {recentes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma licitação recente.</p>
          ) : (
            <ul className="space-y-3">
              {recentes.map((l) => (
                <motion.li
                  key={l.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/licitacao/${l.id}`)}
                >
                  <p className="font-semibold text-gray-900">
                    {l.orgao || "Órgão não informado"}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">{l.objeto}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Publicado em:{" "}
                    {l.data_publicacao
                      ? new Date(l.data_publicacao).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* PRÓXIMOS PRAZOS */}
      <SectionCard title="Próximos prazos importantes">
        {prazos.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum prazo encontrado.</p>
        ) : (
          <ul className="space-y-3">
            {prazos.map((p) => (
              <motion.li
                key={p.id + p.tipo}
                whileHover={{ scale: 1.01 }}
                className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col gap-1"
                onClick={() => navigate(`/licitacao/${p.id}`)}
              >
                <p className="font-medium text-gray-900 line-clamp-2">
                  {p.objeto}
                </p>
                <p className="text-xs text-gray-500">
                  {p.tipo === "abertura" ? "Abertura das propostas" : "Encerramento"}:
                </p>
                <p className="text-xs text-gray-700">
                  {p.data
                    ? new Date(p.data).toLocaleString("pt-BR")
                    : "Data não informada"}
                </p>
              </motion.li>
            ))}
          </ul>
        )}
      </SectionCard>
    </Layout>
  );
}

/* ============================
   COMPONENTES PREMIUM
============================= */

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  gradientFrom,
  gradientTo,
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 18px 30px rgba(15,23,42,0.15)" }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="rounded-2xl overflow-hidden border border-indigo-100 bg-white shadow-sm"
    >
      <div
        className="h-1.5 w-full"
        style={{
          backgroundImage: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <div className="p-4 flex items-center gap-3">
        <div
          className="p-2 rounded-xl"
          style={{
            backgroundImage: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}33)`,
          }}
        >
          <Icon size={20} className="text-indigo-800" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 leading-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SectionCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-semibold text-gray-900">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 mb-3" />
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
          <div className="h-5 w-1/3 bg-gray-300 rounded-full" />
          <div className="h-2 w-2/3 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className = "h-64" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 animate-pulse ${className}`}
    >
      <div className="h-4 w-1/3 bg-gray-200 rounded-full mb-4" />
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
    </div>
  );
}
