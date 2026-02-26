"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudSun, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.refresh();

        setTimeout(() => {
          router.replace("/login");
        }, 100);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] flex flex-col items-center justify-center p-6 transition-colors">
      <Link
        href="/"
        className="flex items-center gap-2 text-[#FF385C] mb-8 animate-vibe"
      >
        <CloudSun size={40} strokeWidth={2.5} />
        <span className="text-2xl font-extrabold tracking-tight">
          cloudvibe
        </span>
      </Link>

      <div className="airbnb-card w-full max-w-md p-8 shadow-2xl animate-vibe">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">
          Create an account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          create share your local vibes.
        </p>

        {error && (
          <p className="bg-red-50 text-red-500 p-3 rounded-lg text-xs mb-4 font-bold uppercase tracking-widest">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="airbnb-input dark:bg-[#1e1e1e] dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="airbnb-input dark:bg-[#1e1e1e] dark:text-white"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="airbnb-input dark:bg-[#1e1e1e] dark:text-white"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {loading ? "Creating account..." : "Create account"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Alredy have an account?{" "}
          <Link href="/login" className="font-bold underline dark:text-white">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
