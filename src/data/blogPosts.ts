// Static blog content. Kept as structured blocks (no markdown dep, no innerHTML)
// so it renders safely and matches the existing hardcoded-data pattern.
// Content is English-only, consistent with the previously hardcoded posts.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
  body: BlogBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 0,
    slug: "top-10-hidden-mooring-gems-croatia-2026",
    title: "Top 10 Hidden Mooring Gems in Croatia for 2026",
    excerpt: "Discover secret spots that even local sailors don't know about.",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80",
    author: "Captain M. Bosic",
    date: "January 15, 2026",
    category: "Destinations",
    readTime: "8 min read",
    featured: true,
    body: [
      { type: "p", text: "Croatia's coastline counts more than a thousand islands, and the famous marinas in Hvar, Split and Dubrovnik fill up months in advance every summer. But the real magic of the Adriatic lies in the quiet coves and community moorings that never make the glossy charter brochures. After a decade of sailing these waters, here are ten spots worth re-routing for in 2026." },
      { type: "h2", text: "Why the hidden coves win" },
      { type: "p", text: "A crowded marina means generator noise, wake from passing tenders, and a premium price for a berth you barely use. A well-placed mooring buoy in a sheltered bay gives you a calm night's sleep, a swim straight off the transom at sunrise, and a fraction of the cost. The trade-off is that the best ones are not advertised — they are passed between skippers." },
      { type: "h2", text: "The shortlist" },
      { type: "ul", items: [
        "Uvala Krivica (Lošinj) — pine-rimmed and bomb-proof in the maestral.",
        "Pokrivenik (Hvar, north side) — a long fjord-like inlet away from the party crowd.",
        "Žakan (Kornati) — a working fishermen's cove with a handful of laid moorings.",
        "Polače (Mljet) — Roman ruins ashore and total shelter in almost any wind.",
        "Soline (Dugi Otok) — turquoise water and a short dinghy ride to a salt lake.",
      ]},
      { type: "p", text: "The remaining five we keep for skippers who book through the marketplace — local hosts list them with up-to-date depth, holding and contact details, so you arrive knowing the buoy is reserved and rated for your vessel." },
      { type: "h2", text: "Plan it like a local" },
      { type: "p", text: "Arrive before 16:00 in July and August, always confirm the maximum draft against your keel, and have a backup cove one bay over. Book the mooring in advance where you can — the difference between a perfect evening and a frustrating circle at dusk is usually fifteen minutes of planning." },
    ],
  },
  {
    id: 1,
    slug: "hidden-gems-kornati-islands",
    title: "Hidden Gems of Croatian Kornati Islands",
    excerpt: "Navigate through 89 islands and discover moorings and marina berths.",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    author: "Ana K.",
    date: "January 12, 2026",
    category: "Destinations",
    readTime: "7 min",
    body: [
      { type: "p", text: "The Kornati archipelago is often described as a nautical paradise and a navigational puzzle in the same breath. Eighty-nine islands, islets and reefs are packed into a national park with almost no permanent population, no shops, and very little fresh water — which is precisely why sailors love it." },
      { type: "h2", text: "Reading the moonscape" },
      { type: "p", text: "The islands' bare, pale slopes give the Kornati its lunar reputation. Underwater the terrain is just as dramatic: steep drop-offs on the seaward side, shallow sandy shelves in the inner channels. Stick to charted routes, keep an eye on the many unlit rocks, and never assume a passage is clear just because it looks wide." },
      { type: "h2", text: "Where to spend the night" },
      { type: "ul", items: [
        "Vrulje — the largest village bay, with restaurant moorings and good shelter.",
        "Lavsa — a near-enclosed lagoon, popular but stunning.",
        "Piškera — home to the park's marina and a useful resupply point.",
        "Žut and Sit — slightly outside the park boundary, cheaper and quieter.",
      ]},
      { type: "p", text: "Most konoba (tavern) owners offer a free or low-cost mooring buoy if you dine ashore — a fair trade for grilled fish and a glass of local wine. Confirm the arrangement on arrival so there are no surprises on the bill." },
      { type: "h2", text: "Practical notes" },
      { type: "p", text: "You need a national park ticket, ideally bought in advance and cheaper that way. There is no fuel and almost no provisioning inside the park, so top up water, food and diesel in Murter or Biograd before you set off." },
    ],
  },
  {
    id: 2,
    slug: "mooring-guide-santorini-greece",
    title: "Mooring Guide: Santorini, Greece",
    excerpt: "Complete guide to finding affordable moorings and marina spots around this iconic island.",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80",
    author: "Nikos P.",
    date: "January 10, 2026",
    category: "Destinations",
    readTime: "9 min",
    body: [
      { type: "p", text: "Santorini is one of the most photographed places on earth, but it is also one of the trickiest to visit by sea. The caldera is a flooded volcanic crater — spectacular, and far too deep for a conventional anchor over most of its area." },
      { type: "h2", text: "The caldera depth problem" },
      { type: "p", text: "Depths inside the caldera plunge to 300 metres and more, so anchoring is only possible on a few narrow shelves close to shore. This is why mooring buoys and stern-to arrangements at the small quays are in such demand. Plan your timing and have a backup, because the obvious spots fill quickly in season." },
      { type: "h2", text: "Where to tie up" },
      { type: "ul", items: [
        "Vlychada Marina — the island's main protected harbour on the south coast.",
        "Ammoudi — a tiny, dramatic quay below Oia, exposed but unforgettable.",
        "Korfos (Thirasia) — a quiet fishing hamlet across the caldera.",
        "Caldera buoys near Fira — convenient for going ashore by tender.",
      ]},
      { type: "p", text: "Vlychada is the sensible base if you want security and services; the caldera moorings are for the view and the swim, weather permitting. The afternoon meltemi can funnel hard through the gap, so always check the forecast before committing to an exposed berth." },
      { type: "h2", text: "Going ashore" },
      { type: "p", text: "From the caldera, tenders land at Ammoudi or the old port below Fira, both connected to the clifftop towns by switchback paths, cable car or donkey. Allow plenty of time — and energy — for the climb." },
    ],
  },
  {
    id: 3,
    slug: "best-moorings-amalfi-coast-italy",
    title: "Best Moorings in Amalfi Coast, Italy",
    excerpt: "Navigate the stunning Amalfi Coast with our insider guide to moorings and marinas.",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
    author: "Giuseppe R.",
    date: "January 8, 2026",
    category: "Destinations",
    readTime: "10 min",
    body: [
      { type: "p", text: "The Amalfi Coast packs lemon-terraced cliffs, pastel villages and Roman history into a few miles of dramatic shoreline. It is also busy, deep close in, and tightly regulated — so a little local knowledge goes a long way." },
      { type: "h2", text: "Moorings over anchors" },
      { type: "p", text: "Much of the coast falls within protected marine areas where anchoring is restricted to safeguard the seagrass meadows. Licensed mooring fields fill the gap: pick up a buoy, pay the attendant who comes by tender, and enjoy a clear conscience and a secure night." },
      { type: "h2", text: "Key stops" },
      { type: "ul", items: [
        "Amalfi — the namesake town, with a small marina and buoy field.",
        "Positano — glamorous and crowded; book ahead or arrive early.",
        "Nerano (Marina del Cantone) — calmer water and legendary seafood.",
        "Li Galli islands — a postcard anchorage off Positano, weather permitting.",
      ]},
      { type: "p", text: "Capri lies just across the water and deserves a day of its own, but its moorings are among the priciest in the Mediterranean — plan and reserve accordingly." },
      { type: "h2", text: "Timing and weather" },
      { type: "p", text: "The coast is exposed to the south and west. Settled summer mornings are usually calm; afternoon sea breezes build quickly. Aim to be on your buoy by early afternoon and keep an eye on any southerly shift." },
    ],
  },
  {
    id: 4,
    slug: "discovering-albanian-riviera-by-boat",
    title: "Discovering Albanian Riviera by Boat",
    excerpt: "Europe's last undiscovered coastline offers incredible value for moorings.",
    image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
    author: "Erion M.",
    date: "January 6, 2026",
    category: "Destinations",
    readTime: "6 min",
    body: [
      { type: "p", text: "While the Croatian and Greek coasts groan under summer traffic, the Albanian Riviera remains gloriously uncrowded. Clear water, dramatic mountains tumbling into the Ionian, and prices that feel like a decade ago make it one of the Mediterranean's last genuine frontiers." },
      { type: "h2", text: "A coast on the rise" },
      { type: "p", text: "Infrastructure is improving fast. Sarandë and Vlorë now offer proper facilities, and new mooring fields are appearing in the bays between them. Arrive with realistic expectations — services are still thinner than further north — and you will be rewarded with space and silence." },
      { type: "h2", text: "Highlights" },
      { type: "ul", items: [
        "Porto Palermo — a near-perfect natural harbour beneath an Ali Pasha castle.",
        "Sarandë — the main southern hub, opposite Corfu.",
        "Gjipe — a wild beach cove at the mouth of a canyon.",
        "Karaburun peninsula — uninhabited, with caves and crystal water.",
      ]},
      { type: "h2", text: "Formalities" },
      { type: "p", text: "Albania requires formal check-in and check-out with the port authorities; using a local agent smooths the paperwork considerably. Carry cash, confirm your mooring in advance where listings exist, and respect that this is still a developing cruising ground." },
    ],
  },
  {
    id: 5,
    slug: "anchoring-in-strong-winds-expert-tips",
    title: "Anchoring in Strong Winds: Expert Tips",
    excerpt: "When the Bura or Meltemi hits, you need to know these techniques.",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",
    author: "Captain Dimitri",
    date: "December 20, 2025",
    category: "Tips & Guides",
    readTime: "12 min",
    body: [
      { type: "p", text: "The Mediterranean's famous winds — the Adriatic Bura, the Aegean Meltemi, the Mistral of the Gulf of Lion — can turn a peaceful anchorage into a dangerous lee shore in minutes. Good ground tackle technique is the difference between a tense night and a sleepless emergency." },
      { type: "h2", text: "Scope is everything" },
      { type: "p", text: "In settled weather a scope of 4:1 may hold, but when it pipes up you want 5:1 to 7:1 of chain, more if you carry rope rode. The catenary of a heavy chain absorbs the snatch loads that drag anchors. If your bay is crowded, this is the moment to find more room rather than less." },
      { type: "h2", text: "Set, then test" },
      { type: "ul", items: [
        "Lower the anchor, do not throw it; let it settle on the bottom.",
        "Pay out scope as you drift back, then snub off.",
        "Power astern at increasing revs to dig the anchor in.",
        "Take transits ashore to confirm you are truly holding.",
      ]},
      { type: "h2", text: "When the Bura threatens" },
      { type: "p", text: "Katabatic winds like the Bura arrive with little warning and ferocious gusts that bear no relation to the gentle morning. Choose anchorages sheltered from the north and east, rig a snubber to protect the windlass, and keep the engine ready. If holding is doubtful, a marina berth or a robust mooring buoy is cheap insurance." },
      { type: "p", text: "Finally, set an anchor-watch alarm and trust your instincts. If the bay feels wrong, it probably is — move while you still have daylight and sea room." },
    ],
  },
  {
    id: 6,
    slug: "peer-to-peer-mooring-changing-sailing",
    title: "How Peer-to-Peer Mooring is Changing Sailing",
    excerpt: "The sharing economy has finally reached the nautical world — moorings and marinas unite.",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
    author: "M. Bosic",
    date: "December 12, 2025",
    category: "Industry",
    readTime: "8 min",
    body: [
      { type: "p", text: "For decades, finding a berth meant phoning around marinas or hoping a harbourmaster answered the VHF. The sharing economy that reshaped travel and transport has finally reached the water — and it is quietly transforming how sailors find a place to stop." },
      { type: "h2", text: "Unlocking idle capacity" },
      { type: "p", text: "Thousands of private moorings sit empty for most of the year while their owners are ashore or cruising elsewhere. A peer-to-peer marketplace lets those owners list the buoy when they are away, and lets visiting skippers book it with confidence — depth, holding and contact details included." },
      { type: "h2", text: "Why it works for everyone" },
      { type: "ul", items: [
        "Owners earn from an asset that otherwise costs them money.",
        "Visitors get a guaranteed, rated spot instead of circling at dusk.",
        "Marinas fill short-notice gaps and reach new customers.",
        "Coastal communities see spending spread beyond the few big ports.",
      ]},
      { type: "h2", text: "Trust is the product" },
      { type: "p", text: "The technology is simple; the hard part is trust. Verified listings, transparent reviews, secure payments and clear cancellation terms are what turn a classified ad into a dependable booking. Get those right and the buoy in a stranger's bay becomes as easy to reserve as a hotel room." },
    ],
  },
  {
    id: 7,
    slug: "best-mediterranean-marinas-winter-storage",
    title: "Best Mediterranean Marinas for Winter Storage",
    excerpt: "Compare prices, services, and locations for overwintering your vessel at top Mediterranean marinas.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    author: "D. Lazukic",
    date: "November 28, 2025",
    category: "For Providers",
    readTime: "10 min",
    body: [
      { type: "p", text: "When the season ends, every owner faces the same question: where does the boat sleep for winter? The choice affects your budget, your spring commissioning, and the condition of the vessel come April." },
      { type: "h2", text: "Afloat or ashore?" },
      { type: "p", text: "Staying in the water is cheaper up front and lets you use the boat on mild winter days, but it demands regular checks on lines, fenders and bilges. Hauling out costs more but protects the hull, stops marine growth, and is the only sensible option in regions prone to violent winter storms." },
      { type: "h2", text: "Regions worth comparing" },
      { type: "ul", items: [
        "Northern Adriatic (Croatia, Slovenia) — excellent yards, well-priced lift-outs.",
        "Greece (Ionian and Saronic) — mild winters and a strong refit industry.",
        "Tunisia and Turkey — among the lowest storage rates in the Med.",
        "Spain's Costas — convenient flights and big travel-lift capacity.",
      ]},
      { type: "h2", text: "Reading the quote" },
      { type: "p", text: "A headline price rarely tells the whole story. Ask about lift and launch fees, pressure-washing, cradle hire, mast unstepping, and whether liveaboard or DIY work is allowed. The cheapest yard is not cheap if every service carries an extra charge." },
      { type: "p", text: "Book early. The best winter spots — and the best yards — are reserved long before the first autumn gale." },
    ],
  },
  {
    id: 8,
    slug: "moorings-vs-marinas-how-to-choose",
    title: "How to Choose Between Moorings and Marinas",
    excerpt: "Pros, cons and cost comparison — which option suits your sailing style?",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80",
    author: "Ana K.",
    date: "November 15, 2025",
    category: "Tips & Guides",
    readTime: "7 min",
    body: [
      { type: "p", text: "Mooring buoy or marina berth? It is one of the most common questions in coastal cruising, and the honest answer is: it depends on the night, the weather, and what you value most." },
      { type: "h2", text: "The case for a mooring" },
      { type: "p", text: "A mooring buoy in a sheltered bay is cheaper, quieter and closer to nature. You swim off the boat, you wake to birdsong instead of dock chatter, and you keep your independence. The price is convenience: you need a working tender, and resupplying water and power takes planning." },
      { type: "h2", text: "The case for a marina" },
      { type: "ul", items: [
        "Shore power, water and Wi-Fi on tap.",
        "Easy provisioning, restaurants and transport links.",
        "Security and shelter in heavy weather.",
        "Simple step-ashore access for guests and families.",
      ]},
      { type: "h2", text: "A simple rule of thumb" },
      { type: "p", text: "Use moorings for calm, settled nights when you want peace and a swim; choose a marina when the forecast turns, when you need to restock and recharge, or when you simply want an easy evening ashore. The best cruises mix the two — and booking either in advance removes the only real stress from the decision." },
    ],
  },
  {
    id: 9,
    slug: "mooring-booking-launches-albania-malta",
    title: "Mooring Booking Launches in Albania and Malta",
    excerpt: "New countries join the Mediterranean's largest mooring marketplace.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    author: "M. Bosic",
    date: "November 1, 2025",
    category: "News",
    readTime: "5 min",
    body: [
      { type: "p", text: "We are delighted to announce that Mooring Booking is now live in Albania and Malta, extending the Mediterranean's fastest-growing berth and mooring marketplace to two of the region's most exciting cruising grounds." },
      { type: "h2", text: "Why these two, now" },
      { type: "p", text: "Albania's Ionian coast is opening up rapidly, with new mooring fields and improving harbour services drawing more sailors each season. Malta, at the crossroads of the central Mediterranean, is a year-round hub for charter and long-distance cruising. Both have been at the top of our community's request list." },
      { type: "h2", text: "What's available from day one" },
      { type: "ul", items: [
        "Verified mooring and berth listings with depth and holding details.",
        "Instant booking and secure online payment.",
        "Local host contacts and clear arrival instructions.",
        "Reviews from skippers who have already tied up there.",
      ]},
      { type: "h2", text: "For local owners" },
      { type: "p", text: "If you manage a buoy, quay or marina in Albania or Malta, you can list it in minutes and start receiving bookings this season. Joining is free; we take a small commission only when you earn. Welcome aboard." },
    ],
  },
];

export const getBlogPost = (slug: string): BlogPost | undefined =>
  blogPosts.find((p) => p.slug === slug);

export const featuredPost = blogPosts.find((p) => p.featured) ?? blogPosts[0];

/** All non-featured posts, in display order. */
export const listPosts = blogPosts.filter((p) => !p.featured);
