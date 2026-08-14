import type { AdminUserSummary } from "./types";
import { getAdminUsersServer, setAdminRoleServer } from "./admin.functions";

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  return getAdminUsersServer({});
}

export async function toggleUserAdminRole(
  _currentAdminEmail: string,
  targetUserId: string,
  targetEmail: string,
  grantAdmin: boolean,
) {
  await setAdminRoleServer({
    data: { targetUserId, targetEmail, grantAdmin },
  });
  return true;
}
