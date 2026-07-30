-- Keep the database table as guest_uploads, but standardize the Storage bucket as guest-uploads.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('guest-uploads', 'guest-uploads', true, 104857600)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 104857600;

DROP POLICY IF EXISTS guest_upload_storage_insert ON storage.objects;
DROP POLICY IF EXISTS guest_upload_storage_owner_delete ON storage.objects;
DROP POLICY IF EXISTS guest_upload_storage_read ON storage.objects;

CREATE POLICY guest_upload_storage_read
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'guest-uploads'
  AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id::text = (storage.foldername(name))[1]
      AND (i.is_published OR i.user_id = auth.uid())
  )
);

CREATE POLICY guest_upload_storage_insert
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'guest-uploads'
  AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id::text = (storage.foldername(name))[1] AND i.is_published
  )
);

CREATE POLICY guest_upload_storage_owner_delete
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'guest-uploads'
  AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id::text = (storage.foldername(name))[1] AND i.user_id = auth.uid()
  )
);
