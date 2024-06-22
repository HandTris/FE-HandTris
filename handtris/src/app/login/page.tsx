"use client";
import React from "react";
import { motion } from "framer-motion";

const Login = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/cyberpunk-bg.jpg')" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-12 rounded-2xl text-center shadow-2xl border border-white border-opacity-40 max-w-md w-full"
      >
        <h1 className="text-5xl mb-10 text-neon">Login</h1>
        <form className="space-y-6">
          <motion.input
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 bg-dark bg-opacity-50 border border-neon text-white placeholder-neon rounded-lg focus:outline-none focus:ring-2 focus:ring-neon"
          />
          <motion.input
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-dark bg-opacity-50 border border-neon text-white placeholder-neon rounded-lg focus:outline-none focus:ring-2 focus:ring-neon"
          />
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
            type="submit"
            className="w-full py-3 bg-neon text-dark rounded-lg hover:bg-teal-500 transition-colors duration-300"
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
