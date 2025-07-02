'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, RotateCcw, Download, Upload, Shuffle, FileText, Eye, EyeOff, List, Code, Maximize, Minimize, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  headings: number;
  links: number;
  images: number;
  codeBlocks: number;
  tables: number;
}

function MarkdownTool() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [stats, setStats] = useState<MarkdownStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
    headings: 0,
    links: 0,
    images: 0,
    codeBlocks: 0,
    tables: 0
  });
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showTOC, setShowTOC] = useState(true);
  const [enableSyntaxHighlight, setEnableSyntaxHighlight] = useState(true);
  const [enableTables, setEnableTables] = useState(true);
  const [enableTaskLists, setEnableTaskLists] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to safely encode/decode for URL sharing
  const encodeForUrl = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch {
      return '';
    }
  };

  const decodeFromUrl = (encoded: string): string => {
    try {
      const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return '';
    }
  };

  // Load from URL parameters on mount
  useEffect(() => {
    const urlMarkdown = searchParams.get('markdown');
    const urlViewMode = searchParams.get('view');
    
    if (urlMarkdown) {
      const decodedMarkdown = decodeFromUrl(urlMarkdown);
      if (decodedMarkdown) {
        setMarkdown(decodedMarkdown);
      }
    }
    if (urlViewMode === 'split' || urlViewMode === 'edit' || urlViewMode === 'preview') {
      setViewMode(urlViewMode);
    }
  }, [searchParams]);

  // Generate example Markdown content
  const generateExampleMarkdown = () => {
    const examples = [
      {
        title: 'Documentation Example',
        content: `# Project Documentation

## Overview

This is a comprehensive guide to our project. It includes **important** information and *useful* tips.

## Features

- [x] User authentication
- [x] Real-time updates
- [ ] Mobile app
- [ ] API v2

## Installation

\`\`\`bash
npm install project-name
cd project-name
npm start
\`\`\`

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Port | 3000 | Server port |
| Debug | false | Enable debug mode |
| Timeout | 30s | Request timeout |

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

> **Note:** This is an important note about the configuration.

## Links

- [Official Website](https://example.com)
- [GitHub Repository](https://github.com/example/repo)

![Example Image](https://via.placeholder.com/400x200?text=Example+Image)

---

### Subsection

More content here with \`inline code\` and additional details.`
      },
      {
        title: 'Blog Post Example',
        content: `# The Future of Web Development

*Published on January 15, 2024*

Web development continues to evolve at a **rapid pace**. Here are the key trends shaping our industry:

## 1. Framework Evolution

### React & Next.js
- Server Components
- App Router
- Streaming

### Vue & Nuxt
- Composition API
- Auto-imports
- Hybrid rendering

## 2. Performance Optimization

> Performance is not just about speed—it's about user experience.

Key metrics to track:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

## 3. Developer Experience

\`\`\`typescript
// Modern TypeScript with great DX
interface User {
  id: string;
  name: string;
  email: string;
}

const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  return await api.post('/users', data);
};
\`\`\`

## Conclusion

The future looks bright! 🚀

---

*What are your thoughts on these trends? Share in the comments below.*`
      },
      {
        title: 'README Template',
        content: `# Project Name

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://example.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A brief description of what this project does and who it's for.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install my-project with npm:

\`\`\`bash
npm install my-project
cd my-project
\`\`\`

## Usage/Examples

\`\`\`javascript
import Component from 'my-project'

function App() {
  return <Component />
}
\`\`\`

## API Reference

#### Get all items

\`\`\`http
GET /api/items
\`\`\`

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| \`api_key\` | \`string\` | **Required**. Your API key |

#### Get item

\`\`\`http
GET /api/items/\${id}
\`\`\`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| \`id\`      | \`string\` | **Required**. Id of item to fetch |

## Contributing

Contributions are always welcome!

See \`contributing.md\` for ways to get started.

## License

[MIT](https://choosealicense.com/licenses/mit/)`
      },
      {
        title: 'Tutorial Example',
        content: `# Getting Started with Markdown

## What is Markdown?

Markdown is a **lightweight markup language** that you can use to add formatting elements to plaintext text documents.

## Basic Syntax

### Headers

\`\`\`markdown
# H1
## H2
### H3
#### H4
##### H5
###### H6
\`\`\`

### Emphasis

- *Italic text* or _italic text_
- **Bold text** or __bold text__
- ***Bold and italic*** or ___bold and italic___
- ~~Strikethrough~~

### Lists

#### Unordered Lists
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

#### Ordered Lists
1. First item
2. Second item
3. Third item

#### Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

### Links and Images

[Link text](https://example.com)

![Alt text](https://via.placeholder.com/300x150?text=Image)

### Code

Inline \`code\` has backticks around it.

\`\`\`python
# Code blocks use triple backticks
def hello_world():
    print("Hello, World!")
\`\`\`

### Tables

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

### Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

### Horizontal Rules

---

That's the basics! Happy writing! ✨`
      }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setMarkdown(randomExample.content);
    toast.success(`Example loaded: ${randomExample.title}`);
  };

  // Simple Markdown to HTML converter
  const convertMarkdownToHTML = (md: string): string => {
    let html = md;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');

    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Code blocks
    if (enableSyntaxHighlight) {
      html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
      });
    } else {
      html = html.replace(/```[\s\S]*?```/gim, (match) => {
        const code = match.replace(/```\w*\n?/g, '').replace(/```$/g, '');
        return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code>${code}</code></pre>`;
      });
    }

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />');

    // Task lists
    if (enableTaskLists) {
      html = html.replace(/- \[x\] (.*)/gim, '<div class="flex items-center space-x-2"><input type="checkbox" checked disabled class="rounded" /><span class="line-through text-gray-500">$1</span></div>');
      html = html.replace(/- \[ \] (.*)/gim, '<div class="flex items-center space-x-2"><input type="checkbox" disabled class="rounded" /><span>$1</span></div>');
    }

    // Unordered lists
    html = html.replace(/^\s*\* (.+)/gim, '<li>$1</li>');
    html = html.replace(/^\s*- (.+)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1 ml-4">$1</ul>');

    // Ordered lists
    html = html.replace(/^\s*\d+\. (.+)/gim, '<li>$1</li>');

    // Tables
    if (enableTables) {
      const tableRegex = /(\|.*\|.*\n)+/gim;
      html = html.replace(tableRegex, (match) => {
        const rows = match.trim().split('\n');
        const headerRow = rows[0];
        const separatorRow = rows[1];
        const dataRows = rows.slice(2);

        if (!separatorRow || !separatorRow.includes('---')) {
          return match;
        }

        const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
        const data = dataRows.map(row => 
          row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );

        let tableHTML = '<table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600 my-4">';
        tableHTML += '<thead class="bg-gray-50 dark:bg-gray-800">';
        tableHTML += '<tr>';
        headers.forEach(header => {
          tableHTML += `<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">${header}</th>`;
        });
        tableHTML += '</tr></thead>';
        tableHTML += '<tbody>';
        data.forEach(row => {
          tableHTML += '<tr>';
          row.forEach(cell => {
            tableHTML += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</td>`;
          });
          tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';

        return tableHTML;
      });
    }

    // Blockquotes
    html = html.replace(/^> (.+)/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="border-gray-300 dark:border-gray-600 my-6" />');

    // Paragraphs
    html = html.replace(/\n\n/gim, '</p><p class="mb-4">');
    html = '<p class="mb-4">' + html + '</p>';

    // Line breaks
    html = html.replace(/\n/gim, '<br />');

    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-4"><\/p>/gim, '');

    return html;
  };

  // Extract table of contents
  const extractTOC = (md: string): TOCItem[] => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const toc: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(md)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      
      toc.push({ id, text, level });
    }

    return toc;
  };

  // Calculate statistics
  const calculateStats = (md: string): MarkdownStats => {
    const characters = md.length;
    const charactersNoSpaces = md.replace(/\s/g, '').length;
    const words = md.trim() ? md.trim().split(/\s+/).length : 0;
    const lines = md.split('\n').length;
    const paragraphs = md.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    const headings = (md.match(/^#{1,6}\s+.+$/gm) || []).length;
    const links = (md.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    const images = (md.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;
    const codeBlocks = (md.match(/```[\s\S]*?```/g) || []).length;
    const tables = (md.match(/(\|.*\|.*\n)+/g) || []).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      headings,
      links,
      images,
      codeBlocks,
      tables
    };
  };

  // Process markdown
  useEffect(() => {
    if (!markdown.trim()) {
      setHtml('');
      setToc([]);
      setStats({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        headings: 0,
        links: 0,
        images: 0,
        codeBlocks: 0,
        tables: 0
      });
      return;
    }

    const convertedHTML = convertMarkdownToHTML(markdown);
    const extractedTOC = extractTOC(markdown);
    const calculatedStats = calculateStats(markdown);

    setHtml(convertedHTML);
    setToc(extractedTOC);
    setStats(calculatedStats);
  }, [markdown, enableSyntaxHighlight, enableTables, enableTaskLists]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const shareResult = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('markdown', encodeForUrl(markdown));
    url.searchParams.set('view', viewMode);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success('Shareable URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to create shareable URL');
    });
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Markdown file downloaded!');
  };

  const downloadHTML = () => {
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        code { background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-size: 85%; }
        pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
        blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
        th { background-color: #f6f8fa; font-weight: 600; }
        img { max-width: 100%; height: auto; }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setMarkdown(text);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setMarkdown('');
    setHtml('');
    setToc([]);
    router.push('/tools/markdown');
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'image':
        newText = `![${selectedText || 'alt text'}](image-url)`;
        break;
      case 'header':
        newText = `## ${selectedText || 'Header'}`;
        break;
      case 'list':
        newText = `- ${selectedText || 'List item'}`;
        break;
      case 'quote':
        newText = `> ${selectedText || 'Quote'}`;
        break;
      case 'table':
        newText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`;
        break;
      case 'codeblock':
        newText = `\`\`\`\n${selectedText || 'code'}\n\`\`\``;
        break;
    }

    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Markdown Preview</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Write Markdown and see a live preview with syntax highlighting, table of contents, and export options.
        </p>
      </div>

      {/* Toolbar */}
      <Card className="mb-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={generateExampleMarkdown}>
                <Shuffle className="h-4 w-4 mr-2" />
                Example
              </Button>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={clearAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
              
              {/* Quick Insert Buttons */}
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('bold')} title="Bold">
                <strong>B</strong>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('italic')} title="Italic">
                <em>I</em>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('code')} title="Inline Code">
                <Code className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('link')} title="Link">
                🔗
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('image')} title="Image">
                🖼️
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('header')} title="Header">
                H
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('list')} title="List">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertMarkdown('quote')} title="Quote">
                💬
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'split' | 'edit' | 'preview')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="edit" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="split" className="text-xs">
                    <Maximize className="h-3 w-3 mr-1" />
                    Split
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor and Preview */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {/* Main Content */}
        <div className={`${showTOC && toc.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className={`grid gap-6 ${viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Editor */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <FileText className="h-5 w-5" />
                      <span>Markdown Editor</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      {markdown && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(markdown, 'Markdown')}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                            <Download className="h-4 w-4 mr-2" />
                            .md
                          </Button>
                          <Button variant="outline" size="sm" onClick={shareResult}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription className="dark:text-gray-300">
                    Write your Markdown content here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="# Welcome to Markdown Preview

Start typing your Markdown here...

## Features
- Live preview
- Syntax highlighting
- Table of contents
- Export options

**Bold text** and *italic text* are supported.

```javascript
console.log('Code blocks too!');
```"
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="min-h-[500px] resize-none font-mono text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Characters: {stats.characters} | Words: {stats.words} | Lines: {stats.lines}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <Eye className="h-5 w-5" />
                      <span>Preview</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      {html && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(html, 'HTML')}>
                            <Copy className="h-4 w-4 mr-2" />
                            HTML
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadHTML}>
                            <Download className="h-4 w-4 mr-2" />
                            .html
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription className="dark:text-gray-300">
                    Live preview of your Markdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[500px] max-h-[600px] overflow-y-auto">
                    {html ? (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    ) : (
                      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start typing Markdown to see the preview</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Table of Contents Sidebar */}
        {toc.length > 0 && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <List className="h-5 w-5" />
                    <span>Table of Contents</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTOC(!showTOC)}
                  >
                    {showTOC ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              {showTOC && (
                <CardContent>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {toc.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"
                        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                      >
                        <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Statistics and Settings Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Statistics */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              <span>Statistics</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Document analysis and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.characters}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Characters</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.words}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Words</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.lines}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Lines</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.paragraphs}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Paragraphs</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.headings}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Headings</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.links}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Links</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-900 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">Images:</span>
                <Badge variant="outline">{stats.images}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-900 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">Code blocks:</span>
                <Badge variant="outline">{stats.codeBlocks}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-900 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tables:</span>
                <Badge variant="outline">{stats.tables}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Customize preview options and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Preview Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="syntax-highlight"
                      checked={enableSyntaxHighlight}
                      onCheckedChange={setEnableSyntaxHighlight}
                    />
                    <label htmlFor="syntax-highlight" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      Syntax highlighting
                    </label>
                  </div>
                  <Badge variant={enableSyntaxHighlight ? "default" : "outline"}>
                    {enableSyntaxHighlight ? "On" : "Off"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="tables"
                      checked={enableTables}
                      onCheckedChange={setEnableTables}
                    />
                    <label htmlFor="tables" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      Table support
                    </label>
                  </div>
                  <Badge variant={enableTables ? "default" : "outline"}>
                    {enableTables ? "On" : "Off"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="task-lists"
                      checked={enableTaskLists}
                      onCheckedChange={setEnableTaskLists}
                    />
                    <label htmlFor="task-lists" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      Task lists
                    </label>
                  </div>
                  <Badge variant={enableTaskLists ? "default" : "outline"}>
                    {enableTaskLists ? "On" : "Off"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Export Options</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" onClick={downloadMarkdown} disabled={!markdown}>
                  <Download className="h-4 w-4 mr-2" />
                  Download .md
                </Button>
                <Button variant="outline" className="w-full" onClick={downloadHTML} disabled={!html}>
                  <Download className="h-4 w-4 mr-2" />
                  Export .html
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">About Markdown</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Markdown is a lightweight markup language that allows you to format text using simple syntax. 
            It's widely used for documentation, README files, and content creation.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Syntax:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <code># Header</code> - Headers</li>
                <li>• <code>**bold**</code> - Bold text</li>
                <li>• <code>*italic*</code> - Italic text</li>
                <li>• <code>`code`</code> - Inline code</li>
                <li>• <code>- item</code> - Lists</li>
                <li>• <code>[link](url)</code> - Links</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Tables with pipes</li>
                <li>• Code blocks with syntax highlighting</li>
                <li>• Task lists with checkboxes</li>
                <li>• Blockquotes</li>
                <li>• Images and media</li>
                <li>• Horizontal rules</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Export Options:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Download as Markdown (.md)</li>
                <li>• Export as HTML (.html)</li>
                <li>• Copy HTML to clipboard</li>
                <li>• Share with URL parameters</li>
                <li>• Live preview updates</li>
                <li>• Table of contents generation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarkdownPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <MarkdownTool />
    </Suspense>
  );
}