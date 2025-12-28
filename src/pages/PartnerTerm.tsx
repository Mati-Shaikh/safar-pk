import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function PartnerTerms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/partner">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Partner
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Partner Terms & Conditions
            </CardTitle>
            <p className="text-center text-gray-500 text-sm mt-2">
              Last Updated: December 28, 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By creating a partner account with Safar.pk, you agree to be bound by these Partner
                Terms and Conditions. These terms govern your relationship with Safar.pk as a
                service provider (hotel owner or driver).
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Partner Account</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                As a partner, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Provide accurate business and contact information</li>
                <li>Maintain valid licenses and permits required for your services</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>Update your availability and pricing information regularly</li>
                <li>Respond promptly to booking requests and customer inquiries</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Service Provider Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Maintaining the quality and safety of your services</li>
                <li>Honoring all confirmed bookings at the agreed price</li>
                <li>Complying with all applicable local, provincial, and federal laws</li>
                <li>Maintaining appropriate insurance coverage for your services</li>
                <li>Providing services as described in your listings</li>
                <li>Resolving disputes with customers professionally</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Pricing Management</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                Partners can configure dynamic pricing including:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>Off-Season Pricing:</strong> Lower rates for specified months</li>
                <li><strong>On-Season Pricing:</strong> Peak rates for high-demand periods</li>
                <li><strong>Closed Months:</strong> Periods when services are unavailable</li>
                <li><strong>Last-Minute Discounts:</strong> Special rates for bookings made within 7 days</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                All pricing must be honored for confirmed bookings. Price changes do not affect
                existing reservations.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Commission and Payment</h2>
              <p className="text-gray-700 leading-relaxed">
                Safar.pk charges a commission on each completed booking made through the platform.
                Commission rates and payment terms will be communicated separately. Payments to
                partners will be processed according to the agreed payment schedule, minus
                applicable commissions and fees.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Cancellation Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Partners must establish and maintain clear cancellation policies for their services.
                Cancellations initiated by partners may result in penalties or suspension of the
                account, depending on the circumstances and frequency.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Quality Standards</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                Partners are expected to maintain high-quality standards:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Vehicles must be clean, well-maintained, and roadworthy</li>
                <li>Hotels must maintain cleanliness, safety, and comfort standards</li>
                <li>Services must match the descriptions and photos provided</li>
                <li>Customer reviews and ratings will be monitored for quality assurance</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">8. Account Suspension and Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                Safar.pk reserves the right to suspend or terminate partner accounts for:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Violation of these terms and conditions</li>
                <li>Fraudulent activity or misrepresentation</li>
                <li>Consistent poor reviews or customer complaints</li>
                <li>Failure to honor confirmed bookings</li>
                <li>Non-compliance with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">9. Liability and Insurance</h2>
              <p className="text-gray-700 leading-relaxed">
                Partners are solely responsible for their services and any liabilities arising from
                them. You agree to maintain adequate insurance coverage and indemnify Safar.pk
                against any claims, damages, or losses arising from your services or actions.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">10. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                You grant Safar.pk a non-exclusive license to use your business name, photos, and
                descriptions for marketing and promotional purposes on the platform. You warrant
                that you have the right to grant this license.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">11. Data and Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to handle customer data in compliance with applicable privacy laws. You
                may only use customer information for providing the booked services and must not
                share it with third parties without consent.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                Safar.pk may modify these Partner Terms at any time. You will be notified of
                material changes via email. Continued use of the platform after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For partner-related inquiries, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                Email: <a href="mailto:partners@safar.pk" className="text-green-600 hover:underline">partners@safar.pk</a>
              </p>
            </section>

            <div className="bg-green-50 p-4 rounded-lg mt-8 border border-green-200">
              <p className="text-sm text-gray-700 text-center">
                By creating a partner account, you acknowledge that you have read, understood, and
                agree to be bound by these Partner Terms and Conditions. You also confirm that you
                have the legal authority to operate your business and provide services through our
                platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
