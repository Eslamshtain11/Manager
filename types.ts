export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
}

export enum Gender {
  Male = 'ذكر',
  Female = 'أنثى',
}

export enum Evaluation {
  Excellent = 'ممتاز',
  VeryGood = 'جيد جداً',
  Good = 'جيد',
  Weak = 'ضعيف',
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  parentWhatsapp: string;
  teacherIds: string[]; // Array of Teacher IDs
}

export interface Subject {
  id: string;
  name: string;
}

export interface Classroom {
  id: string;
  name: string;
  // teacherId is removed
  studentIds: string[]; // Array of Student IDs
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  studentGender: Gender;
  parentWhatsapp: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  evaluation: Evaluation;
  createdAt: string;
}

export interface User {
  id: string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  // Password is not stored in the database
  role: UserRole;
  subjectId?: string; // The ID of the subject the teacher teaches
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}