import { useQuery } from '@tanstack/react-query';
import { courseApi, type CourseQueryParams } from '@/apis/services/course-api';
import type { CourseResponseDTO } from '@workspace/schemas';

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
  totalPages: number;
}

function mapApiCourseToCourse(apiCourse: CourseResponseDTO): Course {
  return {
    id: apiCourse.id,
    title: apiCourse.title,
    slug: apiCourse.slug,
    thumbnail: apiCourse.thumbnailUrl || '/default-thumbnail.jpg',
    level: apiCourse.jlptLevel,
    instructor: {
      name: 'Unknown Instructor',
      avatar: '/default-avatar.jpg',
    },
    rating: apiCourse.averageRating || 0,
    reviewCount: apiCourse.totalReviews || 0,
    students: apiCourse.totalStudents || 0,
    price: apiCourse.price || 0,
    originalPrice: apiCourse.discountPrice ? apiCourse.price : undefined,
    totalLessons: apiCourse.totalLessons || 0,
    totalHours: Math.round((apiCourse.durationWeeks || 0) * 10) || 0, // Rough estimate
    isLive: false,
  };
}

export function useCourses(params: {
  page?: number;
  limit?: number;
  level?: string;
  levels?: string[]; // New
  type?: string;
  q?: string;
  priceFilter?: 'all' | 'free' | 'paid';
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      // Map params to backend API format
      let priceMin: number | undefined;
      let priceMax: number | undefined;

      if (params.priceFilter === 'free') {
        priceMax = 0;
      } else if (params.priceFilter === 'paid') {
        priceMin = 1;
      }

      const levelsString = params.levels?.length ? params.levels.join(',') : params.level;

      const response = await courseApi.advancedSearch({
        page: params.page,
        limit: params.limit,
        q: params.q,
        levels: levelsString,
        priceMin,
        priceMax,
        sort: params.sortBy
      });

      // Map API response to expected format
      const mappedCourses = response.data?.map(mapApiCourseToCourse) || [];

      const result: CoursesResponse = {
        data: mappedCourses,
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || 0,
      };

      return result;
    },
  });
}
