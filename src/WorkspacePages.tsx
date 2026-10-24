import { useEffect, useState } from "react";
import { api } from "./api";
import type { Branch, Employee, User } from "./types";
import {
  CakeSlice,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock3,
  Image,
  MapPin,
  Plus,
  ReceiptText,
  Search,
  SquarePen,
  UserPlus,
  Users,
} from "lucide-react";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
const date = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString("en-IN") : "—";
const blankEmployee = {
  branchId: "",
  name: "",
  username: "",
  password: "",
  employeeType: "USER",
  jobRole: "COUNTER",
  dateOfJoining: new Date().toISOString().slice(0, 10),
  hourlyRate: "",
  monthlySalary: "",
  active: true,
  newPassword: "",
};

export function EmployeesPage({ user }: { user: User }) {
  const [rows, setRows] = useState<Employee[]>([]),
    [branches, setBranches] = useState<Branch[]>([]),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<Employee | null>(null),
    [error, setError] = useState("");
  const [form, setForm] = useState(blankEmployee);
  const load = () =>
    Promise.all([api.employees(user.token), api.branches(user.token)])
      .then(([e, b]) => {
        setRows(e);
        setBranches(b);
        setForm((f) => ({ ...f, branchId: f.branchId || b[0]?.id || "" }));
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [user.token]);
  function edit(e: Employee) {
    setEditing(e);
    setOpen(true);
    setForm({
      ...blankEmployee,
      ...e,
      hourlyRate: String(e.hourlyRate || ""),
      monthlySalary: String(e.monthlySalary || ""),
      password: "",
      newPassword: "",
    });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        monthlySalary: form.monthlySalary ? Number(form.monthlySalary) : null,
      };
      const employee = editing
        ? await api.updateEmployee(editing.id, payload, user.token)
        : await api.createEmployee(payload, user.token);
      setRows((x) =>
        editing
          ? x.map((v) => (v.id === employee.id ? employee : v))
          : [employee, ...x],
      );
      setOpen(false);
      setEditing(null);
      setForm({ ...blankEmployee, branchId: branches[0]?.id || "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save employee");
    }
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">TEAM & ACCESS</span>
          <h1>Employees</h1>
          <p>
            Branch-specific logins, roles, joining details and compensation.
          </p>
        </div>
        {user.role !== "EMPLOYEE" && (
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              setOpen(!open);
            }}
          >
            <UserPlus /> Add employee
          </button>
        )}
      </div>
      {open && (
        <form className="content-card employee-form" onSubmit={save}>
          <h2>{editing ? `Edit ${editing.name}` : "Create employee login"}</h2>
          <div className="form-grid">
            <label>
              Name *
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Branch *
              <select
                required
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            {!editing && (
              <>
                <label>
                  User ID *
                  <input
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </label>
                <label>
                  Temporary password *
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </label>
              </>
            )}
            {editing && (
              <label>
                New password (optional)
                <input
                  minLength={8}
                  type="password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                />
              </label>
            )}
            <label>
              Employee type
              <select
                value={form.employeeType}
                onChange={(e) =>
                  setForm({ ...form, employeeType: e.target.value })
                }
              >
                <option>USER</option>
                <option>OWNER</option>
              </select>
            </label>
            <label>
              Job role
              <select
                value={form.jobRole}
                onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
              >
                {[
                  "COUNTER",
                  "CHEF",
                  "MANAGER",
                  "DELIVERY",
                  "SERVICE",
                  "OWNER",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Date of joining
              <input
                type="date"
                value={form.dateOfJoining}
                onChange={(e) =>
                  setForm({ ...form, dateOfJoining: e.target.value })
                }
              />
            </label>
            <label>
              Monthly salary
              <input
                type="number"
                min="0"
                value={form.monthlySalary}
                onChange={(e) =>
                  setForm({ ...form, monthlySalary: e.target.value })
                }
              />
            </label>
            <label>
              Hourly rate
              <input
                type="number"
                min="0"
                value={form.hourlyRate}
                onChange={(e) =>
                  setForm({ ...form, hourlyRate: e.target.value })
                }
              />
            </label>
            {editing && (
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />{" "}
                Active login
              </label>
            )}
          </div>
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
              {editing ? "Save changes" : "Create login"}
            </button>
          </div>
        </form>
      )}
      <section className="team-grid">
        {rows.map((e) => (
          <article
            className={`employee-card ${!e.active ? "inactive" : ""}`}
            key={e.id}
          >
            {user.role !== "EMPLOYEE" && (
              <button className="employee-edit" onClick={() => edit(e)}>
                <SquarePen /> Edit
              </button>
            )}
            <div
              className={
                e.jobRole === "CHEF"
                  ? "employee-avatar chef"
                  : "employee-avatar"
              }
            >
              {e.jobRole === "CHEF" ? <ChefHat /> : <Users />}
            </div>
            <div>
              <span className="item-type">
                {e.jobRole} · {e.employeeType}
              </span>
              <h3>{e.name}</h3>
              <p>@{e.username}</p>
              <span>
                <MapPin /> {e.branchName}
              </span>
            </div>
            <footer>
              <span>
                {e.active
                  ? `Joined ${new Date(e.dateOfJoining).toLocaleDateString("en-IN")}`
                  : "Inactive"}
              </span>
              <strong>
                {e.monthlySalary
                  ? money(e.monthlySalary)
                  : e.hourlyRate
                    ? `${money(e.hourlyRate)}/hr`
                    : "—"}
              </strong>
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}

export function JobCardsPage({ user }: { user: User }) {
  const [cards, setCards] = useState<Array<Record<string, unknown>>>([]),
    [employees, setEmployees] = useState<Employee[]>([]),
    [selected, setSelected] = useState<Record<string, unknown> | null>(null),
    [chosen, setChosen] = useState<string[]>([]),
    [note, setNote] = useState(""),
    [detailError, setDetailError] = useState("");
  const load = () =>
    Promise.all([api.jobCards(user.token), api.employees(user.token)]).then(
      ([j, e]) => {
        setCards(j);
        setEmployees(e);
      },
    );
  useEffect(() => {
    load();
  }, [user.token]);
  async function view(id: string) {
    setDetailError("");
    try {
      const d = await api.jobCard(id, user.token);
      setSelected(d);
      setChosen(((d.chefs as Array<{ id: string }>) || []).map((x) => x.id));
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to open kitchen job",
      );
    }
  }
  async function assign() {
    if (!selected) return;
    await api.assignChefs(String(selected.id), chosen, user.token);
    await view(String(selected.id));
    load();
  }
  async function addNote() {
    if (!selected || !note.trim()) return;
    await api.addJobNote(String(selected.id), note, user.token);
    setNote("");
    await view(String(selected.id));
  }
  async function status(value: string) {
    if (!selected) return;
    await api.updateJobStatus(String(selected.id), value, user.token);
    await view(String(selected.id));
    load();
  }
  const branchChefs = employees.filter(
    (e) =>
      e.active &&
      e.jobRole === "CHEF" &&
      (!selected || e.branchId === selected.branch_id),
  );
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">LIVE KITCHEN</span>
          <h1>Kitchen jobs</h1>
          <p>
            Jobs appear automatically from new orders. Assign one or more chefs
            and keep one shared preparation history.
          </p>
        </div>
      </div>
      <div className="job-board">
        {["OPEN", "ASSIGNED", "IN_PROGRESS", "READY", "COMPLETED"].map((s) => (
          <section key={s}>
            <h3>
              {s.replace("_", " ")}
              <span>{cards.filter((c) => c.status === s).length}</span>
            </h3>
            {cards
              .filter((c) => c.status === s)
              .map((c) => (
                <button
                  className="job-card"
                  key={String(c.id)}
                  onClick={() => view(String(c.id))}
                >
                  <span
                    className={`priority ${String(c.priority).toLowerCase()}`}
                  >
                    {String(c.priority)}
                  </span>
                  <h4>{String(c.title)}</h4>
                  <p>
                    {String(c.job_number || "Kitchen job")} ·{" "}
                    {String(c.bill_number || "")}
                  </p>
                  <div>
                    <MapPin /> {String(c.branch_name)}
                  </div>
                  <div>
                    <ChefHat /> {String(c.chef_names || "Unassigned")}
                  </div>
                  <div>
                    <Image /> {String(c.reference_image_count || 0)} references
                  </div>
                  {Boolean(c.due_at) && (
                    <div>
                      <Clock3 /> {date(c.due_at)}
                    </div>
                  )}
                </button>
              ))}
          </section>
        ))}
      </div>
      {detailError && <div className="error">{detailError}</div>}
      {selected && (
        <div className="bill-drawer job-detail">
          <button className="drawer-close" onClick={() => setSelected(null)}>
            ×
          </button>
          <span className="eyebrow">
            {String(selected.job_number || "KITCHEN JOB")} · Bill{" "}
            {String(selected.bill_number || "—")}
          </span>
          <h2>{String(selected.title)}</h2>
          <p>
            {String(selected.customer_name || "")} ·{" "}
            {String(selected.customer_phone || "")}
          </p>
          <h3>Assign available chefs</h3>
          <div className="chef-picker">
            {branchChefs.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={chosen.includes(c.id)}
                  onChange={(e) =>
                    setChosen((x) =>
                      e.target.checked
                        ? [...x, c.id]
                        : x.filter((id) => id !== c.id),
                    )
                  }
                />
                <ChefHat /> {c.name}
              </label>
            ))}
          </div>
          <button className="primary" onClick={assign}>
            Save assignment
          </button>
          <h3>Customer references</h3>
          <div className="reference-gallery">
            {(
              (selected.images as Array<{ id: string; file_name: string }>) ||
              []
            ).map((i) => (
              <SecureImage
                key={i.id}
                token={user.token}
                orderId={String(selected.order_id)}
                image={{ id: i.id, fileName: i.file_name }}
              />
            ))}
          </div>
          <h3>Chef notes</h3>
          <div className="note-thread">
            {(
              (selected.notesHistory as Array<Record<string, unknown>>) || []
            ).map((n) => (
              <article key={String(n.id)}>
                <strong>{String(n.author_name)}</strong>
                <p>{String(n.note)}</p>
                <small>{date(n.created_at)}</small>
              </article>
            ))}
          </div>
          <textarea
            placeholder="Add a note for the kitchen team"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="primary" onClick={addNote}>
            Add note
          </button>
          <div className="status-actions">
            {["IN_PROGRESS", "READY", "COMPLETED"].map((s) => (
              <button key={s} onClick={() => status(s)}>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BillsPage({ user }: { user: User }) {
  const [page, setPage] = useState(0),
    [query, setQuery] = useState(""),
    [data, setData] = useState<{
      content: Array<Record<string, unknown>>;
      totalPages: number;
      totalElements: number;
    }>({ content: [], totalPages: 0, totalElements: 0 }),
    [expanded, setExpanded] = useState<string | null>(null),
    [detail, setDetail] = useState<Record<string, unknown> | null>(null),
    [detailError, setDetailError] = useState(""),
    [pay, setPay] = useState({
      amount: "",
      method: "UPI",
      referenceNumber: "",
    });
  const load = () => api.orders(user.token, page, 10, query).then(setData);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [user.token, page, query]);
  async function toggle(id: string) {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
    } else {
      setExpanded(id);
      setDetailError("");
      try {
        const bill = await api.order(id, user.token);
        setDetail(bill);
        setPay((current) => ({
          ...current,
          amount: String(
            Math.max(0, Number(bill.total) - Number(bill.amount_paid)),
          ),
        }));
      } catch (error) {
        setExpanded(null);
        setDetailError(
          error instanceof Error
            ? error.message
            : "Unable to open bill details",
        );
      }
    }
  }
  async function completePayment() {
    if (!detail) return;
    await api.completePayment(
      String(detail.id),
      { ...pay, amount: Number(pay.amount) },
      user.token,
    );
    setDetail(await api.order(String(detail.id), user.token));
    setPay({ ...pay, amount: "" });
    load();
  }
  async function delivered(id: string) {
    await api.markDelivered(id, user.token);
    if (detail?.id === id) setDetail(await api.order(id, user.token));
    load();
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">BILLS & FULFILMENT</span>
          <h1>Bill summary</h1>
          <p>
            Search, inspect payment history and track every order through
            delivery.
          </p>
        </div>
      </div>
      <div className="content-card bill-toolbar">
        <div className="searchbox">
          <Search />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search bill, customer or mobile"
          />
        </div>
        <strong>{data.totalElements} bills</strong>
      </div>
      <section className="content-card bill-list">
        {data.content.map((o) => {
          const id = String(o.id),
            open = expanded === id;
          return (
            <article className="bill-row" key={id}>
              <button onClick={() => toggle(id)}>
                <span className="bill-icon">
                  <ReceiptText />
                </span>
                <span>
                  <strong>{String(o.bill_number)}</strong>
                  <small>
                    {String(o.customer_name)} · {String(o.customer_phone)}
                  </small>
                </span>
                <span>
                  <small>Due</small>
                  <strong>{date(o.due_at)}</strong>
                </span>
                <span
                  className={`status-pill ${String(o.payment_status).toLowerCase()}`}
                >
                  {String(o.payment_status)}
                </span>
                <strong>{money(Number(o.total))}</strong>
                {open ? <ChevronUp /> : <ChevronDown />}
              </button>
              <button
                className="row-deliver"
                disabled={String(o.fulfillment_status) === "DELIVERED"}
                onClick={() => delivered(id)}
              >
                {String(o.fulfillment_status) === "DELIVERED"
                  ? "Delivered"
                  : "Mark delivered"}
              </button>
              {open && detail && (
                <div className="bill-expanded">
                  <div className="bill-facts">
                    <span>
                      Branch<strong>{String(detail.branch_name || "—")}</strong>
                    </span>
                    <span>
                      Created<strong>{date(detail.created_at)}</strong>
                    </span>
                    <span>
                      Completed<strong>{date(detail.completed_at)}</strong>
                    </span>
                    <span>
                      Delivered<strong>{date(detail.delivered_at)}</strong>
                    </span>
                    <span>
                      Paid
                      <strong>
                        {money(Number(detail.amount_paid))} /{" "}
                        {money(Number(detail.total))}
                      </strong>
                    </span>
                  </div>
                  <h3>Items</h3>
                  {((detail.items as Array<Record<string, unknown>>) || []).map(
                    (i) => (
                      <div className="checkout-line" key={String(i.id)}>
                        <span>
                          {String(i.quantity)} × {String(i.description)}
                        </span>
                        <strong>
                          {money(
                            (Number(i.unit_price) - Number(i.discount)) *
                              Number(i.quantity),
                          )}
                        </strong>
                      </div>
                    ),
                  )}
                  <h3>Reference images</h3>
                  <div className="reference-gallery">
                    {(
                      (detail.images as Array<{
                        id: string;
                        fileName: string;
                      }>) || []
                    ).map((i) => (
                      <SecureImage
                        key={i.id}
                        token={user.token}
                        orderId={id}
                        image={i}
                      />
                    ))}
                  </div>
                  <h3>Payments</h3>
                  {(
                    (detail.payments as Array<Record<string, unknown>>) || []
                  ).map((p) => (
                    <p key={String(p.id)}>
                      {String(p.method)} · {money(Number(p.amount))} ·{" "}
                      {date(p.paid_at)}
                    </p>
                  ))}
                  {String(detail.payment_status) !== "PAID" && (
                    <div className="payment-inline">
                      <input
                        type="number"
                        min="1"
                        max={Number(detail.total) - Number(detail.amount_paid)}
                        placeholder="Amount"
                        value={pay.amount}
                        onChange={(e) =>
                          setPay({ ...pay, amount: e.target.value })
                        }
                      />
                      <select
                        value={pay.method}
                        onChange={(e) =>
                          setPay({ ...pay, method: e.target.value })
                        }
                      >
                        <option>UPI</option>
                        <option>CASH</option>
                      </select>
                      <input
                        placeholder="Transaction reference (optional)"
                        value={pay.referenceNumber}
                        onChange={(e) =>
                          setPay({ ...pay, referenceNumber: e.target.value })
                        }
                      />
                      <button
                        className="primary"
                        disabled={!Number(pay.amount)}
                        onClick={completePayment}
                      >
                        Complete payment
                      </button>
                    </div>
                  )}
                  <button
                    className="primary"
                    disabled={String(detail.fulfillment_status) === "DELIVERED"}
                    onClick={() => delivered(id)}
                  >
                    {String(detail.fulfillment_status) === "DELIVERED"
                      ? "Delivered"
                      : "Mark delivered"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
      {detailError && <div className="error">{detailError}</div>}
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page + 1} of {Math.max(data.totalPages, 1)}
        </span>
        <button
          disabled={page + 1 >= data.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SecureImage({
  token,
  orderId,
  image,
}: {
  token: string;
  orderId: string;
  image: { id: string; fileName: string };
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let value = "";
    fetch(`/api/orders/${orderId}/reference-images/${image.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((b) => {
        value = URL.createObjectURL(b);
        setUrl(value);
      });
    return () => {
      if (value) URL.revokeObjectURL(value);
    };
  }, [image.id, orderId, token]);
  return url ? (
    <figure>
      <img src={url} alt={image.fileName} />
      <figcaption>{image.fileName}</figcaption>
    </figure>
  ) : null;
}

export function AdminTenantsPage({ user }: { user: User }) {
  const [tenants, setTenants] = useState<Array<Record<string, unknown>>>([]),
    [open, setOpen] = useState(false),
    [editingId, setEditingId] = useState<string | null>(null),
    [error, setError] = useState(""),
    [branches, setBranches] = useState([
      {
        id: "",
        code: "",
        documentCode: "L",
        name: "",
        address: "",
        phone: "",
        active: true,
      },
    ]),
    [form, setForm] = useState({
      code: "",
      name: "",
      domain: "BAKERY",
      domainPrefix: "CS",
      documentCode: "",
      themeKey: "bakery-rose",
      logoUrl: "",
      active: true,
      ownerName: "",
      ownerUsername: "",
      ownerPassword: "",
    });
  useEffect(() => {
    api.tenants(user.token).then(setTenants);
  }, [user.token]);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        branches: branches.map((b) => ({ ...b, id: b.id || null })),
      };
      const t = editingId
        ? await api.updateTenant(editingId, payload, user.token)
        : await api.createTenant(payload, user.token);
      setTenants((x) =>
        editingId
          ? x.map((row) => (String(row.id) === editingId ? t : row))
          : [t, ...x],
      );
      setOpen(false);
      setEditingId(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save company configuration",
      );
    }
  }
  async function editTenant(id: string) {
    setError("");
    const t = await api.tenant(id, user.token);
    setEditingId(id);
    setForm({
      code: String(t.code || ""),
      name: String(t.name || ""),
      domain: String(t.domain || "GENERAL"),
      domainPrefix: String(t.domain_prefix || "AMC"),
      documentCode: String(t.document_code || ""),
      themeKey: String(t.theme_key || "service-green"),
      logoUrl: String(t.logo_url || ""),
      active: Boolean(t.active),
      ownerName: "",
      ownerUsername: "",
      ownerPassword: "",
    });
    setBranches(
      ((t.branches as Array<Record<string, unknown>>) || []).map((b) => ({
        id: String(b.id),
        code: String(b.code),
        documentCode: String(b.document_code),
        name: String(b.name),
        address: String(b.address || ""),
        phone: String(b.phone || ""),
        active: Boolean(b.active),
      })),
    );
    setOpen(true);
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">PLATFORM ADMINISTRATION</span>
          <h1>Companies & themes</h1>
          <p>
            Each shop has isolated data, branches and a domain-specific theme
            stored in PostgreSQL.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setEditingId(null);
            setOpen(!open);
          }}
        >
          <Plus /> Onboard company
        </button>
      </div>
      {open && (
        <form className="content-card employee-form" onSubmit={create}>
          <div className="form-grid">
            {(
              [
                "name",
                "code",
                "domainPrefix",
                "documentCode",
                "logoUrl",
              ] as const
            ).map((k) => (
              <label key={k}>
                {k.replace(/([A-Z])/g, " $1")}
                <input
                  required={k !== "logoUrl"}
                  type="text"
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <label>
              Business domain
              <select
                value={form.domain}
                onChange={(e) =>
                  setForm({
                    ...form,
                    domain: e.target.value,
                    domainPrefix: e.target.value === "BAKERY" ? "CS" : "AMC",
                    themeKey:
                      e.target.value === "BAKERY"
                        ? "bakery-rose"
                        : "service-green",
                  })
                }
              >
                <option value="BAKERY">Bakery / Cake shop</option>
                <option value="WATER_SERVICE">Water purifier</option>
                <option value="AC_SERVICE">AC service</option>
                <option value="DAIRY">Dairy</option>
                <option value="GENERAL">General</option>
              </select>
            </label>
            <label>
              Theme
              <select
                value={form.themeKey}
                onChange={(e) => setForm({ ...form, themeKey: e.target.value })}
              >
                <option value="bakery-rose">Patisserie Rose</option>
                <option value="service-green">Service Green</option>
              </select>
            </label>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />{" "}
              Company active
            </label>
            {!editingId && (
              <>
                <label>
                  Owner name
                  <input
                    required
                    value={form.ownerName}
                    onChange={(e) =>
                      setForm({ ...form, ownerName: e.target.value })
                    }
                  />
                </label>
                <label>
                  Owner user ID
                  <input
                    required
                    value={form.ownerUsername}
                    onChange={(e) =>
                      setForm({ ...form, ownerUsername: e.target.value })
                    }
                  />
                </label>
                <label>
                  Owner temporary password
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.ownerPassword}
                    onChange={(e) =>
                      setForm({ ...form, ownerPassword: e.target.value })
                    }
                  />
                </label>
              </>
            )}
          </div>
          <div className="branch-config-head">
            <div>
              <h3>Branches & document codes</h3>
              <p>The code becomes part of every new bill and kitchen job ID.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setBranches((x) => [
                  ...x,
                  {
                    id: "",
                    code: "",
                    documentCode: "",
                    name: "",
                    address: "",
                    phone: "",
                    active: true,
                  },
                ])
              }
            >
              <Plus /> Add branch
            </button>
          </div>
          <div className="branch-config-list">
            {branches.map((branch, index) => (
              <section key={branch.id || index}>
                <strong>Branch {index + 1}</strong>
                <div className="form-grid">
                  <label>
                    Branch name
                    <input
                      required
                      value={branch.name}
                      onChange={(e) =>
                        setBranches((x) =>
                          x.map((b, i) =>
                            i === index ? { ...b, name: e.target.value } : b,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Operational code
                    <input
                      required
                      value={branch.code}
                      onChange={(e) =>
                        setBranches((x) =>
                          x.map((b, i) =>
                            i === index
                              ? { ...b, code: e.target.value.toUpperCase() }
                              : b,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Document code
                    <input
                      required
                      maxLength={8}
                      value={branch.documentCode}
                      onChange={(e) =>
                        setBranches((x) =>
                          x.map((b, i) =>
                            i === index
                              ? {
                                  ...b,
                                  documentCode: e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9]/g, ""),
                                }
                              : b,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={branch.phone}
                      onChange={(e) =>
                        setBranches((x) =>
                          x.map((b, i) =>
                            i === index ? { ...b, phone: e.target.value } : b,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="full">
                    Address
                    <textarea
                      value={branch.address}
                      onChange={(e) =>
                        setBranches((x) =>
                          x.map((b, i) =>
                            i === index ? { ...b, address: e.target.value } : b,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={branch.active}
                      onChange={(e) =>
                        setBranches((x) =>
                          x.map((b, i) =>
                            i === index
                              ? { ...b, active: e.target.checked }
                              : b,
                          ),
                        )
                      }
                    />{" "}
                    Active branch
                  </label>
                </div>
              </section>
            ))}
          </div>
          <div className="document-preview">
            Next IDs will look like{" "}
            <strong>
              {form.domainPrefix || "PREFIX"}-{form.documentCode || "SHOP"}
              {branches[0]?.documentCode || "BRANCH"}-123456
            </strong>{" "}
            and{" "}
            <strong>
              {form.domainPrefix || "PREFIX"}-{form.documentCode || "SHOP"}
              {branches[0]?.documentCode || "BRANCH"}-J-123457
            </strong>
          </div>
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
              {editingId ? "Save configuration" : "Create company"}
            </button>
          </div>
        </form>
      )}
      <div className="admin-grid">
        {tenants.map((t) => (
          <article className="admin-card" key={String(t.id)}>
            <span>
              <CakeSlice />
            </span>
            <strong>{String(t.name)}</strong>
            <small>
              {String(t.domain)} · {String(t.branches)} branches ·{" "}
              {String(t.employees)} employees
            </small>
            <small>
              {String(t.domainPrefix)}-{String(t.documentCode)}[BRANCH]-123456
            </small>
            <button
              className="tenant-edit"
              onClick={() => editTenant(String(t.id))}
            >
              <SquarePen /> Configure
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
