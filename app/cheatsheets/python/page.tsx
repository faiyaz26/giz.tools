'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Play, ExternalLink, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloatingNavBar } from '@/components/floating-nav-bar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  loadCheatsheetData, 
  parseSpanConfig, 
  type CheatsheetData,
  type CheatsheetCard,
  type CheatsheetSubsection,
  type CheatsheetCardSubsection
} from '@/lib/cheatsheet-data';

// Load the parsed Python cheatsheet data
const pythonCheatsheet: CheatsheetData = loadCheatsheetData('python-cheatsheet-parsed.json');

// Component for rendering code blocks with syntax highlighting
const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  // Map common language names to syntax highlighter supported languages
  const getLanguage = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
      'json': 'json',
      'html': 'markup',
      'xml': 'markup',
      'md': 'markdown',
      'css': 'css',
      'scss': 'scss',
      'sql': 'sql',
      'dockerfile': 'docker',
      'bash': 'bash',
      'zsh': 'bash',
      'powershell': 'powershell',
      'ps1': 'powershell'
    };
    
    return langMap[lang.toLowerCase()] || lang.toLowerCase() || 'text';
  };

  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'rgb(2 6 23)', // slate-950
      margin: 0,
      padding: '1rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    }
  };

  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={getLanguage(language)}
        style={customStyle}
        customStyle={{
          background: 'rgb(2 6 23)',
          margin: 0,
          padding: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        }}
        wrapLongLines={true}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button 
        onClick={copyCode}
        className={cn(
          "absolute top-2 right-2 p-2 rounded-md transition-all duration-200",
          copied 
            ? "bg-green-700 text-green-100" 
            : "bg-slate-800 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-700"
        )}
        aria-label="Copy code"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

// Component for rendering a table
const Table = ({ rows }: { rows: { key: string, value: string }[] }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          <div className="font-mono text-blue-400">{row.key}</div>
          <div className="text-slate-200">{row.value}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

// Component for rendering markdown content with subsections
const MarkdownContent = ({ content }: { content: string }) => {
  // Function to handle internal link navigation
  const handleInternalNavigation = (sectionId: string) => {
    const normalizedSectionId = sectionId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const element = document.getElementById(normalizedSectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre({ children, ...props }: any) {
            // Handle code blocks wrapped in pre tags
            return (
              <div className="my-4">
                {children}
              </div>
            );
          },
          hr({ ...props }: any) {
            // Don't render horizontal rules - they're often artifacts from markdown parsing
            return null;
          },
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'python';
            const isInline = !className;
            
            if (!isInline) {
              // This is a fenced code block
              return (
                <CodeBlock 
                  language={language} 
                  code={String(children).replace(/\n$/, '')} 
                />
              );
            }
            
            // This is inline code
            return (
              <code 
                className="bg-slate-800 text-blue-300 px-1 py-0.5 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            );
          },
          a({ href, children, ...props }: any) {
            if (href?.startsWith('#')) {
              // Internal navigation
              return (
                <button
                  onClick={() => handleInternalNavigation(href.slice(1))}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                >
                  {children}
                </button>
              );
            } else {
              // External links
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                  {...props}
                >
                  {children}
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            }
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table 
                  className="border-collapse border border-slate-600 w-full" 
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            // Check if header row is empty and skip rendering if so
            const isEmptyHeader = React.Children.toArray(children).some(child => {
              if (React.isValidElement(child) && child.type === 'tr') {
                const thElements = React.Children.toArray(child.props.children);
                const allEmpty = thElements.every(th => {
                  if (React.isValidElement(th) && th.props.children) {
                    const content = typeof th.props.children === 'string' 
                      ? th.props.children.trim() 
                      : '';
                    return content === '' || content === ' ';
                  }
                  return true;
                });
                return allEmpty;
              }
              return false;
            });

            if (isEmptyHeader) {
              return null;
            }

            return (
              <thead {...props}>
                {children}
              </thead>
            );
          },
          tr({ children, ...props }) {
            // Check if this is a separator row (contains only dashes, pipes, and spaces)
            const childrenArray = React.Children.toArray(children);
            const cellContents = childrenArray.map(child => {
              if (React.isValidElement(child) && (child.type === 'td' || child.type === 'th')) {
                const content = typeof child.props.children === 'string' 
                  ? child.props.children.trim() 
                  : '';
                return content;
              }
              return '';
            });

            // A separator row has ALL cells containing only dashes, spaces, and colons
            const isSeperatorRow = cellContents.length > 0 && cellContents.every(content => 
              /^[-:\s]*$/.test(content) && content.length > 0
            );

            // Skip rendering separator rows
            if (isSeperatorRow) {
              return null;
            }

            return (
              <tr {...props}>
                {children}
              </tr>
            );
          },
          th({ children, ...props }) {
            return (
              <th 
                className="border border-slate-600 px-3 py-2 bg-slate-700 font-semibold text-left text-slate-200" 
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td 
                className="border border-slate-600 px-3 py-2 text-slate-300" 
                {...props}
              >
                {children}
              </td>
            );
          },
          p({ children, ...props }) {
            return (
              <p className="mb-2 text-slate-300" {...props}>
                {children}
              </p>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="list-disc list-inside mb-2 space-y-1 text-slate-300" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-300" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="ml-2" {...props}>
                {children}
              </li>
            );
          },
          strong({ children, ...props }) {
            return (
              <strong className="font-bold text-slate-100" {...props}>
                {children}
              </strong>
            );
          },
          em({ children, ...props }) {
            return (
              <em className="italic text-slate-200" {...props}>
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Component for rendering enhanced content with subsections
const EnhancedMarkdownContent = ({ content }: { content: string }) => {
  // Parse content for subsections (#### headings)
  const sections = content.split(/(?=^#### )/m).filter(section => section.trim());
  
  if (sections.length <= 1) {
    // No subsections, render normally
    return <MarkdownContent content={content} />;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const titleMatch = lines[0].match(/^#### (.+)$/);
        
        if (titleMatch) {
          const title = titleMatch[1];
          const restContent = lines.slice(1).join('\n').trim();
          
          return (
            <div key={index} className="border-l-2 border-blue-200 pl-4">
              <h4 className="font-semibold text-blue-400 mb-2">{title}</h4>
              {restContent && <MarkdownContent content={restContent} />}
            </div>
          );
        } else {
          // First section without title or malformed section
          return <MarkdownContent key={index} content={section} />;
        }
      })}
    </div>
  );
};

// Card component for each cheatsheet section
const CheatsheetCard = ({ card, subsection }: { card: CheatsheetCard, subsection: CheatsheetSubsection }) => {
  const spanConfig = parseSpanConfig(card.spanConfig);
  
  const gridStyle: React.CSSProperties = {
    ...(spanConfig.gridColumn && { gridColumn: spanConfig.gridColumn }),
    ...(spanConfig.gridRow && { gridRow: spanConfig.gridRow })
  };

  return (
    <Card 
      className={cn(
        "bg-slate-800 border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-blue-900/20",
        spanConfig.className
      )}
      style={gridStyle}
    >
      <CardHeader className="bg-slate-800/50 border-b border-slate-700 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-100 text-lg">{card.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {card.body && (
          <MarkdownContent content={card.body} />
        )}
        
        {card.footer && (
          <div className="border-t border-slate-700 pt-4">
            <EnhancedMarkdownContent content={card.footer} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function PythonCheatsheetPage() {
  const [activeSection, setActiveSection] = useState(
    pythonCheatsheet.sections[0]?.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''
  );
  
  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = pythonCheatsheet.sections;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i].title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-4">
            # {pythonCheatsheet.metadata.title}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {pythonCheatsheet.metadata.intro}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {pythonCheatsheet.metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <div className="space-y-12">
          {pythonCheatsheet.sections.map((section) => {
            const sectionId = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            return (
              <section key={sectionId} id={sectionId} className="scroll-mt-20">
                <h2 className="text-3xl font-bold text-indigo-400 mb-6 flex items-center">
                  # {section.title}
                </h2>
                
                {/* Grid for subsection cards - responsive grid that adapts to span configs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto"
                     style={{ gridAutoRows: 'minmax(200px, auto)' }}>
                  {section.subsections.map((subsection, subsectionIndex) => (
                    subsection.cards.map((card, cardIndex) => (
                      <CheatsheetCard 
                        key={`${subsectionIndex}-${cardIndex}`} 
                        card={card} 
                        subsection={subsection}
                      />
                    ))
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        
        {/* Floating Navigation Bar */}
        <FloatingNavBar 
          sections={pythonCheatsheet.sections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
    </div>
  );
}