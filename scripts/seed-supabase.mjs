import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const productsPath = path.join(root, "data", "sample-products.json");
const products = JSON.parse(await fs.readFile(productsPath, "utf8"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.");
}

const supabase = createClient(url, serviceRoleKey);

for (const product of products) {
  const { id: _sampleProductId, product_variants: variants, ...productRow } = product;

  const { data, error } = await supabase
    .from("products")
    .upsert(productRow, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("product_variants").delete().eq("product_id", data.id);

  for (const variant of variants) {
    const { id: _sampleId, product_id: _sampleProductId, ...variantRow } = variant;
    const { error: variantError } = await supabase.from("product_variants").insert({
      ...variantRow,
      product_id: data.id
    });

    if (variantError) throw variantError;
  }
}

console.log(`Seeded ${products.length} products.`);
