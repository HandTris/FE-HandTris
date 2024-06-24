import React from "react";
import { useField, ErrorMessage } from "formik";

const CustomField = ({ ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="mb-6">
      <input
        {...field}
        {...props}
        className={`w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:ring-2 ${
          meta.touched && meta.error
            ? "border-red-500 text-red-500 placeholder-red-500 focus:ring-red-300"
            : meta.touched && !meta.error
            ? "border-green-400 text-white placeholder-green-500 focus:ring-green-300"
            : "border-white text-white placeholder-white focus:ring-blue-300"
        }`}
      />
      <ErrorMessage
        component="div"
        name={field.name}
        className="text-white text-sm mt-2 min-h-[24px] bg-red-600 bg-opacity-80 p-2 rounded-lg shadow-md"
      />
    </div>
  );
};

export default CustomField;
