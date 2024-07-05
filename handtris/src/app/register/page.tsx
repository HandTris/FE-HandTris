"use client";

import React from "react";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import axios from "axios";
import CustomField from "../../components/CustomField";
import registerValidation from "../../yup/registervalidation";

const Signup = () => {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="w-full max-w-md rounded-3xl border border-white border-opacity-50 bg-white bg-opacity-30 p-12 text-center shadow-xl backdrop-blur-xl backdrop-filter"
      >
        <h1 className="mb-12 text-4xl font-bold text-white">Sign Up</h1>
        <Formik
          initialValues={{
            username: "",
            password: "",
            confirmPassword: "",
            nickname: "",
          }}
          validationSchema={registerValidation}
          onSubmit={(values, { setSubmitting }) => {
            axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`, {
              username: values.username,
              password: values.password,
              nickname: values.nickname,
            });
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
          }}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                <CustomField
                  type="text"
                  name="username"
                  placeholder="username"
                />
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
                <CustomField
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              >
                <CustomField
                  type="text"
                  name="nickname"
                  placeholder="Nickname"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full rounded-lg border-2 py-3 transition-colors duration-300 ${
                    isValid
                      ? "border-white text-white hover:bg-white hover:text-blue-500"
                      : "cursor-not-allowed border-gray-500 text-gray-500"
                  }`}
                >
                  Sign Up
                </button>
              </motion.div>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default Signup;
