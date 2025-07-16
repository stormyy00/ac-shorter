import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const res = await fetch("http://localhost:8080/health", {
      method: "GET",
    });

    if (!res.ok) {
      return NextResponse.json({
        message: "Health check failed",
        status: res.status,
      }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(
      {
        items: data,    
        message: "OK",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error connecting to health endpoint",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
