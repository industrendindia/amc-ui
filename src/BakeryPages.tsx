import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CakeSlice, IndianRupee, Search, ShoppingBag, Sparkles, UserRound, WalletCards } from "lucide-react";
import { api } from "./api";
import type { CatalogItem, Customer, User } from "./types";

const money=(value:unknown)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value)||0);

export function BakerySalesPage({user}:{user:User}){
 const [period,setPeriod]=useState("TODAY"),[data,setData]=useState<Record<string,unknown>>({}),[error,setError]=useState("");
 useEffect(()=>{setError("");api.ownerDashboard(period,user.token).then(setData).catch(e=>setError(e.message));},[period,user.token]);
 const summary=(data.summary||{}) as Record<string,unknown>, daily=(data.daily||[]) as Array<Record<string,unknown>>, popular=(data.popular||[]) as Array<Record<string,unknown>>, recent=(data.recentOrders||[]) as Array<Record<string,unknown>>;
 const max=Math.max(1,...daily.map(x=>Number(x.sales)||0));
 return <div className="standard-page bakery-experience">
  <div className="cakeflow-hero"><div><span className="eyebrow">OWNER OVERVIEW</span><h1>Your shop, at a glance</h1><p>Sales, collections and kitchen demand from real shop data.</p></div><Sparkles/></div>
  <div className="period-switch" role="group" aria-label="Dashboard period">{[["TODAY","Today"],["7_DAYS","7 days"],["30_DAYS","30 days"]].map(([id,label])=><button key={id} className={period===id?"active":""} onClick={()=>setPeriod(id)}>{label}</button>)}</div>
  {error&&<div className="error">{error}</div>}
  <section className="bakery-metrics">
   <article><IndianRupee/><span>Sales</span><strong>{money(summary.sales)}</strong></article><article><WalletCards/><span>Collected</span><strong>{money(summary.collected)}</strong></article><article><ShoppingBag/><span>Outstanding</span><strong>{money(summary.outstanding)}</strong></article><article><CakeSlice/><span>Open orders</span><strong>{String(summary.open_orders??0)}</strong></article>
  </section>
  <div className="bakery-dashboard-grid"><section className="content-card"><div className="section-title"><div><span className="eyebrow">SALES RHYTHM</span><h2>Daily sales</h2></div><CalendarDays/></div><div className="sales-bars">{daily.map((x,i)=><div className="sales-bar" key={i}><span style={{height:`${Math.max(5,(Number(x.sales)||0)/max*100)}%`}}/><small>{new Date(String(x.day)).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</small></div>)}</div></section>
   <section className="content-card"><div className="section-title"><div><span className="eyebrow">CUSTOMER FAVOURITES</span><h2>Most ordered</h2></div><CakeSlice/></div>{popular.length?popular.map((x,i)=><div className="rank-row" key={i}><b>{i+1}</b><span><strong>{String(x.name)}</strong><small>{String(x.quantity)} sold</small></span><strong>{money(x.revenue)}</strong></div>):<p className="empty-copy">Sales will appear after the first order.</p>}</section>
  </div>
  <section className="content-card"><div className="section-title"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Orders at a glance</h2></div></div><div className="responsive-table">{recent.map(x=><article className="order-glance" key={String(x.id)}><span><strong>{String(x.bill_number)}</strong><small>{String(x.customer_name)}</small></span><span><small>Status</small><strong>{String(x.fulfillment_status).replaceAll("_"," ")}</strong></span><span><small>Balance</small><strong>{money(Number(x.total)-Number(x.amount_paid))}</strong></span></article>)}</div></section>
 </div>;
}

const blank:Customer={name:"",phone:"",address:"",dob:"",anniversary:"",marketingOptIn:false,orderUpdatesOptIn:true};
export function BakeryCustomersPage({user}:{user:User}){
 const [q,setQ]=useState(""),[rows,setRows]=useState<Customer[]>([]),[form,setForm]=useState<Customer>(blank),[open,setOpen]=useState(false),[error,setError]=useState("");
 const load=()=>api.searchCustomers(q,user.token).then(setRows).catch(e=>setError(e.message));useEffect(()=>{void load();},[q,user.token]);
 async function save(e:React.FormEvent){e.preventDefault();setError("");try{form.id?await api.updateCustomer(form.id,form,user.token):await api.saveCustomer(form,user.token);setForm(blank);setOpen(false);load();}catch(e){setError(e instanceof Error?e.message:"Unable to save customer");}}
 return <div className="standard-page bakery-experience"><div className="page-intro"><div><span className="eyebrow">CUSTOMER BOOK</span><h1>Remember every celebration</h1><p>Contact details, important dates and consent stay isolated to {user.tenantName}.</p></div><button className="primary" onClick={()=>{setForm(blank);setOpen(true)}}><UserRound/> Add customer</button></div>
  <label className="customer-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name or mobile number"/></label>{error&&<div className="error">{error}</div>}
  {open&&<form className="content-card customer-editor" onSubmit={save}><div className="form-grid"><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Mobile<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label className="full">Address<textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><label>Birthday<input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></label><label>Anniversary<input type="date" value={form.anniversary} onChange={e=>setForm({...form,anniversary:e.target.value})}/></label></div><div className="consent-grid"><label><input type="checkbox" checked={form.orderUpdatesOptIn} onChange={e=>setForm({...form,orderUpdatesOptIn:e.target.checked})}/> Order updates permitted</label><label><input type="checkbox" checked={form.marketingOptIn} onChange={e=>setForm({...form,marketingOptIn:e.target.checked})}/> Marketing reminders permitted</label></div><div className="actions"><button type="button" className="text-btn" onClick={()=>setOpen(false)}>Cancel</button><button className="primary">Save customer</button></div></form>}
  <div className="customer-cards">{rows.map(row=><button key={row.id} onClick={()=>{setForm(row);setOpen(true)}}><span className="customer-avatar">{row.name.slice(0,1)}</span><span><strong>{row.name}</strong><small>{row.phone}</small><small>{[row.dob&&`Birthday ${row.dob}`,row.anniversary&&`Anniversary ${row.anniversary}`].filter(Boolean).join(" · ")||"No dates added"}</small></span><span className={row.marketingOptIn?"consent yes":"consent"}>{row.marketingOptIn?"Reminders on":"Reminders off"}</span></button>)}</div>
 </div>;
}

export function BakeryCataloguePage({user}:{user:User}){
 const [items,setItems]=useState<CatalogItem[]>([]),[q,setQ]=useState(""),[category,setCategory]=useState("ALL");
 useEffect(()=>{api.catalog(user.token).then(rows=>setItems([...rows] as CatalogItem[]));},[user.token]);
 const categories=useMemo(()=>["ALL",...Array.from(new Set(items.map(x=>x.category).filter(Boolean) as string[]))], [items]);
 const shown=useMemo(()=>items.filter(x=>x.type!=="PACKAGE"&&(category==="ALL"||x.category===category)&&`${x.name} ${x.flavour||""}`.toLowerCase().includes(q.toLowerCase())),[items,q,category]);
 return <div className="standard-page bakery-experience"><div className="cakeflow-hero catalogue-hero"><div><span className="eyebrow">CAKE CATALOGUE</span><h1>Made for every celebration</h1><p>Browse the shop’s live selection, pricing and preparation choices.</p></div><CakeSlice/></div><div className="catalogue-toolbar"><label className="customer-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search cakes and flavours"/></label><div className="category-chips">{categories.map(x=><button className={category===x?"active":""} key={x} onClick={()=>setCategory(x)}>{x==="ALL"?"All cakes":x}</button>)}</div></div><div className="cake-catalogue-grid">{shown.map(item=><article key={item.id}><div className="cake-card-art"><CakeSlice/><span>{item.category||"Cake"}</span></div><div><small>{item.flavour||item.category||"Made to order"}</small><h2>{item.name}</h2><p>{item.description}</p><div className="cake-card-meta"><strong>{money(item.price)} <small>/ {item.unitLabel||"item"}</small></strong>{item.preparationOptions&&<span>{item.preparationOptions}</span>}</div>{item.allergenNote&&<small className="allergen">{item.allergenNote}</small>}</div></article>)}</div>{!shown.length&&<div className="content-card empty-copy">No catalogue items match this search.</div>}</div>;
}
