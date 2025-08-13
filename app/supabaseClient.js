import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdsburauvizlpxpbzjos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkc2J1cmF1dml6bHB4cGJ6am9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NzUzMTIsImV4cCI6MjA3MDU1MTMxMn0.APC7hTZgiOmtiy_PCbDrZCFkCCy7cX_fggjhApmfxGY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
