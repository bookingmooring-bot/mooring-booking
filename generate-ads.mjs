import { GoogleGenAI } from "./.agents/skills/nano-banana-2-skill/node_modules/@google/genai/dist/index.mjs";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// Load API key
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      if (key && value && !process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFile(join(process.cwd(), ".env"));
loadEnvFile(join(homedir(), ".nano-banana", ".env"));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("No GEMINI_API_KEY found!"); process.exit(1); }

const ai = new GoogleGenAI({ apiKey });
const OUTPUT_DIR = "./ad-visuals";

// 10 completely different ad visual concepts for Mooring Booking
const ads = [
  {
    name: "ad-01-aerial-golden-earnings",
    aspect: "1:1",
    prompt: `Premium Facebook feed ad for Mooring Booking nautical platform. Stunning aerial drone photography of a Croatian Adriatic cove at golden hour sunset, crystal azure water, a white sailboat moored to a private buoy. The image has a dark amber-to-transparent gradient overlay at the bottom third. Overlaid bold white sans-serif text at top: "Vaši vezovi zaslužuju više brodova ⚓". Bottom area: clean white rounded CTA button with text "Registruj se ODMAH →" in navy. Top-right corner: small anchor icon + "Mooring Booking" in white. Professional ad design, cinematic, ultra-realistic photographic quality, 1:1 square format.`
  },
  {
    name: "ad-02-split-app-sea",
    aspect: "1:1",
    prompt: `Modern tech Facebook ad for Mooring Booking AI nautical app. Split-screen composition: left half shows a sleek dark navy mobile app interface with a GPS map showing colorful mooring pins and an AI search bar glowing in cyan; right half shows a serene Mediterranean bay with a sailing yacht at anchor in turquoise water. A glowing gradient divider separates both sides. Bold white text across center of both panels: "AI dovodi kapetane · Ti samo naplaćuješ". Bottom: deep ocean blue CTA button "Dodaj svoje vezove →". Color palette: dark navy #0A2342, electric cyan #00B4D8, white. Professional fintech/tech product ad aesthetic, 1:1 square format.`
  },
  {
    name: "ad-03-empty-berth-fomo",
    aspect: "1:1",
    prompt: `Emotional storytelling Facebook ad. Hero photo of an empty wooden dock/berth in a stunning Mediterranean cove on a bright summer day, turquoise water, blue sky. Semi-transparent dark overlay covers top 40% of image. Large bold white text overlay at top: "Ovaj vez mogao je zaraditi €300 ove sedmice." Smaller grey sub-text below: "Mooring Booking ga je mogao popuniti." Bottom stripe: solid ocean-blue gradient with white CTA button "Registruj se ODMAH". Top-left: small anchor logo + "Mooring Booking" in white. Cinematic photography style, slightly melancholic mood with hopeful resolution. 1:1 square Facebook feed format.`
  },
  {
    name: "ad-04-marina-birds-eye",
    aspect: "1:1",
    prompt: `Professional B2B Facebook ad for marina operators. Top-down aerial photograph of a Mediterranean marina with dozens of boats moored in organized rows, clear teal water, white docks. Corporate navy blue and white overlay design. Bold headline text overlaid: "Za marine, koncesionare i privatne vlasnike". Below it in smaller text: "AI platforma koja radi za vaše vezove." Bottom area has a professional navy gradient strip with: "Mooring Booking" logo anchor icon + white button "Saznaj više →". Premium corporate photography aesthetic, clean and professional. 1:1 square format.`
  },
  {
    name: "ad-05-stories-60sec-steps",
    aspect: "9:16",
    prompt: `Instagram Stories/Reels vertical ad 9:16 for Mooring Booking. Deep ocean blue gradient background (#0A2342 to #001529). Clean, modern infographic-style design. Large white bold text at top "Samo 60 sekundi:" with a subtle golden underline. Three illustrated process steps stacked vertically with icons: 1) a clipboard icon - "Popunite kratku anketu" 2) an anchor/buoy icon - "Dodajte vaše vezove" 3) a coin/money icon - "Počnite zarađivati od ove sezone". Bottom: "Mooring Booking" wordmark in white with golden anchor emoji. Gold rounded CTA button: "POČNI ODMAH →". Subtle wavy sea texture in background. Mobile-first, very readable, premium app marketing look.`
  },
  {
    name: "ad-06-passive-income-counter",
    aspect: "1:1",
    prompt: `Bold graphic Facebook ad focusing on earnings. Dark deep-sea navy background with subtle ocean texture. Large centered golden number: "€5.000+" in huge bold typography, below it smaller white text: "prosječna godišnja zarada po vezu". Then a simple divider. Beneath: "Koliko zarađuje vaš vez sada? 🤔". Below: white subline "Besplatna registracija · 15% samo od rezervacija". Bottom: bright cyan CTA button "Registruj vezove ODMAH →". Small "Mooring Booking ⚓" at top. Eye-catching financial/earnings ad aesthetic, high contrast, bold typography-driven design. 1:1 square format.`
  },
  {
    name: "ad-07-before-after-split",
    aspect: "1:1",
    prompt: `Facebook ad with a horizontal before/after comparison concept. Top half (slightly darker, desaturated): empty mooring buoy floating alone in still water with text overlay "Prije: €0 zarade od veza". Bottom half (vibrant, saturated colors): same buoy area but with a beautiful sailboat moored there, golden sunlight, text overlay "Poslije: €5.000+ po sezoni". In the center dividing strip: "Mooring Booking" logo in white. Bottom CTA: "Popunite anketu za 60 sekundi ODMAH". Dark navy band at very bottom. Dramatic visual contrast between monochrome top and vivid color bottom. 1:1 square format.`
  },
  {
    name: "ad-08-wide-landscape-google",
    aspect: "16:9",
    prompt: `Wide horizontal display/banner ad (16:9) for Mooring Booking. Cinematic wide-angle photograph of the Mediterranean coast at sunrise, a private dock stretching into calm golden-hour water, sailboats in the background. Dark gradient overlay on the left third of the image. Left side text overlay: large bold white headline "Pretvorite prazan vez u pasivni prihod" then smaller: "AI pretraga · Instant rezervacija · Sigurno plaćanje" with checkmarks. Bottom left: ocean blue CTA button "Registrujte vezove ODMAH →". Right side: full-brightness coastal scene visible. "Mooring Booking ⚓" logo top-left. Perfect for Google Display ads and Facebook landscape format. 16:9 ratio.`
  },
  {
    name: "ad-09-trust-partner-card",
    aspect: "4:5",
    prompt: `Professional trust-building Facebook ad. Elegant card design with white background and subtle ocean-wave texture at the bottom. Clean sans-serif typography. Top: "Mooring Booking" in navy blue with gold anchor icon. Center: large bold navy text "Savršen partner za vaše vezove" then below: checklist style layout with four bullet items in navy: "✓ Besplatna registracija" | "✓ Puna kontrola cijena" | "✓ AI dovodi nautičare" | "✓ Čak i uz druge platforme". Bottom section: warm gradient blue strip with a white CTA "Kliknite i registrujte ODMAH". Side border: thin gold/amber stripe as design element. Clean, trustworthy, professional aesthetic. 4:5 portrait format.`
  },
  {
    name: "ad-10-carousel-card-one",
    aspect: "1:1",
    prompt: `Dynamic Facebook carousel card number 1 of 3. Bold vibrant design. Background: gradient from deep navy (#0D1B2A) to Mediterranean blue (#1565C0). White bold number "01" large in the top left as a design element. Center: large white icon of a sailboat anchor. Below icon: bold white text "Kapetani vas pronađu AI pretragom" then smaller white text: "Bez čekanja. Bez komplikacija. Bez hladnih poziva." Bottom: cyan gradient strip with "Mooring Booking" and right-arrow symbol suggesting next card. Modern, energetic, app-marketing style. 1:1 square for carousel format.`
  },
];

async function generateAd(ad) {
  console.log(`\n⚓ Generating: ${ad.name} (${ad.aspect})...`);
  
  const config = {
    responseModalities: ["IMAGE", "TEXT"],
    imageConfig: {
      imageSize: "1K",
      ...(ad.aspect ? { aspectRatio: ad.aspect } : {}),
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    config,
    contents: [{ role: "user", parts: [{ text: ad.prompt }] }],
  });

  let saved = false;
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const ext = (part.inlineData.mimeType || "image/png").split("/")[1] || "png";
        const fileName = `${ad.name}.${ext}`;
        const outputPath = join(OUTPUT_DIR, fileName);
        const buffer = Buffer.from(part.inlineData.data || "", "base64");
        await writeFile(outputPath, buffer);
        console.log(`  ✅ Saved: ${outputPath}`);
        saved = true;
      } else if (part.text) {
        console.log(`  ℹ️  ${part.text.slice(0, 100)}`);
      }
    }
  }
  
  if (!saved) {
    console.log(`  ⚠️  No image returned for ${ad.name}`);
  }

  // Add a small delay between calls to avoid rate limiting
  await new Promise(r => setTimeout(r, 2000));
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  console.log("🚢 Mooring Booking — Generating 10 Ad Visuals with Nano Banana 2");
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`🔑 API Key: ${apiKey.slice(0, 8)}...`);
  console.log("=".repeat(60));

  for (const ad of ads) {
    try {
      await generateAd(ad);
    } catch (err) {
      console.error(`  ❌ Error for ${ad.name}: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Done! Check ./ad-visuals/ folder for all 10 images.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
