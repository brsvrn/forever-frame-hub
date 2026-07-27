export type Content = typeof tr;

export const tr = {
  nav: {
    links: [
      { id: "ozellikler", label: "Özellikler" },
      { id: "nasil-calisir", label: "Nasıl Çalışır" },
      { id: "temalar", label: "Temalar" },
      { id: "qr", label: "QR Sistemi" },
      { id: "davetiye", label: "Davetiye" },
      { id: "paketler", label: "Paketler" },
      { id: "sss", label: "SSS" },
    ],
    login: "Giriş Yap",
    cta: "Ücretsiz Başla",
    menu: "Menüyü aç",
    close: "Menüyü kapat",
  },
  hero: {
    badge: "Yeni · AI destekli anı albümü",
    title: ["Düğününüzün", "her anı", "tek bir yerde."],
    subtitle:
      "Dijital davetiye, RSVP, QR ile fotoğraf ve video toplama, etkinlik yönetimi ve premium temalar. MemoryWedding ile büyük gününüz dakikalar içinde kusursuz bir dijital deneyime dönüşür.",
    primary: "Davetiyeni Oluştur",
    secondary: "Demoyu İncele",
    stats: [
      { value: "12.400+", label: "Toplanan anı" },
      { value: "%98", label: "RSVP yanıt oranı" },
      { value: "3 dk", label: "Kurulum süresi" },
    ],
    caption: "Misafirleriniz QR'ı okutur, anılar canlı akışa düşer.",
  },
  features: {
    eyebrow: "Platform",
    title: "Bir düğün için gereken her şey, tek panelde",
    subtitle:
      "Dağınık WhatsApp grupları, kayıp fotoğraflar ve kağıt listeler yerine; tek bir premium sistem.",
    items: [
      {
        title: "Dijital Davetiye",
        desc: "Kendi alan adınızda, sinematik animasyonlu, mobil öncelikli davetiye sayfası.",
      },
      {
        title: "QR ile Anı Toplama",
        desc: "Uygulama indirmeden, tek QR ile misafirlerinizden fotoğraf ve video toplayın.",
      },
      {
        title: "Akıllı RSVP",
        desc: "Katılım, refakatçi ve menü tercihi yanıtlarını canlı olarak takip edin.",
      },
      {
        title: "Etkinlik Yönetimi",
        desc: "Kına, nikah, after party; çoklu etkinlik programı ve konum yönlendirmesi.",
      },
      {
        title: "Premium Tema Sistemi",
        desc: "Sanat yönetmeni elinden çıkmış, tipografi ve renk uyumu kurulmuş temalar.",
      },
      {
        title: "AI Destekli Özellikler",
        desc: "Davet metni önerisi, otomatik albüm seçkisi ve yüz bazlı fotoğraf ayrıştırma.",
      },
    ],
  },
  how: {
    eyebrow: "Nasıl Çalışır",
    title: "Üç adımda hazır",
    subtitle: "Teknik bilgi gerekmez. Kurulumdan paylaşıma kadar ortalama üç dakika.",
    steps: [
      {
        step: "01",
        title: "Temanızı seçin",
        desc: "Koleksiyondan bir tema seçin, çift adlarınızı ve tarihinizi girin. Önizleme anında canlanır.",
      },
      {
        step: "02",
        title: "Davetiyenizi paylaşın",
        desc: "Bağlantıyı WhatsApp'tan gönderin, QR kartlarınızı masalara koyun. RSVP anında akmaya başlar.",
      },
      {
        step: "03",
        title: "Anıları toplayın",
        desc: "Misafirleriniz kare yükler, siz canlı galeriden izler ve tüm albümü tek tıkla indirirsiniz.",
      },
    ],
  },
  themes: {
    eyebrow: "Tema Galerisi",
    title: "Şablon değil, sanat yönetimi",
    subtitle: "Her tema tipografi, renk ve hareket dili ile birlikte tasarlandı.",
    items: [
      { name: "Midnight Bloom", tag: "Sinematik" },
      { name: "Blush Atelier", tag: "Romantik" },
      { name: "Garden Lumière", tag: "Bahçe" },
      { name: "Noir Or", tag: "Minimal lüks" },
    ],
    cta: "Tüm temaları gör",
  },
  qr: {
    eyebrow: "QR Sistemi",
    title: "Misafirlerinizin gözünden düğününüz",
    subtitle:
      "Masalardaki QR kart okutulur, tarayıcı açılır ve yükleme başlar. Uygulama yok, üyelik yok, sürtünme yok.",
    points: [
      "Tek karekod ile sınırsız misafir yüklemesi",
      "4K video ve orijinal kalite fotoğraf desteği",
      "Moderasyon: yayına almadan önce onaylayın",
      "Etkinlik sonrası tüm albümü ZIP olarak indirin",
    ],
    live: "Canlı akış",
    uploads: "yeni yükleme",
  },
  invitation: {
    eyebrow: "Dijital Davetiye",
    title: "Kağıdın yerini alan bir deneyim",
    subtitle:
      "Açılış animasyonu, geri sayım, hikâyeniz, program akışı, konum ve RSVP; hepsi tek sayfada.",
    features: [
      { title: "Sinematik açılış", desc: "Sayfa açıldığında zarif bir perde animasyonu." },
      { title: "Canlı geri sayım", desc: "Büyük güne kalan süre saniye saniye." },
      { title: "Yol tarifi", desc: "Tek dokunuşla harita ve ulaşım yönlendirmesi." },
      { title: "Hediye tercihi", desc: "Hesap bilgisi veya hediye listesi entegrasyonu." },
    ],
    preview: { save: "Kaydedin", names: "Elif & Kaan", date: "14 Haziran 2026", rsvp: "Katılıyorum" },
  },
  pricing: {
    eyebrow: "Paketler",
    title: "Tek seferlik ödeme, ömür boyu anı",
    subtitle: "Abonelik yok. Düğününüz için bir kez ödersiniz, albümünüz sizinle kalır.",
    monthly: "Standart",
    yearly: "Kurumsal",
    popular: "En çok tercih edilen",
    cta: "Paketi seç",
    plans: [
      {
        name: "Essential",
        price: "₺1.490",
        note: "tek seferlik",
        desc: "Sade ve zarif bir başlangıç.",
        features: [
          "1 dijital davetiye",
          "RSVP yönetimi",
          "300 fotoğraf yükleme",
          "3 premium tema",
          "E-posta desteği",
        ],
      },
      {
        name: "Signature",
        price: "₺2.890",
        note: "tek seferlik",
        desc: "Çiftlerin %70'inin seçimi.",
        features: [
          "Sınırsız davetiye gönderimi",
          "Gelişmiş RSVP ve menü tercihi",
          "Sınırsız fotoğraf + video",
          "Tüm premium temalar",
          "AI albüm seçkisi",
          "Özel alan adı",
        ],
      },
      {
        name: "Atelier",
        price: "₺6.900",
        note: "tek seferlik",
        desc: "Organizatörler ve mekânlar için.",
        features: [
          "Signature'daki her şey",
          "Çoklu etkinlik yönetimi",
          "Marka ve logo özelleştirme",
          "Özel tema tasarımı",
          "Öncelikli destek hattı",
        ],
      },
    ],
  },
  testimonials: {
    eyebrow: "Çiftler Ne Diyor",
    title: "Anılar kaybolmadı, arttı",
    items: [
      {
        quote:
          "Fotoğrafçının albümü bir ay sonra geldi. MemoryWedding'de ise gecenin sonunda 800 kare bizi bekliyordu.",
        name: "Elif & Kaan",
        role: "İstanbul, 2025",
      },
      {
        quote:
          "RSVP'yi kayınvalidem bile üç dokunuşta tamamladı. Masa planını iki günde bitirdik.",
        name: "Zeynep & Mert",
        role: "İzmir, 2025",
      },
      {
        quote:
          "Davetiye açıldığında misafirlerin tepkisini gördüm. Gerçekten bir ürün gibi hissettiriyor.",
        name: "Selin & Arda",
        role: "Bodrum, 2024",
      },
      {
        quote:
          "Mekân olarak üç düğünde kullandık. Çiftler artık bunu bizden talep ediyor.",
        name: "Villa Reyhan",
        role: "Etkinlik mekânı",
      },
    ],
  },
  faq: {
    eyebrow: "SSS",
    title: "Merak edilenler",
    items: [
      {
        q: "Misafirlerimin uygulama indirmesi gerekiyor mu?",
        a: "Hayır. QR kod okutulduğunda tarayıcı açılır ve yükleme doğrudan başlar. Üyelik veya kurulum gerekmez.",
      },
      {
        q: "Fotoğraflar ne kadar süre saklanıyor?",
        a: "Signature ve Atelier paketlerinde albümünüz süresiz saklanır. Essential pakette 12 ay boyunca erişim sağlanır; dilediğiniz an tam çözünürlükte indirebilirsiniz.",
      },
      {
        q: "Davetiyeyi kendim düzenleyebilir miyim?",
        a: "Evet. Panelden metinleri, renkleri, fotoğrafları ve program akışını düzenlersiniz; değişiklikler anında yayına alınır.",
      },
      {
        q: "Uygunsuz bir fotoğraf yüklenirse ne olur?",
        a: "Moderasyon modunu açtığınızda her yükleme önce onayınıza düşer. Ayrıca yayındaki her kareyi tek tıkla kaldırabilirsiniz.",
      },
      {
        q: "Yurt dışındaki misafirler için İngilizce seçeneği var mı?",
        a: "Evet. Davetiyeniz çift dilli yayınlanabilir; misafir tarayıcı diline göre otomatik yönlendirilir.",
      },
      {
        q: "Ödeme sonrası iade mümkün mü?",
        a: "Düğün tarihinize 14 günden fazla varsa koşulsuz iade yapıyoruz. Tek yapmanız gereken destek ekibine yazmak.",
      },
    ],
  },
  cta: {
    title: "Büyük gününüz hak ettiği dijital deneyimi bekliyor",
    subtitle: "Bugün başlayın, davetiyenizi dakikalar içinde paylaşın.",
    primary: "Ücretsiz Başla",
    secondary: "Bizimle görüşün",
  },
  footer: {
    tagline: "Düğününüzün her anını toplayan premium dijital deneyim platformu.",
    columns: [
      {
        title: "Ürün",
        links: ["Özellikler", "Temalar", "QR Sistemi", "Paketler"],
      },
      {
        title: "Kaynaklar",
        links: ["Blog", "Yardım Merkezi", "Örnek Davetiyeler", "İletişim"],
      },
      {
        title: "Kurumsal",
        links: ["Hakkımızda", "Gizlilik", "Kullanım Şartları", "KVKK"],
      },
    ],
    rights: "Tüm hakları saklıdır.",
    madeWith: "Sevgiyle tasarlandı.",
  },
};

export const en: Content = {
  nav: {
    links: [
      { id: "ozellikler", label: "Features" },
      { id: "nasil-calisir", label: "How it works" },
      { id: "temalar", label: "Themes" },
      { id: "qr", label: "QR system" },
      { id: "davetiye", label: "Invitation" },
      { id: "paketler", label: "Pricing" },
      { id: "sss", label: "FAQ" },
    ],
    login: "Sign in",
    cta: "Start free",
    menu: "Open menu",
    close: "Close menu",
  },
  hero: {
    badge: "New · AI-powered memory album",
    title: ["Every moment", "of your wedding,", "in one place."],
    subtitle:
      "Digital invitations, RSVP, QR photo and video collection, event management and premium themes. MemoryWedding turns your big day into a flawless digital experience in minutes.",
    primary: "Create your invitation",
    secondary: "See the demo",
    stats: [
      { value: "12,400+", label: "Memories collected" },
      { value: "98%", label: "RSVP response rate" },
      { value: "3 min", label: "Setup time" },
    ],
    caption: "Guests scan the QR, memories land in your live feed.",
  },
  features: {
    eyebrow: "Platform",
    title: "Everything a wedding needs, in one panel",
    subtitle:
      "No more scattered group chats, lost photos and paper lists — just one premium system.",
    items: [
      {
        title: "Digital invitation",
        desc: "A cinematic, mobile-first invitation page on your own domain.",
      },
      {
        title: "QR memory collection",
        desc: "Collect photos and videos from guests with a single QR — no app install.",
      },
      {
        title: "Smart RSVP",
        desc: "Track attendance, plus-ones and menu preferences in real time.",
      },
      {
        title: "Event management",
        desc: "Henna night, ceremony, after party — multi-event schedule with directions.",
      },
      {
        title: "Premium theme system",
        desc: "Art-directed themes with typography and color harmony built in.",
      },
      {
        title: "AI-powered features",
        desc: "Copy suggestions, automatic album curation and face-based photo sorting.",
      },
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "Ready in three steps",
    subtitle: "No technical skills required. Three minutes from setup to sharing.",
    steps: [
      {
        step: "01",
        title: "Pick your theme",
        desc: "Choose a theme, add your names and date. The preview comes alive instantly.",
      },
      {
        step: "02",
        title: "Share your invitation",
        desc: "Send the link, place QR cards on the tables. RSVPs start flowing right away.",
      },
      {
        step: "03",
        title: "Collect the memories",
        desc: "Guests upload shots, you watch the live gallery and download the full album in one click.",
      },
    ],
  },
  themes: {
    eyebrow: "Theme gallery",
    title: "Art direction, not templates",
    subtitle: "Every theme is designed with its own typography, color and motion language.",
    items: [
      { name: "Midnight Bloom", tag: "Cinematic" },
      { name: "Blush Atelier", tag: "Romantic" },
      { name: "Garden Lumière", tag: "Garden" },
      { name: "Noir Or", tag: "Minimal luxury" },
    ],
    cta: "View all themes",
  },
  qr: {
    eyebrow: "QR system",
    title: "Your wedding through your guests' eyes",
    subtitle:
      "Guests scan the card on the table, the browser opens and uploading begins. No app, no sign-up, no friction.",
    points: [
      "Unlimited guest uploads from a single QR code",
      "4K video and original-quality photo support",
      "Moderation: approve before anything goes live",
      "Download the entire album as a ZIP afterwards",
    ],
    live: "Live feed",
    uploads: "new uploads",
  },
  invitation: {
    eyebrow: "Digital invitation",
    title: "An experience that replaces paper",
    subtitle:
      "Opening animation, countdown, your story, schedule, location and RSVP — all on one page.",
    features: [
      { title: "Cinematic intro", desc: "An elegant curtain animation on first open." },
      { title: "Live countdown", desc: "Every second until the big day." },
      { title: "Directions", desc: "Maps and travel guidance in one tap." },
      { title: "Gift preferences", desc: "Bank details or gift registry integration." },
    ],
    preview: { save: "Save the date", names: "Elif & Kaan", date: "June 14, 2026", rsvp: "I'm coming" },
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pay once, keep the memories forever",
    subtitle: "No subscriptions. Pay once for your wedding, your album stays yours.",
    monthly: "Standard",
    yearly: "Enterprise",
    popular: "Most popular",
    cta: "Choose plan",
    plans: [
      {
        name: "Essential",
        price: "$59",
        note: "one-time",
        desc: "A simple, elegant start.",
        features: [
          "1 digital invitation",
          "RSVP management",
          "300 photo uploads",
          "3 premium themes",
          "Email support",
        ],
      },
      {
        name: "Signature",
        price: "$119",
        note: "one-time",
        desc: "Chosen by 70% of couples.",
        features: [
          "Unlimited invitation sends",
          "Advanced RSVP and menu options",
          "Unlimited photos + video",
          "All premium themes",
          "AI album curation",
          "Custom domain",
        ],
      },
      {
        name: "Atelier",
        price: "$279",
        note: "one-time",
        desc: "For planners and venues.",
        features: [
          "Everything in Signature",
          "Multi-event management",
          "Brand and logo customization",
          "Bespoke theme design",
          "Priority support line",
        ],
      },
    ],
  },
  testimonials: {
    eyebrow: "What couples say",
    title: "Memories multiplied, not lost",
    items: [
      {
        quote:
          "The photographer's album arrived a month later. On MemoryWedding, 800 shots were waiting for us by the end of the night.",
        name: "Elif & Kaan",
        role: "Istanbul, 2025",
      },
      {
        quote: "Even my mother-in-law completed the RSVP in three taps. Seating plan done in two days.",
        name: "Zeynep & Mert",
        role: "Izmir, 2025",
      },
      {
        quote: "I saw the guests' reaction when the invitation opened. It genuinely feels like a product.",
        name: "Selin & Arda",
        role: "Bodrum, 2024",
      },
      {
        quote: "We've used it at three weddings as a venue. Couples now ask us for it.",
        name: "Villa Reyhan",
        role: "Event venue",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common questions",
    items: [
      {
        q: "Do my guests need to install an app?",
        a: "No. Scanning the QR opens the browser and uploading starts immediately. No sign-up or installation required.",
      },
      {
        q: "How long are the photos stored?",
        a: "Signature and Atelier keep your album indefinitely. Essential includes 12 months of access, and you can download everything in full resolution any time.",
      },
      {
        q: "Can I edit the invitation myself?",
        a: "Yes. Edit text, colors, photos and the schedule from the panel — changes go live instantly.",
      },
      {
        q: "What if someone uploads an inappropriate photo?",
        a: "With moderation enabled, every upload waits for your approval. You can also remove any published shot in one click.",
      },
      {
        q: "Is there an English option for international guests?",
        a: "Yes. Your invitation can be published bilingually and guests are routed automatically by browser language.",
      },
      {
        q: "Can I get a refund after payment?",
        a: "If your wedding is more than 14 days away, we refund unconditionally. Just message our support team.",
      },
    ],
  },
  cta: {
    title: "Your big day deserves the digital experience it's owed",
    subtitle: "Start today and share your invitation within minutes.",
    primary: "Start free",
    secondary: "Talk to us",
  },
  footer: {
    tagline: "The premium digital platform that collects every moment of your wedding.",
    columns: [
      { title: "Product", links: ["Features", "Themes", "QR system", "Pricing"] },
      { title: "Resources", links: ["Blog", "Help center", "Sample invitations", "Contact"] },
      { title: "Company", links: ["About", "Privacy", "Terms", "Data policy"] },
    ],
    rights: "All rights reserved.",
    madeWith: "Designed with love.",
  },
};

export const content: Record<"tr" | "en", Content> = { tr, en };
