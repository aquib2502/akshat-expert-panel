"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { Sparkles, Mail, Lock, User, Phone, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";

const ExpertLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    specialization: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.push("/profile");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3046/api/expert/login",
        { email: formData.email, password: formData.password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));

      setMessage("Login Successful! Redirecting");
      setError("");

      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3046/api/expert/signup",
        {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          specialization: formData.specialization,
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      setMessage("Registered Successfully! Please login...");
      setError("");

      setTimeout(() => {
        setIsLogin(true);
        setMessage("");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Try again.");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", mobile: "", password: "", confirmPassword: "", specialization: "" });
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-center mb-8">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mr-2" />
              <h2 className="text-3xl font-bold text-white">
                Expert {isLogin ? "Sign In" : "Sign Up"}
              </h2>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-emerald-500/20 text-emerald-100 p-4 rounded-lg mb-6 backdrop-blur-sm"
              >
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/20 text-red-100 p-4 rounded-lg mb-6 backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                    placeholder="Full Name"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                  placeholder="Email Address"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                      placeholder="Mobile Number"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                      placeholder="Specialization"
                      required
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                  placeholder="Password"
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-900 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-all"
              >
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <p className="text-white/80 text-center mt-6">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-emerald-400 font-semibold hover:text-emerald-300 transition-all"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Image */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block w-1/2 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            filter: "brightness(0.8)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent" />
      </motion.div>
    </div>
  );
};

export default ExpertLogin;