
import { FileText } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

const EmptyServiceHistory = () => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center p-6 bg-mechanic-silver/20 rounded-md">
      <FileText size={40} className="mx-auto text-mechanic-gray/40 mb-2" />
      <h3 className="text-lg font-medium text-mechanic-gray">{t('noServiceRecords')}</h3>
      <p className="text-mechanic-gray/80 mt-1">
        {t('startLogging')}
      </p>
    </div>
  );
};

export default EmptyServiceHistory;
