import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  academyJlptMockApi,
  type JlptScoringProfile,
  type JlptLevel,
  type JlptSection,
  type JlptScoringMapping,
} from "@/lib/api/services/academy-jlpt-mock";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { PageHeader } from "@/components/common/page-header";
import { listPageFiltersRowClass } from "@/lib/ui-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"] as const;
const SHOW_JLPT_SCORING_MAPPINGS = false;

export default function JlptConfigPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [levels, setLevels] = useState<JlptLevel[]>([]);
  const [sections, setSections] = useState<JlptSection[]>([]);

  const [activeProfile, setActiveProfile] = useState<JlptScoringProfile | null>(null);

  const [loading, setLoading] = useState(false);

  const [savingMappings, setSavingMappings] = useState<boolean>(false);

  type Domain = JlptScoringMapping["domain"];
  const [mappingRowsByDomain, setMappingRowsByDomain] = useState<
    Record<Domain, Array<{ rawScore: number; scaledScore: number }>>
  >({
    LANGUAGE: [],
    READING: [],
    LISTENING: [],
  });

  const clampRawScore = (raw: number) => Math.max(0, Math.floor(raw));
  const clampScaledScore = (scaled: number) => Math.max(0, Math.min(60, Math.floor(scaled)));
  const sortByRawScoreAsc = (rows: Array<{ rawScore: number; scaledScore: number }>) =>
    [...rows].sort((a, b) => a.rawScore - b.rawScore);

  const rawDuplicateByDomain = useMemo(() => {
    const result: Record<Domain, boolean> = {
      LANGUAGE: false,
      READING: false,
      LISTENING: false,
    };

    (Object.keys(mappingRowsByDomain) as Domain[]).forEach((domain) => {
      const seen = new Set<number>();
      for (const r of mappingRowsByDomain[domain]) {
        const rawInt = clampRawScore(r.rawScore);
        if (seen.has(rawInt)) {
          result[domain] = true;
          return;
        }
        seen.add(rawInt);
      }
    });

    return result;
  }, [mappingRowsByDomain]);

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
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const loadMappings = async () => {
      if (!activeProfile?.id) {
        setMappingRowsByDomain({
          LANGUAGE: [],
          READING: [],
          LISTENING: [],
        });
        return;
      }

      try {
        const items = await academyJlptMockApi.listScoringMappings(activeProfile.id);
        const grouped: Record<Domain, Array<{ rawScore: number; scaledScore: number }>> = {
          LANGUAGE: [],
          READING: [],
          LISTENING: [],
        };
        for (const it of items) {
          grouped[it.domain].push({
            rawScore: clampRawScore(it.rawScore),
            scaledScore: clampScaledScore(it.scaledScore),
          });
        }
        setMappingRowsByDomain({
          LANGUAGE: sortByRawScoreAsc(grouped.LANGUAGE),
          READING: sortByRawScoreAsc(grouped.READING),
          LISTENING: sortByRawScoreAsc(grouped.LISTENING),
        });
      } catch {
        toast.error("Không tải được scoring mappings");
      }
    };

    void loadMappings();
  }, [activeProfile?.id]);

  const handleSaveMappings = async () => {
    if (!activeProfile?.id) {
      toast.error("Chưa có active profile để gắn mapping");
      return;
    }

    const hasDuplicates = Object.values(rawDuplicateByDomain).some(Boolean);
    if (hasDuplicates) {
      toast.error("Không thể lưu: rawScore bị trùng trong cùng domain");
      return;
    }

    try {
      setSavingMappings(true);
      const items = (Object.keys(mappingRowsByDomain) as Domain[]).flatMap((domain) =>
        mappingRowsByDomain[domain].map((row) => ({
          domain,
          rawScore: clampRawScore(row.rawScore),
          scaledScore: clampScaledScore(row.scaledScore),
        })),
      );
      await academyJlptMockApi.upsertScoringMappings({
        profileId: activeProfile.id,
        items,
      });
      toast.success("Đã lưu scoring mappings");

      const refreshed = await academyJlptMockApi.listScoringMappings(activeProfile.id);
      const grouped: Record<Domain, Array<{ rawScore: number; scaledScore: number }>> = {
        LANGUAGE: [],
        READING: [],
        LISTENING: [],
      };
      for (const it of refreshed) {
        grouped[it.domain].push({
          rawScore: clampRawScore(it.rawScore),
          scaledScore: clampScaledScore(it.scaledScore),
        });
      }
      setMappingRowsByDomain({
        LANGUAGE: sortByRawScoreAsc(grouped.LANGUAGE),
        READING: sortByRawScoreAsc(grouped.READING),
        LISTENING: sortByRawScoreAsc(grouped.LISTENING),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      toast.error(msg ?? "Lưu scoring mappings thất bại");
    } finally {
      setSavingMappings(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="JLPT Config"
        subtitle="Xem cấu hình JLPT + scoring profile (seed) - read-only"
      />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border">
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
                      Chưa có JLPT Level trong DB. Vui lòng kiểm tra seed/config JLPT ở backend.
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
                            <TableCell>
                              {l.code === selectedLevel && activeProfile ? "Yes" : "No"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle>Sections theo Level</CardTitle>
                  <CardDescription>Hiển thị sections theo chuẩn N5/N4/... (duration/order/isListening) từ seed/config.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  ) : sections.length === 0 ? (
                    <div className="h-24 text-center text-muted-foreground text-sm">
                      Chưa có sections cho level này.
                    </div>
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

        <div className={listPageFiltersRowClass}>
              <Field className="w-full md:min-w-[220px] md:max-w-sm">
                <FieldLabel>Cấp độ (Level)</FieldLabel>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full">
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
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card className="border">
              <CardHeader>
                <CardTitle>Active scoring profile</CardTitle>
                <CardDescription>
                  Scoring profile đang `isActive=true` cho level này (seed/config đã có).
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
                      <span className="font-medium">minLanguageScaled:</span>{" "}
                      {activeProfile.minLanguageScaled ?? 0}
                    </div>
                    <div>
                      <span className="font-medium">minReadingScaled:</span>{" "}
                      {activeProfile.minReadingScaled ?? 0}
                    </div>
                    <div>
                      <span className="font-medium">minListeningScaled:</span>{" "}
                      {activeProfile.minListeningScaled ?? 0}
                    </div>
                    <div>
                      <span className="font-medium">minTotalScaled:</span>{" "}
                      {activeProfile.minTotalScaled ?? 0}
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                    Chưa có active scoring profile cho level này. Vui lòng kiểm tra seed/scoring profile ở backend.
                  </div>
                )}
              </CardContent>
            </Card>
        {SHOW_JLPT_SCORING_MAPPINGS ? (
          <Card className="border">
            <CardHeader>
              <CardTitle>Scoring mappings (JLPT)</CardTitle>
              <CardDescription>
                Tự định nghĩa bảng quy đổi rawScore sang scaledScore cho từng domain.
                Nếu một rawScore chưa được khai báo, hệ thống sẽ fallback theo tỉ lệ raw/maxRaw.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeProfile ? (
                <div className="h-24 text-center text-muted-foreground text-sm flex items-center justify-center rounded-md border bg-muted/10">
                  Chưa có active scoring profile. Hãy tạo scoring profile trước khi cấu hình mappings.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {(
                      [
                        { domain: "LANGUAGE", title: "LANGUAGE" },
                        { domain: "READING", title: "READING" },
                        { domain: "LISTENING", title: "LISTENING" },
                      ] as Array<{ domain: Domain; title: string }>
                    ).map(({ domain, title }) => (
                      <div key={domain} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold">{title}</div>
                            <div className="text-xs text-muted-foreground">
                              {mappingRowsByDomain[domain].length} dòng mapping
                            </div>
                            {rawDuplicateByDomain[domain] ? (
                              <div className="text-xs text-destructive">rawScore trùng (không lưu được)</div>
                            ) : null}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setMappingRowsByDomain((prev) => ({
                                ...prev,
                                [domain]: sortByRawScoreAsc([
                                  ...prev[domain],
                                  { rawScore: 0, scaledScore: 0 },
                                ]),
                              }))
                            }
                          >
                            <Plus className="size-4 mr-2" />
                            Thêm dòng
                          </Button>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="w-[110px]">Raw</TableHead>
                                <TableHead className="w-[120px]">Scaled</TableHead>
                                <TableHead className="w-[60px] text-right">Xóa</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mappingRowsByDomain[domain].length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={3}
                                    className="text-center text-muted-foreground h-10"
                                  >
                                    Chưa có mapping. Hãy bấm “Thêm dòng”.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                mappingRowsByDomain[domain].map((row, idx) => (
                                  <TableRow key={`${domain}-${idx}`}>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={row.rawScore}
                                        onChange={(e) => {
                                          const v =
                                            e.target.value === "" ? 0 : Number(e.target.value);
                                          const rawScore = Number.isFinite(v)
                                            ? clampRawScore(v)
                                            : 0;
                                          setMappingRowsByDomain((prev) => {
                                            const next = [...prev[domain]];
                                            next[idx] = { ...next[idx], rawScore };
                                            return { ...prev, [domain]: sortByRawScoreAsc(next) };
                                          });
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={60}
                                        step={1}
                                        value={row.scaledScore}
                                        onChange={(e) => {
                                          const v =
                                            e.target.value === "" ? 0 : Number(e.target.value);
                                          const scaledScore = Number.isFinite(v)
                                            ? clampScaledScore(v)
                                            : 0;
                                          setMappingRowsByDomain((prev) => {
                                            const next = [...prev[domain]];
                                            next[idx] = { ...next[idx], scaledScore };
                                            return { ...prev, [domain]: sortByRawScoreAsc(next) };
                                          });
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/5 font-medium"
                                        onClick={() =>
                                          setMappingRowsByDomain((prev) => ({
                                            ...prev,
                                            [domain]: sortByRawScoreAsc(
                                              prev[domain].filter((_, i) => i !== idx),
                                            ),
                                          }))
                                        }
                                      >
                                        <Trash2 className="size-4" />
                                        Xóa
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => void handleSaveMappings()}
                      disabled={
                        savingMappings ||
                        !activeProfile?.id ||
                        Object.values(rawDuplicateByDomain).some(Boolean)
                      }
                    >
                      {savingMappings ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                      Lưu scoring mappings cho active profile
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  </div>
  );
}

