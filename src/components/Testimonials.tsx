import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    // Sailors/Customers - Save 50%+
    {
      id: 1,
      content: t('testimonials.sailor1', "I saved over 60% compared to marina fees! Found a mooring in Dubrovnik for just €45/night instead of €120 at the marina. Incredible!"),
      author: "Sarah L.",
      location: "London, UK",
      role: t('testimonials.roleSailor', 'Sailor & Customer'),
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 2,
      content: t('testimonials.sailor2', "Upgraded to Premium and it changed everything! Unlimited AI Captain, offline maps, storm alerts — worth every cent. Plus saved 55% on my Greek island trip."),
      author: "Giuseppe M.",
      location: "Naples, Italy",
      role: t('testimonials.roleCaptain', 'Yacht Captain'),
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 3,
      content: t('testimonials.sailor3', "Premium Annual at €9.99/mo is a steal! 7-day forecasts, priority booking, maneuvering guides — plus Now4Today alerts saved us twice. Best sailing investment ever!"),
      author: "Hans M.",
      location: "Munich, Germany",
      role: t('testimonials.roleSailor', 'Sailor & Customer'),
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 4,
      content: t('testimonials.sailor4', "Saved €2,000 on my two-week Croatia trip! The moorings on this platform are better than marinas - quieter, more authentic, and half the price."),
      author: "Emma T.",
      location: "Amsterdam, Netherlands",
      role: t('testimonials.roleSailor', 'Sailor & Customer'),
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      rating: 5,
    },
    // AI Captain Testimonials - NEW
    {
      id: 13,
      content: t('testimonials.aiCaptain1', "AI Captain saved our trip when the anchor winch lost power during a storm! It guided us step-by-step to manually secure the anchor and find shelter. Best sailing assistant ever!"),
      author: "Stefan B.",
      location: "Salzburg, Austria",
      role: t('testimonials.roleYachtOwner', 'Yacht Owner'),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 14,
      content: t('testimonials.aiCaptain2', "With Premium I get unlimited AI Captain — it planned a perfect 7-day Greek island route with hidden mooring spots and real-time wind data. Free users only get 5 questions/day!"),
      author: "Claudia R.",
      location: "Zurich, Switzerland",
      role: t('testimonials.roleSailingEnthusiast', 'Sailing Enthusiast'),
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 15,
      content: t('testimonials.aiCaptain3', "As a catamaran newbie, I was terrified of entering the narrow port. AI Captain talked me through every step - approach angle, speed, lines sequence. Docked perfectly!"),
      author: "Pierre L.",
      location: "Lyon, France",
      role: t('testimonials.roleCatamaranGuest', 'Catamaran Charter Guest'),
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      rating: 5,
    },
    // Mooring Owners - High Revenue
    {
      id: 5,
      content: t('testimonials.owner1', "Mooring Booking increased my revenue by 300% this season. People just book overnight! My unused dock now earns €15,000+ annually."),
      author: "Marko K.",
      location: "Dubrovnik, Croatia",
      role: t('testimonials.roleOwner', 'Owner of 2 moorings'),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 6,
      content: t('testimonials.owner2', "My private buoy in Santorini earns €800/week in peak season. That's €20,000+ pure passive income! Only 15% commission is very fair."),
      author: "Nikos P.",
      location: "Santorini, Greece",
      role: t('testimonials.roleOwner3', 'Owner of 3 moorings'),
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 7,
      content: t('testimonials.owner3', "Turned my unused marina berth into €12,000/year income. The instant QR code and booking system made everything so easy!"),
      author: "Marie D.",
      location: "Nice, France",
      role: t('testimonials.roleOwnerMarina', 'Marina Berth Owner'),
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 8,
      content: t('testimonials.owner4', "From 0 to €25,000 annual revenue in my first year! My three moorings in Kotor Bay are always booked. Best investment decision!"),
      author: "Dragan V.",
      location: "Kotor, Montenegro",
      role: t('testimonials.roleOwner3', 'Owner of 3 moorings'),
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
      rating: 5,
    },
    // Now4Today & Insurance Testimonials
    {
      id: 16,
      content: t('testimonials.now4today1', "Now4Today is a game-changer! I enabled same-day bookings and earned an extra €3,000 last month alone. The 20% surcharge means more profit per booking!"),
      author: "Ante M.",
      location: "Split, Croatia",
      role: t('testimonials.roleOwner', 'Owner of 2 moorings'),
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 17,
      content: t('testimonials.now4today2', "Got caught in unexpected weather and needed a mooring FAST. Now4Today found me one in 10 minutes — worth every cent of the 20% premium!"),
      author: "Lisa W.",
      location: "Copenhagen, Denmark",
      role: t('testimonials.roleSailor', 'Sailor & Customer'),
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 18,
      content: t('testimonials.insurance1', "Mooring Insurance at €9.99/year gave me peace of mind. When a guest scratched the dock, the mediation service handled everything!"),
      author: "Josip R.",
      location: "Zadar, Croatia",
      role: t('testimonials.roleOwnerMarina', 'Marina Berth Owner'),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 19,
      content: t('testimonials.customPricing1', "Setting different prices per day is brilliant! I charge €80 on weekdays and €150 on weekends. My revenue jumped 40% overnight!"),
      author: "Valentina S.",
      location: "Hvar, Croatia",
      role: t('testimonials.roleOwner', 'Owner of 2 moorings'),
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 20,
      content: t('testimonials.discount1', "I set a 50% discount for off-season and my mooring stayed booked all winter! Way better than leaving it empty from October to April."),
      author: "Giorgos T.",
      location: "Corfu, Greece",
      role: t('testimonials.roleOwner3', 'Owner of 3 moorings'),
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      rating: 5,
    },
    // Affiliates - High Earnings
    {
      id: 9,
      content: t('testimonials.affiliate1', "My sailing blog now generates €3,000/month in affiliate commissions! Every booking through my link earns me 10%. Passive income dream!"),
      author: "Alex R.",
      location: "Barcelona, Spain",
      role: t('testimonials.roleAffiliate', 'Travel Blogger & Affiliate'),
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 10,
      content: t('testimonials.affiliate2', "I'm a yacht charter company and earn €5,000/month recommending Mooring Booking to clients. The 10% lifetime commission is amazing!"),
      author: "Isabella F.",
      location: "Portofino, Italy",
      role: t('testimonials.roleCharterOwner', 'Charter Company Owner'),
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 11,
      content: t('testimonials.affiliate3', "My Instagram sailing page earned €8,000 in commissions last summer alone! Just sharing my mooring experiences and affiliate links."),
      author: "Thomas B.",
      location: "Monaco",
      role: t('testimonials.roleInfluencer', 'Sailing Influencer (85K followers)'),
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 12,
      content: t('testimonials.affiliate4', "As a marina manager, I recommend Mooring Booking to overflow guests. Extra €2,000/month commission and happy customers - win-win!"),
      author: "François L.",
      location: "Saint-Tropez, France",
      role: t('testimonials.roleMarinaManager', 'Marina Manager & Affiliate'),
      avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&h=150&fit=crop",
      rating: 5,
    },
    // New Mooring Owners
    {
      id: 21,
      content: t('testimonials.owner5', "As a marina director, Mooring Booking helped us fill empty transit berths. The system is simple and I highly recommend it."),
      author: "Luka I.",
      location: "Zadar, Croatia",
      role: t('testimonials.roleDirector', 'Marina Director'),
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      id: 22,
      content: t('testimonials.owner6', "Our luxury yacht dock now has a perfect schedule. Clients appreciate the discretion and ease of booking through the app."),
      author: "Antoine M.",
      location: "Cannes, France",
      role: t('testimonials.roleDockConcessionaire', 'Luxury Yacht Dock Concessionaire'),
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'Join thousands of satisfied sailors and mooring providers who save and earn 50% more')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-all relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 text-secondary/20" size={32} />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground text-sm mb-6 leading-relaxed italic line-clamp-5">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-heading font-semibold text-foreground text-sm">
                    {testimonial.author}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.location}
                  </p>
                  <p className="text-secondary text-xs font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;