
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('el') ? 'en' : 'el';
        i18n.changeLanguage(newLang);
    };

    return (
        <Button onClick={toggleLanguage} variant="outline" size="icon">
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Change language</span>
        </Button>
    );
};
