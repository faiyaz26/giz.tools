'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Command } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeyboardShortcut } from '@/components/keyboard-button';
import { FloatingNavBar } from '@/components/floating-nav-bar';
import { cn } from '@/lib/utils';
import {
  parseSpanConfig, 
  getCheatsheetById,
  type CheatsheetData,
  type CheatsheetCard,
  type CheatsheetSubsection,
  type KeyboardShortcut as KeyboardShortcutType
} from '@/lib/cheatsheet-data';

// Load the parsed Finder cheatsheet data from unified format
const finderCheatsheet: CheatsheetData | null = getCheatsheetById('finder');

// Component for rendering shortcuts cards
const ShortcutsCard = ({ card, spanConfig }: { 
  card: CheatsheetCard, 
  spanConfig?: { gridColumn?: string; gridRow?: string; className: string }
}) => {
  if (!card.shortcuts || !card.isShortcutsCard) {
    return null;
  }

  return (
    <Card 
      className={cn(
        'bg-card border-border h-fit overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-primary/20',
        spanConfig?.className
      )}
      style={{
        gridColumn: spanConfig?.gridColumn,
        gridRow: spanConfig?.gridRow
      }}
    >
      <CardHeader className="bg-card/50 border-b border-border pb-3">
        <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
          <Command className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {card.shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 border border-border hover:border-border/80 transition-all duration-200 hover:bg-muted/70"
            >
              <div className="flex-shrink-0 min-w-fit">
                <KeyboardShortcut shortcut={shortcut.shortcut} />
              </div>
              <div className="flex-1 text-right text-muted-foreground text-sm leading-relaxed font-medium">
                {shortcut.action}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for rendering regular content cards (non-shortcuts)
const ContentCard = ({ card, spanConfig }: { card: CheatsheetCard, spanConfig?: { gridColumn?: string; gridRow?: string; className: string } }) => {
  if (card.isShortcutsCard) {
    return null;
  }

  return (
    <Card 
      className={cn(
        'bg-card border-border h-fit overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-primary/20',
        spanConfig?.className
      )}
      style={{
        gridColumn: spanConfig?.gridColumn,
        gridRow: spanConfig?.gridRow
      }}
    >
      <CardHeader className="bg-card/50 border-b border-border pb-3">
        <CardTitle className="text-card-foreground text-lg">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {card.body && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a({ href, children, ...props }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
                      {...props}
                    >
                      {children}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                }
              }}
            >
              {card.body}
            </ReactMarkdown>
          </div>
        )}
        {card.footer && (
          <div className="border-t border-border pt-4">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a({ href, children, ...props }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
                        {...props}
                      >
                        {children}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  }
                }}
              >
                {card.footer}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function FinderCheatsheetPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(
    finderCheatsheet?.sections[0]?.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''
  );
  
  // Function to navigate to a section and update URL
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      router.replace(`/cheatsheets/finder#${sectionId}`, { scroll: false });
    }
  };
  
  // Initialize from URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setActiveSection(hash);
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);
  
  // Update active section based on scroll position
  useEffect(() => {
    if (!finderCheatsheet) return;
    
    const handleScroll = () => {
      const sections = finderCheatsheet.sections;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i].title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            if (activeSection !== sectionId) {
              setActiveSection(sectionId);
              router.replace(`/cheatsheets/finder#${sectionId}`, { scroll: false });
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, router]);

  // If the cheatsheet is not found, show an error message
  if (!finderCheatsheet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Finder Cheatsheet Not Found</h1>
          <p className="text-slate-400">The Finder cheatsheet data could not be loaded.</p>
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
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">
          {finderCheatsheet.metadata.title}
        </h1>
        <div className="text-xl text-muted-foreground max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children, ...props }) {
                return (
                  <p className="mb-2 text-muted-foreground text-xl" {...props}>
                    {children}
                  </p>
                );
              },
              a({ href, children, ...props }) {
                // External links
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
                    {...props}
                  >
                    {children}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                );
              }
            }}
          >
            {finderCheatsheet.metadata.intro}
          </ReactMarkdown>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {finderCheatsheet.metadata.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
        
      {/* Main content */}
      <div className="space-y-12">
        {finderCheatsheet.sections.map((section) => {
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
              {/* Check if section title contains {.cols-2} for 2-column layout */}
              {(() => {
                const isTwoColumnSection = section.title.includes('{.cols-2}');
                const gridClass = isTwoColumnSection 
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-auto"
                  : "grid grid-cols-1 xl:grid-cols-3 gap-6 auto-rows-auto";
                
                return (
                  <div className={gridClass}
                       style={{ gridAutoRows: 'minmax(200px, auto)' }}>
                    {(() => {
                      return [
                        // Render section-level cards first
                        ...section.cards.map((card, cardIndex) => {
                          const spanConfig = parseSpanConfig(card.spanConfig);
                          
                          if (card.isShortcutsCard && card.shortcuts) {
                            return (
                              <ShortcutsCard 
                                key={`section-${cardIndex}`}
                                card={card}
                                spanConfig={spanConfig}
                              />
                            );
                          } else {
                            return (
                              <ContentCard 
                                key={`section-${cardIndex}`}
                                card={card}
                                spanConfig={spanConfig}
                              />
                            );
                          }
                        }),
                        // Then render subsection cards
                        ...section.subsections.flatMap((subsection, subsectionIndex) => 
                          subsection.cards.map((card, cardIndex) => {
                            const spanConfig = parseSpanConfig(card.spanConfig);
                            
                            if (card.isShortcutsCard && card.shortcuts) {
                              return (
                                <ShortcutsCard 
                                  key={`${subsectionIndex}-${cardIndex}`}
                                  card={card}
                                  spanConfig={spanConfig}
                                />
                              );
                            } else {
                              return (
                                <ContentCard 
                                  key={`${subsectionIndex}-${cardIndex}`}
                                  card={card}
                                  spanConfig={spanConfig}
                                />
                              );
                            }
                          })
                        )
                      ];
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
        sections={finderCheatsheet.sections}
        activeSection={activeSection}
        setActiveSection={navigateToSection}
      />
    </div>
  );
}
