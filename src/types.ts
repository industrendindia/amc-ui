export type Role='OWNER'|'ADMIN';
export type User={token:string;displayName:string;role:Role;tenantName:string};
export type Customer={id?:string;name:string;phone:string;address:string;dob:string;anniversary:string};
export type CatalogItem={id:string;name:string;description:string;type:'PRODUCT'|'SERVICE'|'PACKAGE';price:number;durationMonths?:number;badge?:string};
export type CartLine=CatalogItem&{quantity:number;discount:number};
