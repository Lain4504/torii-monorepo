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

export type JlptBankQuestion = {
  id: string;
  levelCode: string;
  sectionCode: string;
  questionType: string;
  stemText: string;
  contextText?: string;
  audioAssetId?: string;
  imageAssetId?: string;
  options: {
    id: string;
    key: string;
    contentText: string;
    isCorrect: boolean;
  }[];
};

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

  // Bank Questions
  async findAllBankQuestions(params: { level?: string; sectionCode?: string; q?: string } = {}) {
    const res = await apiClient.get<StandardApiResponse<{ items: JlptBankQuestion[] }>>(
      "/api/academy/jlpt-mock/admin/bank-questions",
      { params }
    );
    return res.data.data?.items ?? [];
  },

  async createBankQuestion(data: any) {
    const res = await apiClient.post<StandardApiResponse<{ item: JlptBankQuestion }>>(
      "/api/academy/jlpt-mock/admin/bank-questions",
      data
    );
    return res.data.data?.item;
  },

  async updateBankQuestion(id: string, data: any) {
    const res = await apiClient.patch<StandardApiResponse<{ item: JlptBankQuestion }>>(
      `/api/academy/jlpt-mock/admin/bank-questions/${id}`,
      data
    );
    return res.data.data?.item;
  },
};
