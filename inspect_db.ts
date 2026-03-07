
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rxqtmxypndalebtvhlfg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cXRteHlwbmRhbGVidHZobGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwMzIsImV4cCI6MjA4NzAxMDAzMn0.AyZqcT5tnrJZlHOGdScJ8RG_mw242IesOhrNBEU_-FE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
  console.log("Fetching one session to inspect keys...");
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    if (data && data.length > 0) {
      console.log("Keys found:", Object.keys(data[0]));
    } else {
      console.log("No sessions found, cannot inspect keys.");
      // Try inserting a dummy to see what fails? No, that's risky.
    }
  }
}

inspect();
