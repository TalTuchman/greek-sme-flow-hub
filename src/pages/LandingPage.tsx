
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-primary">All-in-One Business Management</h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your bookings, customer relationships, and marketing campaigns with our powerful and intuitive platform.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/auth">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Features to Grow Your Business</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Smart Booking System</h3>
              <p className="text-muted-foreground">Manage appointments with ease. Our smart calendar syncs with your staff and services.</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Customer Management</h3>
              <p className="text-muted-foreground">Keep track of your clients, their history, and preferences in one place.</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Marketing Campaigns</h3>
              <p className="text-muted-foreground">Launch targeted email and SMS campaigns to engage your customers and boost sales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Get started with all features, on us.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold mb-4">€0<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> All Features Included</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> Unlimited Staff Members</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> Unlimited Customers</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> 3-Month Full Access</li>
                </ul>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" variant="outline">
                    <Link to="/auth">Start 3-Month Trial</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex-1 flex flex-col border-primary">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For growing businesses that need more.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold mb-4">€49<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground mb-4">(Billed after 3-month free trial)</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> Everything in Free Trial</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> Priority Support</li>
                  <li className="flex items-center"><Check className="text-green-500 mr-2" /> Advanced Analytics</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                    <Link to="/auth">Go Premium</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t bg-secondary">
        <p className="text-muted-foreground">&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
