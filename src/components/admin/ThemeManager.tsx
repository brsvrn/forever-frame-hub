import { useState, useEffect } from "react";
import {
  getThemes,
  createTheme,
  updateTheme,
  archiveTheme,
  restoreTheme,
  getUsageCount,
} from "@/lib/admin.api";
import { themes as staticThemes } from "@/lib/theme-engine";
import { Loader2, Plus, Edit2, Archive, AlertTriangle, RefreshCw, Eye } from "lucide-react";

const DEFAULT_CONFIG = {
  font: "Inter",
  primaryColor: "#EAB308", // Gold
  secondaryColor: "#18181B", // Zinc 900
  animationPreset: "fade",
  musicDefault: "",
  thumbnailUrl: "",
  coverVideoUrl: "",
  backgroundUrl: "",
  cardRadius: "md",
  shadow: "sm",
  dividerStyle: "solid",
  buttonVariant: "solid",
  typography: "default",
  iconSet: "lucide",
};

export function ThemeManager({ adminEmail }: { adminEmail: string }) {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [config, setConfig] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      let data = await getThemes(true);
      
      // Check if the new premium themes exist in the DB
      const hasNewThemes = data.some((t: any) => t.theme_id === "midnight");

      // Auto-seed missing themes and archive old ones
      if (!hasNewThemes) {
        // Archive old themes to clean up the view
        for (const oldTheme of data) {
          if (!oldTheme.deleted_at) {
             await archiveTheme(adminEmail, oldTheme.id);
          }
        }

        // Create the new premium themes
        for (const t of Object.values(staticThemes)) {
          await createTheme(adminEmail, {
            theme_id: t.id,
            name: t.name,
            config: { ...t, thumbnailUrl: t.image },
            is_active: true
          });
        }
        data = await getThemes(true);
      }

      const themesWithUsage = await Promise.all(
        data.map(async (th) => {
          const usage = await getUsageCount("theme", th.theme_id);
          return { ...th, usageCount: usage };
        }),
      );
      setThemes(themesWithUsage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (theme: any = null) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        theme_id: theme.theme_id,
        name: theme.name,
        description: theme.description || "",
      });
      setConfig(theme.config || DEFAULT_CONFIG);
    } else {
      setEditingTheme(null);
      setFormData({ theme_id: "", name: "", description: "" });
      setConfig(DEFAULT_CONFIG);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData, config };
      if (editingTheme) {
        await updateTheme(adminEmail, editingTheme.id, payload);
      } else {
        await createTheme(adminEmail, payload);
      }
      setModalOpen(false);
      loadData();
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  const handleArchive = async (theme: any) => {
    if (theme.usageCount > 0) {
      if (
        !confirm(
          `Bu tema ${theme.usageCount} aktif etkinlik tarafından kullanılıyor. Arşivlenirse eski davetiyeler etkilenmez, ancak yenileri için seçilemez. Onaylıyor musunuz?`,
        )
      ) {
        return;
      }
    }
    try {
      await archiveTheme(adminEmail, theme.id);
      loadData();
    } catch (e) {
      alert("Hata");
    }
  };

  const handleRestore = async (theme: any) => {
    try {
      await restoreTheme(adminEmail, theme.id);
      loadData();
    } catch (e) {
      alert("Hata");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display text-foreground mb-1">Tema Yönetimi</h2>
          <p className="text-sm text-muted-foreground">
            Davetiye temalarını ve tasarım konfigürasyonlarını yönetin.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yeni Tema
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`bg-card border rounded-2xl overflow-hidden ${theme.is_active ? "border-border" : "border-border opacity-70"}`}
            >
              <div
                className="aspect-video bg-muted flex items-center justify-center relative bg-cover bg-center"
                style={{ backgroundImage: `url(${theme.config?.thumbnailUrl})` }}
              >
                {!theme.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-muted text-foreground text-xs px-3 py-1 rounded-full font-bold">
                      ARŞİVLENDİ
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-foreground font-medium">{theme.name}</h3>
                  <span className="text-xs text-zinc-500 font-mono">{theme.theme_id}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">{theme.description}</p>
                <div className="mb-4 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1 text-rose-400 font-medium">
                    <AlertTriangle className="w-4 h-4" /> {theme.usageCount} aktif kullanım
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(theme)}
                    className="flex-1 flex justify-center items-center gap-2 bg-muted hover:bg-zinc-700 text-foreground py-2 rounded-lg text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Düzenle
                  </button>
                  {theme.is_active ? (
                    <button
                      onClick={() => handleArchive(theme)}
                      className="flex-1 flex justify-center items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Archive className="w-4 h-4" /> Arşivle
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(theme)}
                      className="flex-1 flex justify-center items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2 rounded-lg text-sm transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Aktifleştir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
              <h3 className="text-xl font-display text-foreground">
                {editingTheme ? "Temayı Düzenle" : "Yeni Tema"}
              </h3>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Ayarlar Paneli */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-border space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Tema ID (Örn: luxury, minimal)
                  </label>
                  <input
                    type="text"
                    disabled={!!editingTheme}
                    className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground disabled:opacity-50"
                    value={formData.theme_id}
                    onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Tema Adı</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Açıklama</label>
                  <textarea
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-foreground font-medium mb-3">Tasarım (Config)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Ana Renk (Primary)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-10 h-10 rounded bg-card"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-card border border-border rounded-lg px-3 text-foreground text-sm"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        Arkaplan (Secondary)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-10 h-10 rounded bg-card"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-card border border-border rounded-lg px-3 text-foreground text-sm"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Font Ailesi</label>
                      <select
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        value={config.font}
                        onChange={(e) => setConfig({ ...config, font: e.target.value })}
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Playfair Display">Playfair Display (Klasik/Luxury)</option>
                        <option value="Cinzel">Cinzel (Zarif)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Animasyon Preset</label>
                      <select
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        value={config.animationPreset}
                        onChange={(e) => setConfig({ ...config, animationPreset: e.target.value })}
                      >
                        <option value="fade">Fade In</option>
                        <option value="slide">Slide Up</option>
                        <option value="zoom">Zoom</option>
                        <option value="bounce">Bounce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        Kart Kenarı (Radius)
                      </label>
                      <select
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        value={config.cardRadius}
                        onChange={(e) => setConfig({ ...config, cardRadius: e.target.value })}
                      >
                        <option value="none">Keskin (None)</option>
                        <option value="sm">Hafif (sm)</option>
                        <option value="md">Orta (md)</option>
                        <option value="lg">Yuvarlak (lg)</option>
                        <option value="full">Tam Yuvarlak (full)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Gölge (Shadow)</label>
                      <select
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        value={config.shadow}
                        onChange={(e) => setConfig({ ...config, shadow: e.target.value })}
                      >
                        <option value="none">Yok</option>
                        <option value="sm">Hafif</option>
                        <option value="md">Orta</option>
                        <option value="lg">Belirgin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Buton Stili</label>
                      <select
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        value={config.buttonVariant}
                        onChange={(e) => setConfig({ ...config, buttonVariant: e.target.value })}
                      >
                        <option value="solid">Dolu (Solid)</option>
                        <option value="outline">Çizgili (Outline)</option>
                        <option value="ghost">Hayalet (Ghost)</option>
                        <option value="rounded">Tam Yuvarlak</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Ayraç Stili</label>
                      <select
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        value={config.dividerStyle}
                        onChange={(e) => setConfig({ ...config, dividerStyle: e.target.value })}
                      >
                        <option value="solid">Düz Çizgi</option>
                        <option value="dashed">Kesik Çizgi</option>
                        <option value="dotted">Noktalı</option>
                        <option value="floral">Çiçekli (Floral)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-foreground font-medium mb-3">Medya Varlıkları (Assets)</h4>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Thumbnail (Görsel URL)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground text-sm"
                      value={config.thumbnailUrl}
                      onChange={(e) => setConfig({ ...config, thumbnailUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Kapak Videosu (URL)</label>
                    <input
                      type="text"
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground text-sm"
                      value={config.coverVideoUrl}
                      onChange={(e) => setConfig({ ...config, coverVideoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Canlı Önizleme Paneli */}
              <div className="w-full md:w-1/2 bg-black flex flex-col p-6 items-center overflow-y-auto">
                <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
                  <Eye className="w-4 h-4" /> Canlı Önizleme
                </div>

                <div
                  className="w-full max-w-sm h-[600px] border border-border rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-500"
                  style={{
                    backgroundColor: config.secondaryColor,
                    fontFamily: config.font === "Playfair Display" ? "serif" : "sans-serif",
                  }}
                >
                  {/* Mock Hero */}
                  <div
                    className="h-2/3 bg-card relative flex items-center justify-center flex-col text-center p-6 bg-cover bg-center"
                    style={{ backgroundImage: `url(${config.thumbnailUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="relative z-10">
                      <p className="text-sm mb-2" style={{ color: config.primaryColor }}>
                        BİZ EVLENİYORUZ
                      </p>
                      <h1 className="text-4xl text-foreground mb-4">Barış & Minel</h1>
                      <button
                        className="px-6 py-2 rounded-full font-medium"
                        style={{
                          backgroundColor: config.primaryColor,
                          color: config.secondaryColor,
                        }}
                      >
                        Katılıyorum
                      </button>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="p-6">
                    <h2 className="text-xl text-foreground mb-2">Detaylar</h2>
                    <div
                      className="w-12 h-1 mb-4"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Bu alan seçtiğiniz {config.font} fontu, {config.primaryColor} vurgu rengi ve{" "}
                      {config.secondaryColor} arkaplanı ile nasıl görüneceğini test etmeniz içindir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0">
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
                Temayı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
