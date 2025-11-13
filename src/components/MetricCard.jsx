export default function MetricCard({ titulo, valor, detalhe }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h2 className="text-3xl font-bold mt-2">{valor}</h2>
      {detalhe && (
        <p className="text-green-600 text-sm mt-1">{detalhe}</p>
      )}
    </div>
  );
}
