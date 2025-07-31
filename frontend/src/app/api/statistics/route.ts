import { getToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const { token } = await getToken();
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    console.log("Statistics data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json("Failed to fetch statistics", { status: 500 });
  }
};
