const { createClient } = require('@supabase/supabase-js');
try {
  createClient('"https://abc.supabase.co"', 'abc');
  console.log('success');
} catch (e) {
  console.error('Error:', e.message);
}
