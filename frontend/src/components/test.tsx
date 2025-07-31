"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export function Grid() {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const cards = [
    {
      title: "ESPRESSO",
      subtitle:
        "Rich, bold shots pulled to perfection. Experience the pure essence of coffee in every sip with our signature espresso blend.",
      action: "Order now",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "CAPPUCCINO",
      subtitle:
        "Silky steamed milk perfectly balanced with espresso. Topped with microfoam art that's almost too beautiful to drink.",
      action: "Try today",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "COLD BREW",
      subtitle:
        "Smooth, refreshing coffee steeped for 12 hours. Low acidity meets bold flavor in this summer favorite.",
      action: "Stay cool",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "PASTRIES",
      subtitle:
        "Freshly baked croissants, muffins, and artisanal breads. The perfect companion to your morning coffee ritual.",
      action: "Fresh daily",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "LATTE ART",
      subtitle:
        "Where coffee meets creativity. Our baristas craft beautiful designs that make every cup a work of art.",
      action: "Watch magic",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "ATMOSPHERE",
      subtitle:
        "Warm lighting, comfortable seating, and the gentle hum of conversation. Your perfect workspace or meeting spot.",
      action: "Come relax",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "BEANS",
      subtitle:
        "Single-origin coffees from around the world. Each bag tells a story of the farmers and regions that created it.",
      action: "Take home",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
    },
    {
      title: "MATCHA",
      subtitle:
        "Ceremonial grade matcha whisked to perfection. A vibrant green tea experience that energizes and refreshes.",
      action: "Sip serenity",
      border: "border-amber-500/20",
      bgColor: "bg-gradient-to-br from-green-900 to-lime-900",
    },
  ];

  const baseWidth = 80; // Base width for each panel
  const expandedWidth = 400; // Expanded width when hovered
  const totalCards = cards.length;

  const getWidth = (index) => {
    if (hoveredIndex === null) {
      return baseWidth;
    }
    return hoveredIndex === index ? expandedWidth : baseWidth;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8 flex items-center justify-center">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-amber-900 mb-2">
            ☕ BREW & BEANS
          </div>
          <p className="text-amber-700 text-lg">
            Where every cup tells a story
          </p>
        </div>
        <div
          className="flex gap-2 h-96"
          onMouseLeave={() => setHoveredIndex(0)}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="relative transition-all duration-700 ease-out cursor-pointer overflow-hidden"
              style={{
                width: `${getWidth(index)}px`,
                opacity:
                  hoveredIndex === 0 ? 1 : hoveredIndex === index ? 1 : 0.9,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <Card
                className={`
                h-full w-full overflow-hidden border-0 rounded-lg
                ${card.bgColor}
                transition-all duration-700 ease-out
                ${
                  hoveredIndex === index
                    ? "scale-105 shadow-2xl shadow-amber-500/20"
                    : ""
                }
              `}
              >
                <CardContent className="h-full p-0 relative">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-4 right-4 text-2xl opacity-30">
                    ☕
                  </div>

                  <div
                    className={`
                    absolute inset-0 flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${
                      hoveredIndex === index
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100 delay-300"
                    }
                  `}
                  >
                    <div className="transform -rotate-90 whitespace-nowrap">
                      <div className="text-amber-100 font-bold text-sm tracking-wider">
                        {card.title}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`
                    absolute inset-0 p-8 flex flex-col justify-between
                    transition-all duration-300 ease-out
                    ${
                      hoveredIndex === index
                        ? "opacity-100 delay-500"
                        : "opacity-0 pointer-events-none"
                    }
                  `}
                  >
                    <div className="space-y-4">
                      <h2 className="text-amber-100 text-3xl font-bold tracking-wide">
                        {card.title}
                      </h2>
                      <p className="text-amber-200 text-base leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-amber-100 group">
                      <span className="text-base font-medium">
                        {card.action}
                      </span>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[8px] border-l-amber-100 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent
                    transition-all duration-700 ease-out
                    ${hoveredIndex === index ? "opacity-100" : "opacity-0"}
                  `}
                  />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Grid;
