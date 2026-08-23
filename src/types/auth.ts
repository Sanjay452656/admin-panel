export type Role = "SUPER_ADMIN" | "ADMIN" | "TECHNICIAN";

export interface User {
  id: string;
  email: string;
  role: Role;
  company_id: string;
}
