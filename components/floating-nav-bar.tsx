"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FloatingNavBarProps {
  sections: { title: string }[];
  activeSection: string;
  setActiveSection: (sectionId: string) => void;
}

export const FloatingNavBar = ({
  sections,
  activeSection,
  setActiveSection,
}: FloatingNavBarProps) => {
  const handleSectionClick = (sectionTitle: string) => {
    const sectionId = sectionTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setActiveSection(sectionId);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-3 shadow-lg shadow-black/20">
        <div className="flex items-center space-x-3">
          {sections.map((section, index) => {
            const sectionId = section.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
            const isActive = activeSection === sectionId;

            return (
              <div key={sectionId} className="relative group">
                <button
                  onClick={() => handleSectionClick(section.title)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200 border-2",
                    isActive
                      ? "bg-primary border-primary scale-125"
                      : "bg-muted-foreground border-muted hover:bg-muted-foreground/80 hover:border-muted-foreground hover:scale-110"
                  )}
                  aria-label={`Navigate to ${section.title}`}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-popover text-popover-foreground text-sm px-3 py-2 rounded-md whitespace-nowrap shadow-lg border border-border">
                    {section.title}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
