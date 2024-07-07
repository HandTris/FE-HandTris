// utils/toasts.ts
import { Toast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";

export const showLoginSuccessToast = (toast: (props: Toast) => void) => {
  toast({
    title: "Login Successful!",
    description: "Welcome back! You're now logged in.",
    duration: 5000,
    className: "toast-success",
    children: (
      <div className="flex items-center">
        <CheckCircle className="w-6 h-6 mr-2" />
        <div>
          <h3 className="font-bold text-lg mb-1">Login Successful!</h3>
          <p>Welcome back! You're now logged in.</p>
        </div>
      </div>
    ),
  });
};
