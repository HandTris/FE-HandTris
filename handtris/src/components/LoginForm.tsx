import React from "react";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import CustomField from "./CustomField";
import loginValidation from "../yup/loginvalidation";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";

const LoginForm = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-xl p-12 rounded-3xl text-center shadow-xl border border-white border-opacity-50 max-w-lg w-full"
    >
      <h1 className="text-4xl mb-12 text-white font-bold">Login</h1>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={loginValidation}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          axios
            .post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signin`, values)
            .then((response) => {
              const { accessToken, refreshToken } = response.data.data;

              Cookies.set("accessToken", accessToken, {
                domain: window.location.hostname,
                path: "/",
                sameSite: "strict",
              });
              Cookies.set("refreshToken", refreshToken, {
                domain: window.location.hostname,
                path: "/",
                sameSite: "strict",
              });

              alert("Login successful!");
              setSubmitting(false);
            })
            .catch((error) => {
              if (error.response) {
                setErrors({
                  api: error.response.data.message || "Login failed",
                });
              } else if (error.request) {
                setErrors({ api: "Network error. Please try again." });
              } else {
                setErrors({
                  api: "Something went wrong. Please try again later.",
                });
              }
              setSubmitting(false);
            });
        }}
      >
        {({ isSubmitting, isValid, touched, errors }) => (
          <Form className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <CustomField type="text" name="username" placeholder="Username" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            >
              <CustomField
                type="password"
                name="password"
                placeholder="Password"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            >
              <button
                type="submit"
                disabled={
                  isSubmitting || !(isValid && Object.keys(touched).length > 0)
                }
                className={`w-full py-3 border-2 rounded-lg transition-colors duration-300 ${
                  isValid && Object.keys(touched).length > 0
                    ? "border-white text-white hover:bg-white hover:text-blue-500"
                    : "border-gray-500 text-gray-500 cursor-not-allowed"
                }`}
              >
                Login
              </button>
              {errors.api && (
                <div className="text-red-500 mt-2">{errors.api}</div>
              )}
            </motion.div>
          </Form>
        )}
      </Formik>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-white mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-green-400">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
