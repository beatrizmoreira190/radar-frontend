import Layout from "../components/Layout";

export default function Catalogo() {
  return (
    <Layout titulo="Catálogo de Livros">
      <p className="text-gray-600">Lista de livros cadastrados pela editora.</p>
      <p className="mt-4">Depois vamos integrar com /livros no seu backend.</p>
    </Layout>
  );
}
