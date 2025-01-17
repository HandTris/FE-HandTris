import React from "react";
import { useField, ErrorMessage } from "formik";

interface CustomFieldProps {
  name: string;
  [x: string]: string | number | boolean;
}

const CustomField: React.FC<CustomFieldProps> = ({ ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="mb-6">
      <input
        {...field}
        {...props}
        className={`w-full rounded-lg border-2 bg-transparent px-4 py-3 focus:outline-none focus:ring-2 ${
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
        className="mt-2 min-h-[24px] rounded-lg bg-red-600 bg-opacity-80 p-2 text-sm text-white shadow-md"
      />
    </div>
  );
};

export default CustomField;
