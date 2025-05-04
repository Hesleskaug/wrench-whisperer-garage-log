
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, PlusCircle, XCircle, CheckCircle, Upload, Link, Receipt } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onSetMainImage?: (imageUrl: string) => void;
  mainImage?: string;
  title?: string;
  isReceiptMode?: boolean;
  onReceiptDataChange?: (data: { note: string; websiteUrl: string }) => void;
  initialReceiptData?: { note: string; websiteUrl: string };
}

const TaskImageUploader = ({ 
  images, 
  onImagesChange, 
  onSetMainImage, 
  mainImage,
  title = "Images",
  isReceiptMode = false,
  onReceiptDataChange,
  initialReceiptData = { note: '', websiteUrl: '' }
}: TaskImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [receiptNote, setReceiptNote] = useState(initialReceiptData.note);
  const [websiteUrl, setWebsiteUrl] = useState(initialReceiptData.websiteUrl);
  const { t } = useLanguage();

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          onImagesChange([...images, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
    setShowUploader(false);
  };

  // Update receipt data whenever it changes
  const updateReceiptData = () => {
    if (onReceiptDataChange) {
      onReceiptDataChange({
        note: receiptNote,
        websiteUrl: websiteUrl
      });
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">
        {isReceiptMode ? (
          <div className="flex items-center gap-1">
            <Receipt size={16} />
            <span>Receipt {title}</span>
          </div>
        ) : (
          title
        )}
      </h4>
      
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
                  {t('mainImage')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowUploader(!showUploader)}
        >
          <Upload size={16} />
          {t('uploadImage')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowInput(!showInput)}
        >
          <PlusCircle size={16} />
          <ImageIcon size={16} />
          {t('addImageUrl')}
        </Button>
      </div>
      
      {showUploader && (
        <div className="mt-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
        </div>
      )}
      
      {showInput && (
        <div className="flex gap-2 items-center mt-2">
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
            {t('add')}
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
            {t('cancel')}
          </Button>
        </div>
      )}

      {/* Receipt additional fields */}
      {isReceiptMode && (
        <div className="space-y-3 pt-2 border-t border-gray-200 mt-3">
          <div>
            <Label htmlFor="receiptNote" className="text-sm">Receipt Note</Label>
            <Textarea
              id="receiptNote"
              placeholder="Add notes about this receipt..."
              value={receiptNote}
              onChange={(e) => {
                setReceiptNote(e.target.value);
                updateReceiptData();
              }}
              className="resize-none mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="websiteUrl" className="text-sm flex items-center gap-1">
              <Link size={14} />
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              placeholder="https://store.example.com/receipt/123"
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value);
                updateReceiptData();
              }}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskImageUploader;
