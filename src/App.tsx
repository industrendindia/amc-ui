import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Cake as BirthdayCake,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardList,
  Facebook,
  FileBarChart,
  ImagePlus,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
  ChefHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SocialPage } from "./SocialPage";
import {
  AdminTenantsPage,
  BillsPage,
  EmployeesPage,
  JobCardsPage,
} from "./WorkspacePages";
import { api } from "./api";
import type { CartLine, CatalogItem, Customer, User } from "./types";
import {
  CatalogManagementPage,
  GalleryPage,
  IntegrationsPage,
  NotificationsPage,
  ReportsPage,
} from "./OwnerPages";

const emptyCustomer: Customer = {
  name: "",
  phone: "",
  address: "",
  dob: "",
  anniversary: "",
};
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      onLogin(await api.login(username, password));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="login-shell">
      <section className="brand-panel">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          <span>SevaSetu</span>
        </div>
        <div className="brand-copy">
          <span className="eyebrow">CARE THAT COMES BACK</span>
          <h1>
            Every customer.
            <br />
            Every service.
            <br />
            <em>Right on time.</em>
          </h1>
          <p>
            One calm workspace for orders, annual plans, billing and customer
            care.
          </p>
        </div>
        <div className="trust-row">
          <div className="avatars">
            <span>AS</span>
            <span>RK</span>
            <span>MJ</span>
          </div>
          <p>
            <strong>Built for local businesses</strong>
            <br />
            Simple on mobile. Ready for WhatsApp.
          </p>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-brand">
            <span className="brand-mark">
              <Sparkles size={20} />
            </span>
            SevaSetu
          </div>
          <span className="eyebrow coral">WELCOME BACK</span>
          <h2>Sign in to your shop</h2>
          <p className="muted">Use the user ID provided for your company.</p>
          <label>
            User ID
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. aquacare.owner"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary wide" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
            <ChevronRight size={18} />
          </button>
          <div className="secure">
            <ShieldCheck size={17} />
            <span>Your shop data stays private and protected.</span>
          </div>
          <p className="demo">
            Preview:{" "}
            <button
              type="button"
              onClick={() => {
                setUsername("owner");
                setPassword("owner123");
              }}
            >
              owner
            </button>{" "}
            or{" "}
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("msadmin123");
              }}
            >
              admin
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

function Shell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [page, setPage] = useState(user.role === "ADMIN" ? "admin" : "order");
  const [drawer, setDrawer] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [shopLogoUrl, setShopLogoUrl] = useState("");
  const [adminTenants, setAdminTenants] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  useEffect(() => {
    if (user.role === "ADMIN") api.tenants(user.token).then(setAdminTenants);
  }, [user.role, user.token]);
  const selectedTenant = adminTenants.find(
    (t) => String(t.id) === selectedTenantId,
  );
  const workspaceUser: User = selectedTenant
    ? {
        ...user,
        tenantName: String(selectedTenant.name),
        domain: String(selectedTenant.domain),
        themeKey: String(selectedTenant.themeKey),
        facebookSocialEnabled: Boolean(selectedTenant.facebookSocialEnabled),
        whatsappEnabled: Boolean(selectedTenant.whatsappEnabled),
        logoAvailable: Boolean(selectedTenant.logoAvailable),
      }
    : user;
  useEffect(() => {
    api.setTenantContext(selectedTenantId);
    if (selectedTenant) {
      document.documentElement.dataset.theme = String(selectedTenant.themeKey);
      document.documentElement.dataset.domain = String(selectedTenant.domain);
      setPage("order");
    } else if (user.role === "ADMIN") {
      document.documentElement.dataset.theme = "service-green";
      document.documentElement.dataset.domain = "PLATFORM";
      setPage("admin");
    }
  }, [selectedTenantId]);
  useEffect(() => {
    if (!workspaceUser.tenantName || user.role === "EMPLOYEE") return;
    api.notificationTodayCount(user.token)
      .then((result) => setNotificationCount(Number(result.count) || 0))
      .catch(() => setNotificationCount(0));
  }, [user.token, selectedTenantId, page]);
  useEffect(() => {
    let url = "";
    setShopLogoUrl("");
    if (!workspaceUser.logoAvailable) return;
    api.tenantLogo(user.token)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setShopLogoUrl(url);
      })
      .catch(() => setShopLogoUrl(""));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [user.token, selectedTenantId, workspaceUser.logoAvailable]);
  const workspaceNav: Array<[string, string, LucideIcon]> = [
    ["order", "New order", Plus],
    ["bills", "Bill summary", ClipboardList],
    [
      "jobs",
      workspaceUser.domain === "BAKERY" ? "Kitchen jobs" : "Job cards",
      ChefHat,
    ],
    [
      "gallery",
      workspaceUser.domain === "BAKERY" ? "Cake gallery" : "Gallery",
      ImagePlus,
    ],
    ...(user.role === "EMPLOYEE"
      ? []
      : ([
          ["employees", "Employees", Users],
          ["catalog", "Catalog", Package],
          ["reports", "Reports", FileBarChart],
          ["notifications", "Notifications", Bell],
          ["integrations", "Integrations", Settings],
          ...(workspaceUser.facebookSocialEnabled
            ? [
                ["social", "AI Social", Facebook] as [
                  string,
                  string,
                  LucideIcon,
                ],
              ]
            : []),
        ] as Array<[string, string, LucideIcon]>)),
  ];
  const nav: Array<[string, string, LucideIcon]> =
    user.role === "ADMIN"
      ? [
          ...(selectedTenantId ? workspaceNav : []),
          ["admin", "Admin setup", Settings],
        ]
      : workspaceNav;
  const content =
    page === "order" ? (
      <OrderFlow user={workspaceUser} />
    ) : page === "bills" ? (
      <BillsPage user={workspaceUser} />
    ) : page === "jobs" ? (
      <JobCardsPage user={workspaceUser} />
    ) : page === "employees" ? (
      <EmployeesPage user={workspaceUser} />
    ) : page === "gallery" ? (
      <GalleryPage user={workspaceUser} />
    ) : page === "catalog" ? (
      <CatalogManagementPage user={workspaceUser} />
    ) : page === "notifications" ? (
      <NotificationsPage user={workspaceUser} />
    ) : page === "reports" ? (
      <ReportsPage user={workspaceUser} />
    ) : page === "integrations" ? (
      <IntegrationsPage user={workspaceUser} />
    ) : page === "social" ? (
      <SocialPage user={workspaceUser} />
    ) : page === "admin" ? (
      <AdminTenantsPage user={user} />
    ) : (
      <ComingSoon title="Coming soon" />
    );
  return (
    <div className="app-shell">
      <aside className={drawer ? "sidebar open" : "sidebar"}>
        <div className="side-head">
          <div className="brand">
            <span className="brand-mark small">
              <Sparkles size={17} />
            </span>
            <span>SevaSetu</span>
          </div>
          <button className="icon-btn close" onClick={() => setDrawer(false)}>
            <X />
          </button>
        </div>
        <div className="shop-card">
          <div className="shop-logo">
            {shopLogoUrl ? (
              <img src={shopLogoUrl} alt="" />
            ) : (
              workspaceUser.tenantName
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
            )}
          </div>
          <div>
            <strong>{workspaceUser.tenantName}</strong>
            <span>
              {user.role === "ADMIN" ? "Platform access" : "Owner workspace"}
            </span>
          </div>
        </div>
        {user.role === "ADMIN" && (
          <label className="tenant-context">
            <span>Manage shop</span>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
            >
              <option value="">Platform administration</option>
              {adminTenants.map((t) => (
                <option key={String(t.id)} value={String(t.id)}>
                  {String(t.name)}
                </option>
              ))}
            </select>
          </label>
        )}
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setDrawer(false);
              }}
            >
              <Icon size={19} />
              {label}
              {id === "notifications" && notificationCount > 0 && (
                <span className="nav-count">{notificationCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="signout" onClick={onSignOut}>
          <LogOut size={19} />
          Sign out
        </button>
      </aside>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
      <main className="workspace">
        <header>
          <button className="icon-btn menu" onClick={() => setDrawer(true)}>
            <Menu />
          </button>
          <div>
            <span className="header-kicker">{workspaceUser.tenantName}</span>
            <strong>{nav.find((n) => n[0] === page)?.[1]}</strong>
          </div>
          <button className="avatar">
            {user.displayName
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")}
          </button>
        </header>
        {content}
      </main>
    </div>
  );
}

function OrderFlow({ user }: { user: User }) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [payment, setPayment] = useState("UPI");
  const [partialMethod, setPartialMethod] = useState("UPI");
  const [partialAmount, setPartialAmount] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerMatches, setCustomerMatches] = useState<Customer[]>([]);
  const [customerSearchError, setCustomerSearchError] = useState("");
  const [bill, setBill] = useState("");
  const [references, setReferences] = useState<File[]>([]);
  const [orderNotice, setOrderNotice] = useState("");
  useEffect(() => {
    api.catalog(user.token).then((x) => setItems(x as CatalogItem[]));
  }, [user.token]);
  useEffect(() => {
    if (customerQuery.trim().length < 2) {
      setCustomerMatches([]);
      return;
    }
    const timer = setTimeout(() => {
      api
        .searchCustomers(customerQuery, user.token)
        .then((matches) => {
          setCustomerSearchError("");
          setCustomerMatches(matches);
          const exact = matches.find(
            (match) =>
              match.phone.replace(/\D/g, "").slice(-10) ===
              customerQuery.replace(/\D/g, "").slice(-10),
          );
          if (exact && customerQuery.replace(/\D/g, "").length === 10)
            setCustomer({
              ...exact,
              address: exact.address || "",
              dob: exact.dob || "",
              anniversary: exact.anniversary || "",
            });
        })
        .catch(() => {
          setCustomerMatches([]);
          setCustomerSearchError(
            "Customer lookup is unavailable. Check that the latest backend is running.",
          );
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [customerQuery, user.token]);
  const subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0),
    discount = cart.reduce((s, x) => s + x.discount * x.quantity, 0),
    total = Math.max(0, subtotal - discount);
  function add(item: CatalogItem) {
    setCart((c) => {
      const found = c.find((x) => x.id === item.id);
      return found
        ? c.map((x) =>
            x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x,
          )
        : [...c, { ...item, quantity: 1, discount: 0 }];
    });
  }
  async function nextCustomer(e: React.FormEvent) {
    e.preventDefault();
    const saved = await api.saveCustomer(customer, user.token);
    setCustomer(saved);
    setStep(2);
  }
  async function pay() {
    const result = await api.createOrder(
      {
        customerId: customer.id,
        items: cart.map(({ id, quantity, discount }) => ({
          catalogItemId: id,
          quantity,
          discount,
        })),
        paymentMethod: payment === "PARTIAL" ? partialMethod : payment,
        initialPaymentAmount:
          payment === "PARTIAL" ? Number(partialAmount) : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      },
      user.token,
    );
    setBill(result.billNumber);
    try {
      await api.uploadOrderImages(result.id, references, user.token);
    } catch (error) {
      setOrderNotice(
        error instanceof Error
          ? error.message
          : "The bill was saved, but reference images need attention.",
      );
    }
    setStep(4);
  }
  if (step === 4)
    return (
      <section className="success-page">
        <div className="success-icon">
          <Check />
        </div>
        <span className="eyebrow coral">PAYMENT RECORDED</span>
        <h1>Order complete</h1>
        <p>
          Bill <strong>{bill}</strong> is ready for {customer.name}.
        </p>
        {orderNotice && <div className="error">{orderNotice}</div>}
        <div className="receipt">
          <span>Amount paid</span>
          <strong>
            {money(
              payment === "PENDING" || payment === "ZERO"
                ? 0
                : payment === "PARTIAL"
                  ? Number(partialAmount)
                  : total,
            )}
          </strong>
          <span>
            {payment} · {new Date().toLocaleDateString("en-IN")}
          </span>
        </div>
        <button
          className="primary"
          onClick={() => {
            setStep(1);
            setCustomer(emptyCustomer);
            setCart([]);
            setReferences([]);
            setBill("");
            setOrderNotice("");
            setDueAt("");
            setCustomerQuery("");
            setPartialAmount("");
          }}
        >
          Start another order
        </button>
      </section>
    );
  return (
    <div className="order-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">NEW ORDER</span>
          <h1>
            {step === 1
              ? "Who are we helping today?"
              : step === 2
                ? "Choose what they need"
                : "Confirm & collect payment"}
          </h1>
          <p>
            {step === 1
              ? "Add a new customer or begin typing to find an existing one."
              : step === 2
                ? "Add products, services, or a ready-made care package."
                : "Review the order before completing the sale."}
          </p>
        </div>
        <div className="stepper">
          {["Customer", "Items", "Payment"].map((x, i) => (
            <div className={step >= i + 1 ? "step active" : "step"} key={x}>
              <span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
              <label>{x}</label>
            </div>
          ))}
        </div>
      </div>
      {step === 1 && (
        <form className="content-card customer-form" onSubmit={nextCustomer}>
          <div className="section-title">
            <div className="title-icon">
              <Users />
            </div>
            <div>
              <h2>Customer details</h2>
              <p>Only their name and mobile number are required.</p>
            </div>
          </div>
          <div className="search-existing">
            <Search />
            <input
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              placeholder="Search existing customer by name or mobile"
            />
            {customerMatches.length > 0 && (
              <div className="customer-results">
                {customerMatches.map((match) => (
                  <button
                    type="button"
                    key={match.id}
                    onClick={() => {
                      setCustomer({
                        ...match,
                        address: match.address || "",
                        dob: match.dob || "",
                        anniversary: match.anniversary || "",
                      });
                      setCustomerQuery("");
                      setCustomerMatches([]);
                    }}
                  >
                    <strong>{match.name}</strong>
                    <span>
                      {match.phone} · {match.address || "Address not saved"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {customerSearchError && (
            <div className="error">{customerSearchError}</div>
          )}
          <div className="or">
            <span>or add someone new</span>
          </div>
          <div className="form-grid">
            <label>
              Full name *
              <input
                required
                value={customer.name}
                onChange={(e) => {
                  setCustomer({ ...customer, name: e.target.value });
                  setCustomerQuery(e.target.value);
                }}
                placeholder="Customer's full name"
              />
            </label>
            <label>
              Mobile number *
              <div className="phone">
                <span>+91</span>
                <input
                  required
                  pattern="[0-9]{10}"
                  value={customer.phone}
                  onChange={(e) => {
                    const phone = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setCustomer({ ...customer, phone });
                    setCustomerQuery(phone);
                  }}
                  placeholder="10-digit number"
                />
              </div>
            </label>
            <label className="full">
              Address
              <textarea
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
                placeholder="House, street, locality and city"
              />
            </label>
            <label>
              Date of birth{" "}
              <input
                type="date"
                value={customer.dob}
                onChange={(e) =>
                  setCustomer({ ...customer, dob: e.target.value })
                }
              />
              <small>
                <BirthdayCake size={14} />
                Reminder sent one month before
              </small>
            </label>
            <label>
              Anniversary{" "}
              <input
                type="date"
                value={customer.anniversary}
                onChange={(e) =>
                  setCustomer({ ...customer, anniversary: e.target.value })
                }
              />
              <small>
                <Bell size={14} />
                Optional customer care reminder
              </small>
            </label>
          </div>
          <div className="actions">
            <button className="primary">
              Continue to items
              <ChevronRight />
            </button>
          </div>
        </form>
      )}
      {step === 2 && (
        <div className="catalog-layout">
          <section>
            <div className="filters">
              <div className="searchbox">
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, services, packages"
                />
              </div>
              <div className="pills">
                {["ALL", "PACKAGE", "SERVICE", "PRODUCT"].map((x) => (
                  <button
                    key={x}
                    onClick={() => setType(x)}
                    className={type === x ? "active" : ""}
                  >
                    {x === "ALL" ? "All" : x[0] + x.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="product-grid">
              {items
                .filter(
                  (x) =>
                    (type === "ALL" || x.type === type) &&
                    `${x.name} ${x.description}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((item) => (
                  <article className="product-card" key={item.id}>
                    {item.badge && <span className="badge">{item.badge}</span>}
                    <div className={`product-icon ${item.type.toLowerCase()}`}>
                      <Package />
                    </div>
                    <span className="item-type">{item.type}</span>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    {item.durationMonths && (
                      <span className="duration">
                        <CalendarClock size={15} />
                        {item.durationMonths} month care cycle
                      </span>
                    )}
                    <footer>
                      <strong>{money(item.price)}</strong>
                      <button onClick={() => add(item)}>
                        <Plus size={18} />
                        Add
                      </button>
                    </footer>
                  </article>
                ))}
            </div>
          </section>
          <Cart
            cart={cart}
            setCart={setCart}
            subtotal={subtotal}
            discount={discount}
            total={total}
            references={references}
            setReferences={setReferences}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </div>
      )}
      {step === 3 && (
        <section className="payment-layout">
          <div className="content-card">
            <div className="section-title">
              <div className="title-icon">
                <Wallet />
              </div>
              <div>
                <h2>Payment</h2>
                <p>Select how {customer.name} is paying today.</p>
              </div>
            </div>
            <div className="pay-options">
              {[
                ["UPI", "UPI / QR", "Fast digital payment"],
                ["CASH", "Cash", "Record cash received"],
                [
                  "ZERO",
                  "No payment",
                  "For complimentary or fully discounted orders",
                ],
                [
                  "PENDING",
                  "Pay later",
                  "Create the bill and collect payment later",
                ],
                [
                  "PARTIAL",
                  "Partial payment",
                  "Collect an advance and retain the balance on the bill",
                ],
              ].map(([id, title, sub]) => (
                <button
                  key={id}
                  type="button"
                  className={payment === id ? "selected" : ""}
                  onClick={() => setPayment(id)}
                >
                  <span className="radio">{payment === id && <i />}</span>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </button>
              ))}
            </div>
            {payment === "PARTIAL" && (
              <div className="partial-payment">
                <label>
                  Amount paid now (₹0 allowed)
                  <input
                    type="number"
                    min="0"
                    max={Math.max(total - 1, 1)}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder="Amount received"
                  />
                </label>
                <label>
                  Method
                  <select
                    value={partialMethod}
                    onChange={(e) => setPartialMethod(e.target.value)}
                  >
                    <option>UPI</option>
                    <option>CASH</option>
                  </select>
                </label>
                <span>
                  Balance: {money(Math.max(0, total - Number(partialAmount)))}
                </span>
              </div>
            )}
            <label className="due-field">
              Required / delivery date & time
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </label>
            <div className="payment-note">
              <ShieldCheck />
              <span>
                The bill is generated only after you confirm. Order details
                remain tenant-isolated.
              </span>
            </div>
          </div>
          <aside className="checkout">
            <span className="eyebrow">ORDER SUMMARY</span>
            <h2>{customer.name}</h2>
            {cart.map((x) => (
              <div className="checkout-line" key={x.id}>
                <span>
                  {x.quantity} × {x.name}
                </span>
                <strong>{money((x.price - x.discount) * x.quantity)}</strong>
              </div>
            ))}
            <div className="total">
              <span>Amount paid now</span>
              <strong>
                {money(
                  payment === "ZERO" || payment === "PENDING"
                    ? 0
                    : payment === "PARTIAL"
                      ? Number(partialAmount)
                      : total,
                )}
              </strong>
            </div>
            <div className="totals payment-balance-summary">
              <div>
                <span>Total bill amount</span>
                <strong>{money(total)}</strong>
              </div>
              <div>
                <span>Pending after payment</span>
                <strong>
                  {money(
                    payment === "UPI" || payment === "CASH" || payment === "ZERO"
                      ? 0
                      : payment === "PARTIAL"
                        ? Math.max(0, total - Number(partialAmount || 0))
                        : total,
                  )}
                </strong>
              </div>
            </div>
            <button
              className="primary wide"
              disabled={
                payment === "PARTIAL" &&
                (partialAmount === "" ||
                  Number(partialAmount) < 0 ||
                  Number(partialAmount) >= total)
              }
              onClick={pay}
            >
              Complete & generate bill
              <ChevronRight />
            </button>
            <button className="text-btn" onClick={() => setStep(2)}>
              Back to items
            </button>
          </aside>
        </section>
      )}
    </div>
  );
}

function Cart({
  cart,
  setCart,
  subtotal,
  discount,
  total,
  references,
  setReferences,
  onBack,
  onNext,
}: {
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  subtotal: number;
  discount: number;
  total: number;
  references: File[];
  setReferences: React.Dispatch<React.SetStateAction<File[]>>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <aside className="cart">
      <div className="cart-head">
        <div>
          <span className="eyebrow">CURRENT ORDER</span>
          <h2>
            {cart.length
              ? `${cart.length} item${cart.length > 1 ? "s" : ""}`
              : "Your cart is empty"}
          </h2>
        </div>
        <span className="cart-count">
          {cart.reduce((s, x) => s + x.quantity, 0)}
        </span>
      </div>
      {!cart.length ? (
        <div className="empty-cart">
          <Package />
          <p>Choose an item to start building this order.</p>
        </div>
      ) : (
        <div className="cart-lines">
          {cart.map((x) => (
            <div className="cart-line" key={x.id}>
              <div>
                <strong>{x.name}</strong>
                <span>{money(x.price)} each</span>
              </div>
              <div className="qty">
                <button
                  onClick={() =>
                    setCart((c) =>
                      c
                        .map((i) =>
                          i.id === x.id
                            ? { ...i, quantity: i.quantity - 1 }
                            : i,
                        )
                        .filter((i) => i.quantity > 0),
                    )
                  }
                >
                  <Minus />
                </button>
                <span>{x.quantity}</span>
                <button
                  onClick={() =>
                    setCart((c) =>
                      c.map((i) =>
                        i.id === x.id ? { ...i, quantity: i.quantity + 1 } : i,
                      ),
                    )
                  }
                >
                  <Plus />
                </button>
              </div>
              <label>
                Owner discount
                <input
                  type="number"
                  min="0"
                  max={x.price}
                  value={x.discount}
                  onChange={(e) =>
                    setCart((c) =>
                      c.map((i) =>
                        i.id === x.id
                          ? { ...i, discount: Number(e.target.value) }
                          : i,
                      ),
                    )
                  }
                />
              </label>
            </div>
          ))}
        </div>
      )}
      <div className="reference-upload">
        <div>
          <ImagePlus />
          <span>
            <strong>Customer reference images</strong>
            <small>Cake design, colour or decoration inspiration</small>
          </span>
        </div>
        <label>
          {references.length ? `${references.length} selected` : "Add images"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) =>
              setReferences(Array.from(event.target.files || []).slice(0, 10))
            }
          />
        </label>
        {references.length > 0 && (
          <div className="reference-names">
            {references.map((file) => (
              <span key={`${file.name}-${file.size}`}>{file.name}</span>
            ))}
          </div>
        )}
      </div>
      <div className="totals">
        <div>
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="discount">
          <span>Discount</span>
          <span>− {money(discount)}</span>
        </div>
        <div>
          <strong>Total</strong>
          <strong>{money(total)}</strong>
        </div>
      </div>
      <button className="primary wide" disabled={!cart.length} onClick={onNext}>
        Continue to payment
        <ChevronRight />
      </button>
      <button className="text-btn" onClick={onBack}>
        Back to customer
      </button>
    </aside>
  );
}

function Notifications() {
  const rows = [
    ["Priya Nair", "Birthday in 28 days", "High value customer", "birthday"],
    [
      "Ramesh Kumar",
      "RO AMC expires in 12 days",
      "Renewal · ₹4,499",
      "renewal",
    ],
    ["Meera Joshi", "AC service due tomorrow", "3-month care plan", "service"],
    ["Sameer Khan", "Anniversary in 30 days", "Personal message", "birthday"],
  ];
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">CUSTOMER CARE</span>
          <h1>Notifications</h1>
          <p>Priority reminders, ranked by value and urgency.</p>
        </div>
        <button className="primary">
          <Bell />
          Configure automation
        </button>
      </div>
      <div className="stats">
        <article>
          <span>Due today</span>
          <strong>6</strong>
          <small>3 automated</small>
        </article>
        <article>
          <span>Next 30 days</span>
          <strong>24</strong>
          <small>8 renewals</small>
        </article>
        <article>
          <span>Messages sent</span>
          <strong>91%</strong>
          <small>this month</small>
        </article>
      </div>
      <section className="content-card notification-list">
        <div className="list-head">
          <div>
            <h2>Needs attention</h2>
            <p>Premium customers and expiring services appear first.</p>
          </div>
          <button className="secondary">Notify selected</button>
        </div>
        {rows.map((r, i) => (
          <label className="notification-row">
            <input type="checkbox" />
            <span className={`notice-icon ${r[3]}`}>
              {r[3] === "birthday" ? <BirthdayCake /> : <CalendarClock />}
            </span>
            <span>
              <strong>{r[0]}</strong>
              <small>
                {r[1]} · {r[2]}
              </small>
            </span>
            <button>Send now</button>
          </label>
        ))}
      </section>
    </div>
  );
}
function Admin() {
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">PLATFORM ADMINISTRATION</span>
          <h1>Business setup</h1>
          <p>
            Configure tenants and operational data. All changes are audited.
          </p>
        </div>
      </div>
      <div className="admin-grid">
        {[
          [LayoutDashboard, "Companies", "Tenant, logo and business profile"],
          [Users, "Owners & employees", "Accounts, roles and access"],
          [
            Package,
            "Catalog & packages",
            "Products, services, pricing and durations",
          ],
          [Bell, "WhatsApp & alerts", "Shop numbers, templates and automation"],
          [
            Settings,
            "System configuration",
            "Sequences, taxes and secure references",
          ],
          [ClipboardList, "All bills", "Search and correct with audit history"],
        ].map(([Icon, title, desc]) => (
          <button className="admin-card">
            <span>
              <Icon />
            </span>
            <strong>{title as string}</strong>
            <small>{desc as string}</small>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  );
}
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="standard-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>{title}</h1>
          <p>
            This module is connected to the secured billing API and ready for
            the next iteration.
          </p>
        </div>
      </div>
      <div className="content-card placeholder">
        <IndianRupee />
        <h2>{title} workspace</h2>
        <p>Filters, exports and detailed operational views will appear here.</p>
      </div>
    </div>
  );
}
export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("amc-user") || "null");
    } catch {
      return null;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = user?.themeKey || "service-green";
    document.documentElement.dataset.domain = user?.domain || "GENERAL";
  }, [user]);
  function login(u: User) {
    localStorage.setItem("amc-user", JSON.stringify(u));
    setUser(u);
  }
  return user ? (
    <Shell
      user={user}
      onSignOut={() => {
        localStorage.removeItem("amc-user");
        setUser(null);
      }}
    />
  ) : (
    <Login onLogin={login} />
  );
}
