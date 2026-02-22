'use client'

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { Smartphone, QrCode, Key, Download, Copy, Check } from 'lucide-react';
import { Spinner } from '@workspace/ui/components/spinner';
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field';
import {
  useGenerateTotpSecret,
  useEnableTotp,
} from "@/apis/services/two-factor-auth-api";

const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Mã phải có 6 chữ số")
    .regex(/^\d+$/, "Mã chỉ được chứa số"),
});

type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

interface EnableTwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnableTwoFactorDialog({
  open,
  onOpenChange,
}: EnableTwoFactorDialogProps) {
  const [step, setStep] = useState<"generate" | "verify" | "backup">(
    "generate",
  );
  const [secret, setSecret] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const generateMutation = useGenerateTotpSecret();
  const enableMutation = useEnableTotp();

  const form = useForm<VerifyCodeForm>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("generate");
      setSecret("");
      setQrCodeUrl("");
      setBackupCodes([]);
      setCopiedSecret(false);
      setCopiedCodes(false);
      form.reset();
    }
  }, [open, form]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync();
      setSecret(result.secret);
      setQrCodeUrl(result.qrCodeUrl);
      setStep("verify");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo mã QR",
      );
    }
  };

  const handleVerify = async (data: VerifyCodeForm) => {
    try {
      const result = await enableMutation.mutateAsync({
        secret,
        code: data.code,
      });
      setBackupCodes(result.backupCodes);
      setStep("backup");
      toast.success("Xác thực hai yếu tố đã được bật thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Mã xác thực không hợp lệ",
      );
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    toast.success("Đã sao chép khóa bí mật");
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    toast.success("Đã sao chép mã dự phòng");
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `torii-backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống mã dự phòng");
  };

  const handleFinish = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl font-sans font-bold italic tracking-tight text-foreground">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Smartphone className="size-5" />
            </div>
            Bật xác thực hai yếu tố
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground/70 leading-relaxed">
            {step === "generate" && "Thiết lập 2FA để bảo mật tài khoản của bạn"}
            {step === "verify" &&
              "Quét mã QR bằng ứng dụng xác thực của bạn"}
            {step === "backup" && "Lưu mã dự phòng của bạn ở nơi an toàn"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Generate */}
        {step === "generate" && (
          <div className="space-y-6 py-2">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-center">
                  <Smartphone className="size-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-bold text-foreground">
                    Bạn cần một ứng dụng xác thực
                  </p>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                    Tải xuống ứng dụng xác thực như Google Authenticator, Authy, hoặc Microsoft Authenticator trên điện thoại của bạn.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full h-12 rounded-xl bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Spinner className="size-4 animate-spin opacity-70" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <QrCode className="size-4" />
                  Tạo mã QR
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === "verify" && (
          <div className="space-y-6 py-2">
            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-2xl border-2 border-border/20 bg-white p-6 shadow-lg shadow-primary/5">
                <img src={qrCodeUrl} alt="QR Code" className="size-52" />
              </div>
              <p className="text-xs text-center text-muted-foreground/60 max-w-sm font-medium leading-relaxed">
                Quét mã QR này bằng ứng dụng xác thực của bạn
              </p>
            </div>

            {/* Manual Entry */}
            <Field className="space-y-3">
              <FieldLabel className="text-muted-foreground/70">
                Hoặc nhập khóa này thủ công:
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs rounded-xl bg-muted/20 border-border/20 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copySecret}
                  className="shrink-0 rounded-xl border-border/20 h-10 w-10"
                >
                  {copiedSecret ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </Field>

            {/* Verification Form */}
            <form
              onSubmit={form.handleSubmit(handleVerify)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="code">Nhập mã 6 chữ số từ ứng dụng</FieldLabel>
                      <Input
                        {...field}
                        id="code"
                        placeholder="000000"
                        maxLength={6}
                        className="h-14 text-center text-2xl font-mono tracking-widest rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                        autoComplete="off"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={enableMutation.isPending}
                className="w-full h-12 rounded-xl bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 gap-2"
              >
                {enableMutation.isPending ? (
                  <>
                    <Spinner className="size-4 animate-spin opacity-70" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <Key className="size-4" />
                    Xác thực và bật
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === "backup" && (
          <div className="space-y-6 py-2">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 flex items-center justify-center">
                  <Key className="size-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-bold text-foreground">
                    Lưu các mã dự phòng này
                  </p>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                    Mỗi mã chỉ có thể sử dụng một lần. Lưu trữ chúng ở nơi an toàn trong trường hợp bạn mất quyền truy cập vào ứng dụng xác thực.
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Codes Grid */}
            <div className="grid grid-cols-2 gap-3 p-5 rounded-xl border border-border/20 bg-muted/10">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-background px-4 py-3 text-center font-mono text-sm font-medium border border-border/10 shadow-sm"
                >
                  {code}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-border/20 bg-background hover:bg-muted/30 gap-2"
              >
                {copiedCodes ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span className="text-xs font-medium">Sao chép</span>
              </Button>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-border/20 bg-background hover:bg-muted/30 gap-2"
              >
                <Download className="size-4" />
                <span className="text-xs font-medium">Tải xuống</span>
              </Button>
            </div>

            <Button
              onClick={handleFinish}
              className="w-full h-12 rounded-xl bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              Tôi đã lưu mã dự phòng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog >
  );
}
