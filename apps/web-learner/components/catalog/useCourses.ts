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
  totalPages: number;
}

interface CourseAPIResponse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  jlptLevel: string;
  totalLessons: number;
  durationWeeks?: number;
  price: number;
  discountPrice?: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  createdBy?: string;
  [key: string]: any;
}

interface APIPaginatedResponse {
  data: CourseAPIResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapApiCourseToCourse(apiCourse: CourseAPIResponse): Course {
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
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', String(params.page));
      if (params.limit) searchParams.append('limit', String(params.limit));
      if (params.level) searchParams.append('jlptLevel', params.level);
      if (params.type) searchParams.append('type', params.type);
      if (params.q) searchParams.append('search', params.q);
      
      const url = `/api/courses?${searchParams.toString()}`;
      console.log('Fetching courses from:', url);
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
      }
      
      const jsonData = await res.json() as APIPaginatedResponse;
      console.log('API Response:', jsonData);
      
      // Map API response to expected format
      const mappedCourses = jsonData.data.map(mapApiCourseToCourse);
      
      const response: CoursesResponse = {
        data: mappedCourses,
        total: jsonData.total,
        page: jsonData.page,
        limit: jsonData.limit,
        totalPages: jsonData.totalPages,
      };
      
      console.log('Mapped response:', response);
      return response;
    },
  });
}
