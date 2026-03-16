import { GoogleGenAI } from "./.agents/skills/nano-banana-2-skill/node_modules/@google/genai/dist/index.mjs";
import { writeFile, mkdir } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

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
const OUTPUT_DIR = "./ad-visuals";

// Only the 4 that failed
const ads = [
  {
    name: "ad-02-split-app-sea",
    aspect: "1:1",
    prompt: `Modern tech Facebook ad for Mooring Booking AI nautical app. Split-screen composition: left half shows a sleek dark navy mobile app with a GPS map showing mooring location pins and an AI search bar glowing cyan; right half shows a Mediterranean sailing yacht in turquoise water. Bold white text across center: "AI dovodi kapetane · Ti samo naplaćuješ". Bottom: deep blue CTA button "Dodaj svoje vezove →". Color palette: navy #0A2342, cyan #00B4D8, white. Professional tech ad, 1:1 square format.`
  },
  {
    name: "ad-03-empty-berth-fomo",
    aspect: "1:1",
    prompt: `Emotional Facebook ad. Photo of an empty wooden dock/berth in a Mediterranean cove on a sunny summer day, turquoise water, blue sky. Dark overlay on top 40%. Bold white text at top: "Ovaj vez mogao je zaraditi 300 EUR ove sedmice." Smaller grey text below: "Mooring Booking ga je mogao popuniti." Bottom solid ocean-blue gradient with white CTA button "Registruj se ODMAH". Small anchor logo top-left: "Mooring Booking". Cinematic style. 1:1 square format.`
  },
  {
    name: "ad-04-marina-birds-eye",
    aspect: "1:1",
    prompt: `Professional B2B Facebook ad for marina operators. Top-down aerial photo of a Mediterranean marina with boats moored in organized rows, clear teal water, white docks. Corporate navy blue overlay design. Bold headline text: "Za marine, koncesionare i privatne vlasnike". Smaller text: "AI platforma koja radi za vase vezove." Bottom area has professional navy gradient with "Mooring Booking" logo + white button "Saznaj vise". Clean corporate look. 1:1 square format.`
  },
  {
    name: "ad-05-stories-60sec-steps",
    aspect: "9:16",
    prompt: `Instagram Stories vertical ad 9:16 for Mooring Booking. Deep ocean blue gradient background. Clean modern infographic design. Large white bold text at top: "Samo 60 sekundi:" with gold underline. Three process steps stacked vertically: 1) clipboard icon "Popunite kratku anketu" 2) anchor icon "Dodajte vase vezove" 3) coin icon "Primajte rezervacije". Bottom: "Mooring Booking" wordmark in white. Gold CTA button: "POCNI ODMAH". Subtle wave texture in background. Mobile app marketing look. Vertical 9:16 format.`
  },
];

async function generateAd(ad, attempt = 1) {
  console.log(`\n⚓ [Attempt ${attempt}] Generating: ${ad.name} (${ad.aspect})...`);
  
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
        const outputPath = join(OUTPUT_DIR, `${ad.name}.${ext}`);
        const buffer = Buffer.from(part.inlineData.data || "", "base64");
        await writeFile(outputPath, buffer);
        console.log(`  ✅ Saved: ${outputPath}`);
        saved = true;
      } else if (part.text) {
        console.log(`  ℹ️  ${part.text.slice(0, 100)}`);
      }
    }
  }
  
  if (!saved) console.log(`  ⚠️  No image returned for ${ad.name}`);
  await new Promise(r => setTimeout(r, 3000));
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("🔄 Mooring Booking — Retrying 4 Failed Ad Visuals");
  console.log("=".repeat(50));

  for (const ad of ads) {
    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        await generateAd(ad, attempt);
        success = true;
      } catch (err) {
        console.error(`  ❌ Attempt ${attempt} failed: ${err.message.slice(0, 80)}`);
        if (attempt < 3) {
          console.log(`  ⏳ Waiting 10s before retry...`);
          await new Promise(r => setTimeout(r, 10000));
        }
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Retry complete!");
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
