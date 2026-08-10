import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

function requestOrThrow() {
  const request = getRequest();
  if (!request) throw new Error("İstek bilgisi bulunamadı.");
  return request;
}

const saveSeatingInput = z.object({
  invitationId: z.string().uuid(),
  config: z.any()
});

export const saveSeatingConfig = createServerFn({ method: "POST" })
  .validator((input: unknown) => saveSeatingInput.parse(input))
  .handler(async ({ data }) => {
    const { requireEventPermission } = await import("./event-access.server");
    await requireEventPermission(requestOrThrow(), data.invitationId, "edit_rsvp");
    
    const { getServiceSupabase } = await import("./supabase-admin");
    const admin = getServiceSupabase();
    
    const { data: inv, error: fetchError } = await admin
      .from("invitations")
      .select("admin_notes")
      .eq("id", data.invitationId)
      .single();
      
    if (fetchError) throw new Error("Davetiye bulunamadı.");
    
    let existingData = {};
    try {
      if (inv.admin_notes) {
        existingData = JSON.parse(inv.admin_notes);
      }
    } catch (err) {
      existingData = { legacy_notes: inv.admin_notes };
    }

    const newConfig = {
      ...existingData,
      seating: data.config
    };
    
    const { error: updateError } = await admin
      .from("invitations")
      .update({ admin_notes: JSON.stringify(newConfig) })
      .eq("id", data.invitationId);
      
    if (updateError) throw updateError;
    
    return { success: true };
  });
