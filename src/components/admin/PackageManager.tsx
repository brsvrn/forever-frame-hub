import { useState, useEffect } from "react";
import {
  getPackages,
  createPackage,
  updatePackage,
  archivePackage,
  restorePackage,
  getUsageCount,
} from "@/lib/admin.api";
import {
  Loader2,
  Plus,
  Edit2,
  Archive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn, getPackageDisplayName } from "@/lib/utils";

export function PackageManager({ adminEmail }: { adminEmail: string }) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  const [formData, setFormData] = useState<any>({});
  const [features, setFeatures] = useState<any>({});
  const [limits, setLimits] = useState<any>({});
  const [storage, setStorage] = useState<any>({});
  const [retention, setRetention] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPackages(true);
      // Fetch usage counts for each package
      const pkgsWithUsage = await Promise.all(
        data.map(async (pkg) => {
          const usage = await getUsageCount("package", pkg.id);
          return { ...pkg, usageCount: usage };
        }),
      );
      setPackages(pkgsWithUsage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        price: pkg.price,
      });
      setFeatures(pkg.features || {});
      setLimits(pkg.limits || { photoLimit: 1000, videoLimit: 50 });
      setStorage(pkg.storage || { maxGb: 5 });
      setRetention(pkg.retention || { days: 30 });
    } else {
      setEditingPkg(null);
      setFormData({ name: "", description: "", price: 0 });
      setFeatures({
        qr_gallery: false,
        digital_invitation: true,
        music: true,
        timeline: true,
        story: true,
        gallery: true,
        guestbook: true,
        rsvp: true,
      });
      setLimits({ photoLimit: 1000, videoLimit: 50 });
      setStorage({ maxGb: 5 });
      setRetention({ days: 30 });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        features,
        limits,
        storage,
        retention,
      };
      if (editingPkg) {
        await updatePackage(adminEmail, editingPkg.id, payload, editingPkg.price);
      } else {
        await createPackage(adminEmail, payload);
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  const handleArchive = async (pkg: any) => {
    if (pkg.usageCount > 0) {
      if (
        !confirm(
          `Bu paket ${pkg.usageCount} aktif etkinlik tarafından kullanılıyor. Silinemez, ancak pasife alınabilir. Onaylıyor musunuz?`,
        )
      ) {
        return;
      }
    }
    try {
      await archivePackage(adminEmail, pkg.id);
      loadData();
    } catch (e) {
      alert("Hata");
    }
  };

  const handleRestore = async (pkg: any) => {
    try {
      await restorePackage(adminEmail, pkg.id);
      loadData();
    } catch (e) {
      alert("Hata");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display text-foreground mb-1">Paket Yönetimi</h2>
          <p className="text-sm text-muted-foreground">
            Üyelik paketlerini, fiyatlarını ve özelliklerini (Feature Flags) yönetin.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yeni Paket
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border rounded-2xl p-6 relative ${pkg.is_active ? "bg-card border-gold/30" : "bg-card/50 border-border opacity-70"}`}
            >
              {!pkg.is_active && (
                <div className="absolute top-4 right-4 text-xs font-bold bg-muted text-muted-foreground px-3 py-1 rounded-full">
                  ARŞİVLENDİ
                </div>
              )}
              <h3 className="text-xl text-foreground font-display mb-1">{getPackageDisplayName(pkg.name)}</h3>
              <div className="text-2xl text-foreground font-medium mb-4">{pkg.price} ₺</div>

              <div className="mb-4 text-sm text-muted-foreground">
                <p>Kota: {pkg.storage?.maxGb || 0} GB</p>
                <p>Fotoğraf Limiti: {pkg.limits?.photoLimit || 0}</p>
                <p className="flex items-center gap-1 mt-1 text-rose-400 font-medium">
                  <AlertTriangle className="w-4 h-4" /> {pkg.usageCount} aktif kullanım
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleOpenModal(pkg)}
                  className="flex-1 flex justify-center items-center gap-2 bg-muted hover:bg-zinc-700 text-foreground py-2 rounded-lg text-sm transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Düzenle
                </button>
                {pkg.is_active ? (
                  <button
                    onClick={() => handleArchive(pkg)}
                    className="flex-1 flex justify-center items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Archive className="w-4 h-4" /> Pasife Al
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(pkg)}
                    className="flex-1 flex justify-center items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2 rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Aktifleştir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-display text-foreground mb-6">
              {editingPkg ? "Paketi Düzenle" : "Yeni Paket Oluştur"}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Paket Adı</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Fiyat (₺)</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Depolama (GB)</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    value={storage.maxGb}
                    onChange={(e) => setStorage({ ...storage, maxGb: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Fotoğraf Limiti</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    value={limits.photoLimit}
                    onChange={(e) => setLimits({ ...limits, photoLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Video Limiti</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    value={limits.videoLimit}
                    onChange={(e) => setLimits({ ...limits, videoLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Saklama Süresi (Gün)</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    value={retention.days}
                    onChange={(e) => setRetention({ ...retention, days: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Özellikler (Features)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(features).length > 0
                    ? Object.keys(features).map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={features[key] || false}
                            onChange={(e) => setFeatures({ ...features, [key]: e.target.checked })}
                            className="rounded bg-card border-zinc-700 text-gold focus:ring-gold"
                          />
                          {key}
                        </label>
                      ))
                    : [
                        "qr_gallery",
                        "digital_invitation",
                        "music",
                        "timeline",
                        "story",
                        "gallery",
                        "guestbook",
                        "rsvp",
                      ].map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={features[key] || false}
                            onChange={(e) => setFeatures({ ...features, [key]: e.target.checked })}
                            className="rounded bg-card border-zinc-700 text-gold focus:ring-gold"
                          />
                          {key}
                        </label>
                      ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
