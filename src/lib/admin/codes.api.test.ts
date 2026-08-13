import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  },
}));

vi.mock("./audit.api", () => ({ logAdminAction: vi.fn() }));

import { redeemAccessCode } from "./codes.api";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("access code redemption", () => {
  it("uses the authenticated atomic RPC instead of reading admin-only tables", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.rpc.mockResolvedValue({
      data: {
        success: true,
        message: "Kod uygulandı.",
        packageType: "all_in_one",
      },
      error: null,
    });
    vi.stubGlobal("navigator", { userAgent: "MemoryWedding test agent" });

    await expect(redeemAccessCode("  mw-abcd-1234  ", "invitation-1")).resolves.toEqual({
      success: true,
      message: "Kod uygulandı.",
      packageType: "all_in_one",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("redeem_access_code_atomic", {
      p_code_label: "MW-ABCD-1234",
      p_invitation_id: "invitation-1",
      p_user_agent: "MemoryWedding test agent",
    });
  });

  it("requires a signed-in user before calling the redemption RPC", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    await expect(redeemAccessCode("MW-ABCD-1234", "invitation-1")).rejects.toThrow(
      "Kodu kullanmak için giriş yapmalısınız.",
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns the validation message from the atomic RPC", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.rpc.mockResolvedValue({
      data: { success: false, message: "Bu kodun kullanım limiti dolmuştur." },
      error: null,
    });

    await expect(redeemAccessCode("MW-USED", "invitation-1")).resolves.toEqual({
      success: false,
      message: "Bu kodun kullanım limiti dolmuştur.",
      packageType: undefined,
    });
  });
});
