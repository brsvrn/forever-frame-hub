import { useState, useEffect } from "react";
import { getSystemSettings, updateSystemSettings, getPackages } from "@/lib/admin.api";
import { Loader2, Save, AlertTriangle } from "lucide-react";

export function SystemSettings({ adminEmail }: { adminEmail: string }) {
  const [settings, setSettings] = useState<any>({});
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getSystemSettings(),
      getPackages(false), // Only active packages
    ]).then(([settingsData, pkgs]) => {
      setSettings({
        maintenance_mode: settingsData.maintenance_mode ?? false,
        allow_new_registrations: settingsData.allow_new_registrations ?? true,
        default_package_id: settingsData.default_package_id ?? "",
        max_upload_size_mb: settingsData.max_upload_size_mb ?? 100,
        support_email: settingsData.support_email ?? "support@memorywedding.com",
      });
      setPackages(pkgs);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSystemSettings(adminEmail, settings);
      alert("Sistem ayarları başarıyla kaydedildi.");
    } catch (e) {
      console.error(e);
      alert("Ayarlar kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display text-white mb-1">Sistem Ayarları</h2>
          <p className="text-sm text-zinc-400">
            Platformun genel işleyişi ve varsayılan limitlerini buradan yapılandırın.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="space-y-6">
        {/* Güvenlik ve Durum */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg text-white font-medium mb-4">Platform Durumu</h3>

          <div className="flex items-center justify-between py-4 border-b border-zinc-800/50">
            <div>
              <p className="text-white font-medium">Bakım Modu (Maintenance Mode)</p>
              <p className="text-sm text-zinc-400 mt-1">
                Aktif edilirse siteye ziyaretçiler erişemez, 'Bakımda' sayfası görünür.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-white font-medium">Yeni Üye Kayıtları (Registrations)</p>
              <p className="text-sm text-zinc-400 mt-1">
                Platforma yeni kullanıcıların üye olmasını izin verir.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_new_registrations}
                onChange={(e) =>
                  setSettings({ ...settings, allow_new_registrations: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Limitler ve Varsayılanlar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg text-white font-medium mb-4">Varsayılan Limitler ve Paket</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white mb-2">Varsayılan (Ücretsiz) Paket</label>
              <select
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-300"
                value={settings.default_package_id || ""}
                onChange={(e) => setSettings({ ...settings, default_package_id: e.target.value })}
              >
                <option value="">-- Lütfen Seçin --</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.price} ₺)
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-2">
                Yeni üye olan kullanıcılara otomatik tanımlanacak başlangıç pakedi.
              </p>
            </div>

            <div>
              <label className="block text-sm text-white mb-2">
                Maksimum Dosya Yükleme Boyutu (MB)
              </label>
              <input
                type="number"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-300"
                value={settings.max_upload_size_mb}
                onChange={(e) =>
                  setSettings({ ...settings, max_upload_size_mb: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-zinc-500 mt-2">
                Misafirlerin yükleyebileceği tek bir fotoğraf/videonun max MB sınırı.
              </p>
            </div>
          </div>
        </div>

        {/* İletişim */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg text-white font-medium mb-4">İletişim</h3>

          <div>
            <label className="block text-sm text-white mb-2">Destek E-posta Adresi</label>
            <input
              type="email"
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-300"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
            <p className="text-xs text-zinc-500 mt-2">
              Kullanıcı panellerinde "Yardım İsteyin" butonlarına tıklandığında açılacak adres.
            </p>
          </div>
        </div>

        {settings.maintenance_mode && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="text-rose-400 w-5 h-5 shrink-0" />
            <div>
              <p className="text-rose-400 font-medium text-sm">Dikkat: Bakım Modu Aktif</p>
              <p className="text-rose-500/70 text-xs mt-1">
                Eğer bu ayarı kaydederseniz, admin olmayan tüm kullanıcılar ve ziyaretçiler
                "Bakımdayız" sayfasına yönlendirilecektir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
