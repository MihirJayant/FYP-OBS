import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "@/lib/axiosClient";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosClient.post(`/auth/login/`, formData);

      console.log("rews", res);
      if (res?.status) {
        const { access, refresh } = res?.data;

        localStorage.setItem("access_ad_token", access);
        localStorage.setItem("refresh_ad_token", refresh);

        toast.success(res?.msg || "Login successful");

        navigate("/", { replace: true });
      } else {
        toast.error(res?.msg || "Invalid credentials");
      }
    } catch (err: any) {
      const message = err?.response?.data?.msg || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 ">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg mb-2">
        <h1 className="text-2xl font-semibold text-center">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6 mb-2">
          {/* Email */}
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
