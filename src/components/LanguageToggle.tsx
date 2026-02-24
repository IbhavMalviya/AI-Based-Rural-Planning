import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="gap-2 fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm shadow-[var(--shadow-soft)]"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "हिंदी" : "English"}
    </Button>
  );
};

export default LanguageToggle;
