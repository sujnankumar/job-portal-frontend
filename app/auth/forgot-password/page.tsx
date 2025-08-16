"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { OTPModal } from "@/components/otp-modal";
import api from "@/lib/axios";

const extractErrorMessage = (err: any, fallback: string) => (
  err?.response?.data?.detail || err?.response?.data?.message || err?.message || fallback
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter email");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/auth/password-reset/initiate`, { email });
  toast.success("OTP sent to your email");
      setOtpRequested(true);
      setOtpOpen(true);
      setResendCooldown(45); // 45s cooldown before resend
      // start cooldown timer
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (e: any) {
  const status = e?.response?.status;
  const msg = extractErrorMessage(e, status === 404 ? "Email does not exist. Please recheck." : "Failed to initiate reset");
  toast.error(msg);
  return; // don't proceed to open modal
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (token: string) => {
    setResetToken(token);
    setOtpOpen(false);
    setStep("reset");
  };

  const reopenOtp = () => {
    if (!otpRequested) return;
    setOtpOpen(true);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0 || !email || resendLoading) return;
    try {
      setResendLoading(true);
      await api.post(`/auth/password-reset/initiate`, { email });
      toast.success("OTP resent");
      setOtpOpen(true);
      setResendCooldown(45);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (e: any) {
      toast.error(extractErrorMessage(e, "Failed to resend OTP"));
    } finally {
      setResendLoading(false);
    }
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.new || passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!resetToken) {
      toast.error("Missing reset token");
      return;
    }
    setLoading(true);
    try {
  await api.post(`/auth/password-reset/confirm`, { email, reset_token: resetToken, new_password: passwords.new, confirm_password: passwords.confirm });
      toast.success("Password updated. You can login now.");
      router.push("/auth/login");
    } catch (e: any) {
      toast.error(extractErrorMessage(e, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4 py-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {step === "email" && (
          <form onSubmit={submitEmail} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-dark-gray mb-1">Forgot Password</h1>
              <p className="text-sm text-gray-500">Enter your email to receive a one-time OTP.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={otpRequested && !resetToken} />
              {otpRequested && !resetToken && (
                <p className="text-xs text-gray-500 mt-1">OTP sent. Check your inbox (and spam). You can reopen the OTP entry or resend.</p>
              )}
            </div>
            {!otpRequested && (
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>{loading ? "Sending..." : "Get OTP"}</Button>
            )}
            {otpRequested && !resetToken && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={reopenOtp}>Enter OTP</Button>
                  <Button type="button" variant="outline" className="flex-1" disabled={resendCooldown>0 || resendLoading} onClick={resendOtp}>
                    {resendLoading ? "Resending..." : resendCooldown>0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                  </Button>
                </div>
                <Button type="button" variant="ghost" onClick={() => { setOtpRequested(false); setEmail(""); setResetToken(null); }} className="text-xs text-gray-500 hover:text-gray-700">Use different email</Button>
              </div>
            )}
            {otpRequested && !resetToken && (
              <div className="text-[11px] leading-snug text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 mt-1">
                Do not refresh or close this page until you finish resetting your password.
              </div>
            )}
            <div className="text-center text-xs text-gray-500">Remembered your password? <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link></div>
          </form>
        )}
        {step === "reset" && (
          <form onSubmit={submitNewPassword} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-dark-gray mb-1">Set New Password</h1>
              <p className="text-sm text-gray-500">Your OTP was verified. Choose a strong new password.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={passwords.new} onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))} placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
            <div className="text-[11px] leading-snug text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 -mt-1">
              Do not refresh this page until your password is updated.
            </div>
            <div className="text-center text-xs text-gray-500"><Link href="/auth/login" className="text-accent hover:underline">Back to login</Link></div>
          </form>
        )}
      </div>
      <OTPModal
        open={otpOpen}
        email={email}
        onClose={() => setOtpOpen(false)}
        onVerified={handleVerified}
        onResend={resendOtp}
        resendCooldown={resendCooldown}
        resendLoading={resendLoading}
      />
    </div>
  );
}
