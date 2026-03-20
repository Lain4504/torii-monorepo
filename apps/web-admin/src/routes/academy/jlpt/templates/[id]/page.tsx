import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings2, 
  ListMusic, 
  Languages, 
  Layers,
  Search,
  CheckCircle2
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
  DialogTrigger,
  DialogFooter
} from "@workspace/ui/components/dialog";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { academyJlptMockApi, type JlptBankQuestion } from "@/lib/api/services/academy-jlpt-mock";
import { toast } from "sonner";

export default function JlptTemplateBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("structure");

  // Selection for adding questions
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuestions, setPickerQuestions] = useState<JlptBankQuestion[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  const fetchTemplate = async () => {
    if (!id) return;
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

  const fetchBankQuestions = async () => {
    if (!template) return;
    try {
      setPickerLoading(true);
      const data = await academyJlptMockApi.findAllBankQuestions({
        level: template.levelCode,
      });
      setPickerQuestions(data);
    } catch (error) {
      toast.error("Không thể tải ngân hàng câu hỏi");
    } finally {
      setPickerLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const handleOpenPicker = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setSelectedBankIds(new Set());
    setIsPickerOpen(true);
    fetchBankQuestions();
  };

  const handleAttachQuestions = async () => {
    if (!id || !targetSectionId) return;
    try {
      const items = Array.from(selectedBankIds).map((qid, idx) => ({
        questionId: qid,
        sectionId: targetSectionId,
        orderIndex: (template.questions?.length || 0) + idx + 1,
      }));
      
      await academyJlptMockApi.attachQuestions(id, items);
      toast.success("Đã thêm câu hỏi vào đề thi");
      setIsPickerOpen(false);
      fetchTemplate();
    } catch (error) {
      toast.error("Thêm câu hỏi thất bại");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải cấu hình đề thi...</div>;
  if (!template) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/academy/jlpt/templates")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{template.title}</h1>
              <Badge variant="outline" className="font-bold border-2">{template.levelCode}</Badge>
            </div>
            <p className="text-muted-foreground text-sm uppercase font-mono tracking-tighter">ID: {template.id} · CODE: {template.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings2 className="w-4 h-4" /> Cài đặt chung
          </Button>
          <Button className="gap-2">
            <Save className="w-4 h-4" /> Lưu cấu hình
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
            <Card key={section.id} className="border-2 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      {section.isListening ? <ListMusic className="w-5 h-5 text-primary" /> : <Languages className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title} ({section.code})</CardTitle>
                      <CardDescription>{section.durationMinutes} phút làm bài</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenPicker(section.id)}>
                      <Plus className="w-4 h-4" /> Chọn từ Bank
                    </Button>
                    <Button variant="ghost" size="icon"><Settings2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                   {template.questions?.filter((q: any) => q.sectionId === section.id).length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                         <Search className="w-8 h-8 opacity-20" />
                         Chưa có câu hỏi nào trong phần này.
                      </div>
                   ) : (
                      template.questions
                        .filter((q: any) => q.sectionId === section.id)
                        .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                        .map((q: any, idx: number) => (
                          <div key={q.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 group">
                            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                            <div className="bg-muted rounded w-8 h-8 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                            <div className="flex-1">
                               <div className="text-sm line-clamp-1" dangerouslySetInnerHTML={{ __html: q.question.stemText }} />
                               <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">{q.question.sectionCode}</Badge>
                                  {q.question.audioAssetId && <Badge variant="outline" className="text-[10px] px-1 py-0 text-blue-500">Audio</Badge>}
                                  {q.question.imageAssetId && <Badge variant="outline" className="text-[10px] px-1 py-0 text-emerald-500">Image</Badge>}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <Input type="number" className="w-16 h-8 text-center" placeholder="Điểm" defaultValue={q.weight || 1} />
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex justify-between items-center">
              <span>Chọn câu hỏi cho phần {template.sections.find((s: any) => s.id === targetSectionId)?.title}</span>
              <Badge>{selectedBankIds.size} đã chọn</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {pickerLoading ? (
               <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : (
              pickerQuestions.map(q => (
                <div key={q.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => {
                  const next = new Set(selectedBankIds);
                  if (next.has(q.id)) next.delete(q.id);
                  else next.add(q.id);
                  setSelectedBankIds(next);
                }}>
                  <Checkbox checked={selectedBankIds.has(q.id)} onCheckedChange={() => {}} />
                  <div className="flex-1">
                    <div className="text-sm font-medium line-clamp-1" dangerouslySetInnerHTML={{ __html: q.stemText }} />
                    <div className="text-[10px] text-muted-foreground uppercase">{q.sectionCode} · {q.questionType}</div>
                  </div>
                  <Badge variant="outline">{q.levelCode}</Badge>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="p-4 border-t bg-muted/30">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Hủy</Button>
            <Button disabled={selectedBankIds.size === 0} onClick={handleAttachQuestions}>Thêm {selectedBankIds.size} câu hỏi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Loader2(props: any) {
    return <Plus {...props} className={props.className + " animate-spin"} />
}
