import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value, maxLength = 160) {
  return String(value || "").trim().slice(0, maxLength);
}

function isDuplicateError(error) {
  return error?.code === "23505" || /duplicate|unique/i.test(error?.message || "");
}

export async function POST(request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return Response.json(
      {
        message: "Waitlist is not configured yet. Please try again later.",
        code: "missing_supabase_env",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "We could not read your waitlist details. Please try again." },
      { status: 400 }
    );
  }

  const name = cleanText(body?.name);
  const email = cleanText(body?.email, 254).toLowerCase();
  const source = cleanText(body?.source || "unknown", 80);

  if (!emailPattern.test(email)) {
    return Response.json(
      { message: "Please enter a valid email address.", code: "invalid_email" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: existingSubscriber, error: lookupError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("Supabase waitlist lookup failed:", lookupError);
      return Response.json(
        { message: "We could not join the waitlist right now. Please try again later." },
        { status: 500 }
      );
    }

    if (existingSubscriber) {
      return Response.json(
        {
          message: "You are already on the Pro Report waitlist. We will notify you when it launches.",
          code: "duplicate_email",
        },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("waitlist").insert({
      name: name || null,
      email,
      source,
    });

    if (error) {
      if (isDuplicateError(error)) {
        return Response.json(
          {
            message: "You are already on the Pro Report waitlist. We will notify you when it launches.",
            code: "duplicate_email",
          },
          { status: 409 }
        );
      }

      console.error("Supabase waitlist insert failed:", error);
      return Response.json(
        { message: "We could not join the waitlist right now. Please try again later." },
        { status: 500 }
      );
    }

    return Response.json({
      message: "You are on the Pro Report waitlist. We will notify you when it launches.",
    });
  } catch (error) {
    console.error("Waitlist API failed:", error);
    return Response.json(
      { message: "We could not join the waitlist right now. Please try again later." },
      { status: 500 }
    );
  }
}
