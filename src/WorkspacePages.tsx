import { useEffect, useState } from "react";
import { api } from "./api";
import type { Branch, Employee, User } from "./types";
import {
  CakeSlice,
  ChefHat,
  Clock3,
  Image,
  IndianRupee,
  MapPin,
  Plus,
  ReceiptText,
  UserPlus,
  Users,
} from "lucide-react";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
export function EmployeesPage({ user }: { user: User }) {
  const [rows, setRows] = useState<Employee[]>([]),
    [branches, setBranches] = useState<Branch[]>([]),
    [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const [form, setForm] = useState({
    branchId: "",
    name: "",
    username: "",
    password: "",
    employeeType: "USER",
    jobRole: "COUNTER",
    dateOfJoining: new Date().toISOString().slice(0, 10),
    hourlyRate: "",
    monthlySalary: "",
  });
  useEffect(() => {
    Promise.all([api.employees(user.token), api.branches(user.token)])
      .then(([e, b]) => {
        setRows(e);
        setBranches(b);
        setForm((f) => ({ ...f, branchId: b[0]?.id || "" }));
      })
      .catch((e) => setError(e.message));
  }, [user.token]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const employee = await api.createEmployee(
        {
          ...form,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          monthlySalary: form.monthlySalary ? Number(form.monthlySalary) : null,
        },
        user.token,
      );
      setRows((x) => [employee, ...x]);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add employee");
    }
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">TEAM & ACCESS</span>
          <h1>Employees</h1>
          <p>Manage secure logins, roles, salaries and branch assignments.</p>
        </div>
        {user.role !== "EMPLOYEE" && (
          <button className="primary" onClick={() => setOpen(!open)}>
            <UserPlus />
            Add employee
          </button>
        )}
      </div>
      {open && (
        <form className="content-card employee-form" onSubmit={save}>
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
                  <option value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label>
              User ID *
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label>
              Temporary password *
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
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
                  <option>{x}</option>
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
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary">Create login</button>
        </form>
      )}
      <section className="team-grid">
        {rows.map((e) => (
          <article className="employee-card">
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
                Joined {new Date(e.dateOfJoining).toLocaleDateString("en-IN")}
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
    [branches, setBranches] = useState<Branch[]>([]),
    [employees, setEmployees] = useState<Employee[]>([]),
    [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    branchId: "",
    chefEmployeeId: "",
    title: "",
    notes: "",
    dueAt: "",
    priority: "NORMAL",
  });
  useEffect(() => {
    Promise.all([
      api.jobCards(user.token),
      api.branches(user.token),
      api.employees(user.token),
    ]).then(([j, b, e]) => {
      setCards(j);
      setBranches(b);
      setEmployees(e);
      setForm((f) => ({ ...f, branchId: b[0]?.id || "" }));
    });
  }, [user.token]);
  const chefs = employees.filter(
    (e) =>
      e.jobRole === "CHEF" && (!form.branchId || e.branchId === form.branchId),
  );
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const card = await api.createJobCard(
      {
        ...form,
        chefEmployeeId: form.chefEmployeeId || null,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      },
      user.token,
    );
    setCards((x) => [card, ...x]);
    setOpen(false);
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">KITCHEN BOARD</span>
          <h1>Job cards</h1>
          <p>Turn paid orders into clear assignments for available chefs.</p>
        </div>
        <button className="primary" onClick={() => setOpen(!open)}>
          <Plus />
          New job card
        </button>
      </div>
      {open && (
        <form className="content-card employee-form" onSubmit={create}>
          <div className="form-grid">
            <label>
              Branch
              <select
                value={form.branchId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    branchId: e.target.value,
                    chefEmployeeId: "",
                  })
                }
              >
                {branches.map((b) => (
                  <option value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label>
              Assign chef
              <select
                value={form.chefEmployeeId}
                onChange={(e) =>
                  setForm({ ...form, chefEmployeeId: e.target.value })
                }
              >
                <option value="">Keep unassigned</option>
                {chefs.map((c) => (
                  <option value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="full">
              Job title
              <input
                required
                placeholder="e.g. 2 kg chocolate photo cake"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Due date & time
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
              />
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>NORMAL</option>
                <option>HIGH</option>
                <option>URGENT</option>
              </select>
            </label>
            <label className="full">
              Preparation notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>
          <button className="primary">Create job card</button>
        </form>
      )}
      <div className="job-board">
        {["OPEN", "ASSIGNED", "IN_PROGRESS", "READY"].map((status) => (
          <section>
            <h3>
              {status.replace("_", " ")}
              <span>{cards.filter((c) => c.status === status).length}</span>
            </h3>
            {cards
              .filter((c) => c.status === status)
              .map((c) => (
                <article className="job-card">
                  <span
                    className={`priority ${String(c.priority).toLowerCase()}`}
                  >
                    {String(c.priority)}
                  </span>
                  <h4>{String(c.title)}</h4>
                  <p>{String(c.notes || "No additional notes")}</p>
                  <div>
                    <MapPin /> {String(c.branchName)}{" "}
                  </div>
                  <div>
                    <ChefHat /> {String(c.chefName || "Unassigned")}
                  </div>
                  {Boolean(c.dueAt) && (
                    <div>
                      <Clock3 />{" "}
                      {new Date(String(c.dueAt)).toLocaleString("en-IN")}
                    </div>
                  )}
                </article>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}
export function BillsPage({ user }: { user: User }) {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]),
    [selected, setSelected] = useState<Record<string, unknown> | null>(null),
    [images, setImages] = useState<Array<{ id: string; fileName: string }>>([]);
  useEffect(() => {
    api.orders(user.token).then(setOrders);
  }, [user.token]);
  async function view(o: Record<string, unknown>) {
    setSelected(o);
    setImages(await api.orderImages(String(o.id), user.token));
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">SALES & REFERENCES</span>
          <h1>Bill summary</h1>
          <p>Every paid order, branch and customer reference in one place.</p>
        </div>
      </div>
      <section className="content-card bill-list">
        {orders.map((o) => (
          <button onClick={() => view(o)}>
            <span className="bill-icon">
              <ReceiptText />
            </span>
            <span>
              <strong>{String(o.bill_number || o.billNumber)}</strong>
              <small>
                {String(o.customer_name || o.customerName)} ·{" "}
                {String(o.branch_name || o.branchName || "Main branch")}
              </small>
            </span>
            <span className="bill-images">
              <Image /> {String(o.reference_image_count || 0)}
            </span>
            <strong>{money(Number(o.total))}</strong>
          </button>
        ))}
      </section>
      {selected && (
        <div className="bill-drawer">
          <button className="drawer-close" onClick={() => setSelected(null)}>
            ×
          </button>
          <span className="eyebrow">CUSTOMER REFERENCES</span>
          <h2>{String(selected.bill_number || selected.billNumber)}</h2>
          {images.length ? (
            <div className="reference-gallery">
              {images.map((i) => (
                <SecureImage
                  token={user.token}
                  orderId={String(selected.id)}
                  image={i}
                />
              ))}
            </div>
          ) : (
            <div className="empty-cart">
              <Image />
              <p>No reference images were provided.</p>
            </div>
          )}
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
    fetch(`/api/orders/${orderId}/reference-images/${image.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((b) => setUrl(URL.createObjectURL(b)));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [image.id]);
  return url ? (
    <figure>
      <img src={url} alt={image.fileName} />
      <figcaption>{image.fileName}</figcaption>
    </figure>
  ) : null;
}

export function AdminTenantsPage({ user }: { user: User }) {
  const [tenants, setTenants] = useState<Array<Record<string, unknown>>>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    domain: "BAKERY",
    themeKey: "bakery-rose",
    ownerName: "",
    ownerUsername: "",
    ownerPassword: "",
    branch1: "",
    branch2: "",
  });
  useEffect(() => {
    api.tenants(user.token).then(setTenants);
  }, [user.token]);
  async function create(event: React.FormEvent) {
    event.preventDefault();
    const branchNames = [form.branch1, form.branch2].filter(Boolean);
    const created = await api.createTenant(
      {
        code: form.code,
        name: form.name,
        domain: form.domain,
        themeKey: form.themeKey,
        ownerName: form.ownerName,
        ownerUsername: form.ownerUsername,
        ownerPassword: form.ownerPassword,
        branches: branchNames.map((name) => ({
          code: name.replace(/\W/g, "").toUpperCase(),
          name,
          address: "",
          phone: "",
        })),
      },
      user.token,
    );
    setTenants((current) => [created, ...current]);
    setOpen(false);
  }
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">PLATFORM ADMINISTRATION</span>
          <h1>Companies & themes</h1>
          <p>Onboard isolated shops, branches and their first owner account.</p>
        </div>
        <button className="primary" onClick={() => setOpen(!open)}>
          <Plus /> Onboard company
        </button>
      </div>
      {open && (
        <form className="content-card employee-form" onSubmit={create}>
          <div className="form-grid">
            <label>
              Company name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Company code
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </label>
            <label>
              Business domain
              <select
                value={form.domain}
                onChange={(e) =>
                  setForm({
                    ...form,
                    domain: e.target.value,
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
            <label>
              First branch
              <input
                required
                value={form.branch1}
                onChange={(e) => setForm({ ...form, branch1: e.target.value })}
              />
            </label>
            <label>
              Second branch
              <input
                value={form.branch2}
                onChange={(e) => setForm({ ...form, branch2: e.target.value })}
              />
            </label>
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
              Temporary password
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
          </div>
          <button className="primary">Create company</button>
        </form>
      )}
      <div className="admin-grid">
        {tenants.map((t) => (
          <article className="admin-card">
            <span>
              <CakeSlice />
            </span>
            <strong>{String(t.name)}</strong>
            <small>
              {String(t.domain)} · {String(t.branches)} branches ·{" "}
              {String(t.employees)} employees
            </small>
          </article>
        ))}
      </div>
    </div>
  );
}
