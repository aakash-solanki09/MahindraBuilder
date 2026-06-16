import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle } from 'lucide-react';
import api, { API_URL } from '../../lib/api';
import { cn } from '../../lib/utils';

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "Enter image URL or upload...",
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Convert relative URLs to absolute URLs for proper loading
  const getAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      // Extract backend base URL (remove /api from end)
      const backendUrl = API_URL.replace('/api', '');
      return `${backendUrl}${url}`;
    }
    return url;
  };

  // Update preview when value changes
  useEffect(() => {
    const absoluteUrl = getAbsoluteUrl(value);
    setPreviewUrl(absoluteUrl);
    setImageError(false);
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setImageError(false);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Add a cache buster timestamp so the preview updates instantly
      const urlWithCacheBuster = `${res.data.url}?t=${Date.now()}`;
      onChange(urlWithCacheBuster);
      // Immediately show preview without waiting for parent to save
      const absoluteUrl = getAbsoluteUrl(urlWithCacheBuster);
      setPreviewUrl(absoluteUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setImageError(true);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3" />
            {label}
          </label>
        )}
        <label className="flex items-center gap-1.5 text-[9px] font-bold text-mahindra-red uppercase cursor-pointer hover:underline bg-red-50 px-2 py-0.5 rounded-full border border-red-100 transition-all hover:bg-red-100">
          {isUploading ? (
            <img src="/mahindra-loader-new.gif" alt="" className="w-3 h-3" />
          ) : (
            <Upload className="w-2.5 h-2.5" />
          )}
          {isUploading ? 'Uploading...' : 'Upload File'}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={isUploading} 
          />
        </label>
      </div>
      
      <div className="relative group">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mahindra-red transition-colors">
          <LinkIcon className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-[10px] border border-gray-200 rounded-xl focus:border-mahindra-red focus:ring-1 focus:ring-mahindra-red/20 outline-none bg-white transition-all shadow-sm"
        />
      </div>

      {(previewUrl || value) && !isUploading && (
        <div className="relative mt-1 group overflow-hidden rounded-lg border border-gray-100 bg-gray-50 h-16 flex items-center justify-center">
            {imageError || !previewUrl ? (
                <div className="flex flex-col items-center justify-center text-red-500 p-2">
                    <AlertCircle className="w-4 h-4 mb-1" />
                    <p className="text-[7px] font-bold text-center">Invalid URL</p>
                </div>
            ) : (
                <>
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-full object-contain"
                        onError={() => {
                            setImageError(true);
                        }}
                        onLoad={() => {
                            setImageError(false);
                        }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-[8px] text-white font-bold uppercase tracking-widest">Current Preview</p>
                    </div>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadInput;
