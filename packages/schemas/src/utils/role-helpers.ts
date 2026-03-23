import { UserRole } from '../models/user.model';

/** Nhân viên nội bộ: chỉ staff-academic và staff-operations (RBAC). */
export function isStaffBranchRole(role: string | undefined | null): boolean {
  if (role == null || role === '') return false;
  const r = String(role).trim().toLowerCase();
  return r === UserRole.STAFF_ACADEMIC || r === UserRole.STAFF_OPERATIONS;
}

/** Có thể dùng cổng quản trị (admin / giảng viên / nhân sự). Học viên trả về false. */
export function isAdminPortalRole(role: string | undefined | null): boolean {
  if (role == null || role === '') return false;
  const r = String(role).trim().toLowerCase();
  if (r === UserRole.LEARNER) return false;
  return (
    r === UserRole.ADMIN ||
    r === UserRole.LECTURER ||
    isStaffBranchRole(role)
  );
}
