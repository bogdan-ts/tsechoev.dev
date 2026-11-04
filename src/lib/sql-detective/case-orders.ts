export const CASE_VERSION = "orders-v1";
export const profiles = { standard: 100000, compact: 25000 } as const;
export type Profile = keyof typeof profiles;
export const configurations = {
  none: { label: "None", name: null, ddl: "" },
  customer: {
    label: "By customer",
    name: "detective_customer_idx",
    ddl: "create index detective_customer_idx on orders (customer_id);",
  },
  status: {
    label: "By status",
    name: "detective_status_idx",
    ddl: "create index detective_status_idx on orders (status);",
  },
  latest: {
    label: "Customer + latest orders",
    name: "detective_customer_latest_idx",
    ddl: "create index detective_customer_latest_idx on orders (customer_id, created_at desc, id desc);",
  },
} as const;
export type Configuration = keyof typeof configurations;
export const schema = `create table orders (
  id integer primary key,
  customer_id integer not null,
  created_at timestamptz not null,
  status text not null,
  total_cents integer not null,
  note text not null
);`;
export const query = `select id, customer_id, created_at, status, total_cents
from orders
where customer_id = 42
order by created_at desc, id desc
limit 20;`;
export const explain = `explain (analyze, buffers, format json, timing off) ${query}`;
export function seed(profile: Profile) {
  return `insert into orders
select g, case when g % 20 = 0 then 42 else 100 + (g * 37) % 1900 end,
 timestamptz '2025-01-01 00:00:00+00' + (((g::bigint * 7919) % 100000)::double precision * interval '1 second'),
 (array['pending','paid','shipped','cancelled'])[1 + ((g / 7) % 4)],
 100 + (g * 97) % 100000, repeat(md5(g::text), 2)
from generate_series(1, ${profiles[profile]}) as s(g);`;
}
export const hints = [
  "The page needs 20 rows. How many rows does the scan examine?",
  "Finding a customer's orders and returning them in date order are separate jobs.",
  `${configurations.latest.ddl} Equality on customer_id selects a range; created_at and id put that range in the requested order.`,
];
