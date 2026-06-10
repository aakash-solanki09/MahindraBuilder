import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Loader2, Play as VideoIcon, AlertCircle } from 'lucide-react';
import api, { API_URL } from '../../lib/api';
import { cn } from '../../lib/utils';

interface VideoUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const VideoUploadInput: React.FC<VideoUploadInputProps> = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "Enter video URL (YouTube) or upload...",
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoError, setVideoError] = useState(false);

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
    setVideoError(false);
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setVideoError(false);
      const formData = new FormData();
      formData.append('video', file);

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
      setVideoError(true);
      alert('Failed to upload video. Please ensure it is under 100MB.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <VideoIcon className="w-3 h-3" />
            {label}
          </label>
        )}
        <label className="flex items-center gap-1.5 text-[9px] font-bold text-mahindra-red uppercase cursor-pointer hover:underline bg-red-50 px-2 py-0.5 rounded-full border border-red-100 transition-all hover:bg-red-100">
          {isUploading ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <Upload className="w-2.5 h-2.5" />
          )}
          {isUploading ? 'Uploading...' : 'Upload Video'}
          <input 
            type="file" 
            className="hidden" 
            accept="video/mp4,video/x-m4v,video/*" 
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
        <div className="relative mt-1 group overflow-hidden rounded-lg border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
            {videoError ? (
                <div className="flex flex-col items-center justify-center text-red-500">
                    <AlertCircle className="w-6 h-6 mb-2" />
                    <p className="text-[8px] font-bold text-center">Invalid Video URL</p>
                </div>
            ) : (value.includes('youtube.com') || value.includes('youtu.be') ? (
                <div className="text-center p-4">
                    <VideoIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-[8px] text-gray-500 font-medium">YouTube Video Linked</p>
                </div>
            ) : (
                <video 
                    src={previewUrl} 
                    className="max-h-full w-full object-cover"
                    controls
                    onError={() => {
                        setVideoError(true);
                    }}
                    onLoadedMetadata={() => {
                        setVideoError(false);
                    }}
                />
            ))}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-[7px] text-white font-bold uppercase tracking-widest pointer-events-none">
                Preview
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploadInput;
