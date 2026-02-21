import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

type Feature = {
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  { title: "🏨 Stay", desc: "Handpicked stays. Clear photos, rules, and location." },
  { title: "🚗 Move", desc: "Book a driver fast — pickup details you can trust." },
  { title: "🏔️ Explore", desc: "Local tours & experiences — from chill to adventure." },
  { title: "🧭 Plan", desc: "Keep your trip organized — bookings, timings, and notes." },
  { title: "💳 Pay Digitally", desc: "PKR pricing. Secure checkout. Instant confirmation." },
  { title: "🌐 One Platform", desc: "Search, book, and manage it all — in one place." },
];

export default function CustomerWaitlist(): JSX.Element {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  return (
    <>
      <div className="min-h-screen bg-white text-[#1A1A1A] font-sans">
        {/* Hero */}
        <section className="px-6 py-20 max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            SafarPK
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-[#6B6B6B]">Travel like a local</p>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-[#4A4A4A]">
            All of Pakistan. One travel platform. Hotels, transport, and tours — managed in one place.
          </p>
          <div className="mt-8">
            {user ? (
              <Button
                size="lg"
                className="rounded-2xl px-8 py-6 text-lg shadow-lg bg-[#C89F40] hover:bg-[#b08a36] text-white"
                disabled
              >
                You're on the waitlist!
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-2xl px-8 py-6 text-lg shadow-lg bg-[#C89F40] hover:bg-[#b08a36] text-white"
                onClick={() => setAuthModalOpen(true)}
              >
                Join the waitlist
              </Button>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            {user
              ? "Thank you for signing up. We'll notify you when we launch."
              : "Early access is limited. No spam."}
          </p>
        </section>

        {/* Problem / Value */}
        <section className="bg-[#F7F5F2] px-6 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-semibold">Travel in Pakistan is harder than it should be</h2>
            <div className="mt-8 flex flex-col items-center gap-3 text-lg">
              <div className="flex items-center gap-2 text-[#4A4A4A]">
                <span>❌</span>
                <span>Multiple sites</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4A4A]">
                <span>❌</span>
                <span>Endless phone calls</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4A4A]">
                <span>❌</span>
                <span>Unclear prices</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-green-600">
                <span>✅</span>
                <span>SafarPK brings everything together with trust</span>
              </div>
              <div className="pt-3 text-[#6B6B6B] font-medium">Everything in one place.</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="rounded-2xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-[#6B6B6B]">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#F7F5F2] px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-center">How SafarPK works</h2>
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-lg">1. Find</h4>
                <p className="mt-2 text-[#6B6B6B]">
                  Search stays, transport, and tours — side by side.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">2. Book</h4>
                <p className="mt-2 text-[#6B6B6B]">
                  Clear PKR pricing. No surprises. Book in seconds.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">3. Travel</h4>
                <p className="mt-2 text-[#6B6B6B]">
                  All bookings, details, and support — in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Message */}
        <section className="px-6 py-20 max-w-4xl mx-auto text-center">
          {user ? (
            <>
              <h2 className="text-3xl font-semibold">We're launching soon!</h2>
              <p className="mt-4 text-lg text-[#4A4A4A]">
                Thank you for joining us early. We're working hard to build the best travel platform
                for Pakistan.
              </p>
              <p className="mt-2 text-lg text-[#4A4A4A]">
                You'll be among the first to know when we go live.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold">Join the waitlist</h2>
              <p className="mt-4 text-lg text-[#4A4A4A]">
                We're launching soon. Get early access and help shape the future of travel in
                Pakistan.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="rounded-2xl px-8 py-6 text-lg shadow-lg bg-[#C89F40] hover:bg-[#b08a36] text-white"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Join the waitlist
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
}
