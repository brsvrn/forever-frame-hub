import { supabase } from "@/integrations/supabase/client";

// === Audit Logging ===
export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: "package" | "theme",
  targetId: string,
  details: any = {},
) {
  try {
    await supabase.from("admin_audit_logs").insert({
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch (error) {
    console.error("Failed to log admin action", error);
  }
}

// === Usage Checks ===
export async function getUsageCount(type: "package" | "theme", id: string): Promise<number> {
  const column = type === "package" ? "package_id" : "theme";
  if (type === "package") {
    const { count, error } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("package_id", id);
    if (error) throw error;
    return count || 0;
  } else {
    const { count, error } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("theme", id);
    if (error) throw error;
    return count || 0;
  }
}

// === Packages CRUD ===
export async function getPackages(includeDeleted = false) {
  let query = supabase.from("packages").select("*").order("created_at", { ascending: false });
  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createPackage(adminEmail: string, payload: any) {
  // payload: name, description, price, features, limits, storage, retention
  const { data, error } = await supabase
    .from("packages")
    .insert([
      {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        features: payload.features || {},
        limits: payload.limits || {},
        storage: payload.storage || {},
        retention: payload.retention || {},
      },
    ])
    .select()
    .single();

  if (error) throw error;
  await logAdminAction(adminEmail, "create", "package", data.id, payload);
  return data;
}

export async function updatePackage(
  adminEmail: string,
  id: string,
  payload: any,
  oldPrice?: number,
) {
  const { data, error } = await supabase
    .from("packages")
    .update({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      features: payload.features || {},
      limits: payload.limits || {},
      storage: payload.storage || {},
      retention: payload.retention || {},
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  if (oldPrice !== undefined && payload.price !== undefined && oldPrice !== payload.price) {
    await supabase.from("package_price_history").insert({
      package_id: id,
      old_price: oldPrice,
      new_price: payload.price,
      changed_by: adminEmail,
    });
  }

  await logAdminAction(adminEmail, "update", "package", id, payload);
  return data;
}

export async function archivePackage(adminEmail: string, id: string) {
  const payload = { is_active: false, deleted_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("packages")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(adminEmail, "archive", "package", id, {});
  return data;
}

export async function restorePackage(adminEmail: string, id: string) {
  const payload = { is_active: true, deleted_at: null };
  const { data, error } = await supabase
    .from("packages")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(adminEmail, "restore", "package", id, {});
  return data;
}

// === Themes CRUD ===
export async function getThemes(includeDeleted = false) {
  let query = supabase.from("themes").select("*").order("created_at", { ascending: false });
  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTheme(adminEmail: string, payload: any) {
  const { data, error } = await supabase.from("themes").insert(payload).select().single();
  if (error) throw error;
  await logAdminAction(adminEmail, "create", "theme", data.id, payload);
  return data;
}

export async function updateTheme(adminEmail: string, id: string, payload: any) {
  const { data, error } = await supabase
    .from("themes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(adminEmail, "update", "theme", id, payload);
  return data;
}

export async function archiveTheme(adminEmail: string, id: string) {
  const payload = { is_active: false, deleted_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("themes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(adminEmail, "archive", "theme", id, {});
  return data;
}

export async function restoreTheme(adminEmail: string, id: string) {
  const payload = { is_active: true, deleted_at: null };
  const { data, error } = await supabase
    .from("themes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(adminEmail, "restore", "theme", id, {});
  return data;
}

export async function getAuditLogs() {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

// === System Settings ===
export async function getSystemSettings() {
  const { data, error } = await supabase.from("system_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return (
    data ?? {
      id: "",
      maintenance_mode: false,
      allow_new_registrations: true,
      default_package_id: null,
      max_upload_size_mb: 100,
      support_email: "support@memorywedding.com",
      updated_at: new Date(0).toISOString(),
      updated_by: null,
    }
  );
}

export async function updateSystemSettings(adminEmail: string, payload: any) {
  // Check if a row exists
  const { data: existing, error: checkError } = await supabase
    .from("system_settings")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (checkError) throw checkError;

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("system_settings")
      .update({ ...payload, updated_by: adminEmail, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from("system_settings")
      .insert({ ...payload, updated_by: adminEmail })
      .select()
      .single();
    if (error) throw error;
    result = data;
  }

  await logAdminAction(adminEmail, "update", "system_settings" as any, result.id, payload);
  return result;
}
