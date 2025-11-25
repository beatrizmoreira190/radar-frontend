import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // LOGIN DE DEMONSTRAÇÃO
    const DEMO_EMAIL = "demo@radar.com";
    const DEMO_SENHA = "123456";

    if (email === DEMO_EMAIL && senha === DEMO_SENHA) {
      localStorage.setItem("radar_token", "DEMO_TOKEN");
      navigate("/dashboard");
    } else {
      setErro("Email ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0412CD] via-blue-700 to-blue-400 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center text-[#0412CD] mb-2">
          Radar Inteligente
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Acesse a plataforma de monitoramento de licitações
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border rounded-xl p-3 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@radar.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Senha</label>
            <input
              type="password"
              className="w-full border rounded-xl p-3 mt-1"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          {erro && (
            <p className="text-red-600 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#0412CD] text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Login de demonstração • Editora #1
        </p>
      </div>
    </div>
  );
}
