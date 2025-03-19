
-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION public.increment_view_count(content_id UUID)
RETURNS void
LANGUAGE SQL
AS $$
  UPDATE public.contents
  SET view_count = view_count + 1
  WHERE id = content_id;
$$;

-- 다운로드 수 증가 함수
CREATE OR REPLACE FUNCTION public.increment_download_count(content_id UUID)
RETURNS void
LANGUAGE SQL
AS $$
  UPDATE public.contents
  SET download_count = download_count + 1
  WHERE id = content_id;
$$;
