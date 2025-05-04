
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskImageGalleryProps {
  images: string[];
}

const TaskImageGallery = ({ images }: TaskImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t } = useLanguage();

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-2">
        <div className="text-sm font-medium text-mechanic-gray mb-1 flex items-center gap-1">
          <ImageIcon size={16} /> {t('images')} ({images.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div 
              key={index}
              onClick={() => setSelectedImage(url)}
              className="w-16 h-16 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <AspectRatio ratio={1 / 1}>
                <img
                  src={url}
                  alt={`Task image ${index + 1}`}
                  className="w-full h-full object-cover rounded border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e2e8f0/64748b?text=Error';
                  }}
                />
              </AspectRatio>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="overflow-hidden rounded-md">
              <img
                src={selectedImage}
                alt="Task image"
                className="w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskImageGallery;
