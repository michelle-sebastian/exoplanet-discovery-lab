// src/app/api/planets/route.ts
import { NextResponse } from "next/server";
import planets from "@/data/planets.json";

export function GET() {
  // In the future, you can add query params here for filtering on the server.
  return NextResponse.json(planets);
}
