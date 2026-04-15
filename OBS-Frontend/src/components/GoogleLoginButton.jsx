// @ts-nocheck
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GOOGLE_LOGIN_URL = import.meta.env.VITE_GOOGLE_LOGIN_URL;

  const navigate = useNavigate();

  useEffect(() => {
    const initializeGoogleOneTap = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await axios.post(GOOGLE_LOGIN_URL, {
              id_token: response.credential,
            });

            const user = res.data?.user;
            const access = res.data?.access;
            const refresh = res.data?.refresh;

            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("user", JSON.stringify(user));

            toast.success(`Welcome ${user?.name || "User"} 🎉`);
            navigate("/jobs");
          } catch (err) {
            toast.error("Google Login failed! Please try again.");
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 260,
        }
      );
    };

    // Check if google script is loaded
    const interval = setInterval(() => {
      if (window.google) {
        initializeGoogleOneTap();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return <div id="google-login-btn" className="flex justify-center"></div>;
}
