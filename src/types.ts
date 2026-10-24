export type Role = "OWNER" | "ADMIN" | "EMPLOYEE";
export type User = {
  token: string;
  displayName: string;
  role: Role;
  tenantName: string;
  domain?: string;
  themeKey?: string;
  branchName?: string;
};
export type Customer = {
  id?: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  anniversary: string;
};
export type CatalogItem = {
  id: string;
  name: string;
  description: string;
  type: "PRODUCT" | "SERVICE" | "PACKAGE";
  price: number;
  durationMonths?: number;
  badge?: string;
};
export type CartLine = CatalogItem & { quantity: number; discount: number };
export type Branch = {
  id: string;
  code: string;
  documentCode: string;
  name: string;
  address: string;
  phone?: string;
};
export type Employee = {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  username: string;
  employeeType: "OWNER" | "USER";
  jobRole: string;
  dateOfJoining: string;
  hourlyRate?: number;
  monthlySalary?: number;
  active: boolean;
};
