-- ============================================================
-- BienPropre — Supabase Storage: tshirt-custom-images bucket
-- ============================================================
-- Run this AFTER creating the bucket "tshirt-custom-images"
-- via the Supabase Dashboard (Storage → New bucket → public: true)
-- OR via CLI: supabase storage create tshirt-custom-images --public
-- ============================================================

-- Allow any user (authenticated or anonymous) to upload images.
-- Files land in a path scoped by the user's session or a random uuid.
create policy "storage: anyone can upload custom images"
  on storage.objects for insert
  to public
  with check (bucket_id = 'tshirt-custom-images');

-- Allow anyone to read / download images (bucket is public).
create policy "storage: anyone can read custom images"
  on storage.objects for select
  to public
  using (bucket_id = 'tshirt-custom-images');

-- Explicitly deny UPDATE on uploaded objects.
create policy "storage: deny update on custom images"
  on storage.objects for update
  to public
  using (false);

-- Explicitly deny DELETE on uploaded objects.
-- Cleanup is handled by a scheduled Edge Function with service-role key.
create policy "storage: deny delete on custom images"
  on storage.objects for delete
  to public
  using (false);
