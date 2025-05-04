
import React from 'react';

interface NorwegianPlateProps {
  plate: string | undefined;
  className?: string;
}

const NorwegianPlate = ({ plate, className = '' }: NorwegianPlateProps) => {
  if (!plate) {
    return <div className={`bg-mechanic-silver px-3 py-1 rounded-full text-xs font-medium text-mechanic-dark ${className}`}>No Plate</div>;
  }

  // Format the plate - Norwegian plates typically have 2 letters followed by 5 digits or numbers
  const formattedPlate = plate.toUpperCase();

  return (
    <div className={`flex items-stretch overflow-hidden rounded-sm ${className}`} style={{ height: '24px' }}>
      {/* Blue section with flag and 'N' */}
      <div className="bg-[#002868] text-white flex flex-col items-center justify-between px-1 py-0.5" style={{ minWidth: '20px' }}>
        {/* Norwegian flag */}
        <div className="relative" style={{ width: '14px', height: '8px' }}>
          <div className="absolute inset-0 bg-[#EF2B2D]"></div>
          <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(33% 0, 45% 0, 45% 100%, 33% 100%, 33% 0, 33% 0, 0 0, 0 39%, 100% 39%, 100% 62%, 0 62%, 0 100%, 33% 100%)' }}></div>
          <div className="absolute inset-0 bg-[#002868]" style={{ clipPath: 'polygon(38% 0, 40% 0, 40% 100%, 38% 100%, 38% 0, 38% 0, 0 0, 0 44%, 100% 44%, 100% 57%, 0 57%, 0 100%, 38% 100%)' }}></div>
        </div>
        {/* Country letter */}
        <div className="text-[8px] font-semibold leading-none mt-0.5">N</div>
      </div>
      
      {/* White section with plate number */}
      <div className="bg-white border border-[#d0d0d0] flex items-center justify-center px-2 py-0.5 flex-grow">
        <span className="text-black font-mono font-bold tracking-wider text-sm">{formattedPlate}</span>
      </div>
    </div>
  );
};

export default NorwegianPlate;
