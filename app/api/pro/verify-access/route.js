import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value, maxLength = 240) {
  return String(value || "").trim().slice(0, maxLength);
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "We could not read your Pro access details. Please try again." },
      { status: 400 }
    );
  }

  const email = cleanText(body?.email, 320).toLowerCase();
  const accessCode = cleanText(body?.accessCode, 120);

  if (!emailPattern.test(email) || !accessCode) {
    return Response.json(
      { error: "Enter the email and Pro access code from your order.", code: "invalid_input" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return Response.json(
      { error: "Pro access is not configured yet.", code: "missing_supabase_config" },
      { status: 503 }
    );
  }

  const { data: order, error } = await supabase
    .from("pro_orders")
    .select("id,email,credits_total,credits_used,status")
    .eq("email", email)
    .eq("access_code", accessCode)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Pro access lookup failed:", error);
    return Response.json(
      { error: "We could not verify this Pro access code right now. Please try again.", code: "lookup_failed" },
      { status: 500 }
    );
  }

  if (!order) {
    return Response.json(
      { error: "Invalid Pro access email or code.", code: "invalid_access" },
      { status: 401 }
    );
  }

  const creditsTotal = Number(order.credits_total || 0);
  const creditsUsed = Number(order.credits_used || 0);
  const creditsRemaining = Math.max(0, creditsTotal - creditsUsed);

  return Response.json({
    valid: true,
    orderId: order.id,
    email: order.email || email,
    creditsRemaining,
    alreadyUsed: creditsRemaining <= 0,
  });
}
