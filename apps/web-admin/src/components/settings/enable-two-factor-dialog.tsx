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
import {
  Smartphone,
  QrCode,
  Key,
  Download,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import {
  useGenerateTotpSecret,
  useEnableTotp,
} from "@/api/services/two-factor-auth";

const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
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
        error instanceof Error ? error.message : "Failed to generate QR code",
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
      toast.success("Two-factor authentication enabled successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid verification code",
      );
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    toast.success("Secret key copied to clipboard");
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    toast.success("Backup codes copied to clipboard");
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
    toast.success("Backup codes downloaded");
  };

  const handleFinish = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Smartphone className="size-5 text-primary" />
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground/60">
            {step === "generate" && "Set up 2FA to secure your account"}
            {step === "verify" &&
              "Scan the QR code with your authenticator app"}
            {step === "backup" && "Save your backup codes in a safe place"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Generate */}
        {step === "generate" && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex gap-3">
                <Smartphone className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    You'll need an authenticator app
                  </p>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    Download an authenticator app like Google Authenticator,
                    Authy, or Microsoft Authenticator on your phone.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full gap-2 rounded-lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="size-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === "verify" && (
          <div className="space-y-6 py-4">
            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-xl border-2 border-border/20 bg-white p-4">
                <img src={qrCodeUrl} alt="QR Code" className="size-48" />
              </div>
              <p className="text-xs text-center text-muted-foreground/60 max-w-sm">
                Scan this QR code with your authenticator app
              </p>
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground/60">
                Or enter this key manually:
              </p>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs rounded-lg bg-muted/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copySecret}
                  className="shrink-0 rounded-lg"
                >
                  {copiedSecret ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Verification Form */}
            <form
              onSubmit={form.handleSubmit(handleVerify)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Enter the 6-digit code from your app
                </label>
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input
                        {...field}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl font-mono tracking-widest rounded-lg"
                        autoComplete="off"
                      />
                      {fieldState.error && (
                        <p className="text-xs text-rose-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={enableMutation.isPending}
                className="w-full gap-2 rounded-lg"
              >
                {enableMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key className="size-4" />
                    Verify and Enable
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === "backup" && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex gap-3">
                <Key className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Save these backup codes
                  </p>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    Each code can only be used once. Store them in a safe place
                    in case you lose access to your authenticator app.
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Codes Grid */}
            <div className="grid grid-cols-2 gap-2 p-4 rounded-lg border border-border/20 bg-muted/20">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="rounded-md bg-background px-3 py-2 text-center font-mono text-sm font-medium"
                >
                  {code}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                className="flex-1 gap-2 rounded-lg"
              >
                {copiedCodes ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
                Copy Codes
              </Button>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                className="flex-1 gap-2 rounded-lg"
              >
                <Download className="size-4" />
                Download
              </Button>
            </div>

            <Button onClick={handleFinish} className="w-full rounded-lg">
              I've Saved My Backup Codes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
