"use client";
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

const extractErrorMessage = (err: any, fallback: string) => {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
};

interface OTPModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerified: (resetToken: string) => void;
  onResend?: () => void;
  resendCooldown?: number;
  resendLoading?: boolean;
}

export const OTPModal: React.FC<OTPModalProps> = ({ open, email, onClose, onVerified, onResend, resendCooldown = 0, resendLoading = false }) => {
  const length = 6;
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(Array(length).fill(""));
      setTimeout(() => inputs.current[0]?.focus(), 50);
    }
  }, [open]);

  const handleChange = (idx: number, v: string) => {
    if (!/^[0-9]?$/.test(v)) return;
    const next = [...values];
    next[idx] = v;
    setValues(next);
    if (v && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      const prev = idx - 1;
      inputs.current[prev]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const submit = async () => {
    const otp = values.join("");
    if (otp.length !== length) {
      toast.error("Enter full OTP");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/auth/password-reset/verify-otp`, { email, otp });
      const data = res.data;
      toast.success("OTP verified");
      onVerified(data.reset_token);
    } catch (e: any) {
      const status = e?.response?.status;
      const detail = extractErrorMessage(e, status === 404 ? "Email does not exist. Please recheck." : "OTP verification failed");
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Enter OTP</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-2 my-4">
          {values.map((v, i) => (
            <Input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-medium tracking-wider"
              value={v}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Close</Button>
            <Button onClick={submit} disabled={submitting} className="bg-accent hover:bg-accent/90 min-w-[120px]">
              {submitting ? "Verifying..." : "Verify"}
            </Button>
          </div>
          {onResend && (
            <Button
              type="button"
              variant="ghost"
              disabled={resendCooldown > 0 || resendLoading}
              onClick={onResend}
              className="text-xs text-purple-700 hover:text-purple-900 w-full"
            >
              {resendLoading ? "Resending..." : resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
            </Button>
          )}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-3">OTP sent to {email}. It expires in 15 minutes. Do not refresh.</p>
      </DialogContent>
    </Dialog>
  );
};
