'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabaseClient';

export default function KYCUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select an ID image first.');
      return;
    }

    try {
      setUploading(true);
      setStatus('Checking authentication session...');

      // 1. Get the current authenticated user for secure RLS storage
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setStatus('Error: You must be logged in to upload KYC documents.');
        setUploading(false);
        return;
      }

      setStatus('Compressing image on client side...');

      // Client-side image compression options
      const options = {
        maxSizeMB: 0.8, // Compress below 800KB
        maxWidthOrHeight: 1280, // Downscale large photos
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      setStatus('Uploading securely to Supabase Storage...');

      // 2. Structure path with user.id to match your RLS storage policy
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}_kyc.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('kyc-assets')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      setStatus('KYC document uploaded successfully!');
      setFile(null);
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message || 'An error occurred'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Identity Verification (KYC)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Please upload a clear photo of your government-issued ID. Images are compressed locally before upload to protect privacy and optimize storage.
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Government ID Photo
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {uploading ? 'Processing & Uploading...' : 'Submit ID Document'}
        </button>
      </form>

      {status && (
        <p className="mt-4 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded border">
          {status}
        </p>
      )}
    </div>
  );
}