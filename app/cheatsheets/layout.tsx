import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programming Cheatsheets - DevTools Hub",
  description: "Comprehensive programming language cheatsheets for quick reference. Find syntax, examples, and best practices for Python, JavaScript, and more.",
  keywords: [
    "programming cheatsheets",
    "code reference",
    "python cheatsheet",
    "javascript cheatsheet",
    "coding syntax",
    "programming guide",
    "developer reference",
  ],
};

export default function CheatsheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}