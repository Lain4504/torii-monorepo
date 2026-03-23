import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { FileAudio, Image as ImageIcon, Plus, Trash2, Loader2, Info } from "lucide-react";
import { storageApi } from "@/lib/api/services/storage-api";
import { academyJlptMockApi, type JlptBankQuestion } from "@/lib/api/services/academy-jlpt-mock";
import { toast } from "sonner";
import {
  JLPT_SECTIONS,
  JLPT_QUESTION_TYPES,
  JLPT_DIFFICULTIES,
  formatJlptMondaiLabel,
} from "@/components/academy/jlpt/jlpt-questions-toolbar";
import {
  inferQuestionTypeFromMondai,
  inferQuestionTypeFromSection,
} from "@/lib/jlpt/infer-question-type-from-mondai";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];

const VALID_QT = new Set(["VOCAB", "GRAMMAR", "READING", "LISTENING"]);

function normalizeQuestionType(raw: string | undefined, section: string): string {
  if (raw && VALID_QT.has(raw)) return raw;
  return inferQuestionTypeFromSection(section);
}

const EMPTY_OPTIONS = () => [
  { key: "1", contentText: "", isCorrect: true },
  { key: "2", contentText: "", isCorrect: false },
  { key: "3", contentText: "", isCorrect: false },
  { key: "4", contentText: "", isCorrect: false },
];

type MondaiRow = { id: string; code: string; titleVi: string | null; titleJa: string | null };

export function JlptQuestionForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: JlptBankQuestion | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mondaiList, setMondaiList] = useState<MondaiRow[]>([]);
  const [mondaiLoading, setMondaiLoading] = useState(false);

  const defaultValues = useMemo(() => {
    if (!initialData?.id) {
      return {
        levelCode: "N3",
        sectionCode: "LANGUAGE_VOCAB",
        mondaiCode: "",
        questionType: "VOCAB",
        difficulty: "MEDIUM",
        stemText: "",
        contextText: "",
        audioAssetId: "",
        imageAssetId: "",
        options: EMPTY_OPTIONS(),
      };
    }
    const section = initialData.sectionCode || "LANGUAGE_VOCAB";
    const opts =
      Array.isArray(initialData.options) && initialData.options.length > 0
        ? initialData.options.map((o) => ({
            key: String(o.key ?? ""),
            contentText: String(o.contentText ?? ""),
            isCorrect: Boolean(o.isCorrect),
          }))
        : EMPTY_OPTIONS();
    return {
      levelCode: initialData.levelCode ?? "N3",
      sectionCode: section,
      mondaiCode: initialData.mondai?.code ?? "",
      questionType: normalizeQuestionType(initialData.questionType, section),
      difficulty:
        initialData.difficulty && ["EASY", "MEDIUM", "HARD"].includes(initialData.difficulty)
          ? initialData.difficulty
          : "MEDIUM",
      stemText: initialData.stemText ?? "",
      contextText: initialData.contextText ?? "",
      audioAssetId: initialData.audioAssetId ?? "",
      imageAssetId: initialData.imageAssetId ?? "",
      options: opts,
    };
  }, [initialData]);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues,
  });

  const sectionCode = watch("sectionCode");
  const levelCode = watch("levelCode");
  const mondaiCodeWatch = watch("mondaiCode");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMondaiLoading(true);
      try {
        const rows = await academyJlptMockApi.listBankMondaiOptions({
          level: levelCode,
          sectionCode: sectionCode,
        });
        if (!cancelled) setMondaiList(rows);
      } catch {
        if (!cancelled) setMondaiList([]);
      } finally {
        if (!cancelled) setMondaiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelCode, sectionCode]);

  /** Hiển thị mondai đang lưu nếu API danh sách chưa có (đổi cấp tạm thời). */
  const mondaiOptionsForSelect = useMemo(() => {
    const code = mondaiCodeWatch;
    if (code && !mondaiList.some((m) => m.code === code) && initialData?.mondai?.code === code) {
      return [
        {
          id: initialData.mondai!.id,
          code,
          titleVi: initialData.mondai!.titleVi ?? null,
          titleJa: initialData.mondai!.titleJa ?? null,
        },
        ...mondaiList,
      ];
    }
    return mondaiList;
  }, [mondaiList, mondaiCodeWatch, initialData?.mondai]);

  const options = watch("options");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "audio" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(type);
      const res = await storageApi.uploadFile(file, "jlpt-mock");
      setValue(type === "audio" ? "audioAssetId" : "imageAssetId", res.fileId);
      toast.success(`Đã tải lên ${type === "audio" ? "âm thanh" : "hình ảnh"}`);
    } catch {
      toast.error("Tải lên thất bại");
    } finally {
      setUploading(null);
    }
  };

  const onSubmitForm = async (data: Record<string, unknown>) => {
    const mc = typeof data.mondaiCode === "string" ? data.mondaiCode.trim() : "";
    if (!mc) {
      toast.error("Chọn Mondai (問題形式) đúng phần thi JLPT");
      return;
    }
    try {
      setSubmitting(true);
      if (initialData?.id) {
        await academyJlptMockApi.updateBankQuestion(initialData.id, data);
        toast.success("Cập nhật câu hỏi thành công");
      } else {
        await academyJlptMockApi.createBankQuestion(data);
        toast.success("Thêm câu hỏi thành công");
      }
      onSuccess();
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Cấu trúc JLPT trong ngân hàng</AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          Chọn <strong>Cấp độ → Phần thi → Mondai (問題)</strong> theo đề chính thức (vd: 漢字読み, 文の文法, 内容理解, 課題理解…).
          Mỗi câu gắn một mondai để lọc và ghép đề đúng format. Nếu danh sách trống, nghĩa là hệ thống chưa có dữ liệu mondai
          cho cấp độ/phần thi đó và cần được nạp dữ liệu ở backend.
        </AlertDescription>
      </Alert>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            {initialData?.id ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Phần thi lớn khớp 言語・読解・聴解; mondai mô tả đúng &quot;dạng bài&quot; trong đề thi (N1–N5).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="levelCode"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cấp độ (Level)</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      setValue("mondaiCode", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="sectionCode"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Phần thi (Section)</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      setValue("mondaiCode", "");
                      setValue("questionType", inferQuestionTypeFromSection(v));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JLPT_SECTIONS.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            name="mondaiCode"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Mondai (問題形式) *</FieldLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={(code) => {
                    field.onChange(code);
                    const row = mondaiOptionsForSelect.find((x) => x.code === code);
                    setValue(
                      "questionType",
                      inferQuestionTypeFromMondai(sectionCode, row ?? { code }),
                    );
                  }}
                  disabled={mondaiLoading || mondaiOptionsForSelect.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        mondaiLoading
                          ? "Đang tải danh sách mondai…"
                          : "Chọn dạng bài (vd: 漢字読み, 文の文法１, 課題理解…)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(320px,50vh)]">
                    {mondaiOptionsForSelect.map((m) => (
                      <SelectItem key={m.id} value={m.code}>
                        <span className="line-clamp-2">
                          {formatJlptMondaiLabel(m)}
                          <span className="ml-1 font-mono text-[10px] text-muted-foreground">· {m.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!mondaiLoading && mondaiList.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                    Chưa có mondai cho cấp độ + phần thi này trong database.
                  </p>
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="questionType"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Phân loại domain (VOCAB / 文法 / 読解 / 聴解)</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JLPT_QUESTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Gợi ý tự động từ mondai; có thể chỉnh nếu dữ liệu đặc biệt.
                  </p>
                </Field>
              )}
            />
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Độ khó</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JLPT_DIFFICULTIES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            name="contextText"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Ngữ cảnh (Context — 読解 / 聴解)</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Đoạn văn dài, hội thoại, hoặc chỉ dẫn (nếu stem chỉ là câu hỏi lẻ)"
                />
              </Field>
            )}
          />

          <Controller
            name="stemText"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Nội dung câu hỏi (Stem)</FieldLabel>
                <Textarea {...field} placeholder="Câu hỏi / đoạn cần chọn đáp án…" className="min-h-[100px]" />
              </Field>
            )}
          />

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-0 flex-1 space-y-2">
              <FieldLabel className="flex items-center gap-2">
                <ImageIcon className="size-4 shrink-0" /> Hình ảnh (表現問題, 発表現話…)
              </FieldLabel>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  className="min-w-0 flex-1 sm:max-w-none"
                  onChange={(e) => handleFileUpload(e, "image")}
                  disabled={!!uploading}
                />
                {uploading === "image" && <Loader2 className="size-4 shrink-0 animate-spin" />}
              </div>
              {watch("imageAssetId") && (
                <p className="text-xs font-medium text-emerald-600">Đã chọn: {watch("imageAssetId")}</p>
              )}
            </div>

            {sectionCode === "LISTENING" && (
              <div className="min-w-0 flex-1 space-y-2">
                <FieldLabel className="flex items-center gap-2">
                  <FileAudio className="size-4 shrink-0" /> File nghe (MP3/WAV)
                </FieldLabel>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Input
                    type="file"
                    accept="audio/*"
                    className="min-w-0 flex-1 sm:max-w-none"
                    onChange={(e) => handleFileUpload(e, "audio")}
                    disabled={!!uploading}
                  />
                  {uploading === "audio" && <Loader2 className="size-4 shrink-0 animate-spin" />}
                </div>
                {watch("audioAssetId") && (
                  <p className="text-xs font-medium text-blue-600">Đã chọn: {watch("audioAssetId")}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Đáp án (Options)</CardTitle>
          <CardDescription className="text-xs">
            Thường 4 lựa chọn (1–4 hoặc ア–エ). Đánh dấu đúng một đáp án trừ khi dạng bài yêu cầu khác.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
          {options.map((opt: { key?: string; contentText: string; isCorrect: boolean }, idx: number) => (
            <div
              key={`${opt.key ?? idx}-${idx}`}
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0"
            >
              <div className="flex items-start gap-2 sm:items-center">
                <div className="w-6 shrink-0 pt-2 text-sm font-bold sm:pt-0">{idx + 1}.</div>
                <Input
                  className="min-w-0 flex-1"
                  placeholder={`Nội dung đáp án ${idx + 1}`}
                  value={opt.contentText}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[idx] = { ...newOptions[idx], contentText: e.target.value };
                    setValue("options", newOptions);
                  }}
                />
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end sm:gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={opt.isCorrect}
                    onCheckedChange={(checked) => {
                      const newOptions = options.map(
                        (o: { key?: string; contentText: string; isCorrect: boolean }, i: number) => ({
                          key: o.key ?? String(i + 1),
                          contentText: o.contentText,
                          isCorrect: i === idx ? checked : checked ? false : o.isCorrect,
                        }),
                      );
                      setValue("options", newOptions);
                    }}
                  />
                  <span className="text-sm whitespace-nowrap">{opt.isCorrect ? "Đúng" : "Sai"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  type="button"
                  onClick={() => {
                    const newOptions = options.filter((_: unknown, i: number) => i !== idx);
                    setValue("options", newOptions);
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setValue("options", [
                ...options,
                { key: (options.length + 1).toString(), contentText: "", isCorrect: false },
              ]);
            }}
          >
            <Plus className="h-4 w-4" /> Thêm đáp án
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={submitting || !!uploading}>
          {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData?.id ? "Cập nhật" : "Lưu câu hỏi"}
        </Button>
      </div>
    </form>
  );
}
