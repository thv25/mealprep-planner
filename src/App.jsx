import { useState } from "react";

const HEALTH_CONDITIONS = [
  { id: "none", label: "No restrictions", icon: "🥗" },
  { id: "diabetes", label: "Diabetes / Low sugar", icon: "🩺" },
  { id: "heart", label: "Heart health", icon: "❤️" },
  { id: "gluten_free", label: "Gluten-free", icon: "🌾" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥦" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "keto", label: "Keto / Low-carb", icon: "🥩" },
  { id: "dairy_free", label: "Dairy-free", icon: "🥛" },
];

const CUISINE_STYLES = [
  { id: "mixed", label: "World mix", icon: "🌍", color: "#1D9E75" },
  { id: "soul_food", label: "Soul food", icon: "🍗", color: "#D97706" },
  { id: "asian", label: "Asian", icon: "🥢", color: "#DC2626" },
  { id: "mexican", label: "Mexican", icon: "🌮", color: "#7C3AED" },
  { id: "italian", label: "Italian", icon: "🍝", color: "#059669" },
  { id: "mediterranean", label: "Mediterranean", icon: "🫒", color: "#0284C7" },
  { id: "indian", label: "Indian", icon: "🍛", color: "#EA580C" },
  { id: "comfort", label: "Comfort food", icon: "🫕", color: "#9333EA" },
];

const PRICE_RANGES = [
  { id: "budget", label: "Budget", desc: "Under $3/meal", icon: "$", color: "#1D9E75", bg: "#F0FDF4", border: "#BBF7D0", text: "#14532D" },
  { id: "moderate", label: "Moderate", desc: "$3–$7/meal", icon: "$$", color: "#BA7517", bg: "#FFFBEB", border: "#FED7AA", text: "#78350F" },
  { id: "premium", label: "Premium", desc: "$7–$15/meal", icon: "$$$", color: "#533AB7", bg: "#F5F3FF", border: "#DDD6FE", text: "#3B1D8A" },
];

const VIBES = [
  { id: "none", label: "No puns", icon: "🚫", color: "#888" },
  { id: "music", label: "Music", icon: "🎵", color: "#7C3AED", examples: "e.g. 'Rolling Scones', 'Smash Mouth Guac'" },
  { id: "books", label: "Books", icon: "📚", color: "#1D4ED8", examples: "e.g. 'Lord of the Fries', 'The Grapes of Math'" },
  { id: "cars", label: "Cars", icon: "🚗", color: "#DC2626", examples: "e.g. 'Ford Fiesta Bowl', 'Fuel Injection Frittata'" },
  { id: "sports", label: "Sports", icon: "🏆", color: "#D97706", examples: "e.g. 'Slam Dunk Stew', 'Full-Court Press Panini'" },
  { id: "plants", label: "Plants", icon: "🌿", color: "#059669", examples: "e.g. 'Aloe Vera Good Soup', 'Fern Gully Frittata'" },
];


const PLANS = {
  single: { id: "single", label: "Single Plan", price: 5, priceLabel: "$5", desc: "One personalized meal prep plan", icon: "🥗", color: "#1D9E75", bg: "#F0FDF4", border: "#BBF7D0" },
  monthly: { id: "monthly", label: "Monthly Access", price: 15, priceLabel: "$15/mo", desc: "Up to 5 meal prep plans per month", icon: "⭐", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
};

const STORAGE_KEY = "mealprep_access";

function getAccess() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Check monthly hasn't expired
    if (data.type === "monthly") {
      const now = Date.now();
      if (now > data.expiresAt) { localStorage.removeItem(STORAGE_KEY); return null; }
    }
    return data;
  } catch { return null; }
}

function saveAccess(type, plansUsed = 0) {
  const data = {
    type,
    plansUsed,
    purchasedAt: Date.now(),
    expiresAt: type === "monthly" ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function canGeneratePlan(access) {
  if (!access) return false;
  if (access.type === "single") return access.plansUsed < 1;
  if (access.type === "monthly") return access.plansUsed < 5;
  return false;
}

const CUISINE_PROMPTS = {
  mixed: `CUISINE: Deliberately rotate through multiple world cuisines across the week — include dishes from at least 5 different cultures such as Southern soul food, Japanese, Mexican, Italian, Indian, Mediterranean, Thai, Korean, Ethiopian, or Caribbean. Each day should feel like a different part of the world. Name dishes authentically (e.g. "Chicken Tikka Masala", "Shrimp Tacos", "Pasta e Fagioli", "Bibimbap", "Jollof Rice").`,
  soul_food: `CUISINE: Traditional Southern Soul Food. Use authentic dishes — fried chicken, smothered pork chops, catfish, collard greens, black-eyed peas, cornbread, grits, mac and cheese, candied yams, oxtail, red beans and rice, hoppin' john, butter beans, okra, biscuits. Real Southern home cooking. Where a health condition applies, adapt the dish (e.g. baked instead of fried, less sodium) but keep the soul food spirit.`,
  asian: `CUISINE: Pan-Asian — rotate between Japanese (ramen, onigiri, miso soup, teriyaki), Korean (bibimbap, kimchi stew, japchae), Chinese (stir-fry, congee, dumplings), Thai (pad thai, green curry, larb), Vietnamese (pho, banh mi bowls, spring rolls). Use authentic dish names and flavors.`,
  mexican: `CUISINE: Mexican and Tex-Mex — tacos, enchiladas, pozole, tamales, chilaquiles, huevos rancheros, caldo de pollo, arroz con leche, elotes, sopes, tlayudas. Mix regional dishes. Use authentic names.`,
  italian: `CUISINE: Italian — pasta e fagioli, cacio e pepe, ribollita, panzanella, arancini, frittata, minestrone, osso buco, pappa al pomodoro, tiramisu overnight oats. Draw from different regions (Sicilian, Tuscan, Roman, Neapolitan). Use Italian dish names.`,
  mediterranean: `CUISINE: Mediterranean — Greek spanakopita, shakshuka, falafel, tabbouleh, baba ganoush, Turkish menemen, Moroccan tagine, Spanish tortilla, Lebanese fattoush, Egyptian koshari. Span the full Mediterranean basin with authentic dish names.`,
  indian: `CUISINE: Indian — rotate between North and South: dal makhani, biryani, dosas, idli sambar, chana masala, palak paneer, aloo gobi, rasam, khichdi, poha, upma, raita. Use authentic names and regional variety.`,
  comfort: `CUISINE: Global comfort food — mac and cheese, chicken pot pie, beef stew, grilled cheese, meatloaf, chicken noodle soup, shepherd's pie, mashed potatoes and gravy, baked ziti. Warm, hearty, nostalgic dishes.`,
};

const FOOD_IMAGES = {
  "overnight oats": "https://images.unsplash.com/photo-1614961908502-fab5a9be4de9?w=400",
  "avocado toast": "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400",
  "scrambled eggs": "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400",
  "smoothie": "https://images.unsplash.com/photo-1612832021026-945d3b0c2f0d?w=400",
  "salmon": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
  "chicken": "https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=400",
  "fried chicken": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400",
  "stir fry": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
  "ramen": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
  "pho": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
  "tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
  "taco": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
  "enchilada": "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=400",
  "pasta": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
  "risotto": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  "bowl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  "curry": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
  "dal": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
  "biryani": "https://images.unsplash.com/photo-1563379091339-03246963d587?w=400",
  "shakshuka": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400",
  "falafel": "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=400",
  "hummus": "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=400",
  "sweet potato": "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400",
  "oxtail": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  "collard": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  "grits": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  "cornbread": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  "mac and cheese": "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=400",
  "bibimbap": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400",
  "sushi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
  "dosa": "https://images.unsplash.com/photo-1630409351241-e90e7f5e4a0c?w=400",
  "omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400",
  "frittata": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400",
  "wrap": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
  "sandwich": "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400",
  "stew": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "beans": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "lentil": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "default breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  "default lunch": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "default dinner": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  "default snack": "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400",
};

function getMealImage(mealName, type) {
  const lower = (mealName || "").toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (!key.startsWith("default") && lower.includes(key)) return url;
  }
  return FOOD_IMAGES[`default ${type}`] || FOOD_IMAGES["default lunch"];
}

const FRESHNESS = {
  breakfast: { cook: "Prep night before or morning of", shelf: "1–2 days" },
  lunch: { cook: "Prep Sunday & Wednesday", shelf: "3–4 days" },
  dinner: { cook: "Cook fresh or prep 1–2 days ahead", shelf: "3–4 days" },
  snack: { cook: "Prep at start of week", shelf: "4–5 days" },
};

const parseJSON = (text) => {
  if (!text) return null;
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const arrStart = clean.indexOf("[");
  const arrEnd = clean.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(clean.slice(arrStart, arrEnd + 1)); } catch {}
  }
  const objStart = clean.indexOf("{");
  const objEnd = clean.lastIndexOf("}");
  if (objStart !== -1 && objEnd > objStart) {
    try { return JSON.parse(clean.slice(objStart, objEnd + 1)); } catch {}
  }
  try {
    const fixed = clean.replace(/,\s*([}\]])/g, "$1");
    const arrS2 = fixed.indexOf("[");
    const arrE2 = fixed.lastIndexOf("]");
    if (arrS2 !== -1 && arrE2 > arrS2) return JSON.parse(fixed.slice(arrS2, arrE2 + 1));
  } catch {}
  return null;
};

async function callClaude(messages, systemPrompt) {
  // Calls our Vercel serverless proxy — API key never touches the browser
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: systemPrompt,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "API request failed");
  }
  const data = await res.json();
  return data.content?.find((b) => b.type === "text")?.text || "";
}

export default function MealPrepApp() {
  const [screen, setScreen] = useState("home");
  const [days, setDays] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [cuisine, setCuisine] = useState("mixed");
  const [budget, setBudget] = useState("moderate");
  const [vibe, setVibe] = useState("none");
  const [plan, setPlan] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Crafting your meal plan…");
  const [error, setError] = useState(null);
  const [screen2, setScreen2] = useState(null); // 'paywall' overlay
  const [access, setAccess] = useState(() => getAccess());
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const toggleCondition = (id) => {
    setConditions(prev => {
      if (id === "none") return [];
      const without = prev.filter(c => c !== "none");
      return without.includes(id) ? without.filter(c => c !== id) : [...without, id];
    });
  };
  const conditionLabels = conditions.length === 0
    ? "No restrictions"
    : conditions.map(id => HEALTH_CONDITIONS.find(c => c.id === id)?.label).filter(Boolean).join(", ");
  const cuisineObj = CUISINE_STYLES.find((c) => c.id === cuisine);
  const budgetInfo = PRICE_RANGES.find((p) => p.id === budget);
  const vibeInfo = VIBES.find((v) => v.id === vibe);

  async function generatePlan() {
    setScreen("loading");
    setError(null);

    const loadingMsgs =
      cuisine === "soul_food" ? ["Firing up the cast iron…", "Seasoning the collards…", "Low and slow…", "Almost time to eat!"]
      : cuisine === "asian" ? ["Boiling the broth…", "Folding the dumplings…", "Seasoning the wok…", "Almost ready!"]
      : cuisine === "mexican" ? ["Warming the tortillas…", "Blending the salsa…", "Slow-cooking the beans…", "Almost ready!"]
      : cuisine === "italian" ? ["Salting the pasta water…", "Simmering the sugo…", "Grating the parmigiano…", "Almost ready!"]
      : cuisine === "indian" ? ["Toasting the spices…", "Tempering the dal…", "Resting the dough…", "Almost ready!"]
      : ["Spinning the globe…", "Sampling world flavors…", "Balancing nutrition…", "Almost ready!"];

    let i = 0;
    setLoadingMsg(loadingMsgs[0]);
    const interval = setInterval(() => { i = (i + 1) % loadingMsgs.length; setLoadingMsg(loadingMsgs[i]); }, 1800);

    try {
      const condInfo = conditions.length > 0 ? `HEALTH REQUIREMENTS (ALL must be strictly followed): ${conditionLabels}` : "No dietary restrictions.";
      const cuisineInfo = CUISINE_PROMPTS[cuisine] || CUISINE_PROMPTS.mixed;
      const budgetGuide = `BUDGET: ${budgetInfo?.label} (${budgetInfo?.desc}). Suggest realistic estimated cost per serving as "costPerServing" in USD (a number like 2.50).`;
      const vibeGuide = vibe !== "none"
        ? `PUN NAMES: Every meal "name" MUST be a clever, witty food pun themed around ${vibe.toUpperCase()} — use wordplay, rhymes, or mashups with ${vibe} references. Examples: ${vibeInfo?.examples}. Also include "realName" with the plain dish name so people know what they're actually eating.`
        : `Use clear, authentic dish names in the "name" field. Set "realName" to the same as "name".`;

      const prompt = `Generate a ${days}-day meal prep plan.

${condInfo}
${cuisineInfo}
${budgetGuide}
${vibeGuide}

Return ONLY a valid JSON array of ${days} day objects, no markdown:
[
  {
    "day": 1,
    "meals": [
      { "type": "breakfast", "name": "...", "realName": "...", "cuisine": "e.g. Japanese", "description": "1 sentence", "calories": 350, "protein": 18, "carbs": 42, "fat": 12, "costPerServing": 3.50 },
      { "type": "lunch", ... },
      { "type": "dinner", ... },
      { "type": "snack", ... }
    ]
  }
]

Rules: vary cuisines across days. Be authentic with dish names. Return ONLY the JSON array.`;

      const text = await callClaude([{ role: "user", content: prompt }],
        "You are a certified nutritionist and world-cuisine meal prep expert. Always return valid JSON only — no markdown, no explanation, no extra text.");

      const parsed = parseJSON(text);
      if (!parsed || !Array.isArray(parsed)) throw new Error("Bad format");
      // Track plan usage
      const currentAccess = getAccess();
      if (currentAccess) {
        const updated = saveAccess(currentAccess.type, (currentAccess.plansUsed || 0) + 1);
        setAccess(updated);
      }
      setPlan(parsed);
      setScreen("plan");
    } catch (e) {
      console.error("Plan generation error:", e);
      setError("Could not generate plan — " + (e?.message || "please try again."));
      setScreen("home");
    } finally {
      clearInterval(interval);
    }
  }

  async function openRecipe(meal) {
    setSelectedMeal(meal);
    setRecipe(null);
    setLoadingRecipe(true);
    setScreen("recipe");
    try {
      const condInfo = conditions.length > 0 ? `Must comply with ALL of: ${conditionLabels}.` : "";
      const cuisineHint = meal.cuisine ? `This is a ${meal.cuisine} dish — use authentic techniques and ingredients from that tradition.` : "";
      const realDish = meal.realName && meal.realName !== meal.name ? meal.realName : meal.name;
      const prompt = `Give a full recipe for "${realDish}". ${condInfo} ${cuisineHint}
Return ONLY valid JSON (no markdown):
{
  "ingredients": ["2 cups X", "1 tbsp Y", ...],
  "steps": ["Chop the ...", "Heat oil ...", ...],
  "prepTime": "10 mins",
  "cookTime": "25 mins",
  "tips": "1–2 practical meal-prep storage tips",
  "healthBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "estimatedCost": "$X.XX per serving"
}`;
      const text = await callClaude([{ role: "user", content: prompt }],
        "You are a professional chef specializing in world cuisines. Return valid JSON only, no markdown fences, no extra text.");
      const parsed = parseJSON(text);
      setRecipe(parsed || { error: true });
    } catch {
      setRecipe({ error: true });
    } finally {
      setLoadingRecipe(false);
    }
  }

  const typeColors = {
    breakfast: { bg: "#FFF7ED", text: "#92400E", border: "#FED7AA" },
    lunch:     { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0" },
    dinner:    { bg: "#EFF6FF", text: "#1E3A5F", border: "#BFDBFE" },
    snack:     { bg: "#FDF4FF", text: "#581C87", border: "#E9D5FF" },
  };
  const macroColor = { calories: "#E24B4A", protein: "#1D9E75", carbs: "#BA7517", fat: "#533AB7" };

  const sectionCard = (children, mb = "1rem") => (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "1.25rem", marginBottom: mb, border: "0.5px solid var(--color-border-tertiary)" }}>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem", color: "var(--color-text-primary)" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
        {(screen === "plan" || screen === "recipe") && (
          <button onClick={() => setScreen(screen === "recipe" ? "plan" : "home")}
            style={{ background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
            ← Back
          </button>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px" }}>🥦 MealPrep Planner</h1>
          {plan && screen !== "home" && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>
              {days}-day · {cuisineObj?.label} · {conditionLabels.length > 30 ? conditionLabels.slice(0,28)+"…" : conditionLabels} · {budgetInfo?.label}
              {vibe !== "none" && ` · ${vibeInfo?.icon} ${vibeInfo?.label} puns`}
            </p>
          )}
        </div>
      </div>

      {/* ── HOME ── */}
      {screen === "home" && (
        <div>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Your personal meal prep coach — pick your preferences and get a full plan with recipes, nutrition, pricing, and cooking schedules.
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 8, padding: "12px 16px", marginBottom: "1rem", color: "#991B1B", fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Days */}
          {sectionCard(<>
            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>How many days?</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[3, 5, 7].map((d) => (
                <button key={d} onClick={() => setDays(d)}
                  style={{ flex: 1, padding: "14px 0", fontSize: 18, fontWeight: 600, borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                    background: days === d ? "#1D9E75" : "var(--color-background-primary)",
                    color: days === d ? "#fff" : "var(--color-text-primary)",
                    border: days === d ? "2px solid #1D9E75" : "0.5px solid var(--color-border-secondary)" }}>
                  {d} days
                </button>
              ))}
            </div>
          </>)}

          {/* Cuisine */}
          {sectionCard(<>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>Cuisine style</p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
              "World mix" rotates through 5+ cultures in one week
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {CUISINE_STYLES.map((cs) => (
                <button key={cs.id} onClick={() => setCuisine(cs.id)}
                  style={{ padding: "10px 6px", textAlign: "center", borderRadius: 8, cursor: "pointer", fontSize: 11, transition: "all 0.15s",
                    background: cuisine === cs.id ? `${cs.color}18` : "var(--color-background-primary)",
                    color: cuisine === cs.id ? cs.color : "var(--color-text-primary)",
                    border: cuisine === cs.id ? `1.5px solid ${cs.color}` : "0.5px solid var(--color-border-secondary)",
                    fontWeight: cuisine === cs.id ? 600 : 400 }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{cs.icon}</div>
                  {cs.label}
                </button>
              ))}
            </div>
          </>)}

          {/* Budget */}
          {sectionCard(<>
            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>Price range</p>
            <div style={{ display: "flex", gap: 10 }}>
              {PRICE_RANGES.map((pr) => (
                <button key={pr.id} onClick={() => setBudget(pr.id)}
                  style={{ flex: 1, padding: "12px 6px", textAlign: "center", borderRadius: 10, cursor: "pointer", fontSize: 12, transition: "all 0.15s",
                    background: budget === pr.id ? pr.bg : "var(--color-background-primary)",
                    color: budget === pr.id ? pr.text : "var(--color-text-primary)",
                    border: budget === pr.id ? `1.5px solid ${pr.color}` : "0.5px solid var(--color-border-secondary)",
                    fontWeight: budget === pr.id ? 600 : 400 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, color: budget === pr.id ? pr.color : "var(--color-text-primary)" }}>{pr.icon}</div>
                  <div style={{ fontWeight: 600 }}>{pr.label}</div>
                  <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>{pr.desc}</div>
                </button>
              ))}
            </div>
          </>)}

          {/* Health */}
          {sectionCard(<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>Health conditions & dietary needs</p>
              {conditions.length > 0 && (
                <button onClick={() => setConditions([])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#378ADD", padding: 0 }}>
                  Clear all
                </button>
              )}
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>Select all that apply — meals will satisfy every requirement</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {HEALTH_CONDITIONS.filter(hc => hc.id !== "none").map((hc) => {
                const active = conditions.includes(hc.id);
                return (
                  <button key={hc.id} onClick={() => toggleCondition(hc.id)}
                    style={{ padding: "10px 12px", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13, transition: "all 0.15s", position: "relative",
                      background: active ? "#EFF6FF" : "var(--color-background-primary)",
                      color: active ? "#1E3A5F" : "var(--color-text-primary)",
                      border: active ? "1.5px solid #378ADD" : "0.5px solid var(--color-border-secondary)",
                      fontWeight: active ? 600 : 400 }}>
                    {hc.icon} {hc.label}
                    {active && <span style={{ position: "absolute", top: 4, right: 7, fontSize: 12, color: "#378ADD" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            {conditions.length === 0 && (
              <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic" }}>No restrictions selected — all foods included</p>
            )}
            {conditions.length > 0 && (
              <div style={{ marginTop: 10, padding: "8px 10px", background: "#EFF6FF", borderRadius: 8, border: "0.5px solid #BFDBFE" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#1E3A5F" }}>
                  <strong>Active:</strong> {conditionLabels}
                </p>
              </div>
            )}
          </>)}

          {/* Vibe */}
          {sectionCard(<>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>Recipe name vibe</p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>Pick a passion — we'll name every dish as a pun</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {VIBES.map((v) => (
                <button key={v.id} onClick={() => setVibe(v.id)}
                  style={{ padding: "10px 8px", textAlign: "center", borderRadius: 8, cursor: "pointer", fontSize: 12, transition: "all 0.15s",
                    background: vibe === v.id ? `${v.color}18` : "var(--color-background-primary)",
                    color: vibe === v.id ? v.color : "var(--color-text-primary)",
                    border: vibe === v.id ? `1.5px solid ${v.color}` : "0.5px solid var(--color-border-secondary)",
                    fontWeight: vibe === v.id ? 600 : 400 }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{v.icon}</div>
                  {v.label}
                </button>
              ))}
            </div>
            {vibe !== "none" && (
              <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic" }}>{vibeInfo?.examples}</p>
            )}
          </>, "1.5rem")}

          <button onClick={() => { if (!days) return; const acc = getAccess(); if (acc && canGeneratePlan(acc)) { generatePlan(); } else { setScreen2('paywall'); setPaymentError(null); } }} disabled={!days}
            style={{ width: "100%", padding: "16px", fontSize: 16, fontWeight: 600, borderRadius: 12,
              cursor: days ? "pointer" : "not-allowed",
              background: days ? "#1D9E75" : "#D1D5DB", color: "#fff", border: "none", transition: "background 0.2s" }}>
            {days ? `Generate My ${days}-Day Plan →` : "Select number of days to continue"}
          </button>
        </div>
      )}

      {/* ── LOADING ── */}
      {screen === "loading" && (
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <div style={{ fontSize: 52, display: "inline-block", animation: "spin 2s linear infinite" }}>{cuisineObj?.icon || "🌍"}</div>
          <p style={{ marginTop: "1rem", fontSize: 16, color: "var(--color-text-secondary)", animation: "pulse 1.5s ease-in-out infinite" }}>{loadingMsg}</p>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      )}

      {/* ── PLAN ── */}
      {screen === "plan" && plan && (
        <div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: "1rem" }}>
            {[
              { label: "Days", val: days, color: "#1D9E75" },
              { label: "Meals/day", val: 4, color: "#BA7517" },
              { label: "Total meals", val: days * 4, color: "#533AB7" },
              { label: "Budget", val: budgetInfo?.icon, color: budgetInfo?.color },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 6px", textAlign: "center", border: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cuisine badge */}
          <div style={{ background: `${cuisineObj?.color}12`, border: `0.5px solid ${cuisineObj?.color}40`, borderRadius: 10, padding: "10px 14px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{cuisineObj?.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: cuisineObj?.color }}>{cuisineObj?.label} meal plan</p>
              {cuisine === "mixed" && <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>Rotating through world cuisines — a different culture each day</p>}
            </div>
          </div>

          {/* Vibe badge */}
          {vibe !== "none" && (
            <div style={{ background: `${vibeInfo?.color}12`, border: `0.5px solid ${vibeInfo?.color}40`, borderRadius: 10, padding: "10px 14px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{vibeInfo?.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: vibeInfo?.color }}>{vibeInfo?.label} pun mode</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>Every dish name is a {vibeInfo?.label.toLowerCase()} pun — tap any card to see the real dish</p>
              </div>
            </div>
          )}

          {/* Prep banner */}
          <div style={{ background: "#FFFBEB", border: "0.5px solid #FED7AA", borderRadius: 10, padding: "11px 14px", marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#92400E", lineHeight: 1.7 }}>
              <strong>📅 Prep schedule:</strong> Batch-cook grains & proteins on <strong>Sunday</strong>. Refresh mid-week on <strong>Wednesday</strong>. Proteins keep 3–4 days, grains 5 days, fresh salads 2–3 days.
            </p>
          </div>

          {plan.map((dayObj) => (
            <div key={dayObj.day} style={{ marginBottom: "1.75rem" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                Day {dayObj.day}
                {cuisine === "mixed" && dayObj.meals?.[0]?.cuisine && (
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-text-secondary)", fontStyle: "italic" }}>— {dayObj.meals[0].cuisine} & more</span>
                )}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {dayObj.meals?.map((meal, mi) => {
                  const tc = typeColors[meal.type] || typeColors.lunch;
                  const freshInfo = FRESHNESS[meal.type];
                  const imgUrl = getMealImage(meal.realName || meal.name, meal.type);
                  const cost = meal.costPerServing ? `$${Number(meal.costPerServing).toFixed(2)}` : null;
                  return (
                    <button key={mi} onClick={() => openRecipe(meal)}
                      style={{ textAlign: "left", background: "var(--color-background-primary)", border: `0.5px solid ${tc.border}`, borderRadius: 12, padding: 0, cursor: "pointer", overflow: "hidden", transition: "transform 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                      <div style={{ width: "100%", height: 95, overflow: "hidden", position: "relative" }}>
                        <img src={imgUrl} alt={meal.realName || meal.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { e.target.style.background = "#f3f4f6"; e.target.style.display = "none"; }} />
                        <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4 }}>
                          <span style={{ background: tc.bg, color: tc.text, fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, border: `0.5px solid ${tc.border}`, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                            {meal.type}
                          </span>
                          {meal.cuisine && cuisine === "mixed" && (
                            <span style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 9, fontWeight: 500, padding: "2px 6px", borderRadius: 20 }}>
                              {meal.cuisine}
                            </span>
                          )}
                        </div>
                        {cost && (
                          <div style={{ position: "absolute", top: 6, right: 6 }}>
                            <span style={{ background: budgetInfo?.bg, color: budgetInfo?.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, border: `0.5px solid ${budgetInfo?.border}` }}>
                              {cost}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "9px 11px" }}>
                        <p style={{ margin: "0 0 1px", fontSize: 12, fontWeight: 700, lineHeight: 1.3, color: "var(--color-text-primary)" }}>{meal.name}</p>
                        {vibe !== "none" && meal.realName && meal.realName !== meal.name && (
                          <p style={{ margin: "0 0 4px", fontSize: 10, color: vibeInfo?.color, fontStyle: "italic", fontWeight: 500 }}>
                            {vibeInfo?.icon} {meal.realName}
                          </p>
                        )}
                        <p style={{ margin: "0 0 7px", fontSize: 10, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{meal.description}</p>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
                          {[
                            { k: "Cal", v: meal.calories, c: macroColor.calories },
                            { k: "P", v: `${meal.protein}g`, c: macroColor.protein },
                            { k: "C", v: `${meal.carbs}g`, c: macroColor.carbs },
                            { k: "F", v: `${meal.fat}g`, c: macroColor.fat },
                          ].map(m => (
                            <span key={m.k} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 20, background: `${m.c}15`, color: m.c, fontWeight: 600 }}>
                              {m.k}: {m.v}
                            </span>
                          ))}
                        </div>
                        <p style={{ margin: "0 0 2px", fontSize: 9, color: "var(--color-text-secondary)" }}>🕐 {freshInfo.cook}</p>
                        <p style={{ margin: 0, fontSize: 9, color: "var(--color-text-secondary)" }}>📦 Good for: {freshInfo.shelf}</p>
                        <p style={{ margin: "5px 0 0", fontSize: 9, color: "#1D9E75", fontStyle: "italic" }}>Tap for full recipe →</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RECIPE ── */}
      {screen === "recipe" && selectedMeal && (
        <div>
          <div style={{ marginBottom: "1rem", borderRadius: 12, overflow: "hidden", position: "relative", height: 210 }}>
            <img src={getMealImage(selectedMeal.realName || selectedMeal.name, selectedMeal.type)} alt={selectedMeal.realName || selectedMeal.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
            <div style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: 19, fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.6)", lineHeight: 1.3 }}>{selectedMeal.name}</h2>
              {vibe !== "none" && selectedMeal.realName && selectedMeal.realName !== selectedMeal.name && (
                <p style={{ margin: "3px 0 2px", fontSize: 12, color: "rgba(255,255,255,0.9)", fontStyle: "italic" }}>{vibeInfo?.icon} {selectedMeal.realName}</p>
              )}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{selectedMeal.description}</span>
            </div>
            {selectedMeal.cuisine && (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <span style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20 }}>
                  {selectedMeal.cuisine}
                </span>
              </div>
            )}
          </div>

          {/* Macros + cost */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: "1rem" }}>
            {[
              { k: "Calories", v: selectedMeal.calories, c: macroColor.calories },
              { k: "Protein", v: `${selectedMeal.protein}g`, c: macroColor.protein },
              { k: "Carbs", v: `${selectedMeal.carbs}g`, c: macroColor.carbs },
              { k: "Fat", v: `${selectedMeal.fat}g`, c: macroColor.fat },
            ].map(m => (
              <div key={m.k} style={{ background: `${m.c}12`, border: `0.5px solid ${m.c}40`, borderRadius: 8, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: m.c }}>{m.v}</div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>{m.k}</div>
              </div>
            ))}
          </div>

          {/* Cost + freshness */}
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
            {selectedMeal.costPerServing && (
              <div style={{ background: budgetInfo?.bg, border: `0.5px solid ${budgetInfo?.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>💰</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: budgetInfo?.color }}>${Number(selectedMeal.costPerServing).toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: budgetInfo?.text }}>per serving</div>
                </div>
              </div>
            )}
            <div style={{ flex: 1, background: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ margin: "0 0 3px", fontSize: 12, color: "#14532D" }}><strong>🕐 When to cook:</strong> {FRESHNESS[selectedMeal.type].cook}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#14532D" }}><strong>📦 Stays fresh:</strong> {FRESHNESS[selectedMeal.type].shelf} refrigerated</p>
            </div>
          </div>

          {loadingRecipe && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
              <div style={{ fontSize: 36, display: "inline-block", animation: "spin 1.5s linear infinite" }}>{cuisineObj?.icon || "🌿"}</div>
              <p style={{ marginTop: 10, fontSize: 14 }}>Loading recipe…</p>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {recipe && !recipe.error && (
            <div>
              {/* Times + cost */}
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                {[{ label: "Prep", val: recipe.prepTime }, { label: "Cook", val: recipe.cookTime }, ...(recipe.estimatedCost ? [{ label: "Cost/serving", val: recipe.estimatedCost }] : [])].map(t => (
                  <div key={t.label} style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.val}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>{t.label}</div>
                  </div>
                ))}
              </div>

              {/* Health Benefits */}
              {recipe.healthBenefits?.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>✨ Health benefits</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {recipe.healthBenefits.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#F0FDF4", borderRadius: 8, padding: "8px 10px", border: "0.5px solid #BBF7D0" }}>
                        <span style={{ color: "#1D9E75", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 13, color: "#14532D", lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>🛒 Ingredients</h3>
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)" }}>
                  {recipe.ingredients?.map((ing, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < recipe.ingredients.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cuisineObj?.color || "#1D9E75", flexShrink: 0 }} />
                      <span style={{ fontSize: 13 }}>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>👨‍🍳 Instructions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recipe.steps?.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: cuisineObj?.color || "#1D9E75", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        {i + 1}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, flex: 1 }}>{step.replace(/^Step \d+:\s*/i, "")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {recipe.tips && (
                <div style={{ background: "#FFFBEB", border: "0.5px solid #FED7AA", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#92400E" }}><strong>💡 Meal prep tip:</strong> {recipe.tips}</p>
                </div>
              )}
            </div>
          )}

          {recipe?.error && (
            <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "1rem", textAlign: "center", color: "#991B1B", fontSize: 14 }}>
              Could not load recipe. Please go back and try again.
            </div>
          )}
        </div>
      )}
    {/* ── PAYWALL OVERLAY ── */}
      {screen2 === "paywall" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "1.75rem", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🥦</div>
              <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Get Your Meal Plan</h2>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Choose a plan to generate your personalized {days}-day meal prep</p>
            </div>

            {/* Plan options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
              {Object.values(PLANS).map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  style={{ padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    background: selectedPlan === plan.id ? plan.bg : "var(--color-background-secondary)",
                    border: selectedPlan === plan.id ? `2px solid ${plan.color}` : "0.5px solid var(--color-border-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{plan.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: selectedPlan === plan.id ? plan.color : "var(--color-text-primary)" }}>{plan.label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{plan.desc}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.priceLabel}</p>
                      {plan.id === "monthly" && <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-secondary)" }}>billed monthly</p>}
                      {plan.id === "single" && <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-secondary)" }}>one time</p>}
                    </div>
                  </div>
                  {plan.id === "monthly" && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `0.5px solid ${plan.border}` }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        {["5 plans/month", "All cuisines", "Cancel anytime"].map(f => (
                          <span key={f} style={{ fontSize: 10, color: plan.color, fontWeight: 500 }}>✓ {f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Access indicator for existing subscribers */}
            {access && access.type === "monthly" && (
              <div style={{ background: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 8, padding: "8px 12px", marginBottom: "1rem" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#14532D" }}>
                  <strong>Active subscription</strong> — {5 - (access.plansUsed || 0)} of 5 plans remaining this month
                </p>
              </div>
            )}

            {paymentError && (
              <div style={{ background: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 8, padding: "10px 12px", marginBottom: "1rem", fontSize: 12, color: "#991B1B" }}>
                {paymentError}
              </div>
            )}

            {/* Square Payment container */}
            <div id="square-payment-form" style={{ marginBottom: "1rem" }} />

            {/* Pay button */}
            <button
              disabled={!selectedPlan || paymentLoading}
              onClick={async () => {
                if (!selectedPlan) return;
                setPaymentLoading(true);
                setPaymentError(null);
                try {
                  // Initialize Square Web Payments SDK
                  if (!window.Square) throw new Error("Square payments not loaded. Please refresh and try again.");
                  const payments = window.Square.payments(
                    import.meta.env.VITE_SQUARE_APP_ID,
                    import.meta.env.VITE_SQUARE_LOCATION_ID
                  );
                  const card = await payments.card();
                  await card.attach("#square-payment-form");
                  const result = await card.tokenize();
                  if (result.status !== "OK") throw new Error("Card details invalid. Please check and try again.");

                  // Send token + plan to our backend
                  const plan = PLANS[selectedPlan];
                  const response = await fetch("/api/payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sourceId: result.token,
                      amount: plan.price * 100, // cents
                      planType: plan.id,
                      currency: "USD",
                    }),
                  });
                  const data = await response.json();
                  if (!response.ok || data.error) throw new Error(data.error || "Payment failed. Please try again.");

                  // Save access and proceed
                  const newAccess = saveAccess(plan.id, 0);
                  setAccess(newAccess);
                  setScreen2(null);
                  generatePlan();
                } catch (err) {
                  setPaymentError(err.message || "Payment failed. Please try again.");
                } finally {
                  setPaymentLoading(false);
                }
              }}
              style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 12, border: "none",
                cursor: selectedPlan && !paymentLoading ? "pointer" : "not-allowed",
                background: selectedPlan ? (PLANS[selectedPlan]?.color || "#1D9E75") : "#D1D5DB",
                color: "#fff", transition: "all 0.2s" }}>
              {paymentLoading ? "Processing…" : selectedPlan ? `Pay ${PLANS[selectedPlan]?.priceLabel} & Generate Plan` : "Select a plan above"}
            </button>

            {/* Cancel */}
            <button onClick={() => { setScreen2(null); setSelectedPlan(null); setPaymentError(null); }}
              style={{ width: "100%", marginTop: 10, padding: "10px", fontSize: 13, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
              Cancel
            </button>

            <p style={{ margin: "12px 0 0", fontSize: 11, color: "var(--color-text-secondary)", textAlign: "center" }}>
              🔒 Payments secured by Square. We never store your card details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
