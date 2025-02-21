import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://apbfeiwsmsylnibwspco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwYmZlaXdzbXN5bG5pYndzcGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNDQ1MzEsImV4cCI6MjA1NTcyMDUzMX0.LKG9tEaCP6eDQOD_WWAF7khNdp4b85MrC53fdPrtMUg'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
