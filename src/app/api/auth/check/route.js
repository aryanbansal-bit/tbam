import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/dbconnect";

export async function GET(request) {
  const authSession = request.cookies.get("authSession")?.value;
  const username = request.cookies.get("username")?.value;

  const isAuthenticated = authSession === "true";

  if (!isAuthenticated || !username) {
    return NextResponse.json({
      authenticated: false,
      username: null,
      role: null,
    });
  }

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Role fetch failed:", error);
    return NextResponse.json({
      authenticated: false,
      username: null,
      role: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    username,
    role: data.role,
  });
}
