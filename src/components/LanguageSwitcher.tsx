
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Flag } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const LanguageSwitcher = ({ 
  variant = "outline", 
  size = "sm",
  className = ""
}: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'no' ? 'en' : 'no';
    setLanguage(newLanguage);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      className={className}
    >
      {language === 'no' ? (
        <>
          <div className="mr-1.5 relative" style={{ width: '16px', height: '12px' }}>
            <div className="absolute inset-0 bg-[#002868]"></div>
            <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(33% 0, 45% 0, 45% 100%, 33% 100%, 33% 0, 33% 0, 0 0, 0 39%, 100% 39%, 100% 62%, 0 62%, 0 100%, 33% 100%)' }}></div>
            <div className="absolute inset-0 bg-[#BA0C2F]" style={{ clipPath: 'polygon(38% 0, 40% 0, 40% 100%, 38% 100%, 38% 0, 38% 0, 0 0, 0 44%, 100% 44%, 100% 57%, 0 57%, 0 100%, 38% 100%)' }}></div>
          </div>
          EN
        </>
      ) : (
        <>
          <div className="mr-1.5 relative" style={{ width: '16px', height: '12px' }}>
            <div className="absolute inset-0 bg-[#ed2939]"></div>
            <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 0, 33% 0, 33% 33%, 100% 33%, 100% 67%, 33% 67%, 33% 100%, 0 100%)' }}></div>
            <div className="absolute inset-0 bg-[#00209F]" style={{ clipPath: 'polygon(0 0, 25% 0, 25% 42%, 100% 42%, 100% 58%, 25% 58%, 25% 100%, 0 100%)' }}></div>
          </div>
          NO
        </>
      )}
    </Button>
  );
};

export default LanguageSwitcher;
