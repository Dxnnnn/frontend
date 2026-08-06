import type { UserRole } from "@/lib/types/auth";
import type {
  CollegeCourse,
  SeniorHighStrand,
  StudentLevel,
} from "@/lib/accounts/student-options";

export type AccountRole = Extract<UserRole, "user" | "faculty">;

export interface Account {
  id: string;
  name: string;
  username: string;
  password: string;
  role: AccountRole;
  department?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  studentLevel?: StudentLevel;
  grade?: string;
  yearLevel?: string;
  section?: string;
  strand?: SeniorHighStrand;
  course?: CollegeCourse;
  createdAt: string;
}

export interface NewStudentAccount {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  studentLevel: StudentLevel;
  grade?: string;
  yearLevel?: string;
  section: string;
  strand?: SeniorHighStrand;
  course?: CollegeCourse;
}

export interface NewSchoolHeadAccount {
  name: string;
  username: string;
  password: string;
  role: "faculty";
  department: string;
}

export type NewAccount = NewStudentAccount | NewSchoolHeadAccount;
