"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, KeyRound } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const requestOtp = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to request code");
      const msg = data?.message || "If an account exists, a code has been sent.";
      const devHint =
        data?.devEmailError
          ? `DEV: ${data.devEmailError}`
          : data?.devThrottled
            ? `DEV: throttled (retryAt=${data.devRetryAt || "unknown"})`
            : "";
      setInfo(devHint ? `${msg} (${devHint})` : msg);
      if (!data?.devThrottled) {
        setStep("confirm");
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to reset password");
      setStep("done");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-md w-full animate-fade-in">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/20">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
              <Logo className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Reset password</h2>
            <p className="mt-2 text-slate-400 text-sm">
              {step === "request"
                ? "We will send a one-time code to your email"
                : step === "confirm"
                  ? "Enter the code and choose a new password"
                  : "Your password has been updated"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium text-center backdrop-blur-sm mb-4">
              {error}
            </div>
          )}

          {info && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm font-medium text-center backdrop-blur-sm mb-4">
              {info}
            </div>
          )}

          {step !== "done" ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="you@company.com"
                    disabled={loading || step === "confirm"}
                  />
                </div>
              </div>

              {step === "confirm" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">OTP Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        placeholder="6-digit code"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        placeholder="At least 8 characters"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={step === "request" ? requestOtp : confirmReset}
                disabled={loading || !email || (step === "confirm" && (!otp || !newPassword))}
                className="relative w-full flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-500 shadow-md hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md group"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    {step === "request" ? "Send code" : "Reset password"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm font-medium text-center backdrop-blur-sm">
                Password updated. You can sign in with your new password.
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Go to login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          ShiftTrack Attendance System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
