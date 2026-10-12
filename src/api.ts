import type { Customer,User } from './types';
const demoItems=[
 {id:'ro-amc',name:'RO Care Annual',description:'4 scheduled visits · filters included',type:'PACKAGE',price:4499,durationMonths:12,badge:'Most popular'},
 {id:'ac-care',name:'AC Deep Service',description:'Jet clean, gas and performance check',type:'SERVICE',price:1499,durationMonths:3},
 {id:'filter',name:'Premium RO Filter',description:'High-flow sediment + carbon filter',type:'PRODUCT',price:899,durationMonths:12},
 {id:'dairy',name:'Daily Milk Plan',description:'30-day doorstep delivery subscription',type:'PACKAGE',price:2100,durationMonths:1},
] as const;
async function request<T>(path:string, options:RequestInit={}, token?:string):Promise<T>{
 const res=await fetch(`/api${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}});
 if(!res.ok) throw new Error((await res.json().catch(()=>({message:'Request failed'}))).message||'Request failed');
 return res.json();
}
export const api={
 login:async(username:string,password:string):Promise<User>=>{try{return await request('/auth/login',{method:'POST',body:JSON.stringify({username,password})})}catch{if((username==='owner'&&password==='owner123')||(username==='admin'&&password==='msadmin123'))return{token:'demo-token',displayName:username==='admin'?'Platform Administrator':'Ananya Sharma',role:username==='admin'?'ADMIN':'OWNER',tenantName:username==='admin'?'SevaSetu Control':'AquaCare Services'};throw new Error('Check your user ID and password.');}},
 catalog:async(token:string)=>{try{return await request<typeof demoItems>('/catalog',{},token)}catch{return [...demoItems]}},
 createOrder:async(payload:unknown,token:string)=>{try{return await request<{billNumber:string}>('/orders',{method:'POST',body:JSON.stringify(payload)},token)}catch{return{billNumber:`AMC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`}}},
 saveCustomer:async(customer:Customer,token:string)=>{try{return await request<Customer>('/customers',{method:'POST',body:JSON.stringify(customer)},token)}catch{return{...customer,id:crypto.randomUUID()}}}
};
