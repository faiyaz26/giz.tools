# @giz-tools/markdown-parser

A TypeScript-based markdown parser specifically designed for Husky CMS. It converts structured markdown files into JSON format suitable for rendering in card-based layouts.

## Features

- 🎯 **Structured Parsing**: Converts markdown into hierarchical sections and cards
- 📝 **YAML Front Matter**: Extracts metadata from document headers
- 🎨 **Span Configuration**: Handles layout hints like `{.row-span-2}`
- 🔧 **Code Block Preservation**: Maintains syntax highlighting information
- 📦 **Batch Processing**: Parse multiple files at once
- 🖥️ **CLI Interface**: Command-line tool for easy integration
- 🎨 **TypeScript**: Full type safety and excellent IDE support
- 🚀 **GitHub Integration**: Download and process cheatsheets directly from GitHub repositories
- 📋 **Automatic Index Generation**: Creates searchable index files
- ⌨️ **Keyboard Shortcuts Parsing**: Special handling for shortcut tables

## Installation

```bash
# Install in your monorepo
npm install @giz-tools/markdown-parser

# Or install globally for CLI usage
npm install -g @giz-tools/markdown-parser
```

## Usage

### As a Library

```typescript
import { MarkdownParser } from "@giz-tools/markdown-parser";

const parser = new MarkdownParser();

// Parse a single file
const result = await parser.parseFile("cheatsheet.md");
if (result.success) {
  console.log(result.document);
}

// Parse multiple files
const results = await parser.parseFiles(["file1.md", "file2.md"]);

// Parse content directly
const content = `---
title: Example
tags: [demo]
---

## Section
### Card Title
\`\`\`javascript
console.log('Hello World');
\`\`\`
This is the footer text.
`;

const document = parser.parseContent(content);
```

### CLI Usage

```bash
# Parse a single file
npx parse-markdown single app/cheatsheets/python/python.md

# Parse multiple files with glob pattern
npx parse-markdown batch "app/cheatsheets/**/*.md"

# Create individual JSON files with index
npx parse-markdown individual "examples/*.md"

# Download and process GitHub repository (NEW!)
npx parse-markdown github

# Get help
npx parse-markdown --help
```

## Quick Start: Update All Cheatsheets

The easiest way to update all cheatsheets from the [Fechin/reference](https://github.com/Fechin/reference) repository:

```bash
# From the root of giz.tools project
npm run update:cheatsheets
```

This command will:

1. Download all cheatsheets from GitHub
2. Parse them into individual JSON files
3. Generate a searchable index
4. Copy everything to the main application

### Manual GitHub Processing

For more control over the GitHub processing:

```bash
# Build the parser first
npm run build

# Download and process all cheatsheets
node dist/cli.js github --pretty

# With custom output directory
node dist/cli.js github -o ./custom-output --index-output ./custom-index.json

# Keep temporary files for inspection
node dist/cli.js github --keep-temp --pretty
```

### CLI Options

- `--output, -o`: Specify output file path or directory
- `--output-dir`: Specify output directory for batch processing
- `--index-output`: Specify path for the index file (individual/github commands)
- `--temp-dir`: Temporary directory for cloning repos (github command)
- `--keep-temp`: Keep temporary repository after processing (github command)
- `--no-metadata`: Skip YAML front matter extraction
- `--no-code-blocks`: Don't preserve code block formatting
- `--no-span-config`: Don't extract span configuration
- `--pretty`: Pretty print JSON output

## Available Commands

### `github`

Download and process cheatsheets from the Fechin/reference GitHub repository.

```bash
# Basic usage
node dist/cli.js github

# With options
node dist/cli.js github --pretty --keep-temp -o ./cheatsheets
```

### `individual <pattern>`

Process local markdown files and create individual JSON files with an index.

```bash
# Process example files
node dist/cli.js individual "examples/*.md" --pretty
```

### `single <file>`

Process a single markdown file.

```bash
# Process one file
node dist/cli.js single examples/python.md -o python-output.json
```

### `batch <pattern>`

Process multiple files matching a pattern (legacy command).

```bash
# Process all markdown files
node dist/cli.js batch "**/*.md" --output-dir ./output
```

## Output Structure

The parser converts markdown files into a structured JSON format:

```typescript
interface MarkdownDocument {
  id: string; // Auto-generated from filename
  metadata: {
    title?: string;
    tags?: string[];
    categories?: string[];
    intro?: string;
    // ... other YAML front matter fields
  };
  sections: Section[];
}

interface Section {
  title: string;
  level: number; // 2 for H2, 3 for H3
  cards: Card[];
  subsections: Section[];
}

interface Card {
  title: string;
  body: string; // Usually code blocks
  footer: string; // Explanatory text
  spanConfig: string; // Layout hints like "row-span-2"
  shortcuts?: KeyboardShortcut[]; // For shortcut tables
  isShortcutsCard?: boolean; // Indicates if this is a shortcuts card
}

interface KeyboardShortcut {
  shortcut: string;
  action: string;
}
```

### Index File Structure

When using `individual` or `github` commands, an index file is also generated:

```typescript
interface CheatsheetIndexData {
  cheatsheets: CheatsheetIndexItem[];
  createdAt: string;
  version: string;
  totalCheatsheets: number;
}

interface CheatsheetIndexItem {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  categories: string[];
  status: string;
  sections: string[]; // Section titles
  icon: string;
  gradient: string;
  badge: string;
}
```

## Example

Given this markdown:

```markdown
---
title: Python Cheatsheet
tags: [python, programming]
---

## Getting Started

### Hello World {.row-span-2}

\`\`\`python
print("Hello, World!")
\`\`\`

The famous "Hello World" program in Python
```

The parser outputs:

````json
{
  "metadata": {
    "title": "Python Cheatsheet",
    "tags": ["python", "programming"]
  },
  "sections": [
    {
      "title": "Getting Started",
      "level": 2,
      "cards": [],
      "subsections": [
        {
          "title": "Hello World",
          "level": 3,
          "cards": [
            {
              "title": "Hello World",
              "body": "```python\nprint(\"Hello, World!\")\n```",
              "footer": "The famous \"Hello World\" program in Python",
              "spanConfig": "row-span-2"
            }
          ],
          "subsections": []
        }
      ]
    }
  ]
}
````

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run development commands
npm run dev

# Process GitHub repository
npm run parse:github

# Process individual files
npm run parse:individual

# Clean build artifacts
npm run clean
```

## Workflow for Updating Cheatsheets

### Regular Updates

To update all cheatsheets with the latest content:

```bash
# From the root directory of giz.tools
npm run update:cheatsheets

# Then build and deploy your application
npm run build
```

### Development Workflow

1. Make changes to parser or add new markdown files
2. Test locally:
   ```bash
   cd packages/markdown-parser
   npm run build
   node dist/cli.js github --keep-temp --pretty
   ```
3. Copy to main app:
   ```bash
   cp -r public/data/* ../../public/data/
   ```
4. Build and test:
   ```bash
   cd ../..
   npm run build
   npm run dev
   ```

## Special Features

### Keyboard Shortcuts Parsing

Tables with "Shortcut" and "Action" columns are automatically detected and converted to structured shortcut data:

```markdown
| Shortcut | Action |
| -------- | ------ |
| Cmd+C    | Copy   |
| Cmd+V    | Paste  |
```

### Span Configuration

CSS grid layout hints are preserved:

```markdown
## Basic Syntax {.col-span-2}
```

### Metadata Extraction

YAML frontmatter is used for categorization and keywords:

```yaml
---
title: Python
categories: [Programming]
tags: [python, scripting]
---

```

## License

MIT
