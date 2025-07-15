
"use client";
import URLShortener from "@/components/home";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={async () => {
            try {
              const  res  = await fetch("/api/health", {
                method: "GET",
              });
              const data = await res.json();

              console.log("Health check response:", data, res.status);
            } catch (error) {
              console.error("Error hitting /api/health:", error);
            }
          }}
        >
          Test Endpoint
        </button>
      </div>
      <URLShortener/>
    </div>
  );
}
