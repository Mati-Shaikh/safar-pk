import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function CustomerTerms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Customer Terms & Conditions
            </CardTitle>
            <p className="text-center text-gray-500 text-sm mt-2">
              Last Updated: December 28, 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By creating an account and using Safar.pk services, you agree to be bound by these
                Terms and Conditions. If you do not agree to these terms, please do not use our
                services.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. User Account</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                When you create an account with us, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Booking and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                All bookings made through Safar.pk are subject to:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Availability of hotels, vehicles, and other services at the time of booking</li>
                <li>Payment terms as displayed during the booking process</li>
                <li>Seasonal pricing that may vary based on demand and availability</li>
                <li>Cancellation policies specific to each service provider</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Pricing</h2>
              <p className="text-gray-700 leading-relaxed">
                Prices displayed on Safar.pk are subject to change without notice. We use dynamic
                pricing that may vary based on season (off-season, on-season), booking timing
                (last-minute discounts), and availability. The final price will be confirmed at the
                time of booking.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Cancellation and Refunds</h2>
              <p className="text-gray-700 leading-relaxed">
                Cancellation and refund policies vary by service provider. Please review the
                specific cancellation policy for each booking before confirming your reservation.
                Refunds, if applicable, will be processed according to the provider's policy.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any harmful or malicious code</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Safar.pk acts as an intermediary platform connecting customers with service
                providers. We are not responsible for the quality, safety, or legality of the
                services provided by third-party vendors. Our liability is limited to the maximum
                extent permitted by law.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">8. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of Safar.pk is also governed by our Privacy Policy. We collect and use
                your personal information in accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of
                any material changes via email or through the platform. Your continued use of the
                service after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                Email: <a href="mailto:support@safar.pk" className="text-blue-600 hover:underline">support@safar.pk</a>
              </p>
            </section>

            <div className="bg-gray-100 p-4 rounded-lg mt-8">
              <p className="text-sm text-gray-600 text-center">
                By creating an account, you acknowledge that you have read, understood, and agree
                to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
