
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceHistoryHeaderProps {
  onPrint: () => void;
}

const ServiceHistoryHeader = ({ onPrint }: ServiceHistoryHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">{t('serviceHistory')}</h3>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onPrint}
        className="text-mechanic-blue hover:text-mechanic-blue/80"
      >
        <Printer size={16} className="mr-1" />
        {t('printHistory')}
      </Button>
    </div>
  );
};

export default ServiceHistoryHeader;
