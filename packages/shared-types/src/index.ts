export enum Role {
  ADMIN = 'ADMIN',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT',
}

export interface AuthenticatedUser {
  id: bigint;
  email: string;
  role: {
    id: number;
    roleName: Role; // Gunakan Enum kita
  };
  student?: {
    id: number;
    nim: string;
    name: string;
  } | null;
  lecturer?: {
    id: number;
    nidn: string;
    name: string;
  } | null;
}