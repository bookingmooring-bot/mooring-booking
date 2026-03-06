import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Anchor, Users, MapPin, Shield, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "10,000+", label: t('about.activeMoorings') },
    { value: "50,000+", label: t('about.happySailors') },
    { value: "10+", label: t('about.countriesCount') },
    { value: "€2M+", label: t('about.savedByBoaters') },
  ];

  const values = [
    { icon: Heart, title: t('about.passionTitle'), description: t('about.passionDesc') },
    { icon: Shield, title: t('about.trustTitle'), description: t('about.trustDesc') },
    { icon: Users, title: t('about.communityTitle'), description: t('about.communityDesc') },
    { icon: Award, title: t('about.qualityTitle'), description: t('about.qualityDesc') },
  ];

  const team = [
    { name: "M. Bosic", role: t('about.ceoRole', 'Founder & CEO'), bio: t('about.ceoBio', 'Sailor with 15 years of Mediterranean experience. Long-time CEO in the tourism industry. Vision: democratize mooring access for all sailors.'), avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
    { name: "D. Lazukic", role: t('about.advisorRole', 'Strategic Advisor'), bio: t('about.advisorBio', 'Former President of Sunčani Hvar and Marina Resort. Expert in marina operations with 20+ years of experience.'), avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop" },
    { name: "Dimitri Papadopoulos", role: t('about.expansionRole', 'Mediterranean Expansion'), bio: t('about.expansionBio', 'Greek sailing champion. Leads our expansion across the Aegean and Eastern Med.'), avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 right-10 opacity-10 animate-float"><Anchor size={100} className="text-gold" /></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6">
                <Anchor size={16} /><span className="text-sm font-medium">{t('about.ourStory')}</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                {t('about.tagline')}<span className="block text-gold">{t('about.taglineHighlight')}</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">{t('about.missionText')}</p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground text-sm mb-6">{t('about.aspiringNote', 'We aspire to reach these milestones across Croatia, Greece, Italy, France, Spain, Turkey, Albania, Malta, Cyprus and Slovenia')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-heading text-3xl md:text-4xl font-bold text-secondary">{stat.value}</div>
                  <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-foreground mb-8 text-center">{t('about.storyTitle')}</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p>{t('about.storyP1', 'It started on a hot summer day in 2022, somewhere between Split and Hvar. After hours of sailing, we couldn\'t find an affordable place to tie up for the night.')}</p>
                <p><strong className="text-foreground">{t('about.storyP2', '"Why isn\'t there an Airbnb for moorings?" That simple question became our obsession.')}</strong></p>
                <p>{t('about.storyP3', 'Mooring Booking was born from that frustration. We built the platform we wished existed.')}</p>
                <p>{t('about.storyP4', 'Today, we aspire to 10,000+ moorings and marina berths across Croatia, Greece, Italy, France, Spain, Turkey, Albania, Malta, Cyprus and Slovenia.')}</p>
                <p className="text-foreground font-medium">{t('about.storyP5', 'This is just the beginning. Our vision is to make every mooring berth and marina in the Mediterranean accessible to every sailor.')}</p>
                <h3 className="font-heading text-xl font-bold text-foreground mt-8">{t('about.featuresTitle', 'What Sets Us Apart')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>{t('about.feature1', 'Now4Today — Same-day bookings (01:00 AM–11:00 PM) with instant 20% premium for urgent availability')}</li>
                  <li>{t('about.feature2', 'AI Captain — Your personal sailing assistant for weather, navigation, and mooring guidance')}</li>
                  <li>{t('about.feature3', 'Custom Daily Pricing — Providers set flexible prices per day via their dashboard calendar')}</li>
                  <li>{t('about.feature4', 'Mooring Insurance — Optional third-party liability protection at just €9.99/year')}</li>
                  <li>{t('about.feature5', 'Up to 50% discount — Providers can offer 0–50% off standard rates')}</li>
                  <li>{t('about.feature6', 'Marketing Tools & Premium Listing — Boost your visibility with QR codes, affiliate links, and priority search placement')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-12 text-center">{t('about.ourValues')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div key={value.title} className="bg-card rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4"><value.icon className="text-secondary" size={24} /></div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4 text-center">{t('about.meetTeam')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{t('about.meetTeamSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <img src={member.avatar} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-card" />
                  <h3 className="font-heading font-semibold text-lg text-foreground">{member.name}</h3>
                  <p className="text-secondary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-ocean">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-6">{t('about.readyToFind')}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/explore"><Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"><MapPin className="mr-2" size={20} />{t('about.exploreMoorings')}</Button></Link>
              <Link to="/become-provider"><Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Anchor className="mr-2" size={20} />{t('about.listYourMooring')}</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
