import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoCarSportOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Redirect to dashboard if already logged in and load saved email
  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard');
    }
    
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [session, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.trim() === "") {
      setEmailError(true);
      return;
    }
    
    setEmailError(false);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }

      toast.success("Bienvenido de nuevo");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message === "Invalid login credentials" ? "Credenciales inválidas" : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
      `}</style>
      


      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="glass-panel w-full max-w-[440px] p-10 shadow-2xl rounded-lg relative overflow-hidden z-10"
      >
        {/* Top progress bar */}
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"
        />

        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/img/logo.png" 
              alt="Logo" 
              className="h-12 w-12 object-contain"
            />
            <h2 className="text-2xl font-semibold tracking-tight text-gray-800">
              AutoLavado <span className="text-indigo-600">Gochi</span>
            </h2>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-2">Usa tu cuenta corporativa para acceder al panel.</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative"
          >
            <input
              type="email"
              id="email"
              placeholder=" "
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              className={`peer w-full px-4 py-3 border ${
                emailError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all bg-white/50 text-gray-900 placeholder-transparent`}
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-3 text-gray-500 text-base transition-all duration-200 pointer-events-none peer-focus:top-[-0.5rem] peer-focus:left-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:top-[-0.5rem] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-gray-500"
            >
              Correo Electrónico
            </label>
            {emailError && (
              <p className="text-red-500 text-xs mt-1">Por favor ingresa tu correo.</p>
            )}
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative"
          >
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all bg-white/50 text-gray-900 placeholder-transparent"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-3 text-gray-500 text-base transition-all duration-200 pointer-events-none peer-focus:top-[-0.5rem] peer-focus:left-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:top-[-0.5rem] peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-gray-500"
            >
              Clave
            </label>
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors z-10 p-2"
            >
              {showPassword ? (
                <IoEyeOffOutline className="text-lg" />
              ) : (
                <IoEyeOutline className="text-lg" />
              )}
            </motion.button>
          </motion.div>

          {/* Remember Me Checkbox */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center text-sm"
          >
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 block text-gray-600 cursor-pointer select-none">
              Recordar mi correo electrónico
            </label>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="pt-4"
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              className="group w-full relative bg-indigo-600 text-white px-4 py-3 rounded-md shadow-md hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all duration-300 font-bold text-base flex items-center justify-center overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <span className={`relative z-10 transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}>
                Iniciar Sesión
              </span>
              {isLoading && (
                <div className="absolute z-20 border-3 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin" />
              )}
              <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10" />
            </motion.button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-8 border-t border-gray-200 pt-4"
        >
          <p className="text-xs text-center text-gray-400">© 2025 Auto Lavado Gochi. Todos los derechos reservados.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
