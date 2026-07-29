require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const themes = [
  {
    theme_id: "midnight",
    name: "Midnight Bloom",
    is_active: true,
    config: {
      thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"
    }
  },
  {
    theme_id: "blush",
    name: "Blush Atelier",
    is_active: true,
    config: {
      thumbnailUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop"
    }
  },
  {
    theme_id: "garden",
    name: "Garden Lumière",
    is_active: true,
    config: {
      thumbnailUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"
    }
  },
  {
    theme_id: "noir",
    name: "Noir Elegance",
    is_active: true,
    config: {
      thumbnailUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop"
    }
  },
  {
    theme_id: "beach",
    name: "Ocean Breeze",
    is_active: true,
    config: {
      thumbnailUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop"
    }
  }
];

async function run() {
  console.log("Deleting old themes...");
  await sb.from('themes').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  
  console.log("Inserting new themes...");
  const { data, error } = await sb.from('themes').insert(themes);
  if (error) console.error("Error inserting:", error);
  else console.log("Success! Inserted 5 themes.");
}

run();
