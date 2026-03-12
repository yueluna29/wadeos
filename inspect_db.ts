
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rxqtmxypndalebtvhlfg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cXRteHlwbmRhbGVidHZobGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwMzIsImV4cCI6MjA4NzAxMDAzMn0.AyZqcT5tnrJZlHOGdScJ8RG_mw242IesOhrNBEU_-FE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
  console.log("Fetching tables...");
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1);
    
  // Let's try to insert a dummy row into a new table or something? No, we can't.
}

inspect();
