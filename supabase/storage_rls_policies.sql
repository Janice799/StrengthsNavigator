-- Supabase Storage RLS 정책 추가
-- coach-profiles 버킷에 업로드 허용 정책

-- 1. 로그인한 사용자가 자신의 폴더에 업로드 허용
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'coach-profiles' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 로그인한 사용자가 자신의 이미지 수정 허용
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'coach-profiles' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 모든 사용자가 프로필 이미지 조회 허용 (Public)
CREATE POLICY "Anyone can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'coach-profiles');

-- 4. 로그인한 사용자가 자신의 이미지 삭제 허용
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'coach-profiles' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
