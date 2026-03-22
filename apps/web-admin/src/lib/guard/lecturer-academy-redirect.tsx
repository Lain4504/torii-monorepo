import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/hooks";
import { selectUser } from "@/store/slices/auth-slice";
import { UserRole } from "@workspace/schemas";

/** Lecturer chỉ dùng LMS qua /academy/classes — chặn URL kho/gói/duyệt/JLPT/AI. */
const BLOCKED =
  /^\/academy\/(course-profiles|course-offerings|approvals|jlpt|ai-subscriptions)(\/|$)/;

export function LecturerAcademyRedirect() {
  const user = useAppSelector(selectUser);
  const { pathname } = useLocation();

  if (user?.role !== UserRole.LECTURER) return null;
  if (!BLOCKED.test(pathname)) return null;

  return <Navigate to="/academy/classes" replace />;
}
