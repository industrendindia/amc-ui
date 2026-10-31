import { useEffect, useState } from "react";
import { api } from "./api";
import type { Branch, Employee, User } from "./types";
import {
  CakeSlice,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Image,
  MapPin,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  SquarePen,
  Upload,
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
  const bakery = user.domain === "BAKERY";
  const electrical = user.domain === "ELECTRICAL";
  const workTitle = bakery ? "Kitchen jobs" : electrical ? "Repair cards" : "Job cards";
  const workerLabel = bakery ? "chefs" : "technicians";
  const workerRole = bakery ? "CHEF" : "SERVICE";
  const [cards, setCards] = useState<Array<Record<string, unknown>>>([]),
    [page, setPage] = useState(0),
    [totalPages, setTotalPages] = useState(0),
    [totalJobs, setTotalJobs] = useState(0),
    [selectedStatuses, setSelectedStatuses] = useState([
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "READY",
      "COMPLETED",
    ]),
    [statusCounts, setStatusCounts] = useState<Record<string, number>>({}),
    [employees, setEmployees] = useState<Employee[]>([]),
    [selected, setSelected] = useState<Record<string, unknown> | null>(null),
    [chosen, setChosen] = useState<string[]>([]),
    [note, setNote] = useState(""),
    [detailError, setDetailError] = useState("");
  const load = () =>
    Promise.all([
      api.jobCards(
        page,
        selectedStatuses.length ? selectedStatuses.join(",") : "NONE",
        user.token,
      ),
      api.employees(user.token),
    ]).then(
      ([j, e]) => {
        setCards(j.content);
        setTotalPages(j.totalPages);
        setTotalJobs(j.totalElements);
        setStatusCounts(j.statusCounts || {});
        setEmployees(e);
      },
    );
  useEffect(() => {
    load();
  }, [user.token, page, selectedStatuses.join(",")]);
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
  const availableWorkers = employees.filter(
    (e) =>
      e.active &&
      e.jobRole === workerRole &&
      (!selected || e.branchId === selected.branch_id),
  );
  const jobReadOnly = String(selected?.fulfillment_status) === "DELIVERED";
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{bakery ? "LIVE KITCHEN" : electrical ? "REPAIR WORKSHOP" : "SERVICE OPERATIONS"}</span>
          <h1>{workTitle}</h1>
          <p>
            Work appears automatically from new orders. Assign one or more {workerLabel}
            and keep one shared service history.
          </p>
        </div>
      </div>
      <div className="job-status-grid">
        {["OPEN", "ASSIGNED", "IN_PROGRESS", "READY", "COMPLETED"].map((s) => (
          <label
            key={s}
            className={`job-status-card ${selectedStatuses.includes(s) ? "active" : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedStatuses.includes(s)}
              onChange={(e) => {
                setPage(0);
                setSelectedStatuses((current) =>
                  e.target.checked
                    ? [...current, s]
                    : current.filter((value) => value !== s),
                );
              }}
            />
            <span>{s.replace("_", " ")}</span>
            <strong>{statusCounts[s] || 0}</strong>
          </label>
        ))}
      </div>
      <section className="job-results">
        <div className="job-results-head">
          <div>
            <span className="eyebrow">FILTERED {workTitle.toUpperCase()}</span>
            <h2>{totalJobs} jobs</h2>
          </div>
          <button
            className="text-btn"
            onClick={() => {
              setPage(0);
              setSelectedStatuses([
                "OPEN",
                "ASSIGNED",
                "IN_PROGRESS",
                "READY",
                "COMPLETED",
              ]);
            }}
          >
            Select all
          </button>
        </div>
        <div className="job-results-grid">
          {cards.map((c) => (
            <button className="job-card" key={String(c.id)} onClick={() => view(String(c.id))}>
              <span className={`priority ${String(c.priority).toLowerCase()}`}>{String(c.priority)}</span>
              <h4>{String(c.title)}</h4>
              <p>{String(c.job_number || workTitle)} · {String(c.bill_number || "")}</p>
              <div><MapPin /> {String(c.branch_name)}</div>
              <div><ChefHat /> {String(c.chef_names || "Unassigned")}</div>
              <div><Image /> {String(c.reference_image_count || 0)} references</div>
              {Boolean(c.due_at) && <div><Clock3 /> {date(c.due_at)}</div>}
            </button>
          ))}
        </div>
        {cards.length === 0 && <p className="empty-state">No jobs match the selected statuses.</p>}
      </section>
      {totalPages > 1 && <div className="pagination job-pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft /> Previous
        </button>
        <span>
          Page {page + 1} of {Math.max(totalPages, 1)} · {totalJobs} jobs
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next <ChevronRight />
        </button>
      </div>}
      {detailError && <div className="error">{detailError}</div>}
      {selected && (
        <div className="bill-drawer job-detail">
          <button className="drawer-close" onClick={() => setSelected(null)}>
            ×
          </button>
          <span className="eyebrow">
            {String(selected.job_number || workTitle.toUpperCase())} · Bill{" "}
            {String(selected.bill_number || "—")}
          </span>
          <h2>{String(selected.title)}</h2>
          <p>
            {String(selected.customer_name || "")} ·{" "}
            {String(selected.customer_phone || "")}
          </p>
          {jobReadOnly && (
            <div className="readonly-notice">
              <ShieldCheck /> Delivered job — details are now read-only.
            </div>
          )}
          <h3>Assign available {workerLabel}</h3>
          <div className="chef-picker">
            {availableWorkers.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  disabled={jobReadOnly}
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
          <button className="primary" disabled={jobReadOnly} onClick={assign}>
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
          <h3>{bakery ? "Chef" : "Technician"} notes</h3>
          <div className="note-thread">
            {(
              (selected.notesHistory as Array<Record<string, unknown>>) ||
              (selected.notes_history as Array<Record<string, unknown>>) ||
              []
            ).map((n) => (
              <article key={String(n.id)}>
                <strong>{String(n.author_name)}</strong>
                <p>{String(n.note)}</p>
                <small>{date(n.created_at)}</small>
              </article>
            ))}
            {!((selected.notesHistory || selected.notes_history) as Array<unknown>)?.length && (
              <p className="empty-state">No {bakery ? "chef" : "technician"} notes have been added yet.</p>
            )}
          </div>
          <textarea
            disabled={jobReadOnly}
            placeholder={`Add a note for the ${bakery ? "kitchen" : "service"} team`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="primary" disabled={jobReadOnly} onClick={addNote}>
            Add note
          </button>
          <div className="status-actions">
            {["IN_PROGRESS", "READY", "COMPLETED"].map((s) => (
              <button key={s} disabled={jobReadOnly} onClick={() => status(s)}>
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
    [delivery, setDelivery] = useState({
      id: "",
      otp: "",
      fallback: "",
      status: "",
      error: "",
      files: [] as File[],
    }),
    [pay, setPay] = useState({
      amount: "",
      method: "UPI",
      referenceNumber: "",
    }),
    [deliveredFiles, setDeliveredFiles] = useState<File[]>([]),
    [mediaNotice, setMediaNotice] = useState("");
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
  async function addDeliveredMedia() {
    if (!detail || !deliveredFiles.length) return;
    setMediaNotice("");
    try {
      await api.uploadDeliveryMedia(
        String(detail.id),
        deliveredFiles,
        user.token,
      );
      setDetail(await api.order(String(detail.id), user.token));
      setDeliveredFiles([]);
      setMediaNotice("Delivery images or reels saved.");
    } catch (error) {
      setMediaNotice(
        error instanceof Error ? error.message : "Unable to upload media",
      );
    }
  }
  async function requestOtp(id = delivery.id) {
    setDelivery((current) => ({
      ...current,
      id,
      status: "REQUESTING",
      error: "",
    }));
    try {
      const result = await api.requestDeliveryOtp(id, false, user.token);
      setDelivery((current) => ({
        ...current,
        id,
        fallback: String(result.fallbackOtp || "987600"),
        status: String(result.status || "FALLBACK_AVAILABLE"),
        error: "",
      }));
    } catch (error) {
      setDelivery((current) => ({
        ...current,
        id,
        status: "REQUEST_FAILED",
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare delivery verification",
      }));
    }
  }
  function beginDelivery(id: string) {
    setDelivery({
      id,
      otp: "",
      fallback: "",
      status: "REQUESTING",
      error: "",
      files: [],
    });
    void requestOtp(id);
  }
  async function confirmDelivery() {
    try {
      await api.confirmDelivery(delivery.id, delivery.otp, user.token);
      await api.uploadDeliveryMedia(delivery.id, delivery.files, user.token);
      if (String(detail?.id) === delivery.id)
        setDetail(await api.order(delivery.id, user.token));
      setDelivery({
        id: "",
        otp: "",
        fallback: "",
        status: "",
        error: "",
        files: [],
      });
      load();
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Unable to verify delivery",
      );
    }
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
              <button className="bill-summary-button" onClick={() => toggle(id)}>
                <span className="bill-icon">
                  <ReceiptText />
                </span>
                <span className="bill-customer">
                  <strong>{String(o.bill_number)}</strong>
                  <small>
                    {String(o.customer_name)} · {String(o.customer_phone)}
                  </small>
                </span>
                <span className="bill-due">
                  <small>Due</small>
                  <strong>{date(o.due_at)}</strong>
                </span>
                <span
                  className={`status-pill ${String(o.payment_status).toLowerCase()}`}
                >
                  {String(o.payment_status)}
                </span>
                <strong className="bill-total">{money(Number(o.total))}</strong>
                <span className="bill-chevron" aria-hidden="true">
                  {open ? <ChevronUp /> : <ChevronDown />}
                </span>
              </button>
              <button
                className="row-deliver"
                disabled={String(o.fulfillment_status) === "DELIVERED"}
                onClick={() => beginDelivery(id)}
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
                      Due<strong>{date(detail.due_at)}</strong>
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
                    <span>
                      Pending
                      <strong>
                        {money(
                          Math.max(
                            0,
                            Number(detail.total) - Number(detail.amount_paid),
                          ),
                        )}
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
                      <strong className="payment-inline-title">
                        Complete payment · pending {money(
                          Math.max(
                            0,
                            Number(detail.total) - Number(detail.amount_paid),
                          ),
                        )}
                      </strong>
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
                  {String(detail.fulfillment_status) === "DELIVERED" && (
                    <div className="delivered-media-upload">
                      <h3>Delivery images or reels</h3>
                      <p>
                        {(
                          (detail.deliveryMedia as Array<unknown>) || []
                        ).length} files saved with this bill.
                      </p>
                      <label className="delivery-upload">
                        <Upload />
                        <strong>Add images or reels</strong>
                        <small>Up to 10 files · images 5 MB · reels 30 MB</small>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) =>
                            setDeliveredFiles(Array.from(e.target.files || []))
                          }
                        />
                        <span>
                          {deliveredFiles.length
                            ? `${deliveredFiles.length} selected`
                            : "Choose files"}
                        </span>
                      </label>
                      <button
                        className="primary"
                        disabled={!deliveredFiles.length}
                        onClick={addDeliveredMedia}
                      >
                        Upload delivery media
                      </button>
                      {mediaNotice && <div className="social-message">{mediaNotice}</div>}
                    </div>
                  )}
                  <button
                    className="primary"
                    disabled={String(detail.fulfillment_status) === "DELIVERED"}
                    onClick={() => beginDelivery(id)}
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
      {delivery.id && (
        <div className="delivery-backdrop">
          <section className="delivery-dialog">
            <button
              className="drawer-close"
              onClick={() => setDelivery({ ...delivery, id: "" })}
            >
              ×
            </button>
            <span className="eyebrow">SECURE HANDOVER</span>
            <h2>Verify delivery</h2>
            <p>
              Confirm the customer’s mobile before marking this order delivered.
            </p>
            {delivery.status === "REQUESTING" ? (
              <div className="otp-status">
                <ShieldCheck />
                <span>Preparing delivery verification…</span>
              </div>
            ) : delivery.error ? (
              <>
                <div className="error">{delivery.error}</div>
                <button className="primary wide" onClick={() => requestOtp()}>
                  Try again
                </button>
              </>
            ) : (
              <>
                <div className="otp-status">
                  <ShieldCheck />
                  <span>
                    {delivery.status.includes("NOT_CONFIGURED") ? (
                      <>
                        WhatsApp is not enabled for this shop. Use default OTP{" "}
                        <strong>{delivery.fallback}</strong>.
                      </>
                    ) : (
                      <>
                        OTP requested on WhatsApp. If it is not delivered, use
                        default OTP <strong>{delivery.fallback}</strong>.
                      </>
                    )}
                  </span>
                </div>
                <label className="otp-input">
                  Enter WhatsApp or default OTP
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={delivery.otp}
                    onChange={(e) =>
                      setDelivery({
                        ...delivery,
                        otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                  />
                </label>
                <button className="text-btn" onClick={() => requestOtp()}>
                  Request OTP again
                </button>
                <label className="delivery-upload">
                  <Upload />
                  <strong>Add delivery images or reels</strong>
                  <small>Up to 10 files · images 5 MB · reels 30 MB</small>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) =>
                      setDelivery({
                        ...delivery,
                        files: Array.from(e.target.files || []),
                      })
                    }
                  />
                  <span>
                    {delivery.files.length
                      ? `${delivery.files.length} selected`
                      : "Choose files"}
                  </span>
                </label>
                <button
                  className="primary wide"
                  disabled={delivery.otp.length !== 6}
                  onClick={confirmDelivery}
                >
                  Verify OTP & mark delivered
                </button>
              </>
            )}
          </section>
        </div>
      )}
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

const TENANT_TABS = [
  ["NAV_NEW_ORDER", "New order"],
  ["NAV_BILLS", "Bill summary"],
  ["NAV_JOBS", "Kitchen / job / repair cards"],
  ["NAV_GALLERY", "Gallery"],
  ["NAV_EMPLOYEES", "Employees"],
  ["NAV_CATALOG", "Catalog"],
  ["NAV_REPORTS", "Reports"],
  ["NAV_NOTIFICATIONS", "Notifications"],
  ["NAV_INTEGRATIONS", "Integrations"],
] as const;
const THEME_OPTIONS = [
  ["bakery-rose", "Floral Patisserie", "Rose, vanilla and celebration florals", "BAKERY", "#8f3f50,#d99078,#fffaf5"],
  ["bakery-chocolate", "Chocolate Boutique", "Cocoa, ganache and champagne gold", "BAKERY", "#4a2d26,#b77a50,#fff6e8"],
  ["bakery-confetti", "Candy Confetti", "Berry, frosting pink and playful mint", "BAKERY", "#a32d67,#ef8eb4,#e9fff7"],
  ["aqua-flow", "Aqua Flow", "Clean water blues and fluid accents", "WATER_SERVICE", "#087ca7,#18a6b8,#f7fcfe"],
  ["aqua-lagoon", "Pure Lagoon", "Deep teal, turquoise and bright foam", "WATER_SERVICE", "#006b68,#2eb8aa,#f0fffc"],
  ["aqua-mineral", "Mineral Mist", "Slate blue, mineral aqua and cool white", "WATER_SERVICE", "#456b82,#78b8c8,#f6fbfc"],
  ["electric-spark", "Electric Spark", "Violet, navy and energy yellow", "ELECTRICAL", "#7048e8,#f2b705,#fbfaff"],
  ["electric-midnight", "Voltage Night", "Midnight blue, electric cyan and lime", "ELECTRICAL", "#14305c,#00a9c7,#d6f04c"],
  ["electric-solar", "Solar Pulse", "Graphite, solar orange and warm yellow", "ELECTRICAL", "#34323a,#f47721,#ffd34d"],
  ["dairy-sky", "Dairy Fresh", "Fresh sky blue and creamy white", "DAIRY", "#3485b8,#9ed5eb,#fffefa"],
  ["dairy-meadow", "Meadow Morning", "Pasture green, sky and clean white", "DAIRY", "#39835b,#83c995,#f8fff7"],
  ["dairy-cream", "Warm Creamery", "Butter cream, caramel and soft blue", "DAIRY", "#8b633d,#e5b85c,#fff9e9"],
  ["tailor-indigo", "Tailor Studio", "Textile indigo and warm thread", "TAILOR", "#5353a3,#d58562,#fdfbf8"],
  ["tailor-plum", "Couture Plum", "Plum fabric, blush and antique gold", "TAILOR", "#753657,#cf7891,#d5a84d"],
  ["tailor-linen", "Linen Atelier", "Natural linen, olive and terracotta", "TAILOR", "#5c6747,#bf7659,#fbf6eb"],
  ["mobile-neon", "Mobile Neon", "Graphite with cyan highlights", "MOBILE_SERVICE", "#007f8f,#23c4ce,#f8fbfb"],
  ["mobile-graphite", "Graphite Pro", "Premium charcoal, steel and signal blue", "MOBILE_SERVICE", "#27323a,#477b9e,#eef4f7"],
  ["mobile-violet", "Pixel Violet", "Digital violet, magenta and cool white", "MOBILE_SERVICE", "#613bb7,#d14f9a,#faf7ff"],
  ["service-green", "Service Green", "Calm professional service palette", "AC_SERVICE", "#0c5c48,#6fb59c,#fbfaf5"],
  ["ac-arctic", "Arctic Air", "Icy blue, cobalt and snow white", "AC_SERVICE", "#266fa3,#7ac7df,#f7fcff"],
  ["ac-breeze", "Cool Breeze", "Mint breeze, teal and cloud white", "AC_SERVICE", "#087b77,#72cabb,#f4fffc"],
  ["service-green", "Service Green", "Calm professional service palette", "GENERAL", "#0c5c48,#6fb59c,#fbfaf5"],
] as const;
const DOMAIN_DEFAULTS: Record<string, { prefix: string; theme: string }> = {
  BAKERY: { prefix: "CS", theme: "bakery-rose" },
  WATER_SERVICE: { prefix: "AMC", theme: "aqua-flow" },
  ELECTRICAL: { prefix: "EL", theme: "electric-spark" },
  DAIRY: { prefix: "DY", theme: "dairy-sky" },
  TAILOR: { prefix: "TL", theme: "tailor-indigo" },
  MOBILE_SERVICE: { prefix: "MB", theme: "mobile-neon" },
  AC_SERVICE: { prefix: "AMC", theme: "service-green" },
  GENERAL: { prefix: "AMC", theme: "service-green" },
};

export function AdminTenantsPage({ user }: { user: User }) {
  const [tenants, setTenants] = useState<Array<Record<string, unknown>>>([]),
    [logoFile, setLogoFile] = useState<File | null>(null),
    [open, setOpen] = useState(false),
    [editingId, setEditingId] = useState<string | null>(null),
    [error, setError] = useState(""),
    [salespeople, setSalespeople] = useState<Array<Record<string, unknown>>>([]),
    [salesForm, setSalesForm] = useState({
      displayName: "",
      username: "",
      password: "",
    }),
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
      facebookSocialEnabled: false,
      instagramSocialEnabled: false,
      aiSocialEnabled: false,
      whatsappEnabled: false,
      enabledTabs: TENANT_TABS.map(([code]) => code) as string[],
      ownerName: "",
      ownerUsername: "",
      ownerPassword: "",
    });
  useEffect(() => {
    api.tenants(user.token).then(setTenants);
    if (user.role === "ADMIN") api.salespeople(user.token).then(setSalespeople);
  }, [user.token]);
  useEffect(() => {
    if (!open) return;
    const previousTheme = document.documentElement.dataset.theme;
    const previousDomain = document.documentElement.dataset.domain;
    document.documentElement.dataset.theme = form.themeKey;
    document.documentElement.dataset.domain = form.domain;
    return () => {
      document.documentElement.dataset.theme = previousTheme;
      document.documentElement.dataset.domain = previousDomain;
    };
  }, [open, form.themeKey, form.domain]);
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
      if (logoFile) {
        await api.uploadTenantLogo(String(t.id), logoFile, user.token);
        Object.assign(t, { logoAvailable: true });
      }
      setTenants((x) =>
        editingId
          ? x.map((row) => (String(row.id) === editingId ? t : row))
          : [t, ...x],
      );
      setOpen(false);
      setEditingId(null);
      setLogoFile(null);
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
      facebookSocialEnabled: Boolean(t.facebook_social_enabled),
      instagramSocialEnabled: Boolean(t.instagram_social_enabled),
      aiSocialEnabled: Boolean(t.ai_social_enabled),
      whatsappEnabled: Boolean(t.whatsapp_enabled),
      enabledTabs: ((t.enabled_features as string[]) || []).filter((feature) =>
        feature.startsWith("NAV_"),
      ),
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
  async function addSalesperson(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const created = await api.createSalesperson(salesForm, user.token);
      setSalespeople((current) => [created, ...current]);
      setSalesForm({ displayName: "", username: "", password: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create salesperson");
    }
  }
  async function toggleSalesperson(person: Record<string, unknown>) {
    setError("");
    try {
      const updated = await api.updateSalesperson(
        String(person.id),
        {
          displayName: String(person.displayName),
          active: !Boolean(person.active),
          newPassword: null,
        },
        user.token,
      );
      setSalespeople((current) =>
        current.map((item) =>
          String(item.id) === String(person.id) ? updated : item,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update salesperson");
    }
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            {user.role === "ADMIN" ? "PLATFORM ADMINISTRATION" : "CUSTOMER ONBOARDING"}
          </span>
          <h1>Companies, access & themes</h1>
          <p>
            Each shop has isolated data, branches and a domain-specific theme
            stored in PostgreSQL.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setEditingId(null);
            setForm({
              code: "",
              name: "",
              domain: "BAKERY",
              domainPrefix: "CS",
              documentCode: "",
              themeKey: "bakery-rose",
              logoUrl: "",
              active: true,
              facebookSocialEnabled: false,
              instagramSocialEnabled: false,
              aiSocialEnabled: false,
              whatsappEnabled: false,
              enabledTabs: TENANT_TABS.map(([code]) => code),
              ownerName: "",
              ownerUsername: "",
              ownerPassword: "",
            });
            setBranches([{ id: "", code: "", documentCode: "L", name: "", address: "", phone: "", active: true }]);
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
              ["name", "code", "domainPrefix", "documentCode"] as const
            ).map((k) => (
              <label key={k}>
                {k.replace(/([A-Z])/g, " $1")}
                <input
                  required
                  type="text"
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <label>
              Shop logo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              <small>Stored securely in PostgreSQL · maximum 2 MB</small>
            </label>
            <label>
              Business domain
              <select
                value={form.domain}
                onChange={(e) => {
                  const defaults = DOMAIN_DEFAULTS[e.target.value];
                  setForm({ ...form, domain: e.target.value, domainPrefix: defaults.prefix, themeKey: defaults.theme });
                }}
              >
                <option value="BAKERY">Bakery / Cake shop</option>
                <option value="WATER_SERVICE">Water purifier</option>
                <option value="ELECTRICAL">Electrical shop</option>
                <option value="AC_SERVICE">AC service</option>
                <option value="DAIRY">Dairy</option>
                <option value="TAILOR">Tailor</option>
                <option value="MOBILE_SERVICE">Mobile shop / repair</option>
                <option value="GENERAL">General</option>
              </select>
            </label>
            <div className="full theme-picker">
              <span>Theme direction</span>
              <div className="theme-choice-grid">
                {THEME_OPTIONS.filter(([, , , domain]) => domain === form.domain).map(
                  ([value, label, description, , colors]) => (
                    <button
                      type="button"
                      key={`${form.domain}-${value}`}
                      className={form.themeKey === value ? "theme-choice active" : "theme-choice"}
                      onClick={() => setForm({ ...form, themeKey: value })}
                    >
                      <span className="theme-swatches">
                        {colors.split(",").map((color) => <i key={color} style={{ background: color }} />)}
                      </span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </button>
                  ),
                )}
              </div>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />{" "}
              Company active
            </label>
            <label className="switch-label feature-toggle">
              <input
                type="checkbox"
                checked={form.facebookSocialEnabled}
                onChange={(e) =>
                  setForm({ ...form, facebookSocialEnabled: e.target.checked })
                }
              />
              Facebook publishing package purchased
            </label>
            <label className="switch-label feature-toggle">
              <input
                type="checkbox"
                checked={form.instagramSocialEnabled}
                onChange={(e) => setForm({ ...form, instagramSocialEnabled: e.target.checked })}
              />
              Instagram package purchased
            </label>
            <label className="switch-label feature-toggle">
              <input
                type="checkbox"
                checked={form.aiSocialEnabled}
                onChange={(e) => setForm({ ...form, aiSocialEnabled: e.target.checked })}
              />
              AI content package purchased
            </label>
            <label className="switch-label feature-toggle">
              <input
                type="checkbox"
                checked={form.whatsappEnabled}
                onChange={(e) =>
                  setForm({ ...form, whatsappEnabled: e.target.checked })
                }
              />
              WhatsApp package purchased
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
          <section className="tenant-feature-panel">
            <div>
              <h3>Owner workspace menu</h3>
              <p>Only selected tabs will appear for this shop. Electrical shops show Repair Cards when the job-card tab is enabled.</p>
            </div>
            <div className="tenant-feature-grid">
              {TENANT_TABS.map(([code, label]) => (
                <label className="switch-label feature-toggle" key={code}>
                  <input
                    type="checkbox"
                    checked={form.enabledTabs.includes(code)}
                    onChange={(e) => setForm({
                      ...form,
                      enabledTabs: e.target.checked
                        ? [...form.enabledTabs, code]
                        : form.enabledTabs.filter((item) => item !== code),
                    })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>
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
      {user.role === "ADMIN" && (
        <section className="content-card salesperson-admin">
          <div>
            <span className="eyebrow">SALES TEAM ACCESS</span>
            <h2>Salesperson demonstration accounts</h2>
            <p>Salespeople can onboard and demonstrate shops, but never see the Admin Setup menu or manage other salesperson accounts.</p>
          </div>
          <form onSubmit={addSalesperson} className="salesperson-form">
            <input required placeholder="Salesperson name" value={salesForm.displayName} onChange={(e) => setSalesForm({ ...salesForm, displayName: e.target.value })} />
            <input required placeholder="User ID" value={salesForm.username} onChange={(e) => setSalesForm({ ...salesForm, username: e.target.value })} />
            <input required minLength={8} type="password" placeholder="Temporary password" value={salesForm.password} onChange={(e) => setSalesForm({ ...salesForm, password: e.target.value })} />
            <button className="primary"><Plus /> Add salesperson</button>
          </form>
          <div className="salesperson-list">
            {salespeople.map((person) => (
              <div key={String(person.id)}>
                <span><strong>{String(person.displayName)}</strong><small>{String(person.username)}</small></span>
                <span className="salesperson-actions">
                  <span className={person.active ? "status-pill paid" : "status-pill"}>{person.active ? "Active" : "Disabled"}</span>
                  <button type="button" onClick={() => toggleSalesperson(person)}>{person.active ? "Disable" : "Enable"}</button>
                </span>
              </div>
            ))}
          </div>
        </section>
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
