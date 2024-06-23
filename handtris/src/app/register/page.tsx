"use client";
import React from "react";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import CustomField from "../../components/CustomField";
import registerValidation from "../../yup/registervalidation";

const Signup = () => {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-xl p-12 rounded-3xl text-center shadow-xl border border-white border-opacity-50 max-w-md w-full"
      >
        <h1 className="text-4xl mb-12 text-white font-bold">Sign Up</h1>
        <Formik
          initialValues={{
            ID: "",
            password: "",
            confirmPassword: "",
            nickname: "",
          }}
          validationSchema={registerValidation}
          onSubmit={(values, { setSubmitting }) => {
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
                <CustomField type="text" name="ID" placeholder="ID" />
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
                  className={`w-full py-3 border-2 rounded-lg transition-colors duration-300 ${
                    isValid
                      ? "border-white text-white hover:bg-white hover:text-blue-500"
                      : "border-gray-500 text-gray-500 cursor-not-allowed"
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
