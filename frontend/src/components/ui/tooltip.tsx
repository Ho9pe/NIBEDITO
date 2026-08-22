"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const childRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Classes based on side and alignment
  const tooltipClasses = {
    top: "bottom-full mb-2",
    right: "left-full ml-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={childRef}>{children}</div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm rounded-md bg-popover text-popover-foreground border shadow-md animate-in fade-in-0 zoom-in-95",
            tooltipClasses[side],
            align === "center"
              ? "left-1/2 -translate-x-1/2"
              : align === "end"
              ? "right-0"
              : "left-0",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
