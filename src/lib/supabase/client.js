import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mrumgzqlkiiekcotujqy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydW1nenFsa2lpZWtjb3R1anF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDE1MjUsImV4cCI6MjA4NDcxNzUyNX0.CY0aPGWQxccXg9QAVZvoL-mf27PG9hyalbvFS4rL2s8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})


