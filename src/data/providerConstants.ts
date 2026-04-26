import { TrendingUp, Shield, Users } from "lucide-react";
import { Megaphone } from "lucide-react";

export const countries = [
  { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },
  { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
  { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },
  { code: "MT", name: "Malta", flag: "\u{1F1F2}\u{1F1F9}" },
  { code: "SI", name: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}" },
  { code: "ME", name: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}" },
  { code: "CY", name: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}" },
];

export const amenities = [
  { id: "water", label: "Fresh Water", icon: "\u{1F4A7}" },
  { id: "electricity", label: "Electricity", icon: "\u{26A1}" },
  { id: "wifi", label: "WiFi", icon: "\u{1F4F6}" },
  { id: "toilet", label: "Toilet", icon: "\u{1F6BD}" },
  { id: "shower", label: "Shower", icon: "\u{1F6BF}" },
  { id: "fuel", label: "Fuel", icon: "\u{26FD}" },
  { id: "restaurant", label: "Restaurant", icon: "\u{1F37D}\u{FE0F}" },
];

export const paymentMethods = [
  { id: "cash", label: "Cash", icon: "\u{1F4B5}" },
  { id: "card", label: "Credit Card", icon: "\u{1F4B3}" },
  { id: "paypal", label: "PayPal", icon: "\u{1F17F}\u{FE0F}" },
  { id: "googlepay", label: "Google Pay", icon: "\u{1F4F1}" },
];

export const winterServices = [
  { id: "winterization", label: "Winterization", icon: "\u{1F527}" },
  { id: "hull_cleaning", label: "Hull Cleaning", icon: "\u{1F9F9}" },
  { id: "mast_storage", label: "Mast Storage", icon: "\u{1F3D7}\u{FE0F}" },
  { id: "electricity_winter", label: "Electricity", icon: "\u{26A1}" },
  { id: "water_winter", label: "Water", icon: "\u{1F4A7}" },
  { id: "security", label: "24/7 Security", icon: "\u{1F512}" },
];

export const mooringTypes = [
  { id: "vez_u_marini", label: "Marina Berth", icon: "\u{2693}" },
  { id: "bova", label: "Buoy", icon: "\u{1F534}" },
  { id: "dok", label: "Dock", icon: "\u{1F3D7}\u{FE0F}" },
  { id: "sidriste", label: "Anchorage", icon: "\u{26F5}" },
  { id: "obalni_vez", label: "Shore Mooring", icon: "\u{1FA22}" },
];

export const benefits = [
  {
    icon: TrendingUp,
    title: "Boost Your Income",
    description: "List your berths on docks, buoys or marinas and watch the AI captain find guests for you.",
    stat: "85%",
    statLabel: "Earnings stay with you"
  },
  {
    icon: Shield,
    title: "Simple & Transparent",
    description: "Only 12% commission on successful bookings. No upfront costs, no hidden fees.",
    stat: "12%",
    statLabel: "Fair commission"
  },
  {
    icon: Megaphone,
    title: "Marketing Tools",
    description: "Get a unique QR code and affiliate link. Share on social media and earn more.",
    stat: "\u{20AC}5/mo",
    statLabel: "Marketing package"
  },
  {
    icon: Users,
    title: "Join Our Providers",
    description: "Be part of the growing Mediterranean mooring community. Support included.",
    stat: "11",
    statLabel: "Mediterranean countries"
  },
];

export const termsContent = `MOORING BOOKING - GENERAL TERMS OF USE
=======================================
Last updated: 18 March 2026.
Operator: Intelligent Matrix

1. PLATFORM
Mooring Booking is an online marketplace connecting mooring providers with users looking for a berth for their vessel. The platform acts as an intermediary and does not own, operate, or control any moorings listed on the platform.

2. USER ACCOUNTS
Use of certain features requires registration. The user agrees to:
- Provide accurate, current, and complete information
- Maintain and regularly update their data
- Keep their password secure and confidential
- Take full responsibility for all activities on the account
- Notify us immediately of any unauthorised use

3. BOOKINGS AND PAYMENTS
For users:
- Bookings are confirmed after successful payment processing
- Displayed prices include all applicable platform discounts
- Cancellation policies vary by mooring; review before booking
- Navigation coordinates are available only after a confirmed, paid booking

For providers:
- A 12% commission is charged on ALL bookings processed via the Platform
- Stripe fees (~2.9% + \u{20AC}0.30) are deducted from the total BEFORE the 12/88 split
- Providers may offer discounts of 0\u{2013}50% via the Platform
- Payouts are processed within 3\u{2013}5 business days after request

4. PROVIDER OBLIGATIONS
Providers agree to:
- Provide accurate descriptions and photos of moorings
- Maintain an accurate availability calendar
- Respond promptly to booking requests
- Ensure moorings meet local safety standards
- Honour all confirmed bookings
- Pay the 12% commission on all bookings without exception
- Sign a declaration of right of disposal
- Maintain valid liability insurance where required by law

5. DATA TRANSFER
By using the Platform, users consent to the transfer of personal data to a successor in the event of a sale, merger, or change of ownership. The successor is bound by the same privacy obligations. Users will be notified within 30 days.

6. LIMITATION OF LIABILITY
Intelligent Matrix is NOT liable for:
- The condition, safety, or legality of any mooring
- Personal injury or property damage
- Financial losses
- Weather/environmental events
- Third-party actions
MAXIMUM LIABILITY: the lesser of all fees paid in 12 months or \u{20AC}500.

7. PROHIBITED ACTIVITIES
- Listing moorings without legal right of disposal
- Providing false information
- Bypassing the platform to avoid commission
- Harassing other users
- Violating applicable laws

8. DISPUTE RESOLUTION
Disputes are first resolved through negotiation within 30 days. If negotiations fail, disputes are settled by arbitration under Czech law. Courts in Prague have exclusive jurisdiction.

9. CONTACT
Intelligent Matrix
Email: legal@mooring-booking.com
Email: info@intelligent-matrix.com
Address: Prague, Czech Republic
Phone: +420 739 328 337

\u{00A9} 2026 Mooring Booking. All rights reserved.`;

export const privacyContent = `MOORING BOOKING - PRIVACY POLICY
=================================
Last updated: 18 March 2026.
Operator: Intelligent Matrix

1. DATA COLLECTION
We collect the following personal data:
- Full name, email address, phone number
- Mooring location (GPS coordinates)
- Booking and payment data
- Mooring photos

2. USE OF DATA
We use your data to:
- Provide and improve the platform service
- Process bookings and payments
- Communicate with you about your bookings
- Send notifications and promotions (with your consent)

3. DATA SHARING
We share your data:
- With other platform users (name, contact for booking)
- With payment service providers (Stripe)
- As required by law

4. YOUR RIGHTS (GDPR)
You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete data ("right to be forgotten")
- Restrict processing
- Data portability
- Object to processing

5. DATA SECURITY
We use industry-standard protection measures including encryption, secure access, and regular audits.

6. CONTACT
For privacy questions:
Email: privacy@mooring-booking.com
Address: Prague, Czech Republic

\u{00A9} 2026 Mooring Booking. All rights reserved.`;
