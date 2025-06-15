
import AuthForm from "@/components/AuthForm";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Your Business Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in or create an account to get started
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
