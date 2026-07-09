export const siteConfig = {
  storeName: "Qpet Rhodes",
  tagline: "Retail products online shop for local pickup.",
  address: "Shop G33, Qpet, 21 Marquet St, Rhodes NSW 2138",
  phone: "0493 044 664",
  email: "hello@qpetrhodes.com",
  pickupHours: "Tue - Sun | 9AM - 5PM"
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
