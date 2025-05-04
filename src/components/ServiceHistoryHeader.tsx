
import { Button } from "@/components/ui/button";
import { Printer, Plus } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceHistoryHeaderProps {
  onPrint: () => void;
  onAddService?: () => void;
}

const ServiceHistoryHeader = ({ onPrint, onAddService }: ServiceHistoryHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">{t('serviceHistory')}</h3>
      <div className="flex gap-2">
        {onAddService && (
          <Button 
            variant="default" 
            size="sm"
            onClick={onAddService}
            className="bg-mechanic-blue hover:bg-mechanic-blue/90"
          >
            <Plus size={16} className="mr-1" />
            {t('logService')}
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPrint}
          className="text-mechanic-gray hover:text-mechanic-gray/80"
        >
          <Printer size={16} className="mr-1" />
          {t('printHistory')}
        </Button>
      </div>
    </div>
  );
};

export default ServiceHistoryHeader;
