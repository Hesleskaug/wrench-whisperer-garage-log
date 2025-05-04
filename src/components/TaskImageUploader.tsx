
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, PlusCircle, XCircle } from "lucide-react";

interface TaskImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const TaskImageUploader = ({ images, onImagesChange }: TaskImageUploaderProps) => {
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
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Task image ${index + 1}`}
                className="w-20 h-20 object-cover rounded border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e2e8f0/64748b?text=Error';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle size={20} />
              </button>
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
          Add Image
        </Button>
      )}
    </div>
  );
};

export default TaskImageUploader;
