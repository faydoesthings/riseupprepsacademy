export type ClassOption = {
  id: string;
  grade: string;
  section: string | null;
  name?: string;
};

export type TeacherOption = {
  id: string;
  user: { name: string };
  salary?: number;
};

export type StudentOption = {
  id: string;
  user: { name: string };
  class?: { grade: string; section: string | null } | null;
};

export type SubjectOption = {
  id: string;
  name: string;
};

export type FeeStructureOption = {
  id: string;
  name: string;
  amount: number;
};

export type DonorOption = {
  id: string;
  user: { name: string };
};
