import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const useAlert = () => {
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isVisible: false,
  });

  const showAlert = (title: string, description: string) => {
    setAlert({ title, description, isVisible: true });
  };

  const hideAlert = () => {
    setAlert({ ...alert, isVisible: false });
  };

  const AlertComponent = () =>
    alert.isVisible && (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{alert.description}</AlertDescription>
      </Alert>
    );

  return { showAlert, hideAlert, AlertComponent };
};

export default useAlert;
