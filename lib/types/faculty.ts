export interface Faculty {
  id: string;
  name: string;
  email?: string | null;
  position?: string | null;
  department: string;
  subjects: string[];
  semester?: string | null;
  profile_image?: string | null;
  createdAt: string;
}

export interface NewFaculty {
  name: string;
  department: string;
  subjects: string[];
}
