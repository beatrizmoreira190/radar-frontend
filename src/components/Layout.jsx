import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ titulo, children }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <Header titulo={titulo} />
        {children}
      </div>
    </div>
  );
}
