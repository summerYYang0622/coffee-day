import test from "node:test";
import assert from "node:assert/strict";
import {
  dateKey,
  parseDate,
  validDate,
  monday,
  weekly,
} from "../src/lib/data.ts";
test("calendar handles local dates, leap days and invalid dates", () => {
  assert.equal(dateKey(parseDate("2026-10-13")), "2026-10-13");
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-13-01"), false);
  assert.equal(dateKey(monday(parseDate("2026-10-18"))), "2026-10-12");
  assert.equal(dateKey(monday(parseDate("2026-01-01"))), "2025-12-29");
});
test("missing days are not coffee-free and cup totals stay separate from days", () => {
  const entries = {
    "2026-10-12": { status: "coffee" as const, cups: 2, kind: 1, note: "" },
    "2026-10-13": { status: "free" as const, cups: 0, kind: 0, note: "" },
    "2026-10-19": { status: "coffee" as const, cups: 8, kind: 1, note: "" },
  };
  assert.deepEqual(weekly(entries, parseDate("2026-10-12")), {
    cups: 2,
    free: 1,
    logged: 2,
  });
  assert.deepEqual(weekly({}, parseDate("2026-10-12")), {
    cups: 0,
    free: 0,
    logged: 0,
  });
});
