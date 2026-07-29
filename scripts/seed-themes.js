import fs from 'fs';
import path from 'path';

// 10 Kategori, her birinden 5 farklı varyasyon üreterek 50 tema yapacağız.
const categories = ["Minimal", "Luxury", "Floral", "Boho", "Modern", "Vintage", "Beach", "Dark", "Classic", "Nature"];

const fonts = ["Inter", "Playfair Display", "Cinzel", "Lora", "Montserrat", "Cormorant Garamond", "Great Vibes", "Lato", "Merriweather", "Dancing Script"];
const animations = ["fade", "slide", "zoom", "bounce"];
const cardRadii = ["none", "sm", "md", "lg", "xl", "2xl", "full"];
const shadows = ["none", "sm", "md", "lg", "xl"];
const buttonVariants = ["solid", "outline", "ghost", "rounded"];

// Pexels / Unsplash (Örnek public stok linkler - prod'da değiştirilebilir)
const videos = [
  "https://cdn.pixabay.com/video/2016/09/21/5320-183786503_tiny.mp4",
  "https://cdn.pixabay.com/video/2021/08/04/83907-584732599_tiny.mp4",
  "https://cdn.pixabay.com/video/2020/05/21/40061-425251213_tiny.mp4",
  "https://cdn.pixabay.com/video/2019/11/24/29511-375990234_tiny.mp4"
];
const images = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=60"
];

const generateColor = (category, variant) => {
  if (category === "Dark") return { primary: "#EAB308", secondary: "#18181B" }; // Gold on almost black
  if (category === "Minimal") return { primary: "#333333", secondary: "#FFFFFF" }; // Black on white
  if (category === "Luxury") return { primary: "#D4AF37", secondary: "#0F0F0F" }; // Pure gold on dark
  if (category === "Floral") return { primary: "#F472B6", secondary: "#FDF2F8" }; // Pink on light pink
  if (category === "Beach") return { primary: "#0EA5E9", secondary: "#F0F9FF" }; // Blue on sky blue
  if (category === "Nature") return { primary: "#22C55E", secondary: "#F0FDF4" }; // Green on light green
  if (category === "Vintage") return { primary: "#78350F", secondary: "#FEF3C7" }; // Brown on amber
  if (category === "Boho") return { primary: "#9A3412", secondary: "#FFEDD5" }; // Orange on light orange
  
  // Rastgele pastel
  const hue = Math.floor(Math.random() * 360);
  return { primary: `hsl(${hue}, 60%, 40%)`, secondary: `hsl(${hue}, 20%, 95%)` };
};

const themes = [];

categories.forEach((cat, index) => {
  for (let i = 1; i <= 5; i++) {
    const colors = generateColor(cat, i);
    const themeId = `${cat.toLowerCase()}-${i}`;
    const font = fonts[(index + i) % fonts.length];
    
    themes.push({
      theme_id: themeId,
      name: `${cat} ${i === 1 ? 'Elegance' : i === 2 ? 'Charm' : i === 3 ? 'Breeze' : i === 4 ? 'Aura' : 'Vibe'}`,
      description: `A beautiful ${cat.toLowerCase()} theme perfect for your special day.`,
      is_active: true,
      config: {
        font: font,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        animationPreset: animations[Math.floor(Math.random() * animations.length)],
        thumbnailUrl: images[Math.floor(Math.random() * images.length)],
        coverVideoUrl: videos[Math.floor(Math.random() * videos.length)],
        backgroundUrl: images[Math.floor(Math.random() * images.length)],
        cardRadius: cardRadii[Math.floor(Math.random() * cardRadii.length)],
        shadow: shadows[Math.floor(Math.random() * shadows.length)],
        dividerStyle: ["solid", "dashed", "dotted", "floral"][Math.floor(Math.random() * 4)],
        buttonVariant: buttonVariants[Math.floor(Math.random() * buttonVariants.length)],
        typography: "default",
        iconSet: "lucide"
      }
    });
  }
});

async function seed() {
  console.log("Generating SQL for 50 themes...");
  
  let sql = `
-- Seed 50 Themes
TRUNCATE TABLE public.themes;

INSERT INTO public.themes (theme_id, name, is_active, config) VALUES
`;

  const values = themes.map(t => {
    const configJson = JSON.stringify(t.config).replace(/'/g, "''");
    return `('${t.theme_id}', '${t.name}', ${t.is_active}, '${configJson}'::jsonb)`;
  }).join(",\n");

  sql += values + ";\n";

  fs.writeFileSync(path.resolve(process.cwd(), 'seed-themes.sql'), sql, 'utf8');
  console.log("Successfully generated seed-themes.sql");
  console.log("Please run this file in your Supabase SQL Editor.");
}

seed();
