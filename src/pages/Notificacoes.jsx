import Layout from "../components/Layout";

export default function Notificacoes() {
  return (
    <Layout titulo="Notificações">
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="font-semibold text-red-600">Prazo próximo do vencimento</p>
          <p className="text-gray-600">Licitação para compra de livros vence em 2 dias</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="font-semibold text-green-600">Proposta aceita</p>
          <p className="text-gray-600">Proposta de fornecimento de kits pedagógicos</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="font-semibold text-blue-600">Novo edital disponível</p>
          <p className="text-gray-600">Edital de literatura infantil – Brasília</p>
        </div>
      </div>
    </Layout>
  );
}
