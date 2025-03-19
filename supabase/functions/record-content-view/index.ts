import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get the request body
    const { user_id, content_id } = await req.json()
    
    if (!user_id || !content_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Check if the view already exists
    const { data: existingView, error: viewCheckError } = await supabase
      .from('user_views')
      .select('*')
      .eq('user_id', user_id)
      .eq('content_id', content_id)
      .maybeSingle()
    
    if (viewCheckError) {
      console.error('Error checking existing view:', viewCheckError)
      throw viewCheckError
    }
    
    let result
    
    // If view exists, update the timestamp
    if (existingView) {
      const { data, error } = await supabase
        .from('user_views')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existingView.id)
        .select()
      
      if (error) throw error
      result = data
    } else {
      // Otherwise, insert a new view
      const { data, error } = await supabase
        .from('user_views')
        .insert([
          { user_id, content_id }
        ])
        .select()
      
      if (error) throw error
      result = data
    }
    
    // Increment view count
    const { error: incrementError } = await supabase.rpc('increment_view_count', { content_id })
    
    if (incrementError) {
      console.error('Error incrementing view count:', incrementError)
      throw incrementError
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
