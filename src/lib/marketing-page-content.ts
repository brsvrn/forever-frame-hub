import type { DecisionPageCard, DecisionPageStep } from "@/components/marketing/pages/DecisionPage";

export interface MarketingDecisionPageContent {
  pageId: string;
  eyebrow: string;
  title: string;
  description: string;
  trustItems: string[];
  cards: DecisionPageCard[];
  steps?: DecisionPageStep[];
  cardsTitle?: string;
  cardsDescription?: string;
  finalTitle: string;
  finalDescription: string;
}

const sharedTrust = ["Uygulama gerekmez", "Tek seferlik ödeme", "Satın almadan önce önizleme"];

export const howItWorksPage: MarketingDecisionPageContent = {
  pageId: "how_it_works",
  eyebrow: "MemoryWedding deneyimi",
  title: "Davetiyeden son fotoğrafa kadar tek bağlantı.",
  description:
    "Düğünden önce davetinizi paylaşın ve LCV yanıtlarını toplayın. Düğün günü aynı deneyimi QR ile anı albümüne dönüştürün. Sonrasında bütün fotoğraf ve videoları tek panelden yönetin.",
  trustItems: sharedTrust,
  steps: [
    {
      label: "Düğünden önce",
      title: "Tasarla ve davet et",
      description:
        "Temanızı seçin, düğün bilgilerinizi girin ve bağlantınızı WhatsApp, SMS veya dilediğiniz kanaldan paylaşın.",
    },
    {
      label: "Düğün günü",
      title: "LCV’den QR anılarına geçin",
      description:
        "Misafirler yol tarifi ve programı görür; masadaki QR kodla fotoğraf ve videolarını uygulama indirmeden yükler.",
    },
    {
      label: "Düğünden sonra",
      title: "Tüm anıları yönetin",
      description:
        "Toplanan içerikleri panelde görüntüleyin, görünürlüğünü yönetin ve paketinizin kapsamına göre toplu indirin.",
    },
  ],
  cardsTitle: "Çift ve misafir için ayrı ayrı kolay",
  cards: [
    {
      title: "Çiftin akışı",
      description: "Bir tema seçin, içeriği düzenleyin, önizleyin ve hazır olduğunda yayınlayın.",
      bullets: ["Mobil önizleme", "Yayın sonrası düzenleme", "Tek panelden takip"],
    },
    {
      title: "Misafirin akışı",
      description:
        "Bağlantıyı açın, detayları görün, LCV yanıtını verin ve düğünde QR kodu okutun.",
      bullets: ["Üyelik gerekmez", "Tek tık yol tarifi", "Tarayıcıdan medya yükleme"],
    },
    {
      title: "Kontrol sizde",
      description:
        "Davetli yanıtları ve paylaşılan anılar aynı etkinliğin yönetim alanında toplanır.",
      bullets: ["Yanıt listesi", "Galeri yönetimi", "İndirme ve paylaşım"],
    },
  ],
  finalTitle: "İlk adım ödeme değil, önizleme.",
  finalDescription:
    "Düğün bilgilerinizi girin ve gerçek davetiye akışını ücretsiz görün. Yalnızca yayınlamaya hazır olduğunuzda paketinizi seçin.",
};

export const featuresHubPage: MarketingDecisionPageContent = {
  pageId: "features_hub",
  eyebrow: "Üç ürün, tek düğün akışı",
  title: "Davetiyeniz yalnızca duyuru değil, çalışan bir deneyim olsun.",
  description:
    "MemoryWedding dijital davetiyeyi, LCV yönetimini ve QR anı albümünü birbirinden kopuk araçlar olmaktan çıkarıp tek etkinlik deneyiminde birleştirir.",
  trustItems: sharedTrust,
  cardsTitle: "İhtiyacınıza göre derine inin",
  cardsDescription:
    "Her ürün sayfası hem çiftin kontrolünü hem misafirin göreceği deneyimi açıklar.",
  cards: [
    {
      title: "Dijital davetiye",
      description:
        "Tema, müzik, hikâye, program, harita ve takvim bilgilerini tek mobil sayfada sunun.",
      bullets: ["Canlı tema önizleme", "Mobil odaklı tasarım", "Kolay paylaşım"],
      href: "/ozellikler/dijital-davetiye",
    },
    {
      title: "LCV ve davetli yönetimi",
      description:
        "Katılım yanıtlarını, kişi sayılarını ve desteklenen ek tercihleri panelde takip edin.",
      bullets: ["Katılıyor/katılamıyor", "Kişi sayısı", "Etkinlik bazlı takip"],
      href: "/ozellikler/lcv-davetli-yonetimi",
    },
    {
      title: "QR anı albümü",
      description:
        "Misafirlerin fotoğraf ve videolarını uygulamasız biçimde aynı özel galeride toplayın.",
      bullets: ["QR veya bağlantı", "Fotoğraf ve video", "Panelden galeri yönetimi"],
      href: "/ozellikler/qr-ani-albumu",
    },
  ],
  finalTitle: "Üç ayrı araç yerine tek düğün bağlantısı.",
  finalDescription:
    "Önizlemede davetiye ve QR akışını birlikte deneyin; düğününüz için yalnızca ihtiyacınız olan paketi seçin.",
};

export const digitalInvitationPage: MarketingDecisionPageContent = {
  pageId: "digital_invitation",
  eyebrow: "Dijital davetiye",
  title: "Düğününüzün atmosferi daha ilk dokunuşta hissedilsin.",
  description:
    "Tema, müzik, tarih, program ve konum bilgilerini telefon için tasarlanmış tek bir davetiye deneyiminde bir araya getirin.",
  trustItems: ["19 seçilebilir tema", "1 yıl davetiye bağlantısı", "Sınırsız bağlantı paylaşımı"],
  steps: [
    {
      label: "Seç",
      title: "Temanızı bulun",
      description:
        "Deniz, doğa, İtalya, lüks ve sinematik koleksiyonlardan tarzınıza uyan temayı seçin.",
    },
    {
      label: "Düzenle",
      title: "Hikâyenizi ekleyin",
      description:
        "İsimler, tarih, metin, program, konum, fotoğraflar ve desteklenen müzik seçeneklerini düzenleyin.",
    },
    {
      label: "Paylaş",
      title: "Önizleyin ve yayınlayın",
      description:
        "Önce telefonda kontrol edin; hazır olduğunuzda özel bağlantınızı misafirlerinizle paylaşın.",
    },
  ],
  cards: [
    {
      title: "Hareketli açılış",
      description: "Davetiniz zarif bir zarf, görsel veya desteklenen sinematik açılışla başlar.",
    },
    {
      title: "Program ve geri sayım",
      description: "Düğün akışını, etkinlik saatlerini ve kalan süreyi tek yerde gösterin.",
    },
    {
      title: "Harita ve takvim",
      description:
        "Misafirler tek dokunuşla yol tarifi alabilir ve tarihi takvimlerine ekleyebilir.",
    },
    {
      title: "Türkçe ve İngilizce",
      description: "Desteklenen etkinliklerde davetiye içeriğini iki dilde sunun.",
    },
    {
      title: "Hikâye ve galeri",
      description: "Birlikte çekildiğiniz kareleri ve ilişkinizin hikâyesini davetiyeye ekleyin.",
    },
    {
      title: "Yayın sonrası kontrol",
      description: "Desteklenen alanları düğün yaklaşırken panelinizden güncel tutun.",
    },
  ],
  finalTitle: "Önce gerçek davetiyenizi görün.",
  finalDescription:
    "Bir tema seçin, bilgilerinizi girin ve yayınlamadan önce mobil önizlemeyi ücretsiz hazırlayın.",
};

export const rsvpPage: MarketingDecisionPageContent = {
  pageId: "rsvp_management",
  eyebrow: "LCV ve davetli yönetimi",
  title: "Kim geliyor, kaç kişi geliyor; tek tek sormayın.",
  description:
    "Misafirler bağlantı üzerinden katılım yanıtını verir. Siz cevapları ve kişi sayılarını etkinlik panelinden düzenli biçimde takip edersiniz.",
  trustItems: ["Misafir için üyelik yok", "Anlık panel görünümü", "Davetiyeye entegre form"],
  steps: [
    {
      label: "Davet et",
      title: "Bağlantıyı paylaşın",
      description:
        "Genel davetiye bağlantısını veya desteklenen kişisel davetli bağlantısını gönderin.",
    },
    {
      label: "Yanıt al",
      title: "Misafir LCV versin",
      description: "Katılım durumu ve kişi sayısı davetiyeden ayrılmadan kaydedilir.",
    },
    {
      label: "Planla",
      title: "Listeyi panelde yönetin",
      description:
        "Yanıtları, toplam katılımı ve desteklenen etkinlik ayrıntılarını tek görünümde takip edin.",
    },
  ],
  cards: [
    {
      title: "Katılım durumu",
      description: "Katılıyor ve katılamıyor yanıtlarını düzenli bir listede görün.",
    },
    {
      title: "Kişi sayısı",
      description: "Misafirin yanında gelecek kişi sayısını planlama hesabına dahil edin.",
    },
    {
      title: "Etkinlik ayrıntıları",
      description: "Desteklenen çoklu etkinliklerde yanıtları tören bazında toplayın.",
    },
    {
      title: "Ek tercihler",
      description:
        "Paket ve etkinlik ayarları destekliyorsa yemek ve özel not gibi ek bilgileri sorun.",
    },
    {
      title: "Kişisel bağlantılar",
      description:
        "Desteklenen akışta belirli misafirleri kişisel karşılama bağlantısıyla davet edin.",
    },
    {
      title: "Dışa aktarma",
      description:
        "Planlama için davetli yanıtlarını panelde yönetin ve desteklenen biçimde dışa aktarın.",
    },
  ],
  finalTitle: "LCV tablosunu düğünden önce netleştirin.",
  finalDescription:
    "Davetiyeyi ücretsiz hazırlayın ve misafirin göreceği LCV akışını yayınlamadan önce deneyin.",
};

export const qrAlbumPage: MarketingDecisionPageContent = {
  pageId: "qr_memory_album",
  eyebrow: "QR anı albümü",
  title: "Misafirlerin çektiği hiçbir güzel kare kaybolmasın.",
  description:
    "Masa kartındaki QR kodu veya özel bağlantıyı açan misafirler fotoğraf ve videolarını uygulama indirmeden düğününüzün özel galerisine yükler.",
  trustItems: ["Uygulama ve misafir üyeliği yok", "Fotoğraf ve video", "Panelden galeri yönetimi"],
  steps: [
    {
      label: "Yerleştir",
      title: "QR kodu paylaşın",
      description:
        "İndirilebilir QR tasarımını masa kartı, karşılama panosu veya dijital mesajınızda kullanın.",
    },
    {
      label: "Topla",
      title: "Misafirler yüklesin",
      description:
        "Telefon kamerasıyla QR kodu okutan misafir, tarayıcıdan fotoğraf veya video seçer.",
    },
    {
      label: "Sakla",
      title: "Anıları panelde yönetin",
      description:
        "Yüklenen içerikleri görüntüleyin, galeri görünürlüğünü yönetin ve paket kapsamına göre indirin.",
    },
  ],
  cards: [
    {
      title: "Hızlı misafir akışı",
      description: "Kayıt ekranı veya uygulama mağazası olmadan QR’dan yüklemeye geçilir.",
    },
    {
      title: "Özel galeri",
      description: "Etkinliğe gönderilen fotoğraf ve videolar aynı galeri altında toplanır.",
    },
    {
      title: "Galeri kontrolü",
      description:
        "Etkinlik sahibi yüklenen içerikleri panelden görüntüler ve görünürlüğünü yönetir.",
    },
    {
      title: "Toplu indirme",
      description: "Birleşik pakette desteklenen içerikleri düğün sonrasında toplu olarak indirin.",
    },
    {
      title: "Açık saklama süresi",
      description: "QR paketteki galeri saklama süresi satın alma öncesinde açıkça gösterilir.",
    },
    {
      title: "Baskıya hazır QR",
      description: "QR görselini kendi masa kartınıza veya karşılama panonuza uyarlayın.",
    },
  ],
  finalTitle: "QR deneyimini düğün gününden önce test edin.",
  finalDescription:
    "Ücretsiz önizlemede misafir yükleme ekranını görün; ihtiyacınıza göre QR veya birleşik paketi seçin.",
};
