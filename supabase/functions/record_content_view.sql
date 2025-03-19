
-- Function to record a content view (solves TypeScript issues by using RPC)
CREATE OR REPLACE FUNCTION public.record_content_view(p_user_id UUID, p_content_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  view_exists BOOLEAN;
BEGIN
  -- Check if the view already exists
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_views 
    WHERE user_id = p_user_id AND content_id = p_content_id
  ) INTO view_exists;
  
  IF view_exists THEN
    -- Update the viewed_at timestamp for existing view
    UPDATE public.user_views 
    SET viewed_at = NOW() 
    WHERE user_id = p_user_id AND content_id = p_content_id;
  ELSE
    -- Insert a new view record
    INSERT INTO public.user_views (user_id, content_id, viewed_at)
    VALUES (p_user_id, p_content_id, NOW());
  END IF;
  
  -- Also increment the view count in the contents table
  PERFORM increment_view_count(p_content_id);
END;
$$;
