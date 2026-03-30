import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  PlusCircle,
  Trash2,
  GripVertical,
  Settings2,
  ListMusic,
  Languages,
  Layers,
  Search,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@workspace/ui/components/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { academyJlptMockApi, type JlptBankQuestion } from "@/lib/api/services/academy-jlpt-mock";
import { JlptQuestionForm } from "@/components/academy/jlpt/jlpt-question-form";
import { toast } from "sonner";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];

export default function JlptTemplateBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("structure");
  const [saving, setSaving] = useState(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsData, setSettingsData] = useState({
    title: "",
    code: "",
    status: "DRAFT",
    description: "",
  });

  // Selection for adding questions
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuestions, setPickerQuestions] = useState<JlptBankQuestion[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [assembling, setAssembling] = useState(false);

  // Quick Create Question
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Template Creation State
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState({
    title: "",
    code: "",
    levelCode: "N3",
  });

  const fetchTemplate = async () => {
    if (!id || isNew) return;
    try {
      setLoading(true);
      const data = await academyJlptMockApi.findTemplateById(id);
      setTemplate(data);
    } catch (error) {
      toast.error("Không thể tải thông tin đề thi");
      navigate("/academy/jlpt/templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      setTemplate(null);
    } else {
      fetchTemplate();
    }
  }, [id, isNew]);

  useEffect(() => {
    if (template) {
      setSettingsData({
        title: template.title || "",
        code: template.code || "",
        status: template.status || "DRAFT",
        description: template.description || "",
      });
    }
  }, [template]);

  const handleUpdateSettings = async () => {
    if (!id || isNew) return;
    try {
      setSaving(true);
      await academyJlptMockApi.updateTemplate(id, settingsData);
      toast.success("Đã lưu cài đặt đề thi");
      setIsSettingsOpen(false);
      fetchTemplate();
    } catch (error) {
      toast.error("Không thể lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateData.title || !newTemplateData.code) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setCreatingTemplate(true);
      const res = await academyJlptMockApi.createTemplate(newTemplateData);
      toast.success("Đã tạo đề thi mới");
      navigate(`/academy/jlpt/templates/${res.id}`, { replace: true });
    } catch {
      toast.error("Không thể tạo đề thi");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const fetchBankQuestionsForSection = async (sectionId: string) => {
    if (!template) return;
    const sectionCode = template.sections.find((s: { id: string }) => s.id === sectionId)?.code as
      | string
      | undefined;
    try {
      setPickerLoading(true);
      const merged: JlptBankQuestion[] = [];
      let page = 1;
      let totalPages = 1;
      const limit = 100;
      do {
        const res = await academyJlptMockApi.findAllBankQuestions({
          level: template.levelCode,
          sectionCode,
          page,
          limit,
        });
        merged.push(...res.items);
        totalPages = res.totalPages;
        page += 1;
      } while (page <= totalPages && page <= 50);
      setPickerQuestions(merged);
    } catch {
      toast.error("Không thể tải ngân hàng câu hỏi");
    } finally {
      setPickerLoading(false);
    }
  };

  const handleOpenPicker = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setSelectedBankIds(new Set());
    setIsPickerOpen(true);
    void fetchBankQuestionsForSection(sectionId);
  };

  const handleOpenQuickCreate = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setIsQuickCreateOpen(true);
  };

  const handleAttachQuestions = async (questionIds: string[]) => {
    if (!id || !targetSectionId || !template || questionIds.length === 0) return;
    try {
      const baseOrder = template.questions?.length || 0;
      const items = questionIds.map((qid, idx) => {
        // Find in pickerQuestions OR just use minimal info
        const bank = pickerQuestions.find((p) => p.id === qid);
        return {
          questionId: qid,
          sectionId: targetSectionId,
          orderIndex: baseOrder + idx + 1,
          mondaiId: bank?.mondai?.id,
        };
      });

      await academyJlptMockApi.attachQuestions(id, items);
      toast.success(questionIds.length === 1 ? "Đã gắn câu hỏi vào đề" : `Đã gắn ${questionIds.length} câu vào đề`);
      fetchTemplate();
    } catch {
      toast.error("Gắn câu hỏi thất bại");
    }
  };

  const handleQuickCreateSuccess = async (newQuestion?: JlptBankQuestion) => {
    setIsQuickCreateOpen(false);
    if (newQuestion?.id) {
       await handleAttachQuestions([newQuestion.id]);
    } else {
       fetchTemplate();
    }
  };

  const handleAssembleRandom = async () => {
    if (!id) return;
    try {
      setAssembling(true);
      const res = await academyJlptMockApi.assembleTemplateRandom(id, {
        perMondaiCount: 1,
        clearExisting: false,
      });
      toast.success(`Đã random gắn ${res?.attachedCount ?? 0} câu`);
      await fetchTemplate();
    } catch {
      toast.error("Random gắn câu thất bại");
    } finally {
      setAssembling(false);
    }
  };

  const handleDeleteQuestion = (tqId: string) => {
    setTargetDeleteId(tqId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!targetDeleteId) return;
    try {
      await academyJlptMockApi.deleteTemplateQuestion(targetDeleteId);
      toast.success("Đã xóa câu hỏi khỏi đề thi");
      fetchTemplate();
    } catch {
      toast.error("Xóa câu hỏi thất bại");
    } finally {
      setIsDeleteConfirmOpen(false);
      setTargetDeleteId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Đang tải cấu hình...</p>
    </div>
  );

  // Creation Form for New Template
  if (isNew && !template) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/academy/jlpt/templates")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Tạo đề thi JLPT mới</h1>
        </div>
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thiết lập tiêu đề và mã định danh cho đề thi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề đề thi</label>
              <Input 
                placeholder="Ví dụ: Đề luyện N1 Tháng 12/2024" 
                value={newTemplateData.title}
                onChange={(e) => setNewTemplateData({...newTemplateData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã đề (Unique Code)</label>
              <Input 
                placeholder="Ví dụ: N1-2024-12-A" 
                value={newTemplateData.code}
                onChange={(e) => setNewTemplateData({...newTemplateData, code: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cấp độ (Level)</label>
              <Select 
                value={newTemplateData.levelCode} 
                onValueChange={(v) => setNewTemplateData({...newTemplateData, levelCode: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <div className="p-6 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/academy/jlpt/templates")}>Hủy</Button>
            <Button onClick={handleCreateTemplate} disabled={creatingTemplate}>
              {creatingTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Tiếp tục tạo cấu trúc
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-background/50 backdrop-blur-sm p-4 rounded-2xl border shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0 border-slate-500/30 text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-700"
            onClick={() => navigate("/academy/jlpt/templates")}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate py-1" title={template.title}>
                {template.title}
              </h1>
              <Badge variant="outline" className="font-bold border-2 shrink-0">{template.levelCode}</Badge>
            </div>
            <p className="text-muted-foreground text-[10px] sm:text-xs uppercase font-mono tracking-tighter truncate">
              ID: {template.id} · CODE: {template.code}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void handleAssembleRandom()} disabled={assembling}>
            {assembling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
            <span className="hidden sm:inline">Random gắn câu</span>
            <span className="sm:hidden">Random</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsSettingsOpen(true)}>
            <Settings2 className="w-4 h-4" /> 
            <span className="hidden sm:inline">Cài đặt chung</span>
            <span className="sm:hidden">Cài đặt</span>
          </Button>
          <Button size="sm" className="gap-2 shadow-sm" onClick={handleUpdateSettings} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            <span className="hidden sm:inline">Lưu cấu hình</span>
            <span className="sm:hidden">Lưu</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="structure" className="gap-2 rounded-lg px-6">
            <Layers className="w-4 h-4" /> Cấu trúc & Câu hỏi
          </TabsTrigger>
          <TabsTrigger value="scoring" className="gap-2 rounded-lg px-6">
            <CheckCircle2 className="w-4 h-4" /> Thang điểm (Scoring)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-6">
          {template.sections.map((section: any) => (
            <Card key={section.id} className="border-2 overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30 border-b py-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                    <div className="bg-primary/10 p-2 rounded-xl shrink-0">
                      {section.isListening ? <ListMusic className="w-5 h-5 text-primary" /> : <Languages className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate" title={`${section.title} (${section.code})`}>
                        {section.title} <span className="text-muted-foreground font-normal text-sm">({section.code})</span>
                      </CardTitle>
                      <CardDescription className="truncate">{section.durationMinutes} phút làm bài dành cho phần này</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0 w-full lg:w-auto justify-end">
                    <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => handleOpenPicker(section.id)}>
                      <Plus className="w-4 h-4" /> 
                      <span className="hidden sm:inline">Chọn từ Ngân hàng</span>
                      <span className="sm:hidden">Chọn từ Bank</span>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-2 h-9 bg-emerald-600 hover:bg-emerald-700 shadow-sm border-none"
                      onClick={() => handleOpenQuickCreate(section.id)}
                    >
                      <PlusCircle className="w-4 h-4" /> 
                      <span>Tạo mới & Gắn</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y overflow-hidden max-h-[800px] overflow-y-auto">
                   {template.questions?.filter((q: any) => q.sectionId === section.id).length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
                         <div className="p-3 bg-muted/50 rounded-full">
                           <Search className="w-8 h-8 opacity-40" />
                         </div>
                         <p>Chưa có câu hỏi nào trong phần này.</p>
                      </div>
                   ) : (
                      template.questions
                        .filter((q: any) => q.sectionId === section.id)
                        .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                        .map((q: any, idx: number) => (
                          <div key={q.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 group transition-colors">
                            <GripVertical className="w-4 h-4 text-muted-foreground opacity-20 group-hover:opacity-100 cursor-grab" />
                            <div className="bg-muted rounded w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                            <div className="flex-1 min-w-0 px-2">
                               <div className="text-sm line-clamp-1 font-medium" dangerouslySetInnerHTML={{ __html: q.question.stemText }} />
                               <div className="flex gap-2 mt-1 flex-wrap">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">{q.question.questionType}</Badge>
                                  {q.mondai?.code && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                      {q.mondai.code}
                                    </Badge>
                                  )}
                                  {q.question.audioAssetId && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-500 font-normal">Audio</Badge>}
                                  {q.question.imageAssetId && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-emerald-500 font-normal">Image</Badge>}
                               </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                               <div className="flex items-center gap-1.5">
                                 <span className="text-[10px] text-muted-foreground uppercase font-semibold">Điểm</span>
                                 <Input type="number" className="w-14 h-8 text-center" defaultValue={q.weight || 1} />
                               </div>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                 onClick={() => handleDeleteQuestion(q.id)}
                                >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                          </div>
                        ))
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scoring">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Thang điểm JLPT</CardTitle>
              <CardDescription>Thiết lập cách quy đổi điểm mộc (raw score) sang điểm JLPT (scaled score).</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-lg m-6">
              Sẽ được hoàn thiện trong giai đoạn 2: Advanced Scoring Profiles.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Picker Dialog */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex justify-between items-center pr-4">
              <span>Chọn câu hỏi cho {template.sections.find((s: any) => s.id === targetSectionId)?.title}</span>
              <Badge variant="secondary">{selectedBankIds.size} đã chọn</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/10">
            {pickerLoading ? (
               <div className="p-12 text-center flex flex-col items-center gap-3">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <p className="text-sm text-muted-foreground">Đang tải ngân hàng...</p>
               </div>
            ) : (
              pickerQuestions.map(q => (
                <div key={q.id} className="flex items-center gap-4 p-4 border bg-background rounded-xl hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                  const next = new Set(selectedBankIds);
                  if (next.has(q.id)) next.delete(q.id);
                  else next.add(q.id);
                  setSelectedBankIds(next);
                }}>
                  <Checkbox checked={selectedBankIds.has(q.id)} onCheckedChange={() => {}} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold line-clamp-1" dangerouslySetInnerHTML={{ __html: q.stemText }} />
                    <div className="text-[11px] text-muted-foreground mt-1 flex gap-2">
                       <span className="font-bold">{q.questionType}</span>
                       {q.mondai?.code && <span>· {q.mondai.code}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-bold">{q.levelCode}</Badge>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="p-4 border-t bg-muted/30">
            <Button variant="outline" onClick={() => setIsPickerOpen(false)}>Hủy</Button>
            <Button disabled={selectedBankIds.size === 0} onClick={() => void handleAttachQuestions(Array.from(selectedBankIds)).then(() => setIsPickerOpen(false))}>
               Thêm {selectedBankIds.size} câu hỏi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Create Dialog */}
      <Dialog open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Tạo câu hỏi mới và gắn vào đề thi</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <JlptQuestionForm
              presetLevelCode={template.levelCode}
              presetSectionCode={template.sections.find((s: any) => s.id === targetSectionId)?.code}
              onSuccess={handleQuickCreateSuccess}
              onCancel={() => setIsQuickCreateOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* General Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cài đặt chung đề thi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề đề thi</label>
              <Input 
                value={settingsData.title}
                onChange={(e) => setSettingsData({...settingsData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã đề (Code)</label>
              <Input 
                value={settingsData.code}
                onChange={(e) => setSettingsData({...settingsData, code: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái (Status)</label>
              <Select 
                value={settingsData.status} 
                onValueChange={(v) => setSettingsData({...settingsData, status: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Bản nháp (DRAFT)</SelectItem>
                  <SelectItem value="READY">Sẵn sàng (READY)</SelectItem>
                  <SelectItem value="PUBLISHED">Công bố (PUBLISHED)</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ (ARCHIVED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input 
                value={settingsData.description}
                onChange={(e) => setSettingsData({...settingsData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdateSettings} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu cài đặt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pt-4">
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" /> Xác nhận xóa câu hỏi
            </DialogTitle>
            <CardDescription className="pt-2">
              Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi không? Hành động này sẽ gỡ bỏ liên kết giữa câu hỏi và đề thi hiện tại.
            </CardDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 p-4 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>Hủy bỏ</Button>
            <Button variant="destructive" onClick={confirmDeleteQuestion}>Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
