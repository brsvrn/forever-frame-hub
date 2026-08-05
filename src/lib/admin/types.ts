export type AdminRole = "admin" | "user" | "super_admin";

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  draftEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  expiredEvents: number;
  activeQrUploadEvents: number;
  todayCreatedEvents: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  testOrdersCount: number;
  testRevenue: number;
  activeCodes: number;
  usedCodes: number;
  totalMediaFiles: number;
  totalMediaStorageBytes: number;
}

export interface AdminEventSummary {
  id: string;
  slug: string;
  partnerOne: string;
  partnerTwo: string;
  headline: string;
  eventType: string;
  eventDate: string | null;
  eventTime: string | null;
  venue: string;
  city: string;
  packageType: string;
  packageName?: string;
  theme: string;
  isPublished: boolean;
  isPaid: boolean;
  lifecycleStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  userEmail?: string;
  userName?: string;
  // Metadata-only media information (No direct URLs to preserve user privacy)
  photoCount: number;
  videoCount: number;
  totalStorageBytes: number;
  qrUploadOpen: boolean;
  qrClosingAt: string | null;
  retentionExpiresAt: string | null;
  invitationExpiresAt: string | null;
  adminNotes?: string | null;
}

export interface AdminOrderSummary {
  id: string;
  merchantOid: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  invitationId?: string | null;
  invitationSlug?: string | null;
  partnerNames?: string;
  packageType: string;
  amount: number; // in kuruş or TL
  currency: string;
  status: "pending" | "success" | "failed" | "cancelled" | "refunded" | "expired";
  isTestOrder: boolean;
  refundStatus: "none" | "requested" | "under_review" | "externally_refunded";
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  // UTM & Attribution
  firstUtmSource?: string | null;
  firstUtmMedium?: string | null;
  firstUtmCampaign?: string | null;
  firstUtmContent?: string | null;
  lastUtmSource?: string | null;
  lastUtmMedium?: string | null;
  lastUtmCampaign?: string | null;
  lastUtmContent?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landingPage?: string | null;
  referrer?: string | null;
}

export type AccessCodeType = "owner" | "single_use" | "multi_use" | "time_limited" | "user_specific" | "timed";

export interface AdminAccessCode {
  id: string;
  codeLabel: string;
  codePrefix?: string | null;
  codeHash?: string | null;
  codeType: AccessCodeType;
  packageType: string;
  packageId?: string | null;
  maxUses: number;
  usedCount: number;
  remainingUses: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  restrictedUserEmail?: string | null;
  restrictedUserId?: string | null;
  isActive: boolean;
  isOwnerCode: boolean;
  isTestCode: boolean;
  adminNotes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "admin" | "user";
  createdAt: string;
  lastSignInAt?: string | null;
  eventCount: number;
  orderCount: number;
  totalSpent: number;
  isActive: boolean;
}

export interface AdminSupportTicket {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  invitationId?: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  status: "new" | "in_progress" | "waiting_user" | "resolved" | "closed";
  adminNotes?: string | null;
  lastRespondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId?: string | null;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details: Record<string, any>;
  createdAt: string;
}

export interface AdminRetentionJob {
  id: string;
  jobType: "close_qr_upload" | "retention_warning" | "delete_expired_media" | "expire_invitation" | "expire_codes";
  invitationId?: string | null;
  invitationSlug?: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  filesCount: number;
  bytesFreed: number;
  errorMessage?: string | null;
  executedAt?: string | null;
  createdAt: string;
}
