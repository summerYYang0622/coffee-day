export type Entry = {
  status: "coffee" | "free";
  cups: number;
  kind: number;
  note: string;
};
export type Plan = { limit: number; reason: string; days: number[] };
export type Data = { entries: Record<string, Entry>; plan: Plan };
export const KEY = "coffee-day.v1";
export const emptyData: Data = {
  entries: {},
  plan: { limit: 4, reason: "", days: [] },
};
export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function validDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && dateKey(parseDate(s)) === s;
}
export function loadData(): Data {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!d) return structuredClone(emptyData);
    if (
      !d.entries ||
      !d.plan ||
      !Number.isInteger(d.plan.limit) ||
      d.plan.limit < 0 ||
      d.plan.limit > 50 ||
      typeof d.plan.reason !== "string" ||
      !Array.isArray(d.plan.days) ||
      !d.plan.days.every(
        (n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 6,
      )
    )
      throw Error("Invalid saved data");
    for (const [key, v] of Object.entries(d.entries)) {
      const e = v as Entry;
      if (
        !validDate(key) ||
        !["coffee", "free"].includes(e.status) ||
        !Number.isInteger(e.cups) ||
        e.cups < 0 ||
        e.cups > 20 ||
        !Number.isInteger(e.kind) ||
        e.kind < 0 ||
        e.kind > 5 ||
        typeof e.note !== "string"
      )
        throw Error("Invalid entry");
    }
    return d;
  } catch {
    return structuredClone(emptyData);
  }
}
export function monday(d: Date) {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  return out;
}
export function shift(d: Date, n: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}
export function weekly(entries: Data["entries"], start: Date) {
  let cups = 0,
    free = 0,
    logged = 0;
  for (let i = 0; i < 7; i++) {
    const e = entries[dateKey(shift(start, i))];
    if (e) {
      logged++;
      cups += e.cups;
      if (e.status === "free") free++;
    }
  }
  return { cups, free, logged };
}
