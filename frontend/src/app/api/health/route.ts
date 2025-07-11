import { NextResponse } from "next/server";

export const GET = async () => {
  const res = await fetch("localhost:8080/health", {
    method: "GET",
  });
  if (!res.ok) {
    return NextResponse.json({
      message: "Health check failed",
      status: res.status,
    });
  }

  const data = await res.json();

  console.log("Health check endpoint hit");

  return NextResponse.json(
    {
      items: ["nmice", "health", "check"],
      message: "OK",
    },
    {
      status: 200,
    }
  );
};
