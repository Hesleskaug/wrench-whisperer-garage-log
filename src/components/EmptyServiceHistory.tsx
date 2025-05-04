
import { FileText, Plus } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";

interface EmptyServiceHistoryProps {
  onAddService?: () => void;
}

const EmptyServiceHistory = ({ onAddService }: EmptyServiceHistoryProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center p-8 bg-mechanic-silver/20 rounded-md flex flex-col items-center">
      <FileText size={48} className="text-mechanic-gray/40 mb-4" />
      <h3 className="text-xl font-medium text-mechanic-gray mb-2">{t('noServiceRecords')}</h3>
      <p className="text-mechanic-gray/80 mb-6 max-w-md">
        {t('startLogging')}
      </p>
      
      {onAddService && (
        <Button 
          onClick={onAddService}
          className="bg-mechanic-blue hover:bg-mechanic-blue/90"
        >
          <Plus size={16} className="mr-1" /> {t('logService')}
        </Button>
      )}
    </div>
  );
};

export default EmptyServiceHistory;
