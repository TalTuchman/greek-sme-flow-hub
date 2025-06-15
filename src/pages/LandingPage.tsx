
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-background text-foreground">
      <header className="absolute top-0 right-0 p-4 z-10">
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-primary">{t('landing.hero_title')}</h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('landing.hero_subtitle')}
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/auth">{t('landing.get_started')}</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t('landing.features_title')}</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">{t('landing.feature_booking_title')}</h3>
              <p className="text-muted-foreground">{t('landing.feature_booking_desc')}</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">{t('landing.feature_crm_title')}</h3>
              <p className="text-muted-foreground">{t('landing.feature_crm_desc')}</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">{t('landing.feature_marketing_title')}</h3>
              <p className="text-muted-foreground">{t('landing.feature_marketing_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t('landing.pricing_title')}</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>{t('landing.pricing_free_title')}</CardTitle>
                <CardDescription>{t('landing.pricing_free_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold mb-4">{t('landing.pricing_free_price').split('/')[0]}<span className="text-lg font-normal text-muted-foreground">/{t('landing.pricing_free_price').split('/')[1]}</span></p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_free_feature1')}</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_free_feature2')}</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_free_feature3')}</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_free_feature4')}</li>
                </ul>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" variant="outline">
                    <Link to="/auth">{t('landing.pricing_free_cta')}</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex-1 flex flex-col border-primary">
              <CardHeader>
                <CardTitle>{t('landing.pricing_premium_title')}</CardTitle>
                <CardDescription>{t('landing.pricing_premium_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold mb-4">{t('landing.pricing_premium_price').split('/')[0]}<span className="text-lg font-normal text-muted-foreground">/{t('landing.pricing_premium_price').split('/')[1]}</span></p>
                <p className="text-sm text-muted-foreground mb-4">{t('landing.pricing_premium_note')}</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_premium_feature1')}</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_premium_feature2')}</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> {t('landing.pricing_premium_feature3')}</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                    <Link to="/auth">{t('landing.pricing_premium_cta')}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t bg-secondary">
        <p className="text-muted-foreground">{t('landing.footer_text')}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
