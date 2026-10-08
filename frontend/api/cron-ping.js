import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Hanya izinkan GET atau POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Gunakan GET.",
    });
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://wrrjjtqqnkqbyxumxqyc.supabase.co";

  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "sb_publishable_so2LE1SJU2OAayx4t5Z-zw_ZIE3uFIS";

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lakukan query ringan untuk membangunkan / menjaga database Supabase tetap aktif (tidak pause)
    const { data, error } = await supabase
      .from("institutions")
      .select("id")
      .limit(1);

    if (error) {
      // Jika tabel institutions ada kendala RLS, fallback ke query tabel alumni
      const fallback = await supabase
        .from("alumni")
        .select("id")
        .limit(1);

      return res.status(200).json({
        success: true,
        status: "pinged_with_fallback",
        detail: error.message,
        fallbackData: fallback.data,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      status: "active",
      message: "Database Supabase berhasil di-ping via Vercel Cron.",
      dataSample: data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan ping ke Supabase.",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
