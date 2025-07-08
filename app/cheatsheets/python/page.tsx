'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Play, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Python cheatsheet content
const pythonCheatsheet = {
  title: "Python Cheatsheet",
  description: "A comprehensive guide to Python programming language basics",
  sections: [
    {
      id: "getting-started",
      title: "Getting Started",
      cards: [
        {
          id: "introduction",
          title: "Introduction",
          size: "normal",
          content: [
            {
              type: "list",
              items: [
                { text: "Python", link: "https://python.org", description: "(python.org)" },
                { text: "Python Document", link: "https://docs.python.org", description: "(docs.python.org)" },
                { text: "Learn X in Y minutes", link: "https://learnxinyminutes.com/docs/python/", description: "(learnxinyminutes.com)" },
                { text: "Regex in python", link: "https://docs.python.org/3/library/re.html", description: "(cheatsheets.zip)" }
              ]
            }
          ]
        },
        {
          id: "hello-world",
          title: "Hello World",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: '>>> print("Hello, World!")\nHello, World!'
            },
            {
              type: "text",
              text: "The famous \"Hello World\" program in Python"
            }
          ],
          actions: [
            { type: "copy", label: "Copy" },
            { type: "run", label: "Run" }
          ]
        },
        {
          id: "variables",
          title: "Variables",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: 'age = 18      # age is of type int\nname = "John"  # name is now of type str\nprint(name)'
            },
            {
              type: "text",
              text: "Python can't declare a variable without assignment."
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        }
      ]
    },
    {
      id: "data-types",
      title: "Data Types",
      cards: [
        {
          id: "data-types-overview",
          title: "Data Types",
          size: "wide",
          content: [
            {
              type: "table",
              rows: [
                { key: "str", value: "Text" },
                { key: "int, float, complex", value: "Numeric" },
                { key: "list, tuple, range", value: "Sequence" },
                { key: "dict", value: "Mapping" },
                { key: "set, frozenset", value: "Set" },
                { key: "bool", value: "Boolean" },
                { key: "bytes, bytearray, memoryview", value: "Binary" }
              ]
            }
          ]
        },
        {
          id: "slicing-string",
          title: "Slicing String",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: '>>> msg = "Hello, World!"\n>>> print(msg[2:5])\nllo'
            },
            {
              type: "text",
              text: "See: Strings"
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        },
        {
          id: "lists",
          title: "Lists",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: 'mylist = []\nmylist.append(1)\nmylist.append(2)\nfor item in mylist:\n    print(item) # prints out 1,2\n\nSee: Lists'
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        }
      ]
    },
    {
      id: "control-flow",
      title: "Control Flow",
      cards: [
        {
          id: "if-else",
          title: "If Else",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: 'num = 200\nif num > 0:\n    print("num is greater than 0")\nelse:\n    print("num is not greater than 0")'
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        },
        {
          id: "loops",
          title: "Loops",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: 'for item in range(6):\n    if item == 3: break\n    print(item)\nelse:\n    print("Finally finished!")'
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        }
      ]
    },
    {
      id: "functions",
      title: "Functions",
      cards: [
        {
          id: "function-basics",
          title: "Function Basics",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: 'def greet(name):\n    """This function greets the person passed in as a parameter"""\n    return f"Hello, {name}!"\n\nprint(greet("World"))'
            },
            {
              type: "text",
              text: "Functions are defined with the def keyword and can include docstrings."
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        },
        {
          id: "lambda-functions",
          title: "Lambda Functions",
          size: "normal",
          content: [
            {
              type: "code",
              language: "python",
              code: '# Lambda function that adds 10 to the input\nx = lambda a : a + 10\nprint(x(5))  # Output: 15\n\n# Lambda with multiple arguments\nsum = lambda a, b, c : a + b + c\nprint(sum(5, 6, 7))  # Output: 18'
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        }
      ]
    },
    {
      id: "modules",
      title: "Modules & Packages",
      cards: [
        {
          id: "importing",
          title: "Importing",
          size: "wide",
          content: [
            {
              type: "code",
              language: "python",
              code: '# Import the entire module\nimport math\nprint(math.sqrt(16))  # Output: 4.0\n\n# Import specific functions\nfrom math import sqrt, pi\nprint(sqrt(16))  # Output: 4.0\nprint(pi)  # Output: 3.141592653589793\n\n# Import with alias\nimport numpy as np\narray = np.array([1, 2, 3])'
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        }
      ]
    },
    {
      id: "file-handling",
      title: "File Handling",
      cards: [
        {
          id: "reading-writing",
          title: "Reading & Writing Files",
          size: "full",
          content: [
            {
              type: "code",
              language: "python",
              code: '# Writing to a file\nwith open("file.txt", "w") as f:\n    f.write("Hello, World!")\n\n# Reading from a file\nwith open("file.txt", "r") as f:\n    content = f.read()\n    print(content)  # Output: Hello, World!\n\n# Appending to a file\nwith open("file.txt", "a") as f:\n    f.write("\\nAppended text.")\n\n# Reading lines\nwith open("file.txt", "r") as f:\n    lines = f.readlines()\n    for line in lines:\n        print(line.strip())'
            }
          ],
          actions: [
            { type: "copy", label: "Copy" }
          ]
        }
      ]
    }
  ],
  sidebar: {
    title: "Contents",
    items: [
      { id: "getting-started", label: "Getting Started" },
      { id: "data-types", label: "Data Types" },
      { id: "control-flow", label: "Control Flow" },
      { id: "functions", label: "Functions" },
      { id: "modules", label: "Modules & Packages" },
      { id: "file-handling", label: "File Handling" }
    ]
  }
};

// Component for rendering code blocks with syntax highlighting
const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="relative group">
      <pre className="p-4 bg-slate-950 text-slate-50 rounded-md overflow-x-auto font-mono text-sm">
        <code>{code}</code>
      </pre>
      <button 
        onClick={copyCode}
        className="absolute top-2 right-2 p-1 rounded-md bg-slate-800 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        <Copy size={16} />
      </button>
    </div>
  );
};

// Component for rendering a list
const List = ({ items }: { items: { text: string, link?: string, description?: string }[] }) => {
  return (
    <ul className="space-y-2 list-disc list-inside text-slate-200">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="mr-2">•</span>
          <div>
            {item.link ? (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
            {item.description && (
              <span className="text-slate-400 ml-1">{item.description}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
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

// Card component for each cheatsheet section
const CheatsheetCard = ({ card }: { card: any }) => {
  const sizeClasses = {
    normal: "md:col-span-1",
    wide: "md:col-span-2",
    full: "md:col-span-3"
  };

  return (
    <Card className={cn(
      "bg-slate-800 border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-blue-900/20",
      sizeClasses[card.size as keyof typeof sizeClasses]
    )}>
      <CardHeader className="bg-slate-800/50 border-b border-slate-700 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-100 text-lg">{card.title}</CardTitle>
          <Badge variant="outline" className="bg-indigo-900/30 text-indigo-300 border-indigo-800">
            {card.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {card.content.map((item: any, index: number) => (
          <div key={index}>
            {item.type === 'code' && (
              <CodeBlock code={item.code} language={item.language} />
            )}
            {item.type === 'text' && (
              <p className="text-slate-300">{item.text}</p>
            )}
            {item.type === 'list' && (
              <List items={item.items} />
            )}
            {item.type === 'table' && (
              <Table rows={item.rows} />
            )}
          </div>
        ))}
        
        {card.actions && card.actions.length > 0 && (
          <div className="flex space-x-2 mt-4">
            {card.actions.map((action: any, index: number) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
                onClick={() => {
                  if (action.type === 'copy') {
                    const codeContent = card.content.find((item: any) => item.type === 'code')?.code || '';
                    navigator.clipboard.writeText(codeContent);
                    toast.success('Code copied to clipboard!');
                  }
                }}
              >
                {action.type === 'copy' && <Copy className="h-4 w-4 mr-2" />}
                {action.type === 'run' && <Play className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sidebar component for navigation
const Sidebar = ({ items, activeSection, setActiveSection }: { 
  items: { id: string, label: string }[], 
  activeSection: string,
  setActiveSection: (id: string) => void
}) => {
  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 sticky top-20">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Contents</h2>
      <nav>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors",
                  activeSection === item.id 
                    ? "bg-blue-900/30 text-blue-300 border-l-2 border-blue-400" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default function PythonCheatsheetPage() {
  const [activeSection, setActiveSection] = useState(pythonCheatsheet.sections[0].id);
  
  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = pythonCheatsheet.sections;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-4">
            # {pythonCheatsheet.title}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {pythonCheatsheet.description}
          </p>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Sidebar 
              items={pythonCheatsheet.sidebar.items} 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3 space-y-12">
            {pythonCheatsheet.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-3xl font-bold text-indigo-400 mb-6 flex items-center">
                  # {section.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {section.cards.map((card) => (
                    <CheatsheetCard key={card.id} card={card} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}