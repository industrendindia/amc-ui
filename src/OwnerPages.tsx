import { useEffect, useState } from "react";
import { api } from "./api";
import type { User } from "./types";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Heart,
  PackagePlus,
  Play,
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
    [today, setToday] = useState<Array<Record<string, unknown>>>([]),
    [selected, setSelected] = useState<string[]>([]),
    [message, setMessage] = useState(
      "We miss you! Contact us for your next order or service.",
    ),
    [notice, setNotice] = useState("");
  const load = () =>
    Promise.all([
      api.notificationSettings(user.token),
      api.premiumCustomers(page, user.token),
      api.notificationsToday(user.token),
    ]).then(([s, c, current]) => {
      setSettings(s);
      setData(c);
      setToday(current);
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
            Reminder window before event or expiry (days)
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
              disabled={!user.whatsappEnabled}
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
              disabled={!user.whatsappEnabled}
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
          {!user.whatsappEnabled
            ? "WhatsApp package is not enabled for this shop. Contact the administrator."
            : settings.whatsappEnabled
            ? "WhatsApp enabled"
            : "WhatsApp not enabled — reminders will be saved without showing an error."}
        </div>
      </section>
      <section className="content-card notification-list today-notifications">
        <div className="list-head">
          <div>
            <h2>Today’s notifications</h2>
            <p>{today.length} reminders and messages scheduled today</p>
          </div>
        </div>
        {today.length === 0 ? (
          <p className="empty-state">No notifications are due today.</p>
        ) : (
          today.map((item) => (
            <div className="notification-row" key={String(item.id)}>
              <span className="notice-icon renewal"><Bell /></span>
              <span>
                <strong>{String(item.customer_name)}</strong>
                <small>{String(item.kind).replaceAll("_", " ")} · {String(item.phone)}</small>
                <small>{String(item.message)}</small>
              </span>
              <span className="status-pill">{String(item.delivery_state)}</span>
            </div>
          ))
        )}
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
  const [period, setPeriod] = useState("MONTH"),
    [report, setReport] = useState<Record<string, unknown>>({});
  useEffect(() => {
    api.reports(period, user.token).then(setReport);
  }, [user.token, period]);
  const current = (report.currentMonth as Record<string, unknown>) || {},
    selected = (report.selected as Record<string, unknown>) || {},
    items = (report.items as Array<Record<string, unknown>>) || [],
    types = (report.salesByType as Array<Record<string, unknown>>) || [],
    chefs = (report.chefs as Array<Record<string, unknown>>) || [];
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">BUSINESS INSIGHTS</span>
          <h1>Reports</h1>
          <p>Sales, products and employee workload for this shop only.</p>
        </div>
        <label className="report-period">
          <span>Report period</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="WEEK">Last week</option>
            <option value="TWO_WEEKS">Last 2 weeks</option>
            <option value="MONTH">Last month</option>
            <option value="QUARTER">Last quarter</option>
            <option value="TWO_QUARTERS">Last 2 quarters</option>
            <option value="YEAR">Last year</option>
          </select>
        </label>
      </div>
      <div className="stats">
        <article>
          <span>Current month sales</span>
          <strong>{money(Number(current.sales))}</strong>
          <small>{String(current.orders || 0)} orders</small>
        </article>
        <article>
          <span>Collected</span>
          <strong>{money(Number(current.collected))}</strong>
          <small>current month</small>
        </article>
        <article>
          <span>Selected period sales</span>
          <strong>{money(Number(selected.sales))}</strong>
          <small>
            {String(selected.orders || 0)} orders ·{" "}
            {money(Number(selected.outstanding))} due
          </small>
        </article>
      </div>
      <div className="report-grid">
        <section className="content-card">
          <h2>
            <TrendingUp /> Sales by product, service & package
          </h2>
          <div className="type-summary">
            {types.map((r, i) => (
              <article key={i}>
                <span>{String(r.sale_type)}</span>
                <strong>{money(Number(r.revenue))}</strong>
                <small>
                  {String(r.quantity)} sold · {String(r.orders)} orders
                </small>
              </article>
            ))}
          </div>
          {items.map((r, i) => (
            <div className="report-row" key={i}>
              <span>
                <strong>{String(r.description)}</strong>
                <small>
                  {String(r.sale_type)} · {String(r.orders)} orders
                </small>
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
            {!user.whatsappEnabled
              ? "WhatsApp package not purchased"
              : settings.whatsappEnabled
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

export function GalleryPage({ user }: { user: User }) {
  const [page, setPage] = useState(0),
    [data, setData] = useState<{
      content: Array<Record<string, unknown>>;
      totalPages: number;
      totalElements: number;
    }>({ content: [], totalPages: 0, totalElements: 0 });
  const load = () => api.gallery(page, user.token).then(setData);
  useEffect(() => {
    load();
  }, [page, user.token]);
  async function favorite(id: string, value: boolean) {
    await api.favoriteGallery(id, value, user.token);
    load();
  }
  return (
    <div className="standard-page gallery-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">DELIVERED CREATIONS</span>
          <h1>
            {user.domain === "BAKERY" ? "Cake gallery" : "Delivery gallery"}
          </h1>
          <p>Delivered orders, with favourites always displayed first.</p>
        </div>
        <div className="gallery-count">{data.totalElements} memories</div>
      </div>
      {data.content.length ? (
        <div className="delivery-gallery">
          {data.content.map((item) => (
            <article className="gallery-card" key={String(item.id)}>
              <GalleryMedia user={user} item={item} />
              <button
                className={item.favorite ? "favorite active" : "favorite"}
                onClick={() =>
                  favorite(String(item.id), !Boolean(item.favorite))
                }
              >
                <Heart fill={item.favorite ? "currentColor" : "none"} />
              </button>
              <footer>
                <span>
                  <strong>{String(item.bill_number)}</strong>
                  <small>{String(item.customer_name)}</small>
                </span>
                <span>
                  {String(item.content_type).startsWith("video/") && <Play />}
                  {new Date(String(item.created_at)).toLocaleDateString(
                    "en-IN",
                  )}
                </span>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="content-card gallery-empty">
          <Heart />
          <h2>No delivered creations yet</h2>
          <p>
            Images and reels uploaded during verified delivery will appear here.
          </p>
        </div>
      )}
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
    </div>
  );
}
function GalleryMedia({
  user,
  item,
}: {
  user: User;
  item: Record<string, unknown>;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let object = "";
    api.galleryContent(String(item.id), user.token).then((blob) => {
      object = URL.createObjectURL(blob);
      setUrl(object);
    });
    return () => {
      if (object) URL.revokeObjectURL(object);
    };
  }, [item.id, user.token]);
  if (!url) return <div className="gallery-loading" />;
  return String(item.content_type).startsWith("video/") ? (
    <video src={url} controls preload="metadata" />
  ) : (
    <img src={url} alt={String(item.file_name)} />
  );
}
