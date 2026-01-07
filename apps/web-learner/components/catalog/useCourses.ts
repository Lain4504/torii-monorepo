import { useQuery } from '@tanstack/react-query';
import { courseApi, type CourseQueryParams } from '@/api/services/course-api';
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
  type?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      // Map params to backend API format
      const queryParams: CourseQueryParams = {
        page: params.page,
        limit: params.limit,
        jlptLevel: params.level,
        search: params.q,
        // Note: 'type' filter not yet supported by backend
      };

      const response = await courseApi.findAll(queryParams);

      // Map API response to expected format
      const mappedCourses = response.data.map(mapApiCourseToCourse);

      const result: CoursesResponse = {
        data: mappedCourses,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };

      return result;
    },
  });
}
