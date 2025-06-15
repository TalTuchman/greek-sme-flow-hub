
import AuthForm from "@/components/AuthForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const AuthPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.page_title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.page_subtitle")}
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
