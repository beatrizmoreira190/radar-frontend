import Layout from "../components/Layout";
import MetricCard from "../components/MetricCard";

export default function Dashboard() {
  return (
    <Layout titulo="Dashboard">
      {/* CARDS SUPERIORES */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <MetricCard titulo="Editais Ativos" valor="248" detalhe="+12% este mês" />
        <MetricCard titulo="Propostas Enviadas" valor="42" detalhe="Taxa de sucesso: 68%" />
        <MetricCard titulo="Valor Total" valor="R$ 89,2M" detalhe="Valor monitorado" />
        <MetricCard titulo="Alertas Ativos" valor="15" detalhe="Próximos vencimentos" />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Taxa de Sucesso Mensal</h2>
          <p className="text-gray-500">Gráfico será inserido aqui</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Comparativo de Propostas</h2>
          <p className="text-gray-500">Gráfico será inserido aqui</p>
        </div>
      </div>

      {/* LISTA DE EDITAIS RECENTES */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-xl font-semibold mb-4">Editais Recentes</h2>
        <p className="text-gray-500">Conteúdo será carregado aqui...</p>
      </div>
    </Layout>
  );
}
