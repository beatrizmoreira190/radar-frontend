export default function Header({ titulo }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">{titulo}</h1>

      <div className="text-sm text-gray-500">
        Radar Inteligente – Monitoramento de Licitações
      </div>
    </div>
  );
}
