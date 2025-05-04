
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

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
      {language === 'no' ? 'EN' : 'NO'}
    </Button>
  );
};

export default LanguageSwitcher;
