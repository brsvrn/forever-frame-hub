import type { AdminOrderSummary } from "./types";
import {
  deleteAdminOrderServer,
  getAdminOrdersServer,
  purgeTestOrdersServer,
  updateOrderAdminNotesServer,
} from "./admin.functions";

export async function getAdminOrders(options?: {
  status?: "all" | "real" | "test" | "success" | "pending" | "failed" | "refunded";
  searchQuery?: string;
}): Promise<AdminOrderSummary[]> {
  const orders = await getAdminOrdersServer({ data: { status: options?.status } });
  if (!options?.searchQuery) return orders;

  const query = options.searchQuery.toLocaleLowerCase("tr-TR");
  return orders.filter(
    (order) =>
      order.merchantOid.toLocaleLowerCase("tr-TR").includes(query) ||
      (order.userEmail || "").toLocaleLowerCase("tr-TR").includes(query) ||
      (order.partnerNames || "").toLocaleLowerCase("tr-TR").includes(query) ||
      (order.invitationSlug || "").toLocaleLowerCase("tr-TR").includes(query),
  );
}

export async function updateOrderAdminNotes(
  _adminEmail: string,
  orderId: string,
  notes: string,
  refundStatus?: "none" | "requested" | "under_review" | "externally_refunded",
) {
  return updateOrderAdminNotesServer({ data: { orderId, notes, refundStatus } });
}

export async function deleteAdminOrder(_adminEmail: string, orderId: string) {
  return deleteAdminOrderServer({ data: { orderId } });
}

export async function purgeTestOrders(_adminEmail: string) {
  return purgeTestOrdersServer({});
}
