import type { Branch, Customer, Employee, User } from "./types";
let adminTenantContext = "";
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
      ...(adminTenantContext ? { "X-Tenant-Id": adminTenantContext } : {}),
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
  setTenantContext: (tenantId: string) => {
    adminTenantContext = tenantId;
  },
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
  manageCatalog: (token: string) =>
    request<Array<Record<string, unknown>>>("/catalog/manage", {}, token),
  saveCatalogItem: (id: string | null, payload: unknown, token: string) =>
    request<Record<string, unknown> | void>(
      id ? `/catalog/${id}` : "/catalog",
      { method: id ? "PUT" : "POST", body: JSON.stringify(payload) },
      token,
    ),
  notificationSettings: (token: string) =>
    request<Record<string, unknown>>(
      "/owner/notifications/settings",
      {},
      token,
    ),
  saveNotificationSettings: (payload: unknown, token: string) =>
    request<void>(
      "/owner/notifications/settings",
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  premiumCustomers: (page: number, token: string) =>
    request<{
      content: Array<Record<string, unknown>>;
      page: number;
      totalPages: number;
      totalElements: number;
    }>(`/owner/notifications/customers?page=${page}`, {}, token),
  notificationTodayCount: (token: string) =>
    request<{ count: number }>("/owner/notifications/today-count", {}, token),
  notificationsToday: (token: string) =>
    request<Array<Record<string, unknown>>>(
      "/owner/notifications/today",
      {},
      token,
    ),
  sendCustomerNotification: (payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      "/owner/notifications/send",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  reports: (period: string, token: string) =>
    request<Record<string, unknown>>(`/reports?period=${period}`, {}, token),
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
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adminTenantContext ? { "X-Tenant-Id": adminTenantContext } : {}),
      },
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
  requestDeliveryOtp: (id: string, whatsappOptOut: boolean, token: string) =>
    request<Record<string, unknown>>(
      `/delivery/orders/${id}/request-otp`,
      { method: "POST", body: JSON.stringify({ whatsappOptOut }) },
      token,
    ),
  confirmDelivery: (id: string, otp: string, token: string) =>
    request<void>(
      `/delivery/orders/${id}/confirm`,
      { method: "POST", body: JSON.stringify({ otp }) },
      token,
    ),
  uploadDeliveryMedia: async (id: string, files: File[], token: string) => {
    if (!files.length) return;
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    const res = await fetch(`/api/delivery/orders/${id}/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adminTenantContext ? { "X-Tenant-Id": adminTenantContext } : {}),
      },
      body,
    });
    if (!res.ok)
      throw new Error("Delivery confirmed, but media upload failed.");
  },
  gallery: (page: number, token: string) =>
    request<{
      content: Array<Record<string, unknown>>;
      page: number;
      totalPages: number;
      totalElements: number;
    }>(`/delivery/gallery?page=${page}`, {}, token),
  favoriteGallery: (id: string, value: boolean, token: string) =>
    request<void>(
      `/delivery/gallery/${id}/favorite?value=${value}`,
      { method: "PATCH" },
      token,
    ),
  galleryContent: async (id: string, token: string) => {
    const res = await fetch(`/api/delivery/gallery/${id}/content`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adminTenantContext ? { "X-Tenant-Id": adminTenantContext } : {}),
      },
    });
    if (!res.ok) throw new Error("Unable to load gallery media");
    return res.blob();
  },
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
  jobCards: (page: number, status: string, token: string) =>
    request<{
      content: Array<Record<string, unknown>>;
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      statusCounts: Record<string, number>;
    }>(`/job-cards?page=${page}&status=${encodeURIComponent(status)}`, {}, token),
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
  tenant: (id: string, token: string) =>
    request<Record<string, unknown>>(`/admin/tenants/${id}`, {}, token),
  createTenant: (payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      "/admin/tenants",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  updateTenant: (id: string, payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      `/admin/tenants/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  uploadTenantLogo: async (id: string, file: File, token: string) => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/admin/tenants/${id}/logo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({ message: "Logo upload failed" })))
          .message || "Logo upload failed",
      );
  },
  salespeople: (token: string) =>
    request<Array<Record<string, unknown>>>("/admin/salespeople", {}, token),
  createSalesperson: (payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      "/admin/salespeople",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  updateSalesperson: (id: string, payload: unknown, token: string) =>
    request<Record<string, unknown>>(
      `/admin/salespeople/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  tenantLogo: async (token: string) => {
    const res = await fetch("/api/tenant/logo", {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adminTenantContext ? { "X-Tenant-Id": adminTenantContext } : {}),
      },
    });
    if (!res.ok) throw new Error("Shop logo is not configured");
    return res.blob();
  },
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
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adminTenantContext ? { "X-Tenant-Id": adminTenantContext } : {}),
      },
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
