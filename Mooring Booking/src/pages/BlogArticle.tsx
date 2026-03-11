import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

const allPosts = [
  {
    id: 0,
    title: "Top 10 Hidden Mooring Gems in Croatia for 2026",
    excerpt: "Discover secret spots that even local sailors don't know about.",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80",
    author: "Captain M. Bosic",
    date: "January 15, 2026",
    category: "Destinations",
    readTime: "8 min read",
    content: `Croatia's coastline stretches over 1,800 km and is home to more than 1,000 islands, islets, and reefs. While the popular spots like Hvar, Dubrovnik, and Šibenik are well-known to sailors worldwide, the Adriatic hides countless secret moorings that only the most seasoned mariners know about.

**1. Vela Luka Bay, Korčula**
Tucked behind the island of Korčula, Vela Luka offers calm waters and easy access to local restaurants and supermarkets. Mooring fees are significantly cheaper than Hvar or Split marinas.

**2. Stari Grad Bay, Hvar**
While Hvar town is packed with tourists, the northern bay near Stari Grad has peaceful moorings with excellent ferry connections.

**3. Telašćica Nature Park, Dugi Otok**
A UNESCO-protected fjord-like bay with crystal clear water and wild cliffs. Limited moorings but unforgettable atmosphere.

**4. Rovinj Old Town Anchorage**
Anchor off the old town in Rovinj for a romantic sunset view. A short dinghy ride puts you in the heart of one of Istria's most beautiful towns.

**5. Vis Island Hidden Coves**
The most remote inhabited island in Croatia's territorial waters. Vis was a military base until 1989, which has preserved its natural beauty.

Whether you're sailing solo or with a crew, these hidden gems offer something that the crowded marinas cannot — authenticity, tranquility, and the feeling of having discovered something truly special.`,
  },
  {
    id: 1,
    title: "Hidden Gems of Croatian Kornati Islands",
    excerpt: "Navigate through 89 islands and discover moorings and marina berths.",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    author: "Ana K.",
    date: "January 12, 2026",
    category: "Destinations",
    readTime: "7 min read",
    content: `The Kornati archipelago is an extraordinary maze of 89 islands, islets, and reefs spread across 320 km² of the Adriatic. This national park — one of the most indented coastlines in the Mediterranean — is a sailor's paradise.

The islands are characterised by their bare karst interior carved by rain, sun, and winds over thousands of years. The contrast of white limestone against the dark blue Adriatic is unlike anything else you'll encounter in the Mediterranean.

**Best moorings in the Kornati:**
- **Uvala Kravljačica** — a quiet bay on the eastern side of Kornat, ideal for escaping the crowds
- **Levrnaka Bay** — crystal clear water and a small restaurant serving grilled fish caught that morning
- **Piškera** — the main hub with a marina, restaurant, and fuel station

The park entrance fee is required for all visiting vessels. Make sure to obtain your permit before entering.`,
  },
  {
    id: 2,
    title: "Mooring Guide: Santorini, Greece",
    excerpt: "Complete guide to finding affordable moorings and marina spots around this iconic island.",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80",
    author: "Nikos P.",
    date: "January 10, 2026",
    category: "Destinations",
    readTime: "9 min read",
    content: `Santorini's caldera is one of the most dramatic sailing destinations in the world. The island's unique shape — formed by a massive volcanic eruption 3,600 years ago — creates both stunning scenery and challenging mooring conditions.

**Athinios Port**
The main commercial port for ferries and cargo. Small docks available for yachts but crowded in summer. Best to arrive early morning.

**Vlychada Marina**
The only proper marina on Santorini, located on the south coast. Modern facilities, fuel, water, and good shelter from the Meltemi winds.

**Kamari Bay**
A temporary anchorage suitable for settled conditions only. The volcanic black sand beach makes for a unique backdrop.

**Tips for sailing to Santorini:**
- The Meltemi winds can be strong and gusty in July-August
- Book marina berths well in advance for peak season
- The caldera anchorage is crowded with cruise ship tenders and water taxis`,
  },
  {
    id: 3,
    title: "Best Moorings in Amalfi Coast, Italy",
    excerpt: "Navigate the stunning Amalfi Coast with our insider guide to moorings and marinas.",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
    author: "Giuseppe R.",
    date: "January 8, 2026",
    category: "Destinations",
    readTime: "10 min read",
    content: `The Amalfi Coast — a UNESCO World Heritage Site — is 50 km of dramatic cliffs, colourful villages, and turquoise water. Sailing this coast requires careful planning, as the anchorages are limited and the currents can be challenging.

**Positano**
The most picturesque village on the coast. Anchor in front of the beach or use one of the buoys operated by local operators. Busy in summer but magical at sunset.

**Amalfi Town**
The historic capital of the coast. Small harbour with limited berths. Better to anchor off and take a dinghy ashore.

**Marina di Praia**
A tiny, perfectly sheltered cove accessible through a narrow gap in the cliffs. Very limited space but unforgettable.

**Furore Fjord**
Italy's only fjord — technically a river inlet. Small enough to be missed by most tourists, accessible only by boat or a long staircase.`,
  },
  {
    id: 4,
    title: "Discovering Albanian Riviera by Boat",
    excerpt: "Europe's last undiscovered coastline offers incredible value for moorings.",
    image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
    author: "Erion M.",
    date: "January 6, 2026",
    category: "Destinations",
    readTime: "6 min read",
    content: `Albania's Ionian coast — often called the Albanian Riviera — stretches from Vlorë to Sarandë and is one of Europe's best-kept secrets. Until recently, this coastline was virtually inaccessible to foreign sailors.

**Why the Albanian Riviera?**
Mooring fees are a fraction of neighbouring Montenegro or Greece. The water is crystal clear, the beaches largely unspoiled, and the local cuisine — particularly the seafood — excellent and affordable.

**Key stops:**
- **Sarandë** — the main tourist town, facing Corfu across a narrow strait. Modern marina with good facilities
- **Ksamil** — three tiny islands just south of Sarandë, with turquoise lagoons between them
- **Porto Palermo** — an Ottoman-era castle sits on a peninsula in this perfectly sheltered bay
- **Himara** — a larger town with an ancient hilltop castle and good restaurants

Albania is now fully open to foreign vessels. Make sure to clear customs and immigration in Sarandë or Vlorë upon arrival.`,
  },
  {
    id: 5,
    title: "Anchoring in Strong Winds: Expert Tips",
    excerpt: "When the Bura or Meltemi hits, you need to know these techniques.",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",
    author: "Captain Dimitri",
    date: "December 20, 2025",
    category: "Tips & Guides",
    readTime: "12 min read",
    content: `Strong winds are part of Mediterranean sailing. The Bura in the Adriatic can reach 50-60 knots, while the Meltemi in the Aegean occasionally gusts to storm force. Knowing how to anchor safely in these conditions is essential.

**Before the wind arrives:**
1. Check the forecast — multiple sources, updated regularly
2. Identify a sheltered anchorage with holding ground suitable for your anchor
3. Prepare your storm anchor and heavy chain

**Setting the anchor:**
- Always motor into the wind when deploying
- Use at least 5:1 scope (chain length to depth ratio); 7:1 in storm conditions
- Set the anchor by reversing slowly at full throttle to dig it in
- Mark your position on GPS to detect any dragging

**During the blow:**
- Stay aboard or assign anchor watch
- Check scope and bearing every 30-60 minutes
- Have fenders and warps ready for emergency mooring
- Know your exit strategy if the anchor drags

The Macedonian sailing proverb says: "He who is well prepared for the storm has half won."`,
  },
  {
    id: 6,
    title: "How Peer-to-Peer Mooring is Changing Sailing",
    excerpt: "The sharing economy has finally reached the nautical world — moorings and marinas unite.",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
    author: "M. Bosic",
    date: "December 12, 2025",
    category: "Industry",
    readTime: "8 min read",
    content: `The sharing economy disrupted hotels with Airbnb, transport with Uber, and now — finally — it's transforming sailing. Peer-to-peer mooring platforms are connecting private boat owners and concessionaires with visiting sailors, opening up thousands of new berths that were previously unavailable.

**The problem with traditional marinas:**
Modern marinas are expensive, often overbooked in summer, and concentrated in major tourist areas. The real Mediterranean — the hidden bays, the quiet fishing villages, the private docks — was mostly inaccessible.

**How P2P mooring changes this:**
Private owners can now list their empty buoys, docks, and berths on platforms like Mooring Booking. A family in Korčula with a private buoy they use two weeks a year can now earn €2,000-4,000 per season from visiting sailors.

For sailors, this means access to unique, authentic locations at competitive prices — often 30-50% cheaper than commercial marinas.

**The challenges:**
Insurance, liability, and regulatory compliance remain complex. The best platforms handle these issues through clear terms of service and appropriate insurance frameworks.`,
  },
  {
    id: 7,
    title: "Best Mediterranean Marinas for Winter Storage",
    excerpt: "Compare prices, services, and locations for overwintering your vessel at top Mediterranean marinas.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    author: "D. Lazukic",
    date: "November 28, 2025",
    category: "For Providers",
    readTime: "10 min read",
    content: `Overwintering your boat in the Mediterranean is a major decision — and the right choice can save you thousands of euros while keeping your vessel in excellent condition.

**Top winter storage destinations:**

**Croatia (Split, Šibenik, Pula)**
Croatia has emerged as the premier winter storage destination. Modern boatyards, competitive prices, and excellent technical services. Average cost for a 12m vessel: €1,500-2,500 per season.

**Montenegro (Tivat, Bar)**
Porto Montenegro is the premium option with 5-star facilities. More affordable alternatives exist in Bar. Good technical infrastructure.

**Turkey (Marmaris, Bodrum)**
Excellent value for money. Strong technical expertise particularly in fiberglass work and engine maintenance. Season-long packages often include unlimited haulage.

**Greece (Athens, Lefkada)**
Good options in Attica for easy access from major airports. Lefkada is popular for boats planning to cruise the Ionian the following season.

**Key factors to consider:**
- Travel distance from your home
- Quality of technical services
- Climate (humidity, temperature extremes)
- Security and insurance requirements`,
  },
  {
    id: 8,
    title: "How to Choose Between Moorings and Marinas",
    excerpt: "Pros, cons and cost comparison — which option suits your sailing style?",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80",
    author: "Ana K.",
    date: "November 15, 2025",
    category: "Tips & Guides",
    readTime: "7 min read",
    content: `Every sailor faces this choice: the convenience of a marina or the freedom of a mooring? There's no single right answer — it depends on your boat, your budget, and your sailing style.

**Marinas: the case for**
- Shore power and water connection
- Easy access to shore (no dinghy needed)
- Security and surveillance
- Showers, laundry, and facilities
- Technical services on-site

**Marinas: the case against**
- Significantly higher cost
- Often located in tourist areas (noisy, crowded)
- Less authentic experience
- Bureaucracy and advance booking required

**Moorings: the case for**
- Lower cost (often 50-70% cheaper)
- Access to secluded, authentic locations
- More flexibility
- Direct contact with local boat owners

**Moorings: the case against**
- No shore power (relying on solar/generator)
- Dinghy required to reach shore
- Variable quality and maintenance
- Less security

**Our recommendation:** Use marinas for resupply and maintenance, and use moorings for exploration and enjoyment. The combination gives you the best of both worlds.`,
  },
  {
    id: 9,
    title: "Mooring Booking Launches in Albania and Malta",
    excerpt: "New countries join the Mediterranean's largest mooring marketplace.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    author: "M. Bosic",
    date: "November 1, 2025",
    category: "News",
    readTime: "5 min read",
    content: `We're excited to announce that Mooring Booking has officially launched in Albania and Malta, bringing our platform to two of the Mediterranean's most interesting sailing destinations.

**Albania**
Albania's rapid development of its Riviera coastline has created enormous opportunities for both providers and sailors. We now have 47 listed moorings across the Albanian coast, from the fjord-like bays of the south to the more developed northern harbours.

**Malta**
The Maltese archipelago — Malta, Gozo, and Comino — offers some of the most sheltered and historic anchorages in the Mediterranean. Our 23 Malta listings include private buoys in the Blue Lagoon on Comino, dock space in the historic Grand Harbour, and affordable berths in Marsaxlokk.

**What this means for sailors**
Both Albania and Malta are accessible year-round, making them excellent winter cruising destinations. Combined with our existing coverage of Croatia, Italy, Greece, Spain, Montenegro, and Slovenia, Mooring Booking now covers the entire Central and Western Mediterranean.

**For providers**
If you own a mooring, dock, or berth in Albania or Malta, we invite you to list it on our platform. Registration is free, and we only charge a 15% commission on completed bookings.`,
  },
];

const BlogArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const post = allPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Article not found</h1>
            <p className="text-muted-foreground mb-8">This article may have been moved or removed.</p>
            <Button onClick={() => { navigate('/blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <ArrowLeft className="mr-2" size={16} /> Back to Blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get next 3 related posts (different from current)
  const related = allPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  const fallback = allPosts.filter(p => p.id !== post.id).slice(0, 3);
  const relatedPosts = related.length >= 2 ? related : fallback;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero image */}
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Back button */}
          <button
            onClick={() => { navigate('/blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} /> Back to Blog
          </button>

          {/* Category + read time */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">{post.category}</span>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock size={14} /> {post.readTime}
            </div>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">{post.title}</h1>

          {/* Author + date */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
            <div className="flex items-center gap-2"><User size={16} /> {post.author}</div>
            <div className="flex items-center gap-2"><Calendar size={16} /> {post.date}</div>
          </div>

          {/* Article content */}
          <div className="prose prose-slate max-w-none">
            {post.content.split('\n\n').map((para, i) => {
              const trimmed = para.trim();
              if (!trimmed) return null;
              // Bold headings: lines starting with **
              if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
                return <h3 key={i} className="font-heading text-xl font-bold text-foreground mt-8 mb-3">{trimmed.slice(2, -2)}</h3>;
              }
              // List items: lines starting with -
              if (trimmed.split('\n').every(l => l.startsWith('- '))) {
                return (
                  <ul key={i} className="list-none space-y-2 my-4">
                    {trimmed.split('\n').map((item, j) => (
                      <li key={j} className="flex gap-2 text-foreground/80 leading-relaxed">
                        <span className="text-secondary mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: item.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                );
              }
              // Numbered list
              if (/^\d+\. /.test(trimmed.split('\n')[0])) {
                return (
                  <ol key={i} className="list-decimal list-inside space-y-2 my-4 text-foreground/80">
                    {trimmed.split('\n').map((item, j) => (
                      <li key={j} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\. /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </ol>
                );
              }
              // Normal paragraph (bold support inline)
              return (
                <p key={i} className="text-foreground/80 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                />
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-ocean rounded-2xl text-center">
            <h3 className="font-heading text-2xl font-bold text-primary-foreground mb-3">Ready to explore moorings?</h3>
            <p className="text-primary-foreground/80 mb-6">Find the perfect mooring for your next sailing adventure.</p>
            <Button
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
              onClick={() => { navigate('/explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Explore Moorings
            </Button>
          </div>
        </div>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-muted">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8">More Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(rp => (
                  <article
                    key={rp.id}
                    className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all cursor-pointer group"
                    onClick={() => { navigate(`/blog/${rp.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-5">
                      <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-medium">{rp.category}</span>
                      <h3 className="font-heading font-semibold text-base text-foreground mt-2 mb-1 line-clamp-2 group-hover:text-secondary transition-colors">{rp.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{rp.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogArticlePage;
