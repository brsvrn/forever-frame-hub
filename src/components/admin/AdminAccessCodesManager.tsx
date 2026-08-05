import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  User,
  Users,
  Shield,
  Loader2,
  ExternalLink,
  History,
  AlertCircle,
} from "lucide-react";
import {
  getAdminAccessCodes,
  createAdminAccessCode,
  toggleAccessCodeStatus,
  generateRandomCode,
  getAccessCodeRedemptions,
} from "@/lib/admin/codes.api";
import type { AdminAccessCode, AccessCodeType } from "@/lib/admin/types";
import { toast } from "sonner";

interface AdminAccessCodesManagerProps {
  adminEmail: string;
}

export function AdminAccessCodesManager({ adminEmail }: AdminAccessCodesManagerProps) {
  const [codes, setCodes] = useState<AdminAccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [rawCode, setRawCode] = useState("");
  const [codeType, setCodeType] = useState<AccessCodeType>("single_use");
  const [packageType, setPackageType] = useState("all_in_one");
  const [maxUses, setMaxUses] = useState(1);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [restrictedEmail, setRestrictedEmail] = useState("");
  const [isOwnerCode, setIsOwnerCode] = useState(false);
  const [isTestCode, setIsTestCode] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  // Redemptions modal state
  const [selectedCodeForRedemptions, setSelectedCodeForRedemptions] =
    useState<AdminAccessCode | null>(null);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const data = await getAdminAccessCodes();
      setCodes(data);
    } catch (error) {
      toast.error("Kullanım kodları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleGenerateRandom = () => {
    const code = generateRandomCode(isOwnerCode ? "VIP" : "MW");
    setRawCode(code);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawCode.trim()) {
      toast.error("Lütfen bir kod girin veya rastgele oluşturun.");
      return;
    }

    setCreating(true);
    try {
      await createAdminAccessCode(adminEmail, {
        rawCode: rawCode.trim(),
        codeType,
        packageType,
        maxUses: isOwnerCode ? 999999 : Number(maxUses) || 1,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        restrictedUserEmail: restrictedEmail.trim() || null,
        isOwnerCode,
        isTestCode,
        adminNotes: adminNotes.trim() || null,
      });

      toast.success("Kullanım kodu başarıyla oluşturuldu.");
      setShowCreateModal(false);
      resetForm();
      await loadCodes();
    } catch (error: any) {
      toast.error(error.message || "Kod oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setRawCode("");
    setCodeType("single_use");
    setPackageType("all_in_one");
    setMaxUses(1);
    setStartsAt("");
    setExpiresAt("");
    setRestrictedEmail("");
    setIsOwnerCode(false);
    setIsTestCode(false);
    setAdminNotes("");
  };

  const handleToggleStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      await toggleAccessCodeStatus(adminEmail, codeId, !currentStatus);
      toast.success(!currentStatus ? "Kod aktif edildi." : "Kod pasife alındı.");
      await loadCodes();
    } catch (error) {
      toast.error("Durum güncellenemedi.");
    }
  };

  const openRedemptionsModal = async (code: AdminAccessCode) => {
    setSelectedCodeForRedemptions(code);
    setLoadingRedemptions(true);
    try {
      const data = await getAccessCodeRedemptions(code.id);
      setRedemptions(data);
    } catch (error) {
      toast.error("Kullanım geçmişi alınamadı.");
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kod panoya kopyalandı!");
  };

  const filteredCodes = codes.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.codeLabel.toLowerCase().includes(q) ||
      (c.restrictedUserEmail && c.restrictedUserEmail.toLowerCase().includes(q)) ||
      (c.adminNotes && c.adminNotes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Kullanım & VIP Kodları
          </h2>
          <p className="text-sm text-muted-foreground">
            Site sahibi VIP kodları, tek kullanımlık tanıtım kodları veya kişiye özel indirim/erişim
            kodları oluşturun.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            handleGenerateRandom();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 shadow-lg shadow-gold/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yeni Kod Oluştur
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kod etiketi, e-posta veya notlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      {/* Codes Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <span className="text-xs text-muted-foreground">Kodlar yükleniyor...</span>
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border text-muted-foreground text-sm">
          Tanımlı kullanım kodu bulunamadı.
        </div>
      ) : (
        <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Kod Etiketi</th>
                  <th className="px-5 py-3.5 font-medium">Tür & Paket</th>
                  <th className="px-5 py-3.5 font-medium">Kullanım</th>
                  <th className="px-5 py-3.5 font-medium">Geçerlilik & Kısıtlama</th>
                  <th className="px-5 py-3.5 font-medium">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-accent/5 transition-colors">
                    {/* Code Label */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground text-sm">
                          {code.codeLabel}
                        </span>
                        <button
                          onClick={() => copyToClipboard(code.codeLabel)}
                          className="p-1 rounded text-muted-foreground hover:text-gold hover:bg-surface transition-colors"
                          title="Kodu Kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {code.adminNotes && (
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                          {code.adminNotes}
                        </div>
                      )}
                    </td>

                    {/* Type & Package */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit bg-surface border border-border text-foreground">
                          {code.isOwnerCode ? (
                            <Shield className="w-3 h-3 text-gold" />
                          ) : (
                            <Key className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className="capitalize">
                            {code.isOwnerCode ? "Site Sahibi (Sınırsız)" : code.codeType}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          Paket: {code.packageType}
                        </span>
                      </div>
                    </td>

                    {/* Usage counts */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground text-xs">
                        {code.usedCount} / {code.isOwnerCode ? "∞" : code.maxUses} kullanıldı
                      </div>
                      {code.usedCount > 0 && (
                        <button
                          onClick={() => openRedemptionsModal(code)}
                          className="text-[11px] text-gold hover:underline mt-0.5 inline-flex items-center gap-1"
                        >
                          <History className="w-3 h-3" />
                          Geçmişi Gör ({code.usedCount})
                        </button>
                      )}
                    </td>

                    {/* Restrictions */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {code.restrictedUserEmail && (
                        <div className="text-amber-400 font-medium truncate max-w-xs">
                          Özel: {code.restrictedUserEmail}
                        </div>
                      )}
                      {code.expiresAt ? (
                        <div>Bitiş: {new Date(code.expiresAt).toLocaleDateString("tr-TR")}</div>
                      ) : (
                        <div>Süresiz</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          code.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-zinc-500/20 text-zinc-400"
                        }`}
                      >
                        {code.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(code.id, code.isActive)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          code.isActive
                            ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {code.isActive ? "Pasife Al" : "Aktif Et"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateCode}
            className="bg-card border border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  Yeni Kullanım Kodu Oluştur
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Özel promosyon veya VIP site sahibi kodları tanımlayın.
                </p>
              </div>
            </div>

            {/* Raw Code Input & Random Gen */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Kod Metni / Etiketi:</span>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="text-gold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Rastgele Üret
                </button>
              </div>
              <input
                type="text"
                required
                value={rawCode}
                onChange={(e) => setRawCode(e.target.value.toUpperCase())}
                placeholder="Örn: MW-2026-VIP veya PROMO50"
                className="w-full font-mono uppercase px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Code Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">Kod Türü:</span>
                <select
                  value={codeType}
                  onChange={(e) => setCodeType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                >
                  <option value="single_use">Tek Kullanımlık</option>
                  <option value="multi_use">Çok Kullanımlık</option>
                  <option value="timed">Süreli (Tarih Aralıklı)</option>
                  <option value="user_specific">Kişiye Özel</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="font-medium text-xs text-foreground block">Paket Türü:</span>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                >
                  <option value="all_in_one">Tam Paket (All in One)</option>
                  <option value="qr_gallery">Yalnızca QR Galeri</option>
                  <option value="digital_invitation">Yalnızca Dijital Davetiye</option>
                </select>
              </div>
            </div>

            {/* VIP & Test Checkboxes */}
            <div className="p-3 rounded-xl bg-surface/50 border border-border space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={isOwnerCode}
                  onChange={(e) => setIsOwnerCode(e.target.checked)}
                  className="rounded border-border text-gold focus:ring-gold"
                />
                <span className="font-semibold text-gold">Site Sahibi VIP Kodu (Sınırsız Kullanım)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isTestCode}
                  onChange={(e) => setIsTestCode(e.target.checked)}
                  className="rounded border-border text-gold focus:ring-gold"
                />
                <span>Test / Geliştirici Kodu</span>
              </label>
            </div>

            {/* Limits & Email */}
            {!isOwnerCode && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="font-medium text-xs text-foreground block">Kullanım Adedi:</span>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="font-medium text-xs text-foreground block">
                    Özel E-Posta (Opsiyonel):
                  </span>
                  <input
                    type="email"
                    value={restrictedEmail}
                    onChange={(e) => setRestrictedEmail(e.target.value)}
                    placeholder="kullanici@gmail.com"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
            )}

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <span className="font-medium text-xs text-foreground block">
                Son Kullanma Tarihi (Opsiyonel):
              </span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <span className="font-medium text-xs text-foreground block">Yönetici Notu:</span>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Örn: Instagram çekilişi için oluşturuldu..."
                className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-accent/10 border border-border text-xs text-foreground"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90 disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Kodu Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Redemptions History Modal */}
      {selectedCodeForRedemptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Kullanım Geçmişi</h3>
                <p className="text-xs font-mono text-gold mt-0.5">
                  {selectedCodeForRedemptions.codeLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedCodeForRedemptions(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Kapat
              </button>
            </div>

            {loadingRedemptions ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : redemptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Bu kod henüz hiç kullanılmadı.
              </div>
            ) : (
              <div className="space-y-2">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-surface/50 border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{r.userEmail}</span>
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(r.redeemedAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    {r.ipAddress && (
                      <div className="text-[11px] font-mono text-muted-foreground/70">
                        IP: {r.ipAddress}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
