import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '@/providers/LanguageProvider';

const languages = [
  {
    code: 'en-US',
    name: 'English (United States)',
    flag: '🇺🇸',
    flagUrl: 'https://flagcdn.com/w20/us.png'
  },
  {
    code: 'ar-SA',
    name: 'العربية (المملكة العربية السعودية)',
    flag: '🇸🇦',
    flagUrl: 'https://flagcdn.com/w20/sa.png'
  }
];

export const LanguageSwitcher = ({ className }: {className?: string}) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  // Language change now only updates cookies, no URL navigation needed
  const handleLanguageChange = (newLang: string) => {
    changeLanguage(newLang);
  };

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[280px] ${className}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <img 
              src={currentLang?.flagUrl} 
              alt={currentLang?.name}
              className="w-5 h-auto"
            />
            <span className="truncate">{currentLang?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <img 
                src={language.flagUrl} 
                alt={language.name}
                className="w-5 h-auto"
              />
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};