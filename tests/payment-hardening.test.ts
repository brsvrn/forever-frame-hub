import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validatePayTRCallback } from "../src/lib/paytr";

const adminFunctions = readFileSync("src/lib/admin/admin.functions.ts", "utf8");
const ordersApi = readFileSync("src/lib/admin/orders.api.ts", "utf8");
const invitationsApi = readFileSync("src/lib/invitations.api.ts", "utf8");
const shareImageRoute = readFileSync("src/routes/api.share-image.$slug.ts", "utf8");
const webhook = readFileSync("src/server.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260814103700_harden_admin_payment_boundaries.sql",
  "utf8",
);

describe("critical admin and payment boundaries", () => {
  it("validates PayTR hashes without a normal string comparison", () => {
    const payload = {
      merchant_oid: "FFH123",
      status: "success",
      total_amount: "79900",
      hash: "",
    };
    const key = "merchant-key";
    const salt = "merchant-salt";
    payload.hash = crypto
      .createHmac("sha256", key)
      .update(`${payload.merchant_oid}${salt}${payload.status}${payload.total_amount}`)
      .digest("base64");

    expect(validatePayTRCallback(payload, key, salt)).toBe(true);
    expect(validatePayTRCallback({ ...payload, hash: `${payload.hash}x` }, key, salt)).toBe(false);
    expect(validatePayTRCallback({ ...payload, hash: payload.hash.replace(/^./, "x") }, key, salt)).toBe(
      false,
    );
  });

  it("requires an administrator before every privileged service-role operation", () => {
    expect(adminFunctions.match(/await authorizeAdmin/g)?.length).toBeGreaterThanOrEqual(6);
    expect(adminFunctions).not.toContain("purgeAllOrdersServer");
    expect(ordersApi).not.toContain('from("transactions")');
    expect(ordersApi).not.toContain("purgeAllOrders");
    expect(adminFunctions).toContain("Gerçek sipariş kayıtları kalıcı olarak silinemez");
    expect(adminFunctions).toContain('.eq("is_test_order", true)');
  });

  it("atomically finalizes a payment and protects public invitation data", () => {
    expect(webhook).toContain('rpc("finalize_paytr_payment"');
    expect(migration).toContain("FOR UPDATE");
    expect(migration).toContain("amount_mismatch");
    expect(migration).toContain("payment_event_outbox");
    expect(migration).toContain('DROP POLICY IF EXISTS "Service role can manage transactions"');
    expect(migration).toContain('DROP POLICY IF EXISTS "invitations_public_read"');
    expect(invitationsApi).toContain('rpc("get_public_invitation"');
    expect(invitationsApi).not.toContain('select("*, package:packages(*)")');
    expect(shareImageRoute).toContain('.eq("is_paid", true)');
    expect(shareImageRoute).toContain('.eq("is_published", true)');
  });
});
