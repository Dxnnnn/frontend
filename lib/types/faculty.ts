export interface Faculty {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  createdAt: string;
}

export interface NewFaculty {
  name: string;
  department: string;
  subjects: string[];
}
