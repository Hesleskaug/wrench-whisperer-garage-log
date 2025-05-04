
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NorwegianPlateProps {
  plate: string | undefined;
  className?: string;
}

const NorwegianPlate = ({ plate, className = '' }: NorwegianPlateProps) => {
  const { t } = useLanguage();
  
  if (!plate) {
    return <div className={`bg-mechanic-silver px-3 py-1 rounded-full text-xs font-medium text-mechanic-dark ${className}`}>{t('noPlate')}</div>;
  }

  // Format the plate - Norwegian plates typically have 2 letters followed by 5 digits or numbers
  const formattedPlate = plate.toUpperCase();

  return (
    <div className={`flex items-stretch overflow-hidden rounded-md shadow-sm ${className}`} style={{ height: '28px' }}>
      {/* Blue section with flag and 'N' */}
      <div className="bg-[#002868] text-white flex flex-col items-center justify-between px-1.5" style={{ width: '30px' }}>
        {/* Norwegian flag */}
        <div className="relative mt-1" style={{ width: '18px', height: '12px' }}>
          <div className="absolute inset-0 bg-[#EF2B2D]"></div>
          <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(33% 0, 45% 0, 45% 100%, 33% 100%, 33% 0, 33% 0, 0 0, 0 39%, 100% 39%, 100% 62%, 0 62%, 0 100%, 33% 100%)' }}></div>
          <div className="absolute inset-0 bg-[#002868]" style={{ clipPath: 'polygon(38% 0, 40% 0, 40% 100%, 38% 100%, 38% 0, 38% 0, 0 0, 0 44%, 100% 44%, 100% 57%, 0 57%, 0 100%, 38% 100%)' }}></div>
        </div>
        {/* Country letter */}
        <div className="text-[10px] font-bold leading-none mb-1">N</div>
      </div>
      
      {/* White section with plate number */}
      <div className="bg-white border-y border-r border-gray-300 flex items-center justify-center px-3 py-0.5 flex-grow">
        <span className="text-black font-sans font-bold tracking-wider text-base">{formattedPlate}</span>
      </div>
    </div>
  );
};

export default NorwegianPlate;
