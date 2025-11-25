export default function Layout({ titulo, children }) {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {titulo && (
        <h1 className="text-2xl font-bold mb-6">{titulo}</h1>
      )}
      {children}
    </div>
  );
}
