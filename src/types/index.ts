// User and Authentication Types
export interface User {
  _id: string;
  email: string;
  role: "admin" | "student";
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: "admin" | "student";
  organizationId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Student Types
export interface Student {
  _id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  yearLevel: string;
  major: string;
  departmentProgram: string;
  status: "regular" | "governor" | "vice-governor" | "under-secretary";
  qrCodeData: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentImportData {
  student_id: string;
  student_name: string;
  year_level: string;
  major: string;
  department_program: string;
  status: string;
}

// Event Types
export interface Event {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  attendanceRequiredMorning?: boolean;
  attendanceRequiredAfternoon?: boolean;
  scanWindowMinutes?: number;
  gracePeriodMinutes?: number;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
}

// Attendance Types
export interface Attendance {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    email: string;
  };
  event: string;
  morningStatus: "present" | "absent" | "excused";
  afternoonStatus: "present" | "absent" | "excused";
  morningCheckIn?: string;
  morningCheckOut?: string;
  afternoonCheckIn?: string;
  afternoonCheckOut?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  course: string;
  year: string;
  eventName: string;
  day: string;
  signInMorning?: string;
  signOutMorning?: string;
  signInAfternoon?: string;
  signOutAfternoon?: string;
  status: string;
}

export interface QRScanData {
  qrCodeData: string;
  eventId: string;
  session: "morning" | "afternoon";
}

// Officer Exclusion Types
export interface OfficerExclusion {
  _id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficerExclusionFormData {
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// Excuse Letter Types
export interface ExcuseLetter {
  _id: string;
  studentId: string;
  eventId: string;
  reason: string;
  filePath: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ExcuseLetterFormData {
  studentId: string;
  eventId: string;
  reason: string;
  file: File;
}

// Organization Types
export interface Organization {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  requiredRole?: "admin" | "student";
}

// Report Types
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  eventId?: string;
  studentId?: string;
  course?: string;
  year?: string;
  status?: string;
}

export interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  presentPercentage: number;
}
