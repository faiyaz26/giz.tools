'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ArrowRight, Zap, Shield, Globe, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { tools, categories, searchTools, getToolsByCategory } from '@/lib/tools-data';

const features = [
  {
    name: 'Lightning Fast',
    description: 'All processing happens client-side for instant results and maximum privacy.',
    icon: Zap,
  },
  {
    name: 'Secure & Private',
    description: 'Your data never leaves your browser. No servers, no logging, no tracking.',
    icon: Shield,
  },
  {
    name: 'Share Results',
    description: 'Generate shareable URLs with encoded results for easy collaboration.',
    icon: Globe,
  },
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter tools based on search query and selected category
  const filteredTools = useMemo(() => {
    let result = tools;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = getToolsByCategory(selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      result = searchTools(searchQuery).filter(tool => 
        selectedCategory === 'All' || tool.category === selectedCategory
      );
    }
    
    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Online
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Tools{' '}
            </span>
            Collection
          </h1>
          <div className="absolute -top-2 -left-2 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-2 -right-2 w-32 h-32 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          A comprehensive collection of free online tools for everyone. Convert images, manage PDFs, encode data, and more. 
          All processing happens in your browser for maximum privacy and speed.
        </p>
        
        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                ×
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? 'default' : 'outline'}
                className={cn(
                  "px-4 py-2 cursor-pointer transition-all duration-200",
                  category === selectedCategory
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-blue-100 dark:hover:bg-blue-900/50"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          {/* Search Results Info */}
          {(searchQuery || selectedCategory !== 'All') && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {filteredTools.length === 0 ? (
                <span>No tools found matching your criteria</span>
              ) : (
                <span>
                  Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.name} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            {selectedCategory === 'All' ? 'All Tools' : `${selectedCategory} Tools`}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isAvailable = tool.status === 'Available';
              
              return (
                <Card 
                  key={tool.name} 
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-xl group border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800",
                    isAvailable ? "hover:scale-[1.02] cursor-pointer" : "opacity-75"
                  )}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", tool.gradient)}></div>
                  
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-xl bg-gradient-to-br", tool.gradient)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          isAvailable 
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" 
                            : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                        )}>
                          {tool.status}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl dark:text-white mb-2">{tool.name}</CardTitle>
                    <CardDescription className="text-base dark:text-gray-300 mb-4">{tool.description}</CardDescription>
                    
                    {/* Features List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {isAvailable ? 'Features:' : 'Planned Features:'}
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {tool.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    {isAvailable ? (
                      <Button asChild className="w-full">
                        <Link href={tool.href}>
                          Use Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* No Results */
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No tools found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We couldn't find any tools matching your search criteria. Try adjusting your search or selecting a different category.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
            <Button variant="outline" onClick={() => setSelectedCategory('All')}>
              Show All Categories
            </Button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
        <p className="text-xl mb-8 text-blue-100">
          Start using our free online tools now. No sign-up required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/tools/image-converter">
              Try Image Converter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/tools/pdf-merger">
              Try PDF Merger
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}