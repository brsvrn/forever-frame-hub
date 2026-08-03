import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getPackages, getSystemSettings, updateSystemSettings } from "@/lib/admin.api";
import {
  enableAdminMaintenanceBypass,
  getAdminMaintenanceSettings,
  updateAdminMaintenanceSettings,
} from "@/lib/maintenance-admin";
import type { MaintenanceSettings } from "@/lib/maintenance";
import type { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type GeneralSettings = {
  allow_new_registrations: boolean;
  default_package_id: string;
  max_upload_size_mb: number;
  support_email: string;
};

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function inputClassName() {
  return "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/10";
}

export function SystemSettings({ adminEmail }: { adminEmail: string }) {
  const [maintenance, setMaintenance] = useState<MaintenanceSettings | null>(null);
  const [general, setGeneral] = useState<GeneralSettings | null>(null);
  const [packages, setPackages] = useState<Tables<"packages">[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [openingAdminPreview, setOpeningAdminPreview] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<boolean | null>(null);
  const dirtyRef = useRef(false);

  const refreshMaintenance = useCallback(async (silent = false) => {
    try {
      const current = await getAdminMaintenanceSettings();
      setMaintenance(current);
      dirtyRef.current = false;
    } catch (error) {
      if (!silent) toast.error(error instanceof Error ? error.message : "Bakım durumu alınamadı.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminMaintenanceSettings(), getSystemSettings(), getPackages(false)])
      .then(([maintenanceData, settingsData, packageRows]) => {
        if (cancelled) return;
        setMaintenance(maintenanceData);
        setGeneral({
          allow_new_registrations: settingsData.allow_new_registrations ?? true,
          default_package_id: settingsData.default_package_id ?? "",
          max_upload_size_mb: settingsData.max_upload_size_mb ?? 100,
          support_email: settingsData.support_email ?? "support@memorywedding.com",
        });
        setPackages(packageRows);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Sistem ayarları alınamadı."),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refreshIfSafe = () => {
      if (!dirtyRef.current && !savingMaintenance) void refreshMaintenance(true);
    };
    const interval = window.setInterval(refreshIfSafe, 15_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshIfSafe();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshMaintenance, savingMaintenance]);

  const editMaintenance = <K extends keyof MaintenanceSettings>(
    key: K,
    value: MaintenanceSettings[K],
  ) => {
    dirtyRef.current = true;
    setMaintenance((current) => (current ? { ...current, [key]: value } : current));
  };

  const persistMaintenance = async (nextMode = maintenance?.maintenance_mode) => {
    if (!maintenance || typeof nextMode !== "boolean" || savingMaintenance) return;
    const modeChanged = nextMode !== maintenance.maintenance_mode;
    setSavingMaintenance(true);
    try {
      const updated = await updateAdminMaintenanceSettings({
        expected_updated_at: maintenance.updated_at,
        maintenance_mode: nextMode,
        maintenance_title: maintenance.maintenance_title,
        maintenance_message: maintenance.maintenance_message,
        estimated_return_at: maintenance.estimated_return_at,
        allow_admin_access: maintenance.allow_admin_access,
        maintenance_contact_email: maintenance.maintenance_contact_email,
        maintenance_whatsapp_url: maintenance.maintenance_whatsapp_url,
        maintenance_instagram_url: maintenance.maintenance_instagram_url,
        show_whatsapp: maintenance.show_whatsapp,
        show_instagram: maintenance.show_instagram,
      });
      setMaintenance(updated);
      dirtyRef.current = false;
      toast.success(
        modeChanged
          ? nextMode
            ? "Bakım modu açıldı. Ziyaretçiler bakım sayfasını görüyor."
            : "Bakım modu kapatıldı. Site yeniden yayında."
          : "Bakım sayfası içeriği kaydedildi.",
      );
    } catch (error) {
      await refreshMaintenance(true);
      toast.error(error instanceof Error ? error.message : "Bakım ayarı kaydedilemedi.");
    } finally {
      setSavingMaintenance(false);
      setToggleTarget(null);
    }
  };

  const saveGeneral = async () => {
    if (!general || savingGeneral) return;
    setSavingGeneral(true);
    try {
      await updateSystemSettings(adminEmail, general);
      toast.success("Genel sistem ayarları kaydedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSavingGeneral(false);
    }
  };

  const openAdminPreview = async () => {
    if (openingAdminPreview) return;
    if (!maintenance?.allow_admin_access) {
      toast.error("Önce doğrulanmış admin erişimini açıp bakım ayarlarını kaydedin.");
      return;
    }

    const previewWindow = window.open("about:blank", "_blank");
    setOpeningAdminPreview(true);
    try {
      await enableAdminMaintenanceBypass();
      toast.success("Güvenli yönetici önizlemesi açıldı.");
      if (previewWindow) {
        previewWindow.location.replace(`${window.location.origin}/`);
      } else {
        window.location.assign("/");
      }
    } catch (error) {
      previewWindow?.close();
      toast.error(error instanceof Error ? error.message : "Yönetici önizlemesi açılamadı.");
    } finally {
      setOpeningAdminPreview(false);
    }
  };

  if (loading || !maintenance || !general) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in space-y-7 fade-in duration-500">
      <div>
        <h2 className="mb-1 font-display text-2xl text-white">Sistem Ayarları</h2>
        <p className="text-sm text-zinc-400">Platform durumunu ve genel limitleri yönetin.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col gap-5 border-b border-zinc-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck
                className={maintenance.maintenance_mode ? "text-rose-400" : "text-emerald-400"}
              />
              <h3 className="text-lg font-medium text-white">Bakım Modu</h3>
            </div>
            <p
              className={
                maintenance.maintenance_mode ? "text-sm text-rose-300" : "text-sm text-emerald-300"
              }
            >
              {maintenance.maintenance_mode
                ? "Bakım modu açık — Ziyaretçiler bakım sayfasını görüyor"
                : "Bakım modu kapalı — Site yayında"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {savingMaintenance && <Loader2 className="size-4 animate-spin text-zinc-400" />}
            <Switch
              aria-label="Bakım modunu değiştir"
              checked={maintenance.maintenance_mode}
              disabled={savingMaintenance}
              onCheckedChange={(checked) => setToggleTarget(checked)}
              className="data-[state=checked]:bg-rose-500"
            />
          </div>
        </div>

        <div className="grid gap-5 p-6">
          <label className="grid gap-2 text-sm text-zinc-300">
            Bakım başlığı
            <input
              className={inputClassName()}
              maxLength={160}
              value={maintenance.maintenance_title}
              onChange={(event) => editMaintenance("maintenance_title", event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Bakım açıklaması
            <textarea
              className={`${inputClassName()} min-h-32 resize-y`}
              maxLength={1200}
              value={maintenance.maintenance_message}
              onChange={(event) => editMaintenance("maintenance_message", event.target.value)}
            />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-zinc-300">
              Tahmini dönüş tarihi ve saati
              <input
                type="datetime-local"
                className={inputClassName()}
                value={toLocalDateTime(maintenance.estimated_return_at)}
                onChange={(event) =>
                  editMaintenance(
                    "estimated_return_at",
                    event.target.value ? new Date(event.target.value).toISOString() : null,
                  )
                }
              />
            </label>
            <label className="grid gap-2 text-sm text-zinc-300">
              İletişim e-postası
              <input
                type="email"
                className={inputClassName()}
                value={maintenance.maintenance_contact_email}
                onChange={(event) =>
                  editMaintenance("maintenance_contact_email", event.target.value)
                }
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">WhatsApp bağlantısını göster</span>
                <Switch
                  checked={maintenance.show_whatsapp}
                  onCheckedChange={(checked) => editMaintenance("show_whatsapp", checked)}
                />
              </div>
              <input
                type="url"
                placeholder="https://wa.me/90..."
                className={inputClassName()}
                value={maintenance.maintenance_whatsapp_url}
                onChange={(event) =>
                  editMaintenance("maintenance_whatsapp_url", event.target.value)
                }
              />
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">
                  Instagram bağlantısını göster
                </span>
                <Switch
                  checked={maintenance.show_instagram}
                  onCheckedChange={(checked) => editMaintenance("show_instagram", checked)}
                />
              </div>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                className={inputClassName()}
                value={maintenance.maintenance_instagram_url}
                onChange={(event) =>
                  editMaintenance("maintenance_instagram_url", event.target.value)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Doğrulanmış admin erişimi</p>
              <p className="mt-1 text-xs text-zinc-500">
                Açıkken adminler güvenli oturumlarıyla normal sayfaları test edebilir.
              </p>
            </div>
            <Switch
              checked={maintenance.allow_admin_access}
              onCheckedChange={(checked) => editMaintenance("allow_admin_access", checked)}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={openingAdminPreview || !maintenance.allow_admin_access}
              onClick={() => void openAdminPreview()}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {openingAdminPreview ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ExternalLink className="size-4" />
              )}
              Geliştirme önizlemesini aç
            </button>
            <a
              href="/bakim"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              <ExternalLink className="size-4" />
              Siteyi ziyaretçi olarak önizle
            </a>
            <button
              type="button"
              disabled={savingMaintenance}
              onClick={() => void persistMaintenance()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {savingMaintenance ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Bakım içeriğini kaydet
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-white">Genel Ayarlar</h3>
          <button
            type="button"
            disabled={savingGeneral}
            onClick={() => void saveGeneral()}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {savingGeneral ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Kaydet
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-zinc-300">
            Varsayılan paket
            <select
              className={inputClassName()}
              value={general.default_package_id}
              onChange={(event) =>
                setGeneral({ ...general, default_package_id: event.target.value })
              }
            >
              <option value="">Lütfen seçin</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>{`${pkg.name} (${pkg.price} ₺)`}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Maksimum yükleme boyutu (MB)
            <input
              type="number"
              min={1}
              max={100}
              className={inputClassName()}
              value={general.max_upload_size_mb}
              onChange={(event) =>
                setGeneral({ ...general, max_upload_size_mb: Number(event.target.value) })
              }
            />
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Destek e-postası
            <input
              type="email"
              className={inputClassName()}
              value={general.support_email}
              onChange={(event) => setGeneral({ ...general, support_email: event.target.value })}
            />
          </label>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div>
              <p className="text-sm font-medium text-white">Yeni üye kayıtları</p>
              <p className="mt-1 text-xs text-zinc-500">Yeni hesap oluşturulmasına izin ver.</p>
            </div>
            <Switch
              checked={general.allow_new_registrations}
              onCheckedChange={(checked) =>
                setGeneral({ ...general, allow_new_registrations: checked })
              }
            />
          </div>
        </div>
      </section>

      <AlertDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
      >
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget
                ? "Bakım modunu açmak istiyor musunuz?"
                : "Siteyi yeniden yayına almak istiyor musunuz?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6 text-zinc-400">
              {toggleTarget
                ? "Bakım modunu açtığınızda normal ziyaretçiler siteye erişemeyecek ve bakım sayfasına yönlendirilecektir. Devam etmek istiyor musunuz?"
                : "Bakım modunu kapattığınızda site yeniden ziyaretçilere açılacaktır. Devam etmek istiyor musunuz?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingMaintenance}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={savingMaintenance}
              onClick={(event) => {
                event.preventDefault();
                if (toggleTarget !== null) void persistMaintenance(toggleTarget);
              }}
              className={
                toggleTarget
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }
            >
              {savingMaintenance && <Loader2 className="mr-2 size-4 animate-spin" />}
              {toggleTarget ? "Bakım modunu aç" : "Siteyi yayına al"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
