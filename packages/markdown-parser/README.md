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

# Run the example
npx parse-markdown example

# Get help
npx parse-markdown --help
```

### CLI Options

- `--output, -o`: Specify output file path
- `--output-dir`: Specify output directory for batch processing
- `--no-metadata`: Skip YAML front matter extraction
- `--no-code-blocks`: Don't preserve code block formatting
- `--no-span-config`: Don't extract span configuration
- `--pretty`: Pretty print JSON output

## Output Structure

The parser converts markdown files into a structured JSON format:

```typescript
interface MarkdownDocument {
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

# Run in development mode
npm run dev

# Clean build artifacts
npm run clean
```

## License

MIT
