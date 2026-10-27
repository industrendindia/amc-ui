import { useEffect, useState } from "react";
import { api } from "./api";
import type { User } from "./types";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Facebook,
  PackagePlus,
  Save,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export function CatalogManagementPage({ user }: { user: User }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]),
    [editing, setEditing] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const empty = {
    type: "PRODUCT",
    name: "",
    description: "",
    price: "",
    durationMonths: "",
    active: true,
    includedItemIds: [] as string[],
  };
  const [form, setForm] = useState(empty);
  const load = () =>
    api
      .manageCatalog(user.token)
      .then(setRows)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [user.token]);
  function edit(row: Record<string, unknown>) {
    setEditing(String(row.id));
    setForm({
      type: String(row.type),
      name: String(row.name),
      description: String(row.description || ""),
      price: String(row.price),
      durationMonths: String(row.duration_months || ""),
      active: Boolean(row.active),
      includedItemIds: (row.included_item_ids as string[]) || [],
    });
    setOpen(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.saveCatalogItem(
        editing,
        {
          ...form,
          price: Number(form.price),
          durationMonths: form.durationMonths
            ? Number(form.durationMonths)
            : null,
        },
        user.token,
      );
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save item");
    }
  }
  const basic = rows.filter((r) => r.type !== "PACKAGE");
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">SHOP CATALOG</span>
          <h1>Products, services & packages</h1>
          <p>Only this shop’s configured catalog appears during billing.</p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <PackagePlus /> Add item
        </button>
      </div>
      {open && (
        <form className="content-card employee-form" onSubmit={save}>
          <div className="form-grid">
            <label>
              Type
              <select
                disabled={Boolean(editing)}
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    includedItemIds: [],
                  })
                }
              >
                <option>PRODUCT</option>
                <option>SERVICE</option>
                <option>PACKAGE</option>
              </select>
            </label>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="full">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label>
              Price
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label>
              Duration in months
              <input
                type="number"
                min="1"
                value={form.durationMonths}
                onChange={(e) =>
                  setForm({ ...form, durationMonths: e.target.value })
                }
              />
            </label>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />{" "}
              Available during billing
            </label>
          </div>
          {form.type === "PACKAGE" && (
            <div className="package-items">
              <h3>Items included in package</h3>
              {basic.map((i) => (
                <label key={String(i.id)}>
                  <input
                    type="checkbox"
                    checked={form.includedItemIds.includes(String(i.id))}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        includedItemIds: e.target.checked
                          ? [...form.includedItemIds, String(i.id)]
                          : form.includedItemIds.filter((id) => id !== i.id),
                      })
                    }
                  />
                  {String(i.name)} · {money(Number(i.price))}
                </label>
              ))}
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <div className="actions">
            <button
              type="button"
              className="text-btn"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button className="primary">
              <Save /> Save catalog item
            </button>
          </div>
        </form>
      )}
      <div className="catalog-admin-grid">
        {["PRODUCT", "SERVICE", "PACKAGE"].map((type) => (
          <section className="content-card" key={type}>
            <h2>{type[0] + type.slice(1).toLowerCase()}</h2>
            {rows
              .filter((r) => r.type === type)
              .map((r) => (
                <button
                  className="catalog-admin-row"
                  key={String(r.id)}
                  onClick={() => edit(r)}
                >
                  <span>
                    <strong>{String(r.name)}</strong>
                    <small>{String(r.description || "No description")}</small>
                  </span>
                  <strong>{money(Number(r.price))}</strong>
                  <span
                    className={`status-pill ${r.active ? "paid" : "pending"}`}
                  >
                    {r.active ? "ACTIVE" : "HIDDEN"}
                  </span>
                </button>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function NotificationsPage({ user }: { user: User }) {
  const [settings, setSettings] = useState<Record<string, unknown>>({
      purchaseReminderDays: 15,
      premiumCustomerThreshold: 10000,
      automaticNotifications: false,
      whatsappEnabled: false,
      whatsappNumber: "",
    }),
    [data, setData] = useState<{
      content: Array<Record<string, unknown>>;
      totalPages: number;
      totalElements: number;
    }>({ content: [], totalPages: 0, totalElements: 0 }),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [message, setMessage] = useState(
      "We miss you! Contact us for your next order or service.",
    ),
    [notice, setNotice] = useState("");
  const load = () =>
    Promise.all([
      api.notificationSettings(user.token),
      api.premiumCustomers(page, user.token),
    ]).then(([s, c]) => {
      setSettings(s);
      setData(c);
    });
  useEffect(() => {
    load();
  }, [user.token, page]);
  async function save() {
    await api.saveNotificationSettings(settings, user.token);
    setNotice("Automation settings saved.");
  }
  async function send(ids: string[]) {
    const result = await api.sendCustomerNotification(
      { customerIds: ids, message },
      user.token,
    );
    setNotice(
      String(result.status) === "QUEUED_WHATSAPP_NOT_CONFIGURED"
        ? "Saved safely. WhatsApp is not configured yet, so nothing was sent."
        : "Notification queued.",
    );
    setSelected([]);
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">CUSTOMER CARE</span>
          <h1>Notifications & premium customers</h1>
          <p>
            Purchase reminders and high-value customers are isolated to{" "}
            {user.tenantName}.
          </p>
        </div>
        <button className="primary" onClick={save}>
          <Settings /> Save automation
        </button>
      </div>
      <section className="content-card automation-panel">
        <div className="form-grid">
          <label>
            Reminder days before purchase anniversary
            <input
              type="number"
              min="1"
              max="365"
              value={Number(settings.purchaseReminderDays)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  purchaseReminderDays: Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Premium customer threshold
            <input
              type="number"
              min="0"
              value={Number(settings.premiumCustomerThreshold)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  premiumCustomerThreshold: Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            WhatsApp shop number
            <input
              value={String(settings.whatsappNumber || "")}
              onChange={(e) =>
                setSettings({ ...settings, whatsappNumber: e.target.value })
              }
              placeholder="Not configured"
            />
          </label>
          <label className="switch-label">
            <input
              type="checkbox"
              checked={Boolean(settings.automaticNotifications)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  automaticNotifications: e.target.checked,
                })
              }
            />{" "}
            Enable automatic reminders
          </label>
          <label className="switch-label">
            <input
              type="checkbox"
              checked={Boolean(settings.whatsappEnabled)}
              onChange={(e) =>
                setSettings({ ...settings, whatsappEnabled: e.target.checked })
              }
            />{" "}
            WhatsApp integration enabled
          </label>
        </div>
        <div
          className={`integration-state ${settings.whatsappEnabled ? "connected" : ""}`}
        >
          <Bell />{" "}
          {settings.whatsappEnabled
            ? "WhatsApp enabled"
            : "WhatsApp not enabled — reminders will be saved without showing an error."}
        </div>
      </section>
      <section className="content-card notification-list">
        <div className="list-head">
          <div>
            <h2>Premium customers</h2>
            <p>
              {data.totalElements} customers above{" "}
              {money(Number(settings.premiumCustomerThreshold))}
            </p>
          </div>
          <button
            className="secondary"
            disabled={!selected.length}
            onClick={() => send(selected)}
          >
            Notify selected
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {data.content.map((c) => (
          <label className="notification-row" key={String(c.id)}>
            <input
              type="checkbox"
              checked={selected.includes(String(c.id))}
              onChange={(e) =>
                setSelected((x) =>
                  e.target.checked
                    ? [...x, String(c.id)]
                    : x.filter((id) => id !== c.id),
                )
              }
            />
            <span className="notice-icon renewal">
              <Users />
            </span>
            <span>
              <strong>{String(c.name)}</strong>
              <small>
                {String(c.phone)} · {money(Number(c.lifetime_value))} ·{" "}
                {String(c.purchase_count)} purchases
              </small>
            </span>
            <button type="button" onClick={() => send([String(c.id)])}>
              Send now
            </button>
          </label>
        ))}
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
          </button>
          <span>
            Page {page + 1} of {Math.max(data.totalPages, 1)}
          </span>
          <button
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </section>
      {notice && <div className="social-message success">{notice}</div>}
    </div>
  );
}

export function ReportsPage({ user }: { user: User }) {
  const [report, setReport] = useState<Record<string, unknown>>({});
  useEffect(() => {
    api.reports(user.token).then(setReport);
  }, [user.token]);
  const last = (report.lastMonth as Record<string, unknown>) || {},
    trend = (report.trending as Array<Record<string, unknown>>) || [],
    chefs = (report.chefs as Array<Record<string, unknown>>) || [];
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">BUSINESS INSIGHTS</span>
          <h1>Reports</h1>
          <p>Sales, products and employee workload for this shop only.</p>
        </div>
      </div>
      <div className="stats">
        <article>
          <span>Last month sales</span>
          <strong>{money(Number(last.sales))}</strong>
          <small>{String(last.orders || 0)} orders</small>
        </article>
        <article>
          <span>Collected</span>
          <strong>{money(Number(last.collected))}</strong>
          <small>last month</small>
        </article>
        <article>
          <span>Trending items</span>
          <strong>{trend.length}</strong>
          <small>last 90 days</small>
        </article>
      </div>
      <div className="report-grid">
        <section className="content-card">
          <h2>
            <TrendingUp /> Trending products & services
          </h2>
          {trend.map((r, i) => (
            <div className="report-row" key={i}>
              <span>
                <strong>{String(r.description)}</strong>
                <small>{String(r.item_kind)}</small>
              </span>
              <span>{String(r.quantity)} sold</span>
              <strong>{money(Number(r.revenue))}</strong>
            </div>
          ))}
        </section>
        <section className="content-card">
          <h2>
            <Users /> Chef workload
          </h2>
          {chefs.map((r, i) => (
            <div className="report-row" key={i}>
              <span>
                <strong>{String(r.name)}</strong>
                <small>{String(r.branch_name)}</small>
              </span>
              <span>{String(r.jobs)} jobs</span>
              <strong>{String(r.completed)} completed</strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function IntegrationsPage({ user }: { user: User }) {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  useEffect(() => {
    api.notificationSettings(user.token).then(setSettings);
  }, [user.token]);
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">SHOP CONNECTIONS</span>
          <h1>WhatsApp & Facebook</h1>
          <p>Connections belong only to {user.tenantName}.</p>
        </div>
      </div>
      <div className="integration-grid">
        <article className="content-card">
          <Bell />
          <h2>WhatsApp</h2>
          <p>
            {settings.whatsappEnabled
              ? `Enabled for ${String(settings.whatsappNumber || "")}`
              : "Not enabled. Notifications remain safely queued."}
          </p>
          <small>Configure the number and automation from Notifications.</small>
        </article>
        <article className="content-card">
          <Facebook />
          <h2>Facebook Page</h2>
          <p>
            {settings.facebookConnected
              ? `Connected to ${String(settings.facebookPageName)}`
              : "No Page connected"}
          </p>
          <small>
            Use AI Social to connect or publish to the shop’s Facebook Page.
          </small>
        </article>
      </div>
    </div>
  );
}
