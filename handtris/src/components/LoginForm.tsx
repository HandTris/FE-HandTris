"use client";
import React from "react";
import { motion } from "framer-motion";
import { Formik, Form, FormikHelpers } from "formik";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import loginValidation from "../yup/loginvalidation";
import CustomField from "./CustomField";
import { useToast } from "./ui/use-toast";
import { showLoginSuccessToast } from "@/util/showLoginSuccessToast";

interface LoginFormValues {
  username: string;
  password: string;
  api?: string;
}

const LoginForm = () => {
  const initialValues: LoginFormValues = { username: "", password: "" };
  const router = useRouter();
  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="w-full max-w-lg rounded-3xl border border-white border-opacity-50 bg-white bg-opacity-30 p-12 text-center shadow-xl backdrop-blur-xl backdrop-filter"
    >
      <h1 className="mb-12 text-4xl font-bold text-white">Login</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={loginValidation}
        onSubmit={(
          values,
          { setSubmitting, setFieldError }: FormikHelpers<LoginFormValues>,
        ) => {
          Cookies.remove("accessToken", { path: "/" });
          Cookies.remove("refreshToken", { path: "/" });

          axios
            .post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signin`, values)
            .then(response => {
              const { accessToken, refreshToken } = response.data.data;
              console.log("Received accessToken:", accessToken);
              console.log("Received refreshToken:", refreshToken);

              Cookies.set("accessToken", accessToken, {
                path: "/",
                sameSite: "lax",
                expires: 1,
              });
              Cookies.set("refreshToken", refreshToken, {
                path: "/",
                sameSite: "lax",
                expires: 1,
              });

              // 설정된 토큰 확인
              console.log("All cookies after setting:", Cookies.get());

              const setRefreshToken = Cookies.get("refreshToken");
              const setAccessToken = Cookies.get("accessToken");
              console.log("Set accessToken:", setAccessToken);
              console.log("Set refreshToken:", setRefreshToken);

              if (setAccessToken && setRefreshToken) {
                setSubmitting(false);
                router.push("/lobby");
                router.refresh();
                setTimeout(() => showLoginSuccessToast(toast), 100);
              } else {
                console.error("Failed to set tokens");
                setFieldError("api", "Failed to set tokens. Please try again.");
                setSubmitting(false);
              }
            })
            .catch(error => {
              console.error("Login error:", error);
              if (error.response) {
                setFieldError(
                  "api",
                  error.response.data.message || "Login failed",
                );
              } else if (error.request) {
                setFieldError("api", "Network error. Please try again.");
              } else {
                setFieldError(
                  "api",
                  "Something went wrong. Please try again later.",
                );
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
                className={`w-full rounded-lg border-2 py-3 transition-colors duration-300 ${
                  isValid && Object.keys(touched).length > 0
                    ? "border-white text-white hover:bg-white hover:text-blue-500"
                    : "cursor-not-allowed border-gray-500 text-gray-500"
                }`}
              >
                Login
              </button>
              {errors.api && (
                <div className="mt-2 text-red-500">{errors.api}</div>
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
        <p className="mt-4 text-white">
          {"Don't have an account?"}
          <Link href="/register" className="text-green-400">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
