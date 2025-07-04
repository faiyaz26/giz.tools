import {
  Hash,
  Key,
  Braces,
  Search,
  Clock,
  FileText,
  FileCode,
  Timer,
  Merge,
  Scissors,
  ImageIcon,
  GitCompare,
  Link2,
  Shield,
  Globe,
  MapPin,
  BookOpen,
  FileImage,
} from "lucide-react";

export interface Tool {
  name: string;
  description: string;
  href: string;
  icon: any;
  status: "Available" | "Coming Soon";
  gradient: string;
  category: string;
  features: string[];
  keywords: string[];
}

export const tools: Tool[] = [
  {
    name: "Image Converter",
    description:
      "Convert images between formats, resize, compress, and optimize with quality control.",
    href: "/tools/image-converter",
    icon: ImageIcon,
    status: "Available",
    gradient: "from-cyan-500 to-blue-500",
    category: "Images",
    features: [
      "Format conversion",
      "Resize & compress",
      "Quality control",
      "Batch processing",
    ],
    keywords: [
      "image",
      "convert",
      "resize",
      "compress",
      "format",
      "jpeg",
      "png",
      "webp",
      "optimize",
    ],
  },
  {
    name: "PDF Merger",
    description:
      "Upload multiple PDF files, reorder them, and merge into a single document.",
    href: "/tools/pdf-merger",
    icon: Merge,
    status: "Available",
    gradient: "from-red-500 to-orange-500",
    category: "Documents",
    features: [
      "Drag & drop upload",
      "File reordering",
      "Client-side processing",
      "Secure merging",
    ],
    keywords: [
      "pdf",
      "merge",
      "combine",
      "documents",
      "files",
      "upload",
      "reorder",
      "join",
    ],
  },
  {
    name: "PDF Splitter",
    description:
      "Split PDF pages into individual files and download them as a ZIP archive.",
    href: "/tools/pdf-splitter",
    icon: Scissors,
    status: "Available",
    gradient: "from-violet-500 to-purple-500",
    category: "Documents",
    features: [
      "Page extraction",
      "Range selection",
      "ZIP archive creation",
      "Individual page selection",
    ],
    keywords: [
      "pdf",
      "split",
      "extract",
      "pages",
      "separate",
      "zip",
      "archive",
      "individual",
    ],
  },
  {
    name: "PDF to Image",
    description:
      "Convert PDF pages to images in various formats (PNG, JPEG, WebP). Download single images or ZIP archives for multi-page PDFs.",
    href: "/tools/pdf-to-image",
    icon: FileImage,
    status: "Available",
    gradient: "from-green-500 to-emerald-500",
    category: "Documents",
    features: [
      "Multiple formats",
      "Quality control",
      "ZIP for multi-page",
      "Client-side processing",
    ],
    keywords: [
      "pdf",
      "image",
      "convert",
      "png",
      "jpeg",
      "webp",
      "export",
      "pages",
      "zip",
    ],
  },
  {
    name: "Image to PDF",
    description:
      "Convert multiple images to a single PDF document. Upload JPG, PNG, GIF, WebP and other formats, reorder them, and create a custom PDF.",
    href: "/tools/image-to-pdf",
    icon: FileText,
    status: "Available",
    gradient: "from-purple-500 to-pink-500",
    category: "Documents",
    features: [
      "Multiple image formats",
      "Drag & drop reordering",
      "Custom page sizes",
      "Quality control",
    ],
    keywords: [
      "image",
      "pdf",
      "convert",
      "jpg",
      "png",
      "gif",
      "webp",
      "merge",
      "combine",
      "create",
    ],
  },
  {
    name: "Base64 Encoder/Decoder",
    description:
      "Encode and decode Base64 strings with real-time conversion and URL sharing support.",
    href: "/tools/base64",
    icon: Hash,
    status: "Available",
    gradient: "from-blue-500 to-cyan-500",
    category: "Encoding",
    features: [
      "Real-time conversion",
      "File upload/download",
      "Shareable URLs",
      "Copy to clipboard",
    ],
    keywords: [
      "base64",
      "encode",
      "decode",
      "encoding",
      "conversion",
      "binary",
      "text",
    ],
  },
  {
    name: "Text Diff Checker",
    description:
      "Compare two text inputs and visualize differences with multiple viewing modes.",
    href: "/tools/text-diff",
    icon: GitCompare,
    status: "Available",
    gradient: "from-teal-500 to-cyan-500",
    category: "Text",
    features: [
      "Multiple view modes",
      "Syntax highlighting",
      "Statistics",
      "File comparison",
    ],
    keywords: [
      "diff",
      "compare",
      "text",
      "changes",
      "version",
      "git",
      "merge",
      "review",
    ],
  },
  {
    name: "Timezone Converter",
    description:
      "Convert time between different timezones and view current time across multiple zones.",
    href: "/tools/timezone",
    icon: MapPin,
    status: "Available",
    gradient: "from-amber-500 to-orange-500",
    category: "Time",
    features: [
      "Live world clock",
      "Timezone conversion",
      "DST detection",
      "Meeting scheduler",
    ],
    keywords: [
      "timezone",
      "time",
      "convert",
      "world",
      "clock",
      "utc",
      "dst",
      "meeting",
      "schedule",
    ],
  },
  {
    name: "JWT Decoder",
    description:
      "Decode and verify JSON Web Tokens, inspect headers, payloads, and signatures.",
    href: "/tools/jwt",
    icon: Key,
    status: "Available",
    gradient: "from-purple-500 to-pink-500",
    category: "Security",
    features: [
      "Token validation",
      "Expiration checking",
      "Example generator",
      "Claims inspection",
    ],
    keywords: [
      "jwt",
      "json",
      "web",
      "token",
      "decode",
      "security",
      "authentication",
      "auth",
    ],
  },
  {
    name: "JSON Tools",
    description:
      "Format, validate, and minify JSON data with syntax highlighting.",
    href: "/tools/json",
    icon: Braces,
    status: "Available",
    gradient: "from-orange-500 to-red-500",
    category: "Data",
    features: [
      "Syntax highlighting",
      "Validation",
      "Minification",
      "Pretty printing",
    ],
    keywords: [
      "json",
      "format",
      "validate",
      "minify",
      "pretty",
      "syntax",
      "data",
      "api",
    ],
  },
  {
    name: "Regex Tester",
    description:
      "Test and debug regular expressions with real-time matching and highlighting.",
    href: "/tools/regex",
    icon: Search,
    status: "Available",
    gradient: "from-green-500 to-emerald-500",
    category: "Testing",
    features: [
      "Real-time matching",
      "Match highlighting",
      "Group analysis",
      "Flag support",
    ],
    keywords: [
      "regex",
      "regular",
      "expression",
      "pattern",
      "match",
      "test",
      "search",
      "replace",
    ],
  },
  {
    name: "Unix Timestamp",
    description:
      "Convert between Unix timestamps and human-readable dates with live current time.",
    href: "/tools/unix",
    icon: Clock,
    status: "Available",
    gradient: "from-indigo-500 to-purple-500",
    category: "Time",
    features: [
      "Live timestamp",
      "Bidirectional conversion",
      "Multiple formats",
      "Relative time",
    ],
    keywords: [
      "unix",
      "timestamp",
      "epoch",
      "time",
      "date",
      "convert",
      "seconds",
      "milliseconds",
    ],
  },
  {
    name: "Word Counter",
    description:
      "Analyze text with word count, character count, frequency analysis, and readability metrics.",
    href: "/tools/word-counter",
    icon: FileText,
    status: "Available",
    gradient: "from-pink-500 to-rose-500",
    category: "Text",
    features: [
      "Word frequency",
      "Character analysis",
      "Readability score",
      "Statistics",
    ],
    keywords: [
      "word",
      "count",
      "character",
      "text",
      "frequency",
      "readability",
      "analysis",
      "writing",
    ],
  },
  {
    name: "URL Encoder/Decoder",
    description:
      "Encode and decode URLs for safe transmission and proper formatting.",
    href: "/tools/url",
    icon: Link2,
    status: "Available",
    gradient: "from-teal-500 to-cyan-500",
    category: "Encoding",
    features: [
      "URL encoding",
      "Query parameter parsing",
      "Component breakdown",
      "Validation",
    ],
    keywords: [
      "url",
      "encode",
      "decode",
      "uri",
      "percent",
      "encoding",
      "query",
      "parameters",
    ],
  },
  {
    name: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and other hash values for text and files.",
    href: "/tools/hash",
    icon: Shield,
    status: "Available",
    gradient: "from-red-500 to-pink-500",
    category: "Security",
    features: [
      "Multiple algorithms",
      "File hashing",
      "Comparison tools",
      "Verification",
    ],
    keywords: [
      "hash",
      "md5",
      "sha1",
      "sha256",
      "checksum",
      "digest",
      "security",
      "verify",
    ],
  },
  {
    name: "Markdown Preview",
    description:
      "Write Markdown and see a live preview with syntax highlighting, table of contents, and export options.",
    href: "/tools/markdown",
    icon: FileCode,
    status: "Available",
    gradient: "from-violet-500 to-purple-500",
    category: "Text",
    features: [
      "Live preview",
      "Syntax highlighting",
      "Table of contents",
      "Export HTML/MD",
    ],
    keywords: [
      "markdown",
      "preview",
      "md",
      "documentation",
      "readme",
      "syntax",
      "html",
      "export",
    ],
  },
  {
    name: "Cron Parser",
    description:
      "Parse and analyze cron expressions with next execution times and human-readable descriptions.",
    href: "/tools/cron",
    icon: Timer,
    status: "Available",
    gradient: "from-emerald-500 to-teal-500",
    category: "Time",
    features: [
      "Expression parsing",
      "Next executions",
      "Human descriptions",
      "Timezone support",
    ],
    keywords: [
      "cron",
      "schedule",
      "parser",
      "expression",
      "time",
      "job",
      "task",
      "automation",
    ],
  },
];

export const categories = [
  "All",
  "Images",
  "Documents",
  "Encoding",
  "Security",
  "Data",
  "Testing",
  "Time",
  "Text",
];

export const quickActions = [
  {
    name: "Home",
    description: "Go to homepage",
    href: "/",
    icon: Globe,
    category: "Navigation",
    keywords: ["home", "main", "start", "index"],
  },
  {
    name: "All Tools",
    description: "Browse all available tools",
    href: "/tools",
    icon: FileText,
    category: "Navigation",
    keywords: ["tools", "all", "browse", "list", "overview"],
  },
  {
    name: "Articles",
    description: "Read our articles and guides",
    href: "/articles",
    icon: BookOpen,
    category: "Navigation",
    keywords: ["articles", "blog", "guides", "tutorials", "learn"],
  },
  {
    name: "Privacy Article",
    description: "Learn about our privacy-first approach",
    href: "/articles/privacy-concerns",
    icon: Shield,
    category: "Navigation",
    keywords: ["privacy", "security", "data", "protection", "client-side"],
  },
];

// Helper functions
export const getToolByHref = (href: string): Tool | undefined => {
  return tools.find((tool) => tool.href === href);
};

export const getToolsByCategory = (category: string): Tool[] => {
  if (category === "All") return tools;
  return tools.filter((tool) => tool.category === category);
};

export const searchTools = (query: string): Tool[] => {
  if (!query.trim()) return tools;

  const searchTerm = query.toLowerCase();
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.description.toLowerCase().includes(searchTerm) ||
      tool.category.toLowerCase().includes(searchTerm) ||
      tool.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm)
      ) ||
      tool.features.some((feature) =>
        feature.toLowerCase().includes(searchTerm)
      )
  );
};
