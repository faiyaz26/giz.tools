'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function AnimatedToolButton() {
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Select a subset of tools to cycle through, prioritizing image and PDF tools
  const featuredTools = [
    { name: 'Image Converter', href: '/tools/image-converter' },
    { name: 'PDF Merger', href: '/tools/pdf-merger' },
    { name: 'PDF Splitter', href: '/tools/pdf-splitter' },
    { name: 'Base64 Tool', href: '/tools/base64' },
    { name: 'Text Diff', href: '/tools/text-diff' },
    { name: 'Timezone Converter', href: '/tools/timezone' },
  ];

  useEffect(() => {
    // Set up the interval to change the tool name
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // After animation out completes, change the tool
      setTimeout(() => {
        setCurrentToolIndex((prevIndex) => (prevIndex + 1) % featuredTools.length);
        
        // Start animation in
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 200);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTool = featuredTools[currentToolIndex];

  return (
    <Button 
      size="lg" 
      variant="outline" 
      asChild 
      className="text-lg px-8 py-3 min-w-[240px]"
    >
      <Link href={currentTool.href}>
        <span className={`transition-all duration-200 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
          Try {currentTool.name}
        </span>
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  );
}