import type { ThemeCustomization } from "./theme-customization";
import type { InvitationDraft, InviteThemeId } from "./invitation";

export type DemoInvitationProfile = Pick<
  InvitationDraft,
  | "partnerOne"
  | "partnerTwo"
  | "headline"
  | "message"
  | "date"
  | "time"
  | "venue"
  | "address"
  | "city"
  | "rsvpLabel"
>;

const profiles: Partial<Record<InviteThemeId, DemoInvitationProfile>> = {
  "evergreen-vows": {
    partnerOne: "Defne",
    partnerTwo: "Aras",
    headline: "Daima yeşil, daima birlikte",
    message: "Ormanın dinginliğinde verdiğimiz sözü, sevdiklerimizle birlikte kutlamak istiyoruz.",
    date: "2026-09-19",
    time: "17:30",
    venue: "Ajia Hotel Bahçesi",
    address: "Ahmet Rasim Paşa Yalısı, Kanlıca",
    city: "İstanbul",
    rsvpLabel: "Bu güzel güne katılıyorum",
  },
  "midnight-conservatory": {
    partnerOne: "Lara",
    partnerTwo: "Mert",
    headline: "Gece çiçekleri altında",
    message: "Işıkların, müziğin ve gecenin büyüsünün arasında yeni hikâyemize sizi de bekliyoruz.",
    date: "2026-10-03",
    time: "20:00",
    venue: "Feriye Sarayı",
    address: "Çırağan Caddesi, Ortaköy",
    city: "İstanbul",
    rsvpLabel: "Geceye eşlik edeceğim",
  },
  "lueur-de-minuit": {
    partnerOne: "Alara",
    partnerTwo: "Bora",
    headline: "Minuit à deux",
    message: "Bir Paris gecesi kadar zarif, yalnızca bize ait bu başlangıçta yanımızda olun.",
    date: "2026-11-14",
    time: "19:30",
    venue: "Pera Palace",
    address: "Meşrutiyet Caddesi, Tepebaşı",
    city: "İstanbul",
    rsvpLabel: "Daveti kabul ediyorum",
  },
  "turquoise-cove": {
    partnerOne: "Duru",
    partnerTwo: "Ege",
    headline: "Mavinin kıyısında evet",
    message: "Denizin sesi ve gün batımı eşliğinde hayatımızın en güzel yolculuğuna başlıyoruz.",
    date: "2027-06-12",
    time: "18:30",
    venue: "D Maris Bay",
    address: "Datça Yolu, Hisarönü",
    city: "Muğla",
    rsvpLabel: "Kıyıda buluşalım",
  },
  "golden-sunset": {
    partnerOne: "İdil",
    partnerTwo: "Kerem",
    headline: "Gün batımında bir ömür",
    message: "Gökyüzü altına dönerken verdiğimiz söze tanıklık etmeniz bizi çok mutlu edecek.",
    date: "2027-07-03",
    time: "19:00",
    venue: "Momo Bodrum",
    address: "Türkbükü Sahili",
    city: "Muğla",
    rsvpLabel: "Gün batımına geliyorum",
  },
  "tropical-lagoon": {
    partnerOne: "Melis",
    partnerTwo: "Deniz",
    headline: "Sonsuz yazımıza davetlisiniz",
    message:
      "Palmiye gölgeleri, çıplak ayaklar ve bol kahkahayla kutlayacağımız düğünümüzde buluşalım.",
    date: "2027-05-22",
    time: "17:00",
    venue: "Kuum Beach",
    address: "Türkbükü Mahallesi",
    city: "Bodrum",
    rsvpLabel: "Yaza katılıyorum",
  },
  "moonlit-shore": {
    partnerOne: "Ceyda",
    partnerTwo: "Atlas",
    headline: "Ay ışığında buluşalım",
    message: "Ay denize vururken, yıldızların altında başlayan hikâyemizi sizinle kutlayacağız.",
    date: "2027-08-21",
    time: "20:30",
    venue: "The Stay Warehouse",
    address: "Alaçatı Port Yolu",
    city: "İzmir",
    rsvpLabel: "Ay ışığında oradayım",
  },
  "aegean-morning": {
    partnerOne: "Nehir",
    partnerTwo: "Emir",
    headline: "Ege sabahı gibi taze",
    message: "Zeytin dalları ve iyot kokusu arasında kurduğumuz sofraya sizi de bekliyoruz.",
    date: "2027-05-08",
    time: "11:30",
    venue: "Manej Urla",
    address: "Kuşçular Köyü, Urla",
    city: "İzmir",
    rsvpLabel: "Ege sofrasında yerim hazır",
  },
  "soft-sand-dunes": {
    partnerOne: "Ada",
    partnerTwo: "Rüzgar",
    headline: "Kumların üzerinde bir söz",
    message: "Sade, sıcak ve özgür bir kutlamada yollarımızın birleşmesine tanıklık edin.",
    date: "2027-09-04",
    time: "18:00",
    venue: "Patara Viewpoint",
    address: "Gelemiş Mahallesi",
    city: "Antalya",
    rsvpLabel: "Bu yolculuğa eşlik edeceğim",
  },
  "emerald-forest": {
    partnerOne: "İpek",
    partnerTwo: "Toprak",
    headline: "Doğanın kalbinde",
    message: "Çam kokusu, ateş ışığı ve en sevdiklerimizle yeni hayatımıza ilk adımı atıyoruz.",
    date: "2027-06-26",
    time: "16:30",
    venue: "Yeşil Vadi Garden",
    address: "Polonezköy Tabiat Parkı",
    city: "İstanbul",
    rsvpLabel: "Ormanda buluşalım",
  },
  "wildflower-meadow": {
    partnerOne: "Nil",
    partnerTwo: "Can",
    headline: "Kır çiçekleri arasında",
    message: "Renkli çiçekler ve uzun bir yaz sofrasıyla aşkımızı kutladığımız güne davetlisiniz.",
    date: "2027-06-05",
    time: "17:00",
    venue: "Nif Bağları",
    address: "Karaçam Köyü, Kemalpaşa",
    city: "İzmir",
    rsvpLabel: "Çiçeklerin arasında olacağım",
  },
  "alpine-mist": {
    partnerOne: "Sera",
    partnerTwo: "Doruk",
    headline: "Bulutların üstünde evet",
    message: "Dağların sessizliği ve sisin büyüsü içinde verdiğimiz söze ortak olun.",
    date: "2027-02-20",
    time: "16:00",
    venue: "Kaya Palazzo Ski Lodge",
    address: "Kartalkaya Kayak Merkezi",
    city: "Bolu",
    rsvpLabel: "Zirvede buluşuyoruz",
  },
  "amalfi-lemon-terrace": {
    partnerOne: "Mina",
    partnerTwo: "Levent",
    headline: "La dolce vita başlıyor",
    message: "Limon çiçekleri, Akdeniz güneşi ve uzun sofralarla dolu düğünümüzde buluşalım.",
    date: "2027-05-29",
    time: "18:30",
    venue: "Villa Treville",
    address: "Via Arienzo, Positano",
    city: "Amalfi",
    rsvpLabel: "İtalya’da görüşürüz",
  },
  "tuscan-golden-hills": {
    partnerOne: "Beliz",
    partnerTwo: "Eren",
    headline: "Toskana güneşinin altında",
    message: "Üzüm bağlarının arasında, gün boyu sürecek neşeli kutlamamıza davetlisiniz.",
    date: "2027-09-18",
    time: "16:30",
    venue: "Borgo Santo Pietro",
    address: "Palazzetto, Chiusdino",
    city: "Toscana",
    rsvpLabel: "Bağlarda buluşalım",
  },
  "lake-como-garden": {
    partnerOne: "Leyla",
    partnerTwo: "Alp",
    headline: "Göl kıyısında sonsuza dek",
    message: "Bahçelerin göle kavuştuğu bu zarif akşamda mutluluğumuzu sizinle paylaşacağız.",
    date: "2027-06-19",
    time: "18:00",
    venue: "Villa Balbianello",
    address: "Via Guido Monzino, Lenno",
    city: "Como",
    rsvpLabel: "Como’da yanınızdayım",
  },
  "grand-ballroom": {
    partnerOne: "Derin",
    partnerTwo: "Kuzey",
    headline: "Büyük bir gece, tek bir söz",
    message: "Işıltılı salonun kapıları, birlikte yazacağımız yeni bölüm için açılıyor.",
    date: "2027-01-23",
    time: "19:30",
    venue: "Çırağan Palace Kempinski",
    address: "Çırağan Caddesi, Beşiktaş",
    city: "İstanbul",
    rsvpLabel: "Baloya katılıyorum",
  },
  "cinematic-flow": {
    partnerOne: "Zeynep",
    partnerTwo: "Arda",
    headline: "Bizim filmimiz şimdi başlıyor",
    message: "İlk sahneden son dansa kadar bu hikâyenin en güzel karesinde siz de olun.",
    date: "2026-12-05",
    time: "19:00",
    venue: "Beykoz Kundura",
    address: "Kundura Fabrikası, Beykoz",
    city: "İstanbul",
    rsvpLabel: "Bu sahnede yerimi alıyorum",
  },
  "boho-motion": {
    partnerOne: "Güneş",
    partnerTwo: "Baran",
    headline: "Özgür ruhlar, tek hikâye",
    message: "Müzik, dans ve gün batımıyla dolu samimi festival düğünümüzde bize katılın.",
    date: "2027-07-17",
    time: "17:30",
    venue: "Babakamp Eco Ranch",
    address: "Karaağaç Yaylası",
    city: "Fethiye",
    rsvpLabel: "Festivale geliyorum",
  },
  "ethereal-light": {
    partnerOne: "Ela",
    partnerTwo: "Umut",
    headline: "Işığın içinde bir başlangıç",
    message: "Yumuşak ışıklar ve beyaz çiçeklerle çevrili masalsı günümüze davetlisiniz.",
    date: "2027-04-24",
    time: "17:00",
    venue: "Adile Sultan Sarayı",
    address: "Kandilli, Üsküdar",
    city: "İstanbul",
    rsvpLabel: "Masala katılıyorum",
  },
  "colorburst-fiesta": {
    partnerOne: "Lalin",
    partnerTwo: "Mavi",
    headline: "Aşkın bütün renkleri",
    message: "Renklerin, müziğin ve kahkahanın hiç bitmeyeceği bu neşeli günde bizimle dans edin.",
    date: "2027-07-24",
    time: "18:00",
    venue: "Casa Lavanda",
    address: "Ulupelit Köyü, Şile",
    city: "İstanbul",
    rsvpLabel: "Renkli kutlamada yerim hazır",
  },
  "silver-screen-romance": {
    partnerOne: "Nazan",
    partnerTwo: "Selim",
    headline: "Eski bir film gibi",
    message:
      "Zamanın yavaşladığı, anıların siyah beyaz bir filme dönüştüğü gecemizde yanımızda olun.",
    date: "2027-10-16",
    time: "19:30",
    venue: "Tarihi Pera Salonu",
    address: "Asmalı Mescit, Beyoğlu",
    city: "İstanbul",
    rsvpLabel: "Bu güzel karede yerimi alıyorum",
  },
  "royal-envelope": {
    partnerOne: "Azra",
    partnerTwo: "Demir",
    headline: "Kraliyet mührüyle",
    message: "Zamansız bir zarafetle hazırladığımız kutlamada şeref konuğumuz olmanızı dileriz.",
    date: "2027-03-13",
    time: "19:30",
    venue: "Esma Sultan Yalısı",
    address: "Muallim Naci Caddesi, Ortaköy",
    city: "İstanbul",
    rsvpLabel: "Daveti onurlandıracağım",
  },
};

const demoThemeCustomization: ThemeCustomization = {
  presetId: "original",
  coverStyle: "immersive",
};

const fallbackProfiles = Object.values(profiles) as DemoInvitationProfile[];

function fallbackProfile(themeId: string): DemoInvitationProfile {
  const hash = [...themeId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return fallbackProfiles[hash % fallbackProfiles.length];
}

export function getDemoInvitationProfile(themeId: string): DemoInvitationProfile {
  return profiles[themeId as InviteThemeId] ?? fallbackProfile(themeId);
}

export function getDemoInvitationDraft(themeId: string): InvitationDraft {
  const profile = getDemoInvitationProfile(themeId);
  return {
    packageId: "",
    theme: themeId as InviteThemeId,
    themeCustomization: demoThemeCustomization,
    category: "wedding",
    ...profile,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${profile.venue} ${profile.city}`,
    )}`,
    musicUrl: "",
    coverPhoto: "",
    galleryImages: [],
    slug: "demo",
    eventProgram: [
      { time: profile.time, title: "Karşılama", desc: "İlk kadehler ve hoş geldiniz müziği" },
      { time: addMinutes(profile.time, 45), title: "Tören", desc: "Birlikte yeni bir başlangıç" },
      { time: addMinutes(profile.time, 105), title: "Kutlama", desc: "Yemek, müzik ve dans" },
    ],
    ourStory: [
      { date: "2022", title: "Tanıştık", desc: "Beklenmedik bir karşılaşma hikâyemizi başlattı." },
      {
        date: "2025",
        title: "Evet dedik",
        desc: "Birlikte geçirdiğimiz yılları tek bir sözle taçlandırdık.",
      },
    ],
    familyInfo: {},
    customSections: [],
  };
}

function addMinutes(time: string, minutes: number): string {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
