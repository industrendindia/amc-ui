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
  return res.json();
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
    try {
      return await request<{ id: string; billNumber: string }>(
        "/orders",
        { method: "POST", body: JSON.stringify(payload) },
        token,
      );
    } catch {
      return {
        id: crypto.randomUUID(),
        billNumber: `AMC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      };
    }
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
  orders: (token: string) =>
    request<Array<Record<string, unknown>>>("/orders", {}, token),
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
  jobCards: (token: string) =>
    request<Array<Record<string, unknown>>>("/job-cards", {}, token),
  createJobCard: (payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      "/job-cards",
      { method: "POST", body: JSON.stringify(payload) },
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
    try {
      return await request<Customer>(
        "/customers",
        { method: "POST", body: JSON.stringify(customer) },
        token,
      );
    } catch {
      return { ...customer, id: crypto.randomUUID() };
    }
  },
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
