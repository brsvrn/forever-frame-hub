import { useState } from "react";
import {
  BookOpen,
  X,
  ShieldCheck,
  Calendar,
  CreditCard,
  Key,
  Users,
  Package,
  Palette,
  MessageSquare,
  HardDrive,
  History,
  Settings,
  Music,
} from "lucide-react";

interface AdminUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminUserGuideModal({ isOpen, onClose }: AdminUserGuideModalProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  if (!isOpen) return null;

  const sections = [
    { id: "overview", label: "1. Genel Bakış & Metrikler", icon: ShieldCheck },
    { id: "events", label: "2. Etkinlik Yönetimi", icon: Calendar },
    { id: "orders", label: "3. Sipariş & PayTR", icon: CreditCard },
    { id: "codes", label: "4. Kodlar & Kuponlar", icon: Key },
    { id: "users", label: "5. Kullanıcılar & Roller", icon: Users },
    { id: "packages", label: "6. Paketler & Fiyat", icon: Package },
    { id: "themes", label: "7. Tema Yönetimi", icon: Palette },
    { id: "support", label: "8. Destek Talepleri", icon: MessageSquare },
    { id: "retention", label: "9. Saklama & Temizlik", icon: HardDrive },
    { id: "audit", label: "10. İşlem Kayıtları (Audit)", icon: History },
    { id: "settings", label: "11. Sistem & Bakım Modu", icon: Settings },
    { id: "music", label: "12. Müzik & Davetiye", icon: Music },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-card/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">
                MemoryWedding Super Admin — Kullanım Kılavuzu & Talimatı
              </h2>
              <p className="text-xs text-muted-foreground">
                Tüm panel fonksiyonları, yetkiler ve yönetim yönergeleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Section Navigation */}
          <div className="w-full md:w-64 border-r border-border p-3 overflow-y-auto space-y-1 bg-surface/50">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? "bg-gold text-zinc-950 font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-zinc-950" : "text-muted-foreground"}`} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-background text-foreground space-y-6">
            {activeSection === "overview" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> 1. Genel Bakış & Metrikler
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Super Admin Genel Bakış sekmesi, platformun tüm anlık sağlık ve finansal durumunu gerçek Supabase veritabanı üzerinden görüntüler.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">Temel İstatistikler</span>
                    <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                      <li><strong>Toplam Gelir (₺):</strong> Başarıyla tamamlanan PayTR siparişleri toplamı.</li>
                      <li><strong>Etkinlik Sayısı:</strong> Sistemdeki tüm aktif, taslak ve arşivlenmiş düğünler.</li>
                      <li><strong>Medya Hacmi (GB):</strong> Misafirlerin yüklediği fotoğrafların toplam depolama boyutu.</li>
                      <li><strong>Kayıtlı Kullanıcılar:</strong> Sisteme üye olan etkinlik sahipleri.</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Hızlı Aksiyonlar</span>
                    <p className="text-xs text-muted-foreground">
                      Genel bakış kartları üzerinden tek tıklamayla Etkinlikler, Siparişler, Kodlar veya Destek talepleri bölümlerine geçiş yapabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "events" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> 2. Etkinlikler Yönetimi
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Platformdaki tüm düğün ve etkinlikleri arayabilir, durumlarına göre filtreleyebilir ve detaylarını yönetebilirsiniz.
                </p>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-card border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Neler Yapabilirsiniz?</h4>
                    <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                      <li><strong>Arama & Filtreleme:</strong> Etkinlik adı, slug veya çift adına göre anında arama. Yayınlandı, Taslak, Ödendi veya Silindi durumuna göre filtreleme.</li>
                      <li><strong>Canlı Davetiye & QR Görüntüleme:</strong> "Davetiyeyi Aç" butonuyla misafirlerin gördüğü canlı davetiyeyi test edebilirsiniz.</li>
                      <li><strong>Ömür Döngüsü (Lifecycle) Düzenleme:</strong> "Yönet" butonuna tıklayarak QR yükleme kapanış tarihini, Saklama (retention) bitiş tarihini ve Davetiye yayın süresini elle uzatıp kısaltabilirsiniz.</li>
                      <li><strong>Güvenli Silme (Soft-Delete) & Geri Getirme:</strong> İstenmeyen etkinlikleri silebilir veya silinenleri tek tıkla geri yükleyebilirsiniz.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "orders" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> 3. Siparişler & PayTR Ödemeleri
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kullanıcıların satın aldığı paketler, PayTR ödeme referansları ve sipariş durumları burada listelenir.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Sipariş Durumları & Aksiyonlar:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong className="text-emerald-400">paid (Ödendi):</strong> PayTR webhook'u tarafından başarıyla onaylanan siparişler.</li>
                    <li><strong className="text-amber-400">pending (Bekliyor):</strong> Kullanıcının ödeme adımına geçtiği fakat henüz tamamlamadığı işlemler.</li>
                    <li><strong className="text-rose-400">failed (Başarısız):</strong> Kart reddi veya iptal edilen işlemler.</li>
                    <li><strong>Manuel Onaylama / İptal:</strong> Banka havalesi veya özel durumlarda siparişi manuel olarak onaylayabilir veya iptal edebilirsiniz.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "codes" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Key className="w-5 h-5" /> 4. Kullanım Kodları & Promosyonlar
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Çiftlerin veya anlaşmalı organizasyon firmalarının etkinlik paketlerini ücretsiz veya indirimli aktifleştirmesi için kodlar oluşturabilirsiniz.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Yeni Kod Oluşturma:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong>Kod İsmi:</strong> Örn: <code>YAZ2026</code>, <code>VIPGIFT</code></li>
                    <li><strong>Paket Türü:</strong> Standart, Premium, Lüks paket ataması</li>
                    <li><strong>Kullanım Limiti:</strong> Tek seferlik (1) veya çoklu kullanım</li>
                    <li><strong>Son Kullanma Tarihi:</strong> Belirli tarihe kadar geçerli promosyonlar</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "users" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Users className="w-5 h-5" /> 5. Kullanıcılar & Rol Yönetimi
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Platforma kayıtlı tüm hesapları görebilir, Super Admin yetkisi atayabilir veya yetkileri geri alabilirsiniz.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Önemli Güvenlik Notu:</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bir kullanıcıya <strong>Admin Rolü</strong> verildiğinde, o kullanıcı tüm finansal verileri, sistem ayarlarını ve silme işlemlerini gerçekleştirebilir. Yalnızca yetkili personellere admin rolü veriniz.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "packages" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Package className="w-5 h-5" /> 6. Paketler & Fiyatlandırma
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kullanıcıların satın alabileceği paketlerin fiyatlarını, özelliklerini, indirim oranlarını ve depolama limitlerini dinamik olarak düzenleyebilirsiniz.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong>Fiyat (₺):</strong> Sitede ve PayTR ödeme formunda geçerli güncel tutar.</li>
                    <li><strong>Özellik Listesi:</strong> Pakete dahil olan hizmetler (Davetiye, Canlı Galeri, QR Kod, Özel Müzik).</li>
                    <li><strong>Öne Çıkarılan Paket:</strong> "En Çok Tercih Edilen" rozeti ile satış artırma.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "themes" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Palette className="w-5 h-5" /> 7. Tema Yönetimi & Canlı Önizleme
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Davetiye ve canlı slayt temalarının renklerini, yazı tiplerini, arka plan görsellerini ve varsayılan müziklerini yönetebilirsiniz.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong>Tema Aktiflik / Pasiflik:</strong> Kullanıcıların seçimine açıp kapatma.</li>
                    <li><strong>Premium Tema:</strong> Yalnızca Premium ve üstü paketlere özel temalar belirleme.</li>
                    <li><strong>Sıralama:</strong> Kullanıcı panelinde temaların listelenme sırasını değiştirme.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "support" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> 8. Destek Talepleri & İletişim
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kullanıcılardan gelen destek taleplerini, soruları ve hata bildirimlerini buradan yönetebilirsiniz. Taleplerin durumunu "Açık", "İnceleniyor" veya "Çözüldü" olarak güncelleyebilirsiniz.
                </p>
              </div>
            )}

            {activeSection === "retention" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <HardDrive className="w-5 h-5" /> 9. Saklama Süresi & Depolama Temizliği
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Etkinlik paketlerinde belirtilen saklama süresi (örn. 30 gün, 1 yıl) dolan etkinliklerin medya dosyalarını temizleyerek sunucu maliyetlerini optimize edebilirsiniz.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong>Süresi Dolanları Tara:</strong> Saklama süresi geçmiş medyaları otomatik listeler.</li>
                    <li><strong>Güvenli Temizlik:</strong> Medyalar silinmeden önce arşiv indirme bağlantısı oluşturulabilir.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "audit" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <History className="w-5 h-5" /> 10. İşlem Kayıtları (Audit Logs)
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Super Adminler tarafından yapılan tüm kritik işlemler (rol değişikliği, etkinlik silme/kurtarma, fiyat güncelleme, bakım modu) zaman damgası ve yönetici e-postasıyla birlikte kayıt altına alınır.
                </p>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Settings className="w-5 h-5" /> 11. Sistem Ayarları & Bakım Modu
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Site genelindeki bakım modunu, iletişim bilgilerini, PayTR API anahtarlarını ve genel platform yapılandırmalarını buradan yönetebilirsiniz.
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">Bakım Modu Davranışı:</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bakım modu açıldığında normal ziyaretçiler bakım ekranı ile karşılaşır. Ancak Super Adminler özel bypass çerezi ile siteyi ve paneli kesintisiz kullanmaya devam eder.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "music" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display text-gold flex items-center gap-2">
                  <Music className="w-5 h-5" /> 12. Müzik Oynatıcı & Davetiye Kılavuzu
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mobil tarayıcıların otomatik ses çalma kısıtlamalarını aşmak için özel çift-katmanlı müzik mimarisi devrededir:
                </p>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong>Zarf Açılışı:</strong> Misafir "Davetiyeyi Aç" butonuna dokunduğu an müzik anında ve sorunsuz başlar.</li>
                    <li><strong>Yerel Yüksek Hızlı MP3 Dosyaları:</strong> CC-BY telifsiz parçalar sistem sunucusunda doğrudan barındırılır.</li>
                    <li><strong>Özel YouTube Parçaları:</strong> Çiftler kendi sevdikleri şarkının YouTube linkini etkinlik ayarlarından girdiklerinde otomatik olarak YouTube oynatıcısına bağlanır.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card/60">
          <span className="text-xs text-muted-foreground">MemoryWedding Platform Yönetim Sistemi v2.4</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gold text-zinc-950 font-semibold text-xs transition-all hover:bg-gold/90"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
