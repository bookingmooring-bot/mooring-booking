import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, CheckCircle, Mail } from "lucide-react";

const Unsubscribe = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <Anchor className="text-white" size={32} />
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold mb-2">Mooring Booking</h1>
        <p className="text-white/50 text-sm mb-10">Mediterranean's #1 Berth Marketplace</p>

        {!submitted ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <Mail className="text-red-400" size={24} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unsubscribe</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your email address below and we will immediately remove you from our mailing list.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center"
              />
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold h-11"
              >
                Unsubscribe me
              </Button>
            </form>
            <p className="text-gray-400 text-xs mt-4">
              Your request will be processed immediately in accordance with GDPR.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-500" size={28} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">You've been unsubscribed</h2>
            <p className="text-gray-500 text-sm mb-2">
              <strong>{email}</strong> has been removed from our mailing list.
            </p>
            <p className="text-gray-400 text-xs mt-4">
              You will no longer receive commercial emails from Mooring Booking.<br />
              If this was a mistake, please contact us at{" "}
              <a href="mailto:info@mooring-booking.com" className="text-blue-500 underline">
                info@mooring-booking.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
