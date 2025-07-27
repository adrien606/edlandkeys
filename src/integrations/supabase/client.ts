import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mahjfnprbxykxwoxzdav.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1haGpmbnByYnh5a3h3b3h6ZGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjgzNTYsImV4cCI6MjA2OTE0NDM1Nn0.rRxFne-ia-5GnZUEZtie9w5OC000CmynQQEEJUF42TQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)