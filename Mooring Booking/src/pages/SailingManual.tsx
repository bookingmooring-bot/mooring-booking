import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Anchor, Ship, Wind, Compass, AlertTriangle, LifeBuoy, 
  Navigation, CloudRain, Sun, Moon, Waves, MapPin, Phone,
  Shield, BookOpen, CheckCircle2
} from "lucide-react";
import { useTranslation } from "react-i18next";

const SailingManual = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: "safety",
      icon: Shield,
      title: t('sailing.safetyTitle'),
      content: [
        {
          subtitle: t('sailing.safetyEquipment', 'Essential Safety Equipment'),
          items: [
            t('sailing.safety1', 'Life jackets for all crew members (EN ISO 12402 certified)'),
            t('sailing.safety2', 'Fire extinguisher (minimum 2kg dry powder)'),
            t('sailing.safety3', 'First aid kit with seasickness medication'),
            t('sailing.safety4', 'Distress flares (2 handheld, 2 parachute rockets)'),
            t('sailing.safety5', 'VHF radio with DSC (Digital Selective Calling)'),
            t('sailing.safety6', 'EPIRB (Emergency Position Indicating Radio Beacon)'),
            t('sailing.safety7', 'Throwable rescue ring with 30m floating line'),
            t('sailing.safety8', 'Navigation lights in working order'),
            t('sailing.safety9', 'Anchor with adequate chain/rope (5:1 scope minimum)'),
          ]
        },
        {
          subtitle: t('sailing.preDeparture', 'Pre-Departure Checklist'),
          items: [
            t('sailing.pre1', 'Check weather forecast for the next 24-48 hours'),
            t('sailing.pre2', 'File a float plan with marina or family member'),
            t('sailing.pre3', 'Verify fuel and water levels'),
            t('sailing.pre4', 'Test engine, steering, and navigation systems'),
            t('sailing.pre5', 'Confirm all safety equipment is accessible'),
            t('sailing.pre6', 'Brief crew on emergency procedures and man-overboard drill'),
          ]
        }
      ]
    },
    {
      id: "navigation",
      icon: Compass,
      title: t('sailing.navigationTitle'),
      content: [
        {
          subtitle: t('sailing.electronicNav', 'Electronic Navigation'),
          items: [
            t('sailing.nav1', 'Always carry updated paper charts as backup'),
            t('sailing.nav2', 'Set waypoints before departure'),
            t('sailing.nav3', 'Monitor AIS for vessel traffic'),
            t('sailing.nav4', 'Cross-reference GPS with visual landmarks'),
            t('sailing.nav5', 'Update chartplotter software regularly'),
          ]
        },
        {
          subtitle: t('sailing.visualNav', 'Visual Navigation'),
          items: [
            t('sailing.vnav1', 'Learn to read nautical charts and symbols'),
            t('sailing.vnav2', 'Understand buoyage systems (IALA Region A)'),
            t('sailing.vnav3', 'Use dead reckoning as backup to electronics'),
            t('sailing.vnav4', 'Practice taking compass bearings'),
            t('sailing.vnav5', 'Know local landmarks and their light characteristics'),
          ]
        }
      ]
    },
    {
      id: "weather",
      icon: Wind,
      title: t('sailing.weatherTitle'),
      content: [
        {
          subtitle: t('sailing.weatherPatterns', 'Mediterranean Weather Patterns'),
          items: [
            t('sailing.wind1', 'Mistral: Strong NW wind in Gulf of Lion (up to 50 knots)'),
            t('sailing.wind2', 'Bora: Cold NE wind in Adriatic (sudden onset)'),
            t('sailing.wind3', 'Meltemi: N wind in Aegean Sea (June-September)'),
            t('sailing.wind4', 'Sirocco: Hot S wind bringing Saharan dust'),
            t('sailing.wind5', 'Sea breeze: Develops mid-morning, peaks afternoon'),
          ]
        },
        {
          subtitle: t('sailing.weatherWarning', 'Weather Warning Signs'),
          items: [
            t('sailing.warn1', 'Rapidly dropping barometer (>3mb in 3 hours)'),
            t('sailing.warn2', 'Increasing wind and changing direction'),
            t('sailing.warn3', 'Dark clouds building on the horizon'),
            t('sailing.warn4', 'Unusual swell patterns'),
            t('sailing.warn5', 'Static on VHF radio (electrical storms)'),
          ]
        }
      ]
    },
    {
      id: "anchoring",
      icon: Anchor,
      title: t('sailing.anchoringTitle'),
      content: [
        {
          subtitle: t('sailing.choosingAnchorage', 'Choosing an Anchorage'),
          items: [
            t('sailing.anch1', 'Check holding ground (sand/mud preferred over rock/weed)'),
            t('sailing.anch2', 'Assess protection from wind and swell'),
            t('sailing.anch3', 'Verify adequate depth for tide changes'),
            t('sailing.anch4', 'Consider swing room and neighboring boats'),
            t('sailing.anch5', 'Plan escape route if weather deteriorates'),
          ]
        },
        {
          subtitle: t('sailing.anchoringTechnique', 'Anchoring Technique'),
          items: [
            t('sailing.tech1', 'Approach slowly into wind or current'),
            t('sailing.tech2', 'Lower anchor from bow, never throw'),
            t('sailing.tech3', 'Pay out 5:1 scope in calm, 7:1 in strong winds'),
            t('sailing.tech4', 'Set anchor by reversing gently'),
            t('sailing.tech5', 'Set anchor alarm on chartplotter'),
            t('sailing.tech6', 'Check position regularly against shore transits'),
          ]
        },
        {
          subtitle: t('sailing.medMooring', 'Mediterranean Mooring'),
          items: [
            t('sailing.med1', 'Stern-to mooring is standard in Mediterranean'),
            t('sailing.med2', 'Use lazy line if provided by marina/mooring owner'),
            t('sailing.med3', 'Prepare fenders and lines before approach'),
            t('sailing.med4', 'Approach at 90° angle, then turn parallel'),
            t('sailing.med5', 'Drop anchor 3-4 boat lengths from quay'),
            t('sailing.med6', 'Reverse slowly while paying out anchor chain'),
          ]
        }
      ]
    },
    {
      id: "colregs",
      icon: Navigation,
      title: t('sailing.colregsTitle'),
      content: [
        {
          subtitle: t('sailing.rightOfWay', 'Basic Right of Way Rules'),
          items: [
            t('sailing.col1', 'Power gives way to sail (when sailing)'),
            t('sailing.col2', 'Overtaking vessel keeps clear'),
            t('sailing.col3', 'When two power vessels meet: starboard gives way'),
            t('sailing.col4', 'Vessels in narrow channels keep to starboard'),
            t('sailing.col5', 'Never impede vessels constrained by draft'),
          ]
        },
        {
          subtitle: t('sailing.navLights', 'Navigation Lights'),
          items: [
            t('sailing.light1', 'Required from sunset to sunrise and reduced visibility'),
            t('sailing.light2', 'Sailing: red/green sidelights, white stern light'),
            t('sailing.light3', 'Motoring: add white masthead light'),
            t('sailing.light4', 'At anchor: white all-round light'),
            t('sailing.light5', 'Never display conflicting lights'),
          ]
        }
      ]
    },
    {
      id: "emergency",
      icon: LifeBuoy,
      title: t('sailing.emergencyTitle'),
      content: [
        {
          subtitle: t('sailing.mob', 'Man Overboard (MOB)'),
          items: [
            t('sailing.mob1', "Shout 'MAN OVERBOARD' and point continuously"),
            t('sailing.mob2', 'Press MOB button on chartplotter'),
            t('sailing.mob3', 'Throw life ring/dan buoy immediately'),
            t('sailing.mob4', 'Post lookout to maintain visual contact'),
            t('sailing.mob5', 'Execute Williamson Turn or Quick Stop'),
            t('sailing.mob6', 'Approach from downwind, stop when alongside'),
          ]
        },
        {
          subtitle: t('sailing.distress', 'Distress Signals'),
          items: [
            t('sailing.dist1', 'MAYDAY on VHF Ch16: immediate danger to life'),
            t('sailing.dist2', 'PAN-PAN: urgent but not life-threatening'),
            t('sailing.dist3', 'Fire orange smoke or red flares'),
            t('sailing.dist4', 'Wave arms slowly above head'),
            t('sailing.dist5', 'Sound horn continuously'),
            t('sailing.dist6', 'Activate EPIRB as last resort'),
          ]
        },
        {
          subtitle: t('sailing.fireSea', 'Fire at Sea'),
          items: [
            t('sailing.fire1', 'Alert all crew and assign roles'),
            t('sailing.fire2', 'Turn off fuel supply at source'),
            t('sailing.fire3', 'Position boat so fire is downwind'),
            t('sailing.fire4', 'Use appropriate extinguisher (powder for electrical)'),
            t('sailing.fire5', 'Prepare life raft and grab bag'),
            t('sailing.fire6', 'Call MAYDAY if fire uncontrollable'),
          ]
        }
      ]
    }
  ];

  const quickTips = [
    { icon: Sun, tip: t('sailing.tip1', 'Start early: Mediterranean winds typically build after 14:00') },
    { icon: Waves, tip: t('sailing.tip2', 'Check depth: Allow 1m clearance under keel minimum') },
    { icon: Phone, tip: t('sailing.tip3', 'Emergency: VHF Ch16 or dial 112 on mobile') },
    { icon: Moon, tip: t('sailing.tip4', 'Night sailing: Allow 30 mins for night vision adaptation') },
    { icon: Wind, tip: t('sailing.tip5', "Reef early: If you're thinking about reefing, do it now") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <section className="bg-gradient-ocean py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6">
              <BookOpen size={16} />
              <span className="text-sm font-medium">{t('sailing.badge')}</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t('sailing.title')}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              {t('sailing.subtitle')}
            </p>
          </div>
        </section>

        <section className="bg-muted py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {quickTips.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <item.icon size={16} className="text-secondary" />
                  <span className="text-foreground">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6 text-center">
                {t('sailing.tableOfContents')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} className="flex items-center gap-3 bg-card p-4 rounded-xl shadow-card hover:shadow-hover transition-all">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <section.icon className="text-secondary" size={20} />
                    </div>
                    <span className="font-medium text-foreground">{section.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="py-12 odd:bg-muted">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <section.icon className="text-secondary" size={28} />
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="space-y-8">
                  {section.content.map((block, i) => (
                    <div key={i} className="bg-card rounded-xl p-6 shadow-card">
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-4">{block.subtitle}</h3>
                      <ul className="space-y-3">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-success mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="py-12 bg-destructive/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <AlertTriangle className="mx-auto text-destructive mb-4" size={48} />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{t('sailing.emergencyContacts')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-card p-6 rounded-xl shadow-card">
                  <h3 className="font-semibold text-foreground mb-2">{t('sailing.maritimeRescue')}</h3>
                  <p className="text-2xl font-bold text-destructive">VHF Ch16</p>
                  <p className="text-sm text-muted-foreground">{t('sailing.distressChannel')}</p>
                </div>
                <div className="bg-card p-6 rounded-xl shadow-card">
                  <h3 className="font-semibold text-foreground mb-2">{t('sailing.europeanEmergency')}</h3>
                  <p className="text-2xl font-bold text-destructive">112</p>
                  <p className="text-sm text-muted-foreground">{t('sailing.worksAcrossEU')}</p>
                </div>
                <div className="bg-card p-6 rounded-xl shadow-card">
                  <h3 className="font-semibold text-foreground mb-2">{t('sailing.supportTitle')}</h3>
                  <p className="text-2xl font-bold text-secondary">24/7 AI Captain</p>
                  <p className="text-sm text-muted-foreground">{t('sailing.inAppAssistance')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-muted-foreground text-center">
                <strong>{t('sailing.disclaimer')}</strong>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SailingManual;
