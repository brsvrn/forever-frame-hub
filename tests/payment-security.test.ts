import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const paymentActions = readFileSync(resolve("src/lib/payment-actions.ts"), "utf8");
const paymentRoute = readFileSync(resolve("src/routes/odeme.index.tsx"), "utf8");
const webhook = readFileSync(resolve("src/server.ts"), "utf8");

describe("payment boundary", () => {
  it("derives identity, package and amount on the server", () => {
    expect(paymentActions).toContain('"manage_payment"');
    expect(paymentActions).toContain('.select("id, package_id, is_paid")');
    expect(paymentActions).toContain('.select("id, name, price, is_active")');
    expect(paymentRoute).not.toContain("priceOverride");
    expect(paymentRoute).not.toContain("userId:");
    expect(paymentRoute).not.toContain("email:");
  });

  it("uses one idempotency key per payment page", () => {
    expect(paymentRoute).toContain("useRef(crypto.randomUUID())");
    expect(paymentActions).toContain("idempotency_key: data.idempotencyKey");
    expect(webhook).toContain("idempotency_key: null");
  });

  it("protects complimentary activation with a verified admin session", () => {
    expect(paymentActions).toContain("requireAdmin(request)");
    expect(paymentActions).toContain("assertSameOrigin(request)");
    expect(paymentActions).not.toContain('data.email !== "brsvrn@gmail.com"');
  });
});

