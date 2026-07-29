import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.VITE_SUPABASE_URL 
  ? process.env.VITE_SUPABASE_URL.replace('http://127.0.0.1:54321', 'postgresql://postgres:postgres@127.0.0.1:54322/postgres')
  : 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'; // local fallback

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const sql = fs.readFileSync('C:/Users/misafir/.gemini/antigravity/brain/560d4386-c6e5-491e-8d0b-a89560705604/create_guest_uploads.sql', 'utf8');
    await client.query(sql);
    console.log('SQL executed successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
