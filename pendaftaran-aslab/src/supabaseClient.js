import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yldbpegogntddcqhitpj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZGJwZWdvZ250ZGRjcWhpdHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzY3NjAsImV4cCI6MjEwNDExMjc2MH0.P68XXr9TPf4IDsKIvd0kuAT2OKBb9ik_uG6CZPiiUAs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)