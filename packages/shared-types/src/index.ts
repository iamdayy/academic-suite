export enum Role {
  ADMIN = 'ADMIN',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT',
}

export interface AuthenticatedUser {
  id: bigint;
  email: string;
  role: {
    id?: bigint;
    roleName: Role; // Gunakan Enum kita
  };
  student?: {
    id?: bigint;
    nim: string;
    name: string;
  } | null;
  lecturer?: {
    id?: bigint;
    nidn: string;
    name: string;
  } | null;
}