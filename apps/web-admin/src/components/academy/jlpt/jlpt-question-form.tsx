import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select";
import { 
  Field, 
  FieldLabel, 
 
} from "@workspace/ui/components/field";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { FileAudio, Image as ImageIcon, Plus, Trash2, Loader2 } from "lucide-react";
import { storageApi } from "@/lib/api/services/storage-api";
import { academyJlptMockApi } from "@/lib/api/services/academy-jlpt-mock";
import { toast } from "sonner";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];
const SECTIONS = [
  { code: "LANGUAGE_VOCAB", label: "Từ vựng (Vocab)" },
  { code: "LANGUAGE_GRAMMAR_READING", label: "Ngữ pháp & Đọc (Grammar/Reading)" },
  { code: "LISTENING", label: "Nghe hiểu (Listening)" },
];

export function JlptQuestionForm({ 
  initialData, 
  onSuccess, 
  onCancel 
}: { 
  initialData?: any; 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialData || {
      levelCode: "N3",
      sectionCode: "LANGUAGE_VOCAB",
      questionType: "SINGLE_CHOICE",
      stemText: "",
      contextText: "",
      audioAssetId: "",
      imageAssetId: "",
      options: [
        { key: "1", contentText: "", isCorrect: true },
        { key: "2", contentText: "", isCorrect: false },
        { key: "3", contentText: "", isCorrect: false },
        { key: "4", contentText: "", isCorrect: false },
      ]
    }
  });

  const sectionCode = watch("sectionCode");
  const options = watch("options");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(type);
      const res = await storageApi.uploadFile(file, "jlpt-mock");
      setValue(type === 'audio' ? 'audioAssetId' : 'imageAssetId', res.fileId);
      toast.success(`Đã tải lên ${type === 'audio' ? 'âm thanh' : 'hình ảnh'}`);
    } catch (error) {
      toast.error("Tải lên thất bại");
    } finally {
      setUploading(null);
    }
  };

  const onSubmitForm = async (data: any) => {
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
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="levelCode"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cấp độ (Level)</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map(s => <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>)}
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
                <FieldLabel>Ngữ cảnh (Context - Tùy chọn)</FieldLabel>
                <Textarea {...field} placeholder="Ví dụ: Đọc đoạn văn sau..." />
              </Field>
            )}
          />

          <Controller
            name="stemText"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Nội dung câu hỏi (Stem)</FieldLabel>
                <Textarea {...field} placeholder="Nhập nội dung câu hỏi..." className="min-h-[100px]" />
              </Field>
            )}
          />

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <FieldLabel className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hình ảnh (N4, N5, Drawing...)
              </FieldLabel>
              <div className="flex items-center gap-4">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'image')}
                  disabled={!!uploading}
                />
                {uploading === 'image' && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              {watch("imageAssetId") && <p className="text-xs text-emerald-600 font-medium">Đã chọn: {watch("imageAssetId")}</p>}
            </div>

            {sectionCode === "LISTENING" && (
              <div className="flex-1 space-y-2">
                <FieldLabel className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4" /> File nghe (MP3/WAV)
                </FieldLabel>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="audio/*" 
                    onChange={(e) => handleFileUpload(e, 'audio')}
                    disabled={!!uploading}
                  />
                  {uploading === 'audio' && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {watch("audioAssetId") && <p className="text-xs text-blue-600 font-medium">Đã chọn: {watch("audioAssetId")}</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đáp án (Options)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((opt: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="font-bold w-6">{idx + 1}.</div>
              <Input 
                placeholder={`Nội dung đáp án ${idx + 1}`}
                value={opt.contentText}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[idx].contentText = e.target.value;
                  setValue("options", newOptions);
                }}
              />
              <div className="flex items-center gap-2 min-w-[100px]">
                <Switch 
                  checked={opt.isCorrect} 
                  onCheckedChange={(checked) => {
                    const newOptions = options.map((o: any, i: number) => ({
                      ...o,
                      isCorrect: i === idx ? checked : (checked ? false : o.isCorrect)
                    }));
                    setValue("options", newOptions);
                  }}
                />
                <span className="text-sm">{opt.isCorrect ? "Đúng" : "Sai"}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  const newOptions = options.filter((_: any, i: number) => i !== idx);
                  setValue("options", newOptions);
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              setValue("options", [...options, { key: (options.length + 1).toString(), contentText: "", isCorrect: false }]);
            }}
          >
            <Plus className="w-4 h-4" /> Thêm đáp án
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>Hủy</Button>
        <Button onClick={handleSubmit(onSubmitForm)} disabled={submitting || !!uploading}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? "Cập nhật" : "Lưu câu hỏi"}
        </Button>
      </div>
    </form>
  );
}
