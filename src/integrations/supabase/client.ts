// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wrmydznwdopgcpbxdojg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybXlkem53ZG9wZ2NwYnhkb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTM3NjksImV4cCI6MjA1Nzk2OTc2OX0.JVfGLag-BUod4bN4LWQqa8pa4ffHBJkEuL_WVFOExQY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);