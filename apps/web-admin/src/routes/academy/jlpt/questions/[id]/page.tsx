import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  FileAudio, 
  Image as ImageIcon 
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { academyJlptMockApi } from "@/lib/api/services/academy-jlpt-mock";
import { storageApi } from "@/lib/api/services/storage-api";
import { toast } from "sonner";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];
const SECTIONS = [
  { code: "LANGUAGE_VOCAB", label: "Từ vựng (Vocab)" },
  { code: "LANGUAGE_GRAMMAR_READING", label: "Ngữ pháp & Đọc (Grammar/Reading)" },
  { code: "LISTENING", label: "Nghe hiểu (Listening)" },
];

export default function JlptQuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>({
    levelCode: "N3",
    sectionCode: "LANGUAGE_VOCAB",
    questionType: "SINGLE_CHOICE",
    stemText: "",
    contextText: "",
    options: [
      { key: "1", contentText: "", isCorrect: true },
      { key: "2", contentText: "", isCorrect: false },
      { key: "3", contentText: "", isCorrect: false },
      { key: "4", contentText: "", isCorrect: false },
    ],
  });

  useEffect(() => {
    if (!isNew && id) {
      // Fetch question data
      // For now we assume we have a findById or we filter from list
      // Real implementation would call academyJlptMockApi.findBankQuestionById(id)
    }
  }, [id, isNew]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isNew) {
        await academyJlptMockApi.createBankQuestion(data);
        toast.success("Đã tạo câu hỏi mới");
      } else {
        await academyJlptMockApi.updateBankQuestion(id!, data);
        toast.success("Đã cập nhật câu hỏi");
      }
      navigate("/academy/jlpt/questions");
    } catch (error) {
      toast.error("Không thể lưu câu hỏi");
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    setData((prev: any) => ({
      ...prev,
      options: [...prev.options, { key: (prev.options.length + 1).toString(), contentText: "", isCorrect: false }],
    }));
  };

  const removeOption = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      options: prev.options.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateOption = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const nextOptions = [...prev.options];
      nextOptions[index] = { ...nextOptions[index], [field]: value };
      
      // If setting isCorrect to true, set others to false (single choice)
      if (field === "isCorrect" && value === true) {
        nextOptions.forEach((opt, i) => {
          if (i !== index) opt.isCorrect = false;
        });
      }
      
      return { ...prev, options: nextOptions };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info(`Đang tải lên ${type === 'audio' ? 'âm thanh' : 'hình ảnh'}...`);
      const res = await storageApi.uploadFile(file, "jlpt-mock");
      setData((prev: any) => ({
        ...prev,
        [type === 'audio' ? 'audioAssetId' : 'imageAssetId']: res.fileId,
      }));
      toast.success("Tải lên thành công");
    } catch (error) {
      toast.error("Lỗi khi tải file");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-500/30 text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-700"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isNew ? "Thêm câu hỏi mới" : "Chỉnh sửa câu hỏi"}
        </h1>
        <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
            <Button className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung câu hỏi</CardTitle>
              <CardDescription>Nhập văn bản hiển thị cho câu hỏi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Context (Bối cảnh/Đoạn văn - Tùy chọn)</label>
                <Textarea 
                  placeholder="Nhập đoạn văn bối cảnh hoặc hướng dẫn riêng..." 
                  className="min-h-[100px]"
                  value={data.contextText}
                  onChange={(e) => setData({...data, contextText: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Câu hỏi (Stem)</label>
                <Textarea 
                  placeholder="Nhập nội dung câu hỏi chính..." 
                  className="min-h-[80px] text-lg"
                  value={data.stemText}
                  onChange={(e) => setData({...data, stemText: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Đáp án</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={addOption}>
                <Plus className="w-4 h-4" /> Thêm đáp án
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Lỡ</TableHead>
                    <TableHead className="w-[80px]">Key</TableHead>
                    <TableHead>Nội dung đáp án</TableHead>
                    <TableHead className="w-[80px] text-center">Đúng</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.options.map((opt: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <Input 
                          value={opt.key} 
                          onChange={(e) => updateOption(idx, "key", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={opt.contentText} 
                          onChange={(e) => updateOption(idx, "contentText", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={opt.isCorrect} 
                          onCheckedChange={(val) => updateOption(idx, "isCorrect", val)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 border-red-500/30 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeOption(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cấp độ</label>
                <Select value={data.levelCode} onValueChange={(val) => setData({...data, levelCode: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phần thi</label>
                <Select value={data.sectionCode} onValueChange={(val) => setData({...data, sectionCode: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(s => <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-blue-500" /> Audio
                  </label>
                  {data.audioAssetId && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-mono">READY</span>}
                </div>
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="audio/*" 
                    className="cursor-pointer" 
                    onChange={(e) => handleFileUpload(e, 'audio')}
                  />
                  <div className="absolute right-3 top-2.5">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" /> Hình ảnh
                  </label>
                  {data.imageAssetId && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-mono">READY</span>}
                </div>
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="cursor-pointer" 
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                  <div className="absolute right-3 top-2.5">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
