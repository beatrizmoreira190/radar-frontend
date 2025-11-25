import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Logo do Radar
  const LOGO_URL = "https://i.ibb.co/G3HCf3yN/LOGO-RADAR-INTELIGENTE-removebg-preview.png";

  const handleLogin = (e) => {
    e.preventDefault();

    // Login de demonstração
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
    <div className="min-h-screen flex flex-col">

      {/* HEADER BRANCO PREMIUM */}
      <header className="bg-white w-full py-4 shadow-md flex justify-center">
        <img
          src={LOGO_URL}
          alt="Radar Inteligente"
          className="h-20 w-auto object-contain drop-shadow-lg"
        />
      </header>

      {/* FUNDO + CARD */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0412CD] via-[#1E3AFF] to-[#65A8FF] p-4">

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-10 w-full max-w-md animate-fadeIn">

          {/* Título */}
          <h1 className="text-3xl font-extrabold text-center text-white tracking-tight mb-2">
            Acessar plataforma
          </h1>

          <p className="text-center text-gray-100 mb-8">
            Monitoramento inteligente de licitações públicas
          </p>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-sm text-white font-medium">Email</label>
              <input
                type="email"
                className="w-full border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl p-3 mt-1 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email corporativo"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="text-sm text-white font-medium">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  className="w-full border border-white/30 bg-white/10 text-white placeholder-white/60 rounded-xl p-3 mt-1 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="sua senha"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <p className="text-red-300 text-sm text-center -mt-3">
                {erro}
              </p>
            )}

            {/* Botão */}
            <button
              type="submit"
              className="w-full bg-white text-[#0412CD] py-3 rounded-xl font-semibold shadow-lg transition transform hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
            >
              Entrar
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-white/70 mt-6">
            Acesso exclusivo • Modo demonstração • Editora #1
          </p>

        </div>
      </div>
    </div>
  );
}
