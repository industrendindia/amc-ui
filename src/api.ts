import type { Branch, Customer, Employee, User } from "./types";
const demoItems = [
  {
    id: "ro-amc",
    name: "RO Care Annual",
    description: "4 scheduled visits · filters included",
    type: "PACKAGE",
    price: 4499,
    durationMonths: 12,
    badge: "Most popular",
  },
  {
    id: "ac-care",
    name: "AC Deep Service",
    description: "Jet clean, gas and performance check",
    type: "SERVICE",
    price: 1499,
    durationMonths: 3,
  },
  {
    id: "filter",
    name: "Premium RO Filter",
    description: "High-flow sediment + carbon filter",
    type: "PRODUCT",
    price: 899,
    durationMonths: 12,
  },
  {
    id: "dairy",
    name: "Daily Milk Plan",
    description: "30-day doorstep delivery subscription",
    type: "PACKAGE",
    price: 2100,
    durationMonths: 1,
  },
] as const;
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({ message: "Request failed" }))).message ||
        "Request failed",
    );
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
export const api = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      return await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    } catch {
      if (username === "bakes.owner" && password === "ChangeMe@123")
        return {
          token: "demo-token",
          displayName: "Bakes n Cakes Owner",
          role: "OWNER",
          tenantName: "Bakes n Cakes",
          domain: "BAKERY",
          themeKey: "bakery-rose",
          branchName: "Lohagaon",
        };
      if (
        (username === "owner" && password === "owner123") ||
        (username === "admin" && password === "msadmin123")
      )
        return {
          token: "demo-token",
          displayName:
            username === "admin" ? "Platform Administrator" : "Ananya Sharma",
          role: username === "admin" ? "ADMIN" : "OWNER",
          tenantName:
            username === "admin" ? "SevaSetu Control" : "AquaCare Services",
        };
      throw new Error("Check your user ID and password.");
    }
  },
  catalog: async (token: string) => {
    try {
      return await request<typeof demoItems>("/catalog", {}, token);
    } catch {
      return [...demoItems];
    }
  },
  createOrder: async (payload: unknown, token: string) => {
    return request<{ id: string; billNumber: string }>(
      "/orders",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
  },
  uploadOrderImages: async (orderId: string, files: File[], token: string) => {
    if (!files.length) return;
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    const res = await fetch(`/api/orders/${orderId}/reference-images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (!res.ok)
      throw new Error(
        "Order saved, but reference images could not be uploaded.",
      );
  },
  orders: (token: string, page = 0, size = 10, q = "") =>
    request<{
      content: Array<Record<string, unknown>>;
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    }>(
      `/orders?page=${page}&size=${size}&q=${encodeURIComponent(q)}`,
      {},
      token,
    ),
  order: (id: string, token: string) =>
    request<Record<string, unknown>>(`/orders/${id}`, {}, token),
  completePayment: (id: string, payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      `/orders/${id}/payments`,
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  markDelivered: (id: string, token: string) =>
    request<void>(`/orders/${id}/delivered`, { method: "PATCH" }, token),
  orderImages: (orderId: string, token: string) =>
    request<
      Array<{
        id: string;
        fileName: string;
        contentType: string;
        fileSize: number;
      }>
    >(`/orders/${orderId}/reference-images`, {}, token),
  branches: (token: string) => request<Branch[]>("/branches", {}, token),
  employees: (token: string) => request<Employee[]>("/employees", {}, token),
  createEmployee: (payload: unknown, token: string) =>
    request<Employee>(
      "/employees",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  updateEmployee: (id: string, payload: unknown, token: string) =>
    request<Employee>(
      `/employees/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  jobCards: (token: string) =>
    request<Array<Record<string, unknown>>>("/job-cards", {}, token),
  jobCard: (id: string, token: string) =>
    request<Record<string, unknown>>(`/job-cards/${id}`, {}, token),
  assignChefs: (id: string, employeeIds: string[], token: string) =>
    request<void>(
      `/job-cards/${id}/chefs`,
      { method: "PUT", body: JSON.stringify({ employeeIds }) },
      token,
    ),
  addJobNote: (id: string, note: string, token: string) =>
    request<void>(
      `/job-cards/${id}/notes`,
      { method: "POST", body: JSON.stringify({ note }) },
      token,
    ),
  updateJobStatus: (id: string, status: string, token: string) =>
    request<void>(
      `/job-cards/${id}/status?value=${status}`,
      { method: "PATCH" },
      token,
    ),
  tenants: (token: string) =>
    request<Array<Record<string, unknown>>>("/admin/tenants", {}, token),
  createTenant: (payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      "/admin/tenants",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  saveCustomer: async (customer: Customer, token: string) => {
    return request<Customer>(
      "/customers",
      { method: "POST", body: JSON.stringify(customer) },
      token,
    );
  },
  searchCustomers: (q: string, token: string) =>
    request<Customer[]>(`/customers?q=${encodeURIComponent(q)}`, {}, token),
  socialStatus: async (token: string) =>
    request<{ connected: boolean; pageName?: string; pageId?: string }>(
      "/social/facebook/status",
      {},
      token,
    ),
  facebookConnectUrl: async (token: string) =>
    request<{ authorizationUrl: string }>(
      "/social/facebook/connect",
      {},
      token,
    ),
  publishFacebook: async (caption: string, files: File[], token: string) => {
    const body = new FormData();
    body.append("caption", caption);
    files.forEach((file) => body.append("files", file));
    const res = await fetch("/api/social/facebook/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (!res.ok)
      throw new Error(
        (
          await res
            .json()
            .catch(() => ({ message: "Facebook publishing failed" }))
        ).message || "Facebook publishing failed",
      );
    return res.json() as Promise<{ facebookPostId: string }>;
  },
};
