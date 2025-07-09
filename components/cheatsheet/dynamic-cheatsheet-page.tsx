'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FloatingNavBar } from '@/components/floating-nav-bar';
import { cn } from '@/lib/utils';
import { CheatsheetHeader } from '@/components/cheatsheet/cheatsheet-header';
import { ContentCard } from '@/components/cheatsheet/content-card';
import { ShortcutsCard } from '@/components/cheatsheet/shortcuts-card';
import {
  parseSpanConfig, 
  getCheatsheetById,
  type CheatsheetData,
} from '@/lib/cheatsheet-data';

interface DynamicCheatsheetPageProps {
  cheatsheetId: string;
}

export const DynamicCheatsheetPage: React.FC<DynamicCheatsheetPageProps> = ({ cheatsheetId }) => {
  const router = useRouter();
  const [cheatsheet, setCheatsheet] = useState<CheatsheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');

  // Load cheatsheet data
  useEffect(() => {
    setIsLoading(true);
    const loadedCheatsheet = getCheatsheetById(cheatsheetId);
    setCheatsheet(loadedCheatsheet);
    setIsLoading(false);
    
    if (loadedCheatsheet && loadedCheatsheet.sections.length > 0) {
      const firstSectionId = loadedCheatsheet.sections[0].title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setActiveSection(firstSectionId);
    }
  }, [cheatsheetId]);

  // Function to navigate to a section and update URL
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      // Update URL with hash
      router.replace(`/cheatsheets/${cheatsheetId}#${sectionId}`, { scroll: false });
    }
  };
  
  // Initialize from URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setActiveSection(hash);
        // Small delay to ensure the page is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);
  
  // Update active section based on scroll position
  useEffect(() => {
    if (!cheatsheet) return;
    
    const handleScroll = () => {
      const sections = cheatsheet.sections;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i].title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            if (activeSection !== sectionId) {
              setActiveSection(sectionId);
              // Update URL when scrolling to a new section
              router.replace(`/cheatsheets/${cheatsheetId}#${sectionId}`, { scroll: false });
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, router, cheatsheet, cheatsheetId]);

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cheatsheet...</p>
        </div>
      </div>
    );
  }

  // If the cheatsheet is not found after loading, show an error message
  if (!cheatsheet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Cheatsheet Not Found</h1>
          <p className="text-slate-400">The requested cheatsheet could not be loaded.</p>
          <Link href="/cheatsheets">
            <Button className="mt-4">Back to Cheatsheets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      {/* Header */}
      <CheatsheetHeader metadata={cheatsheet.metadata} />
        
      {/* Main content */}
      <div className="space-y-12">
        {cheatsheet.sections.map((section) => {
          const sectionId = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          
          return (
            <section key={sectionId} id={sectionId} className="scroll-mt-20">
              <h2 
                className="text-3xl font-bold text-blue-600 dark:text-indigo-400 mb-6 flex items-center cursor-pointer hover:text-blue-500 dark:hover:text-indigo-300 transition-colors"
                onClick={() => navigateToSection(sectionId)}
              >
                # {section.title.replace(/\s*\{[^}]+\}/, '')}
              </h2>
              
              {/* Grid for subsection cards - responsive grid that adapts to span configs */}
              {(() => {
                const isTwoColumnSection = section.title.includes('{.cols-2}');
                const gridClass = isTwoColumnSection 
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-2"
                  : "grid grid-cols-1 xl:grid-cols-3 gap-2";
                
                return (
                  <div className={gridClass}
                       style={{ gridAutoRows: 'auto' }}>
                    {(() => {
                      // Combine section-level cards and subsection cards
                      const allCards = [
                        // Render section-level cards first
                        ...section.cards.map((card, cardIndex) => ({
                          card,
                          key: `section-${cardIndex}`,
                        })),
                        // Then render subsection cards
                        ...section.subsections.flatMap((subsection, subsectionIndex) => 
                          subsection.cards.map((card, cardIndex) => ({
                            card,
                            key: `${subsectionIndex}-${cardIndex}`,
                          }))
                        )
                      ];

                      return allCards.map(({ card, key }) => {
                        const spanConfig = parseSpanConfig(card.spanConfig);
                        
                        if (card.isShortcutsCard && card.shortcuts) {
                          return (
                            <ShortcutsCard 
                              key={key}
                              card={card}
                              spanConfig={spanConfig}
                            />
                          );
                        } else {
                          return (
                            <ContentCard 
                              key={key}
                              card={card}
                              spanConfig={spanConfig}
                            />
                          );
                        }
                      });
                    })()}
                  </div>
                );
              })()}
            </section>
          );
        })}
      </div>
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar 
        sections={cheatsheet.sections}
        activeSection={activeSection}
        setActiveSection={navigateToSection}
      />
    </div>
  );
};
