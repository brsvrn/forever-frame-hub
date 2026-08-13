import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CalendarPlus, CheckCheck, CreditCard, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
} from "@/lib/admin/notifications.api";

function notificationIcon(category: AdminNotification["category"]) {
  if (category === "purchase") return CreditCard;
  if (category === "event_created") return CalendarPlus;
  return TriangleAlert;
}

function categoryStyle(category: AdminNotification["category"]) {
  if (category === "purchase") return "bg-emerald-500/15 text-emerald-400";
  if (category === "event_created") return "bg-sky-500/15 text-sky-400";
  return "bg-rose-500/15 text-rose-400";
}

export function AdminNotificationCenter({
  onNavigateTab,
}: {
  onNavigateTab: (tab: string) => void;
}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [desktopPermission, setDesktopPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const initializedRef = useRef(false);
  const knownVersionsRef = useRef(new Map<string, string>());

  const refresh = useCallback(async (announce = false) => {
    try {
      const rows = await getAdminNotifications();
      if (
        announce &&
        initializedRef.current &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        rows
          .filter(
            (row) =>
              !row.is_read &&
              knownVersionsRef.current.get(row.id) !== (row.updated_at || row.created_at),
          )
          .forEach((row) => {
            new Notification(row.title, {
              body:
                row.occurrence_count > 1
                  ? `${row.message} (${row.occurrence_count} kez)`
                  : row.message,
              icon: "/logo.jpg",
              tag: row.id,
            });
          });
      }
      knownVersionsRef.current = new Map(
        rows.map((row) => [row.id, row.updated_at || row.created_at]),
      );
      initializedRef.current = true;
      setNotifications(rows);
    } catch (error) {
      if (!initializedRef.current) {
        toast.error(error instanceof Error ? error.message : "Bildirimler alınamadı.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ("Notification" in window) setDesktopPermission(Notification.permission);
    void refresh();

    const channel = supabase
      .channel("admin-notification-center")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => void refresh(true),
      )
      .subscribe();
    const interval = window.setInterval(() => void refresh(true), 20_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const openNotification = async (item: AdminNotification) => {
    if (!item.is_read) {
      setNotifications((rows) =>
        rows.map((row) =>
          row.id === item.id ? { ...row, is_read: true, read_at: new Date().toISOString() } : row,
        ),
      );
      void markAdminNotificationRead(item.id).catch(() => void refresh());
    }
    if (item.category === "purchase") onNavigateTab("orders");
    else if (item.category === "event_created") onNavigateTab("events");
    else onNavigateTab("overview");
    setOpen(false);
  };

  const markAllRead = async () => {
    setNotifications((rows) =>
      rows.map((row) => ({ ...row, is_read: true, read_at: new Date().toISOString() })),
    );
    try {
      await markAllAdminNotificationsRead();
    } catch {
      await refresh();
    }
  };

  const enableDesktopNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setDesktopPermission(permission);
    if (permission === "granted") toast.success("Masaüstü bildirimleri açıldı.");
  };

  return (
    <div className="fixed right-[7.25rem] top-3.5 z-[60] md:right-8 md:top-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Yönetici bildirimleri${unreadCount ? `, ${unreadCount} okunmamış` : ""}`}
        aria-expanded={open}
        className="relative grid size-10 place-items-center rounded-xl border border-border bg-card/95 text-foreground shadow-lg backdrop-blur transition hover:border-gold/50 hover:text-gold"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card/98 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-bold text-foreground">Bildirimler</p>
              <p className="text-[11px] text-muted-foreground">Satın alım, etkinlik ve hatalar</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gold hover:text-gold/80"
              >
                <CheckCheck className="size-3.5" /> Tümünü okundu yap
              </button>
            )}
          </div>

          {desktopPermission === "default" && (
            <button
              type="button"
              onClick={() => void enableDesktopNotifications()}
              className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/15"
            >
              <Bell className="size-3.5" /> Masaüstü bildirimlerini aç
            </button>
          )}

          <div className="max-h-[min(65vh,32rem)] overflow-y-auto">
            {loading ? (
              <div className="grid place-items-center py-14">
                <Loader2 className="size-5 animate-spin text-gold" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-5 py-14 text-center text-xs text-muted-foreground">
                Henüz bildirim yok.
              </p>
            ) : (
              notifications.map((item) => {
                const Icon = notificationIcon(item.category);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => void openNotification(item)}
                    className={`flex w-full gap-3 border-b border-border/60 px-4 py-3.5 text-left transition last:border-0 hover:bg-accent/40 ${
                      item.is_read ? "opacity-65" : "bg-gold/[0.035]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${categoryStyle(item.category)}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-foreground">{item.title}</span>
                        {!item.is_read && (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" />
                        )}
                      </span>
                      <span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                        {item.message}
                        {item.occurrence_count > 1 ? ` · ${item.occurrence_count} kez` : ""}
                      </span>
                      <span className="mt-1.5 block text-[10px] text-muted-foreground/70">
                        {new Date(item.updated_at || item.created_at).toLocaleString("tr-TR")}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
