"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ExpertLogin = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.push("/profile"); // Redirect if already logged in
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
        "http://localhost:3046/api/expert/signup", // Replace with your backend API
        {
          name: formData.name,
          email: formData.email,
          mobile:formData.mobile,
          password: formData.password,
          specialization: formData.specialization,
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      setMessage("Registered Successfully! Please login...");
      setError("");

      setTimeout(() => {
        setIsLogin(true); // Switch to login after successful registration
        setMessage("");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Try again.");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "",mobile:"", password: "", confirmPassword: "", specialization: "" });
    setError("");
    setMessage("");
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row h-full lg:h-screen bg-gray-900">
      {/* Left Section - Form */}
      <div className="w-full flex items-center justify-center p-6 lg:p-10">
        <div className="bg-gray-800 shadow-lg rounded-2xl p-6 lg:p-10 w-full max-w-md border border-blue-300">
          <h2 className="text-2xl lg:text-3xl font-bold text-blue-400 mb-6 text-center">{isLogin ? "Expert Sign In" : "Expert Sign Up"}</h2>

          {message && <p className="text-green-600 text-center mb-4">{message}</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-amber-50 px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-amber-50 px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Email"
                required
              />
            </div>

            {!isLogin &&(
              <div>
              <label className="block text-white text-sm font-semibold mb-1">Mobile</label>
              <input
                type="number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full bg-amber-50 px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ypur mobile number"
                required
              />
            </div>
          )}
            

            {!isLogin && (
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 bg-amber-50 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Specialization"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-amber-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Password"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg bg-amber-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm Password"
                  required
                />
              </div>
            )}

            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
              {isLogin ? "Sign In" : "Sign Up"}
            </button>

            <p className="text-sm text-center text-green-400 mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={toggleForm} className="text-blue-500 font-medium">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ExpertLogin;
