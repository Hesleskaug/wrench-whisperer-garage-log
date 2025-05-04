
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, PlusCircle, XCircle, CheckCircle } from "lucide-react";

interface TaskImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onSetMainImage?: (imageUrl: string) => void;
  mainImage?: string;
  title?: string;
}

const TaskImageUploader = ({ 
  images, 
  onImagesChange, 
  onSetMainImage, 
  mainImage,
  title = "Images"
}: TaskImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showInput, setShowInput] = useState(false);

  const addImage = () => {
    if (!imageUrl.trim()) return;
    
    onImagesChange([...images, imageUrl]);
    setImageUrl('');
    setShowInput(false);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Image ${index + 1}`}
                className={`w-20 h-20 object-cover rounded border-2 ${mainImage === url ? 'border-mechanic-blue' : 'border-transparent hover:border-gray-300'}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e2e8f0/64748b?text=Error';
                }}
                onClick={() => onSetMainImage && onSetMainImage(url)}
              />
              {onSetMainImage && mainImage === url && (
                <div className="absolute top-1 left-1 bg-mechanic-blue rounded-full p-0.5">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle size={20} />
              </button>
              {onSetMainImage && mainImage === url && (
                <span className="absolute bottom-0 left-0 right-0 bg-mechanic-blue bg-opacity-80 text-white text-[8px] text-center py-0.5">
                  Main Image
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showInput ? (
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addImage}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setImageUrl('');
              setShowInput(false);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowInput(true)}
        >
          <PlusCircle size={16} />
          <ImageIcon size={16} />
          Add Image URL
        </Button>
      )}
    </div>
  );
};

export default TaskImageUploader;
