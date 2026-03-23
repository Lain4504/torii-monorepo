import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  academyJlptMockApi,
  type JlptScoringProfile,
  type JlptLevel,
  type JlptSection,
} from "@/lib/api/services/academy-jlpt-mock";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { PageHeader } from "@/components/common/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"] as const;

export default function JlptConfigPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [levels, setLevels] = useState<JlptLevel[]>([]);
  const [sections, setSections] = useState<JlptSection[]>([]);

  const [activeProfile, setActiveProfile] = useState<JlptScoringProfile | null>(null);

  const [loading, setLoading] = useState(false);
  const [ensuring, setEnsuring] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const [levelNameVi, setLevelNameVi] = useState<string>("N5");

  const [profileName, setProfileName] = useState<string>("Default N5");
  const [minLanguageScaled, setMinLanguageScaled] = useState<number>(0);
  const [minReadingScaled, setMinReadingScaled] = useState<number>(0);
  const [minListeningScaled, setMinListeningScaled] = useState<number>(0);
  const [minTotalScaled, setMinTotalScaled] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [mappingJson, setMappingJson] = useState<string>("[]");
  const [savingMappings, setSavingMappings] = useState<boolean>(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const items = await academyJlptMockApi.listLevels();
      setLevels(items);
      const active = await academyJlptMockApi.getActiveScoringProfile(selectedLevel);
      setActiveProfile(active);
      const sec = await academyJlptMockApi.listSectionsForLevel(selectedLevel);
      setSections(sec);
    } catch {
      toast.error("Không tải được cấu hình JLPT");
    } finally {
      setLoading(false);
    }
  }, [selectedLevel]);

  useEffect(() => {
    setMappingJson("[]");
  }, [activeProfile?.id]);

  useEffect(() => {
    // Sync display defaults when switching level.
    setLevelNameVi(selectedLevel);
    setProfileName(`Default ${selectedLevel}`);
    setMinLanguageScaled(0);
    setMinReadingScaled(0);
    setMinListeningScaled(0);
    setMinTotalScaled(0);
    setIsActive(true);
  }, [selectedLevel]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleEnsure = async () => {
    setEnsuring(true);
    try {
      await academyJlptMockApi.ensureLevelConfig({
        level: selectedLevel,
        nameVi: levelNameVi || undefined,
      });
      toast.success("Đã tạo/đồng bộ cấu trúc Level + Section");
      await loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg ?? "Tạo Level thất bại");
    } finally {
      setEnsuring(false);
    }
  };

  const handleCreateProfile = async () => {
    setCreatingProfile(true);
    try {
      await academyJlptMockApi.createScoringProfile({
        level: selectedLevel,
        name: profileName.trim() || `Default ${selectedLevel}`,
        isActive,
        minLanguageScaled,
        minReadingScaled,
        minListeningScaled,
        minTotalScaled,
      });
      toast.success("Đã tạo scoring profile (active cho template)");
      await loadAll();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg ?? "Tạo scoring profile thất bại");
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleSaveMappings = async () => {
    if (!activeProfile?.id) {
      toast.error("Chưa có active profile để gắn mapping");
      return;
    }
    try {
      setSavingMappings(true);
      const parsed = JSON.parse(mappingJson) as Array<{
        domain: "LANGUAGE" | "READING" | "LISTENING";
        rawScore: number;
        scaledScore: number;
      }>;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error("Mapping JSON phải là mảng không rỗng");
        return;
      }
      await academyJlptMockApi.upsertScoringMappings({
        profileId: activeProfile.id,
        items: parsed,
      });
      toast.success("Đã lưu scoring mappings");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg ?? "Lưu scoring mappings thất bại");
    } finally {
      setSavingMappings(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-6">
      <PageHeader
        title="JLPT Config (từ số 0)"
        subtitle="Tạo Level + Section global và ScoringProfile để có thể tạo Template đề thi JLPT."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>JlptLevel (danh sách cấu hình)</CardTitle>
            <CardDescription>
              Đây là cấu hình chuẩn JLPT dùng cho các phần thi + mondai + scoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : levels.length === 0 ? (
              <div className="h-24 text-center text-muted-foreground text-sm">
                Chưa có JLPT Level trong DB. Bấm “Tạo/đồng bộ Level + Sections”.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Code</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead className="w-[160px]">Tổng thời gian</TableHead>
                    <TableHead className="w-[120px]">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((l) => (
                    <TableRow
                      key={l.id}
                      className={l.code === selectedLevel ? "bg-muted/40" : undefined}
                      onClick={() => setSelectedLevel(l.code)}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell className="font-mono">{l.code}</TableCell>
                      <TableCell>{l.nameVi ?? "—"}</TableCell>
                      <TableCell>{l.totalDurationMinutes} phút</TableCell>
                      <TableCell>{l.code === selectedLevel && activeProfile ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sections theo Level</CardTitle>
            <CardDescription>Backend sẽ tự tạo theo chuẩn N5/N4/... (duration/order/isListening).</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <div className="h-24 text-center text-muted-foreground text-sm">Chưa có sections cho level này.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Section</TableHead>
                    <TableHead className="w-[90px]">Order</TableHead>
                    <TableHead className="w-[160px]">Thời lượng</TableHead>
                    <TableHead className="w-[90px]">Listening</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono">{s.code}</TableCell>
                      <TableCell>{s.orderIndex}</TableCell>
                      <TableCell>{s.durationMinutes} phút</TableCell>
                      <TableCell>{s.isListening ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Field className="min-w-[220px]">
          <FieldLabel>Cấp độ (Level)</FieldLabel>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
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

        <Field className="min-w-[260px] flex-1">
          <FieldLabel>Tên tiếng Việt (tuỳ chọn)</FieldLabel>
          <Input
            value={levelNameVi}
            onChange={(e) => setLevelNameVi(e.target.value)}
            placeholder="Ví dụ: N5"
          />
        </Field>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => void handleEnsure()}
          disabled={ensuring}
        >
          {ensuring ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Tạo/đồng bộ Level + Sections
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Active scoring profile</CardTitle>
            <CardDescription>
              Template tạo mới sẽ tự dùng scoring profile đang `isActive=true` của Level này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : activeProfile ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {activeProfile.name}
                </div>
                <div>
                  <span className="font-medium">minLanguageScaled:</span> {activeProfile.minLanguageScaled ?? 0}
                </div>
                <div>
                  <span className="font-medium">minReadingScaled:</span> {activeProfile.minReadingScaled ?? 0}
                </div>
                <div>
                  <span className="font-medium">minListeningScaled:</span> {activeProfile.minListeningScaled ?? 0}
                </div>
                <div>
                  <span className="font-medium">minTotalScaled:</span> {activeProfile.minTotalScaled ?? 0}
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                Chưa có active scoring profile cho level này. Hãy tạo ở bên phải.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Tạo scoring profile</CardTitle>
            <CardDescription>
              Để case demo dễ chạy, có thể đặt min* = 0 (user chắc pass). Bạn có thể tinh chỉnh sau.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>minLanguageScaled</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={minLanguageScaled}
                  onChange={(e) => setMinLanguageScaled(Number(e.target.value) || 0)}
                />
              </Field>
              <Field>
                <FieldLabel>minReadingScaled</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={minReadingScaled}
                  onChange={(e) => setMinReadingScaled(Number(e.target.value) || 0)}
                />
              </Field>
              <Field>
                <FieldLabel>minListeningScaled</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={minListeningScaled}
                  onChange={(e) => setMinListeningScaled(Number(e.target.value) || 0)}
                />
              </Field>
              <Field>
                <FieldLabel>minTotalScaled</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={minTotalScaled}
                  onChange={(e) => setMinTotalScaled(Number(e.target.value) || 0)}
                />
              </Field>
            </div>

            <Button
              type="button"
              onClick={() => void handleCreateProfile()}
              disabled={creatingProfile}
              className="w-full"
            >
              {creatingProfile ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {creatingProfile ? "Đang tạo..." : "Tạo scoring profile"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Scoring mappings (JLPT)</CardTitle>
          <CardDescription>
            Nhập mapping theo chuẩn chính thức dạng JSON rồi lưu vào active profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field>
            <FieldLabel>Mapping JSON</FieldLabel>
            <Textarea
              rows={10}
              value={mappingJson}
              onChange={(e) => setMappingJson(e.target.value)}
              placeholder={`[
  { "domain": "LANGUAGE", "rawScore": 0, "scaledScore": 0 },
  { "domain": "LANGUAGE", "rawScore": 1, "scaledScore": 6 },
  { "domain": "READING", "rawScore": 0, "scaledScore": 0 },
  { "domain": "LISTENING", "rawScore": 0, "scaledScore": 0 }
]`}
            />
          </Field>
          <Button
            type="button"
            onClick={() => void handleSaveMappings()}
            disabled={savingMappings || !activeProfile?.id}
          >
            {savingMappings ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Lưu scoring mappings cho active profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

