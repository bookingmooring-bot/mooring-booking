import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, LayoutAnimation, Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Article Data ──────────────────────────────────────────────────────────────
const ARTICLES = [
  // Safety
  {
    id: 's1', category: 'Safety', categoryColor: COLORS.red,
    title: 'Top 10 Knots Every Skipper Must Know',
    readTime: '5 min', icon: '🪢',
    summary: 'From the bowline to the cleat hitch, knowing the right knot at the right time can save your boat.',
    content: `**Bowline** — The king of knots. Creates a fixed loop at the end of a line. Perfect for securing to a mooring buoy.\n\n**Cleat Hitch** — The go-to for securing lines to cleats on docks and boats. Quick to tie and untie.\n\n**Clove Hitch** — Great for attaching lines to rings or posts temporarily.\n\n**Round Turn & Two Half Hitches** — Ideal for securing to rings and posts when load may vary.\n\n**Figure Eight** — A stopper knot that prevents a line from running through a block or fairlead.\n\n**Sheet Bend** — Join two lines of different thickness. Never trust a square knot for this.\n\n**Rolling Hitch** — Attach a line to another under load. Essential for towing.\n\n**Reef Knot** — Tie two ends of the same line to bundle a reefed sail.\n\n**Anchor Hitch** — The proper way to secure your anchor rode to the anchor.\n\n**Mooring Hitch** — Quick-release knot for temporary mooring at a dock.`,
  },
  {
    id: 's2', category: 'Safety', categoryColor: COLORS.red,
    title: 'MAYDAY vs PAN PAN: When to Use Which',
    readTime: '3 min', icon: '📡',
    summary: 'Knowing which distress signal to transmit could save your life. Learn the difference before you cast off.',
    content: `**MAYDAY** — Grave and imminent danger. Use this when lives are at risk: sinking, fire aboard, person overboard with no recovery possible.\n\nTransmit on VHF Channel 16:\n"MAYDAY MAYDAY MAYDAY — This is [vessel name] — Position: [lat/lng] — Nature of distress — Persons aboard — Any other information"\n\n**PAN PAN** — Urgent situation, but not immediately life-threatening. Use for: engine failure in traffic, medical emergency (not life-threatening), taking on water slowly.\n\n"PAN PAN PAN PAN PAN PAN — All stations — This is [vessel name]..."\n\n**SECURITÉ** — Safety announcement. Use for: navigational hazards, severe weather warnings.\n\n💡 Always keep your VHF radio on Channel 16 while underway.`,
  },
  {
    id: 's3', category: 'Safety', categoryColor: COLORS.red,
    title: 'Life Jacket Selection & Fitting Guide',
    readTime: '4 min', icon: '🦺',
    summary: 'The right life jacket only saves you if it fits correctly and is worn. Here\'s how to choose and fit one.',
    content: `**Types of Life Jackets:**\n\n• **50N (Buoyancy Aid)** — For competent swimmers in sheltered water. Does NOT guarantee face-up position.\n\n• **100N (Life Jacket)** — General boating in sheltered coastal waters. Good for day sailing.\n\n• **150N (ISO)** — Offshore and rough sea use. Will turn most unconscious wearers face-up.\n\n• **275N (Ocean)** — Open ocean sailing. Highest buoyancy, works in heavy gear.\n\n**Fitting Correctly:**\n1. Fasten all zips and buckles\n2. Tighten until snug — you should be able to slide flat hand underneath\n3. Cannot be lifted over your head when someone pulls straight up\n4. Check crotch strap if fitted\n\n**Maintenance:** Inflate annually to check for leaks. Replace gas cylinder if fired or expired.`,
  },

  // Navigation
  {
    id: 'n1', category: 'Navigation', categoryColor: COLORS.blue,
    title: 'Reading Nautical Charts: A Beginner\'s Guide',
    readTime: '7 min', icon: '🗺️',
    summary: 'Understand depths, hazards, buoys, and what every symbol means before you leave the marina.',
    content: `**Depths & Soundings:**\nNumbers on charts show depths in metres (modern charts) at Chart Datum (lowest astronomical tide). Always add tide height for safety.\n\n**Contour Lines:** Submarine contours show the shape of the seabed. Closely spaced = steep drop-off.\n\n**Hazards:**\n• (*)  = wreck\n• Dotted magenta line = caution area\n• Solid magenta = restricted zone\n\n**Buoys & Markers (IALA A — Europe, Africa, Asia, Australia):**\n• **Red** — Port side when entering harbour (leave to port)\n• **Green** — Starboard side when entering\n• **Yellow** — Special marks (cables, buoys)\n• **Black/Yellow** — Cardinal marks (north/south/east/west of danger)\n\n**Chart Symbols Reference:**\n• ⊕ = Anchorage\n• AM = Marina\n• Lr = Leading light\n• FL = Flashing light\n\n💡 Always cross-reference paper charts with electronic. Never rely on a single source.`,
  },
  {
    id: 'n2', category: 'Navigation', categoryColor: COLORS.blue,
    title: 'Using GPS & AIS Together for Safe Sailing',
    readTime: '5 min', icon: '📍',
    summary: 'GPS tells you where you are. AIS tells you where everyone else is. Combined, they prevent collisions.',
    content: `**GPS Basics:**\nYour chartplotter uses GPS to show your position on electronic charts. Key things to check:\n\n• CPA (Closest Point of Approach) — how close another vessel will get\n• COG (Course Over Ground) — your actual direction of travel\n• SOG (Speed Over Ground) — your actual speed\n• VMG (Velocity Made Good) — speed toward your waypoint\n\n**AIS (Automatic Identification System):**\nTransponders broadcast vessel info: name, MMSI, position, COG, SOG, destination.\n\n• Class A — Required on all commercial vessels >300GT\n• Class B — Voluntary for recreational vessels but highly recommended\n\n**Best Practices:**\n1. Set CPA alarm at 0.5nm in busy waters\n2. Never assume AIS shows all vessels — fishing boats often lack transponders\n3. Cross-check radar and visual when AIS conflicts\n4. Maintain proper lookout — instruments supplement, never replace`,
  },

  // Weather
  {
    id: 'w1', category: 'Weather', categoryColor: COLORS.cyan,
    title: 'Understanding Mediterranean Weather Patterns',
    readTime: '6 min', icon: '🌤️',
    summary: 'The Bora, Tramontane, Meltemi — every Mediterranean sailor must know these regional winds.',
    content: `**Bora (Adriatic):**\nThe most feared wind in the Adriatic. Cold, dry NE wind from the Dinaric Alps. Can exceed 100 km/h. Typically lasts 1-9 days in winter. Warning signs: clear sky, unusual visibility, falling barometer.\n\n**Jugo/Scirocco:**\nS-SE warm, humid wind from the Sahara. Often brings red dust and reduced visibility. Can build significant swell. Typically lasts 2-5 days.\n\n**Meltemi (Aegean):**\nThe summer NW monsoon of the Aegean. Strengthens from midday, dies at sunset. Can reach force 6-7. Predictable but not to be underestimated.\n\n**Tramontane (W Mediterranean):**\nNortherly wind from the Pyrenees. Affects French and Spanish coasts. Can be very strong.\n\n**Maestral/Mistral:**\nNW wind, often gusty and cold. Affects the Gulf of Lion strongly.\n\n**Reading Forecasts:**\n• Use Windy.com, Predictwind, or Passage Weather\n• Always check multiple models (GFS, ECMWF)\n• The 0-6h forecast is quite reliable; 48-72h is directional only`,
  },
  {
    id: 'w2', category: 'Weather', categoryColor: COLORS.cyan,
    title: 'Reading Synoptic Charts for Sailors',
    readTime: '5 min', icon: '🌀',
    summary: 'Isobars, fronts, and pressure systems decoded for practical passage planning.',
    content: `**Pressure Systems:**\n• **High (H)** — Anticyclone. Stable, light winds. In summer = good sailing; in winter = fog risk.\n• **Low (L)** — Depression. Strong winds, unsettled weather. Wind circulates counterclockwise in Northern Hemisphere.\n\n**Isobars:**\nLines of equal pressure. Closely packed = strong wind gradient = stronger winds.\n\nA rough guide: In mid-latitudes, 4 isobars crossing 10° of latitude = ~30 knots of wind.\n\n**Fronts:**\n• **Warm Front** — Gradual deterioration, prolonged rain, backing wind\n• **Cold Front** — Sudden: squalls, wind shift, heavy showers, rapid clearing\n• **Occluded Front** — Complex; associated with mature lows\n\n**COLs:**\nAreas between pressure systems. Light, variable winds — often very pleasant for sailing.\n\n💡 Check ECMWF (windyty.com) every 12 hours when on passage.`,
  },

  // Destinations
  {
    id: 'd1', category: 'Destinations', categoryColor: COLORS.primary,
    title: 'Anchoring Secrets in the Mediterranean',
    readTime: '8 min', icon: '⚓',
    summary: 'Mediterranean anchoring demands technique. Learn about holding ground, stern-to tactics, and the best hidden coves.',
    content: `**Mediterranean Mooring (Med Moor):**\nLet out anchor, reverse slowly to dock. Two stern lines ashore. Takes practice.\n\n1. Prepare anchor and two stern lines\n2. Approach bow-first at slow speed\n3. Drop anchor 30-40m from berth\n4. Reverse slowly, laying chain\n5. When close, crew take stern lines ashore\n6. Tension anchor chain until snug\n\n**Holding Ground by Region:**\n• Croatian Dalmatia — Rocky bottom with weed patches. Often poor holding. Use CQR or Rocna.\n• Greek Islands — Sandy patches excellent; rocky patches terrible. Dive to check.\n• Italian coasts — Varies. Posidonia (seagrass) is protected. Don't anchor in it.\n• Turkish coast — Generally good sandy/muddy holding.\n\n**Best Anchorages:**\n🇭🇷 Kornati Islands — 90 uninhabited islands, crystal water\n🇬🇷 Fiskardo, Kefalonia — Postcard-perfect Venetian harbour\n🇮🇹 Cala Gonone, Sardinia — Dramatic limestone cliffs\n🇪🇸 Formentera — Turquoise water, gorgeous but crowded in summer`,
  },
  {
    id: 'd2', category: 'Destinations', categoryColor: COLORS.primary,
    title: 'Croatia: Top 7 Moring Spots for 2025',
    readTime: '6 min', icon: '🇭🇷',
    summary: 'From Lastovo to Vis, discover the most spectacular mooring locations on the Croatian coast.',
    content: `🏆 **1. Lastovo Archipelago**\nThe most remote and pristine area of the Croatian coast. Excellent holding in sandy bays. Very few tourists outside summer.\n\n⚓ **2. Vis Island (Stiniva Cove)**\nOnly accessible by sea or a challenging hike. Crystal water, dramatic cliffs. Arrive before 10am for a spot.\n\n🌊 **3. Kornati National Park**\nPay the park fee (€30-50/day) but get access to 90 uninhabited islands. Organize buoys through Mooring Booking.\n\n🏖️ **4. Hvar Town**\nGlamorous harbour, excellent restaurants. Use the town moorings — anchoring inside bay is restricted.\n\n🐟 **5. Milna, Brač**\nProtected harbour, excellent shelter in Bora. Year-round community. Friendly marinars.\n\n🌅 **6. Lošinj — Čikat Bay**\nNorthern Adriatic gem. The bay is packed with mooring buoys managed by ACI.\n\n🦜 **7. Šibenik Channel**\nGateway to Krka National Park. Anchor off Kaprije island or take a berth in Šibenik's medieval harbour.`,
  },

  // Maintenance
  {
    id: 'm1', category: 'Maintenance', categoryColor: COLORS.orange,
    title: 'Pre-Season Checklist: Get Your Boat Ready',
    readTime: '7 min', icon: '🔧',
    summary: 'A comprehensive spring commissioning checklist to ensure your season starts safely.',
    content: `**Engine Room:**\n☐ Change engine oil and filter\n☐ Check coolant level and antifreeze proportion\n☐ Inspect belts for wear and tension\n☐ Grease sea cocks\n☐ Check raw water impeller (replace every 2 years)\n☐ Check zincs / sacrificial anodes\n☐ Inspect shaft seal / stern gland\n\n**Sails & Rigging:**\n☐ Inspect all standing rigging (especially swage terminals)\n☐ Check masthead (use binoculars or go up)\n☐ Inspect running rigging for wear\n☐ Wash and inspect sails for UV damage\n☐ Check batten pockets and cars\n\n**Safety Equipment:**\n☐ Flares — within date?\n☐ EPIRB — registered and battery OK?\n☐ Life raft — within service date?\n☐ Fire extinguishers — charged?\n☐ Life jackets — bladder inflated, cylinders full?\n\n**Electrical:**\n☐ Check bilge pumps (auto and manual)\n☐ Test all navigation lights\n☐ Inspect battery banks and connections\n☐ Test VHF DSC and check MMSI programmed\n\n**Documentation:**\n☐ Ship's papers and registration\n☐ Radio licence\n☐ Insurance certificate\n☐ Crew list template ready`,
  },
  {
    id: 'm2', category: 'Maintenance', categoryColor: COLORS.orange,
    title: 'How to Prevent Mooring Scuffs & Gelcoat Damage',
    readTime: '3 min', icon: '⛵',
    summary: 'A few simple measures can save hundreds in gelcoat repairs.',
    content: `**The Right Fenders:**\n• Size: fender diameter should be ~1 inch per 5m of boat length\n• Position: ribbed fenders vertical, round fenders horizontal\n• Height: center at the widest point or slightly above waterline\n• Always use at least 3 per side\n\n**Fender Boards:**\nWhen docking against pilings, a wooden plank hung across 2+ fenders prevents the piling catching between fenders.\n\n**Chafe Protection:**\nUse chafe guards or leather sleeves where lines cross sharp edges — bow roller, fairleads, cleats. Chafe is the #1 cause of line failure.\n\n**At Anchor:**\n• Fit snubber / chain hook to absorb shock\n• Remove anchor chain weight from anchor locker by using snubber\n• In rolling anchorage, use baggywrinkle or chafe guards on lifelines\n\n**Regular Washing:**\nRinse hull with fresh water after every salt water exposure. Apply marine wax annually to protect gelcoat UV oxidation.`,
  },
];

const CATEGORIES = ['All', 'Safety', 'Navigation', 'Weather', 'Destinations', 'Maintenance'];
const CAT_ICONS: Record<string, string> = {
  All: 'book', Safety: 'shield', Navigation: 'compass', 
  Weather: 'partly-sunny', Destinations: 'map', Maintenance: 'construct',
};
const CAT_COLORS: Record<string, string> = {
  Safety: COLORS.red, Navigation: COLORS.blue, Weather: COLORS.cyan,
  Destinations: COLORS.primary, Maintenance: COLORS.orange,
};

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={i} style={styles.contentBold}>{line.replace(/\*\*/g, '')}</Text>;
      }
      if (line.match(/^\*\*(.*?)\*\*/)) {
        const parts = line.split(/\*\*(.*?)\*\*/);
        return (
          <Text key={i} style={styles.contentLine}>
            {parts.map((p, j) => j % 2 === 1
              ? <Text key={j} style={{ fontWeight: '700', color: COLORS.text }}>{p}</Text>
              : p
            )}
          </Text>
        );
      }
      if (line.startsWith('• ') || line.startsWith('☐ ')) {
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>{line.startsWith('☐') ? '☐' : '•'}</Text>
            <Text style={styles.bulletText}>{line.replace(/^[•☐] /, '')}</Text>
          </View>
        );
      }
      if (line.trim() === '') return <View key={i} style={{ height: 6 }} />;
      return <Text key={i} style={styles.contentLine}>{line}</Text>;
    });
  };

  return (
    <TouchableOpacity style={styles.articleCard} activeOpacity={0.85} onPress={toggle}>
      {/* Top accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: article.categoryColor }]} />

      <View style={styles.articleHeader}>
        <View style={[styles.articleIconWrap, { backgroundColor: article.categoryColor + '20' }]}>
          <Text style={{ fontSize: 22 }}>{article.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.catRow}>
            <View style={[styles.catPill, { backgroundColor: article.categoryColor + '15', borderColor: article.categoryColor + '30' }]}>
              <Text style={[styles.catText, { color: article.categoryColor }]}>{article.category}</Text>
            </View>
            <Text style={styles.readTime}>⏱ {article.readTime}</Text>
          </View>
          <Text style={styles.articleTitle}>{article.title}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textDim}
        />
      </View>

      {!expanded && (
        <Text style={styles.summaryText} numberOfLines={2}>{article.summary}</Text>
      )}

      {expanded && (
        <View style={styles.contentWrap}>
          <View style={styles.divider} />
          {renderContent(article.content)}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HandbookScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = ARTICLES;
    if (selectedCategory !== 'All') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        title: 'Sailing Handbook',
        headerStyle: { backgroundColor: COLORS.bg },
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '800' },
      }} />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Text style={{ fontSize: 36 }}>📖</Text>
          </View>
          <Text style={styles.heroTitle}>Sailing Handbook</Text>
          <Text style={styles.heroSub}>
            {ARTICLES.length} guides to make you a better skipper
          </Text>
        </View>

        {/* Sticky search + filters */}
        <View style={styles.stickyHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles..."
              placeholderTextColor={COLORS.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow2}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={(CAT_ICONS[cat] + (selectedCategory === cat ? '' : '-outline')) as any}
                  size={14}
                  color={selectedCategory === cat ? COLORS.bg : (CAT_COLORS[cat] || COLORS.textMuted)}
                />
                <Text style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Article List */}
        <View style={styles.articleList}>
          {filtered.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={{ fontSize: 32 }}>🔍</Text>
              <Text style={styles.noResultsText}>No articles found</Text>
            </View>
          ) : (
            filtered.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  hero: {
    alignItems: 'center', padding: SPACING.xl,
    paddingTop: SPACING.lg, paddingBottom: SPACING.lg,
  },
  heroIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  heroTitle: { ...FONTS.h1, marginBottom: 4 },
  heroSub: { ...FONTS.body, textAlign: 'center' },

  stickyHeader: { backgroundColor: COLORS.bg, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginHorizontal: SPACING.md, paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },

  catRow2: { paddingHorizontal: SPACING.md, gap: SPACING.xs },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.card, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  catBtnTextActive: { color: COLORS.bg, fontWeight: '700' },

  articleList: { padding: SPACING.md },

  articleCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardAccent: { height: 3 },
  articleHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    padding: SPACING.md,
  },
  articleIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  catPill: {
    borderRadius: RADIUS.full, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  readTime: { color: COLORS.textDim, fontSize: 11, fontWeight: '500' },
  articleTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, lineHeight: 21 },
  summaryText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },

  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  contentWrap: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  contentLine: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 2 },
  contentBold: { color: COLORS.text, fontWeight: '800', fontSize: 14, marginTop: SPACING.sm, marginBottom: 4 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bullet: { color: COLORS.primary, fontSize: 14, lineHeight: 21, width: 16 },
  bulletText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, flex: 1 },

  noResults: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  noResultsText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600' },
});
