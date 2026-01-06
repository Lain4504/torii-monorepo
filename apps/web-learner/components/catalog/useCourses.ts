import { useQuery } from '@tanstack/react-query';

export interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  level: string;
  instructor: {
    name: string;
    avatar: string;
  };
  rating: number;
  reviewCount: number;
  students: number;
  price: number;
  originalPrice?: number;
  totalLessons: number;
  totalHours: number;
  isLive?: boolean;
}

export interface CoursesResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
}

export function useCourses(params: {
  page?: number;
  limit?: number;
  level?: string;
  type?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', String(params.page));
      if (params.limit) searchParams.append('limit', String(params.limit));
      if (params.level) searchParams.append('level', params.level);
      if (params.type) searchParams.append('type', params.type);
      if (params.q) searchParams.append('q', params.q);
      const res = await fetch(`/api/courses?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json() as Promise<CoursesResponse>;
    },
  });
}
