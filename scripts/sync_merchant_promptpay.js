const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envContent = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: profiles, error: prErr } = await supabase
    .from("profiles")
    .select("id, store_name, promptpay_id")
    .not("promptpay_id", "is", null);

  if (prErr) {
    console.error("Error fetching profiles:", prErr);
    return;
  }

  for (const prof of profiles) {
    if (prof.promptpay_id) {
      console.log(`Syncing products for merchant ${prof.id} (${prof.store_name}) -> PromptPay: ${prof.promptpay_id}`);
      const { data: updated, error: uErr } = await supabase
        .from("products")
        .update({
          merchant_name: prof.store_name || "Book Sangdai Official",
          merchant_promptpay: prof.promptpay_id,
        })
        .eq("merchant_id", prof.id)
        .select("id, title, merchant_promptpay");

      if (uErr) {
        console.error(`Failed to update products for ${prof.id}:`, uErr);
      } else {
        console.log(`Updated ${updated?.length || 0} products:`, updated);
      }
    }
  }
}

run();
