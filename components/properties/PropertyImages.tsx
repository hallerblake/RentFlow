'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

type PropertyImage = {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  createdAt: string;
};

type PropertyImagesProps = {
  propertyId: string;
};

export function PropertyImages({ propertyId }: PropertyImagesProps) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [propertyId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/property-images?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        toast.error('Failed to load images');
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    await uploadImage(file, images.length === 0); // Set first image as primary
  };

  const uploadImage = async (file: File, isPrimary: boolean = false) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId);
      formData.append('isPrimary', isPrimary.toString());

      const response = await fetch('/api/property-images', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newImage = await response.json();
        setImages(prev => [...prev, newImage]);
        toast.success('Image uploaded successfully');

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/property-images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        toast.success('Image deleted successfully');
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/property-images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (response.ok) {
        const updatedImage = await response.json();
        setImages(prev =>
          prev.map(img => ({
            ...img,
            isPrimary: img.id === imageId,
          }))
        );
        toast.success('Primary image updated');
      } else {
        toast.error('Failed to set primary image');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to set primary image');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Property Images</h3>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="aspect-video bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No images uploaded yet</p>
          <p className="text-sm text-gray-400">Click "Upload Image" to add photos of this property</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(image => (
            <Card key={image.id} className="relative group overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />

                {/* Primary badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" />
                    Primary
                  </div>
                )}

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!image.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryImage(image.id)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Set as Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImage(image.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Image info */}
              <div className="p-3 bg-white border-t">
                <p className="text-sm font-medium truncate">{image.fileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(image.fileSize)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
