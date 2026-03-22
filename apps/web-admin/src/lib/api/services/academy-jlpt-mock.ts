import { apiClient } from "../api-client";
import type { StandardApiResponse } from "@workspace/schemas";

export type JlptMockTemplate = {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: string;
  levelCode: string;
  totalDurationMinutes?: number;
};

export type JlptBankQuestionMondai = {
  id: string;
  code: string;
  titleVi: string;
};

/** Dữ liệu thô từ API có thể có `level: { code }` thay vì `levelCode` ở root. */
export type JlptBankQuestion = {
  id: string;
  levelCode: string;
  sectionCode: string;
  questionType: string;
  /** EASY | MEDIUM | HARD */
  difficulty?: string;
  stemText: string;
  contextText?: string | null;
  audioAssetId?: string | null;
  imageAssetId?: string | null;
  options: {
    id: string;
    key: string;
    contentText: string;
    isCorrect: boolean;
  }[];
  mondai?: JlptBankQuestionMondai | null;
  level?: { code: string };
};

export function normalizeJlptBankQuestion(raw: Record<string, unknown> | null | undefined): JlptBankQuestion {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid bank question payload');
  }
  const levelCode =
    (typeof raw.levelCode === 'string' && raw.levelCode) ||
    (raw.level && typeof (raw.level as { code?: string }).code === 'string'
      ? (raw.level as { code: string }).code
      : '');

  const optionsRaw = Array.isArray(raw.options) ? raw.options : [];
  const options = optionsRaw.map((o: Record<string, unknown>) => ({
    id: String(o.id ?? ''),
    key: String(o.key ?? ''),
    contentText: String(o.contentText ?? ''),
    isCorrect: Boolean(o.isCorrect),
  }));

  const mondai = raw.mondai && typeof raw.mondai === 'object'
    ? (raw.mondai as JlptBankQuestionMondai)
    : null;

  return {
    id: String(raw.id ?? ''),
    levelCode,
    sectionCode: String(raw.sectionCode ?? ''),
    questionType: String(raw.questionType ?? ''),
    difficulty:
      raw.difficulty != null && raw.difficulty !== ''
        ? String(raw.difficulty)
        : undefined,
    stemText: String(raw.stemText ?? ''),
    contextText: raw.contextText != null ? String(raw.contextText) : undefined,
    audioAssetId: raw.audioAssetId != null ? String(raw.audioAssetId) : undefined,
    imageAssetId: raw.imageAssetId != null ? String(raw.imageAssetId) : undefined,
    options,
    mondai,
    level: raw.level && typeof raw.level === 'object' ? (raw.level as { code: string }) : undefined,
  };
}

export const academyJlptMockApi = {
  // Templates
  async findAllTemplates(params: { levelCode?: string; status?: string; q?: string } = {}) {
    const res = await apiClient.get<StandardApiResponse<{ items: JlptMockTemplate[] }>>(
      "/api/academy/jlpt-mock/admin/templates",
      { params }
    );
    return res.data.data?.items ?? [];
  },

  async findTemplateById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: any }>>(
      `/api/academy/jlpt-mock/templates/${id}`
    );
    return res.data.data?.item;
  },

  async createTemplate(data: any) {
    const res = await apiClient.post<StandardApiResponse<{ item: JlptMockTemplate }>>(
      "/api/academy/jlpt-mock/admin/templates",
      data
    );
    return res.data.data?.item;
  },

  async updateTemplate(id: string, data: any) {
    const res = await apiClient.patch<StandardApiResponse<{ item: JlptMockTemplate }>>(
      `/api/academy/jlpt-mock/admin/templates/${id}`,
      data
    );
    return res.data.data?.item;
  },

  async attachQuestions(templateId: string, items: { questionId: string; sectionId: string; orderIndex: number; weight?: number; mondaiId?: string }[]) {
    const res = await apiClient.post<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/jlpt-mock/admin/templates/${templateId}/attach-questions`,
      { items }
    );
    return res.data.data?.ok;
  },

  // Bank Questions (phân trang server: `page`, `limit`; `take` = alias `limit`)
  async findAllBankQuestions(
    params: {
      level?: string;
      sectionCode?: string;
      q?: string;
      mondaiCode?: string;
      questionType?: string;
      difficulty?: string;
      page?: number;
      limit?: number;
      take?: number;
    } = {},
  ) {
    const res = await apiClient.get<
      StandardApiResponse<{
        items: Record<string, unknown>[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >("/api/academy/jlpt-mock/admin/bank-questions", { params });
    const payload = res.data.data;
    const rows = Array.isArray(payload?.items) ? payload.items : [];
    return {
      items: rows.map((row) => normalizeJlptBankQuestion(row)),
      total: payload?.total ?? 0,
      page: payload?.page ?? 1,
      limit: payload?.limit ?? 20,
      totalPages: payload?.totalPages ?? 0,
    };
  },

  async listBankMondaiOptions(params: { level: string; sectionCode: string }) {
    const res = await apiClient.get<
      StandardApiResponse<{
        items: { id: string; code: string; titleVi: string | null; titleJa: string | null }[];
      }>
    >("/api/academy/jlpt-mock/admin/bank-questions/mondai-options", { params });
    return res.data.data?.items ?? [];
  },

  async createBankQuestion(data: Record<string, unknown>) {
    const { levelCode, ...rest } = data;
    const level = (typeof data.level === 'string' && data.level) || (typeof levelCode === 'string' ? levelCode : undefined);
    const body = { ...rest, ...(level ? { level } : {}) };
    const res = await apiClient.post<StandardApiResponse<{ item: Record<string, unknown> }>>(
      "/api/academy/jlpt-mock/admin/bank-questions",
      body,
    );
    const item = res.data.data?.item;
    return item ? normalizeJlptBankQuestion(item) : undefined;
  },

  async updateBankQuestion(id: string, data: any) {
    const res = await apiClient.patch<StandardApiResponse<{ item: Record<string, unknown> }>>(
      `/api/academy/jlpt-mock/admin/bank-questions/${id}`,
      data,
    );
    const item = res.data.data?.item;
    return item ? normalizeJlptBankQuestion(item) : undefined;
  },
};
