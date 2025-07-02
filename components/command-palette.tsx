'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Command, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tools, quickActions, searchTools } from '@/lib/tools-data';

const allItems = [...quickActions, ...tools];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search query
  const filteredItems = query === '' 
    ? allItems 
    : [...quickActions.filter(item => {
        const searchText = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchText) ||
          item.description.toLowerCase().includes(searchText) ||
          item.category.toLowerCase().includes(searchText) ||
          item.keywords.some(keyword => keyword.toLowerCase().includes(searchText))
        );
      }), ...searchTools(query)];

  // Reset selection when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Only handle these keys when palette is open
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setQuery('');
          setSelectedIndex(0);
          break;
        
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleSelect(filteredItems[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback((item: any) => {
    router.push(item.href);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, [router]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Navigation': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'Encoding': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'Security': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      'Data': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      'Testing': 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
      'Time': 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
      'Text': 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300',
      'Documents': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      'Images': 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <Search className="h-4 w-4 text-gray-400 mr-3" />
          <Input
            ref={inputRef}
            placeholder="Search tools and actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
          />
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 ml-3">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <Command className="h-3 w-3 inline mr-1" />
              K
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tools found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for a different term</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Group by category */}
              {['Navigation', 'Encoding', 'Security', 'Data', 'Testing', 'Time', 'Text', 'Documents', 'Images'].map(category => {
                const categoryItems = filteredItems.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="mb-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                    {categoryItems.map((item, index) => {
                      const globalIndex = filteredItems.indexOf(item);
                      const Icon = item.icon;
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <div
                          key={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500" 
                              : "hover:bg-gray-50 dark:hover:bg-slate-800"
                          )}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-lg mr-3",
                            isSelected 
                              ? "bg-blue-100 dark:bg-blue-900/50" 
                              : "bg-gray-100 dark:bg-slate-800"
                          )}>
                            <Icon className={cn(
                              "h-5 w-5",
                              isSelected 
                                ? "text-blue-600 dark:text-blue-400" 
                                : "text-gray-600 dark:text-gray-400"
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={cn(
                                "font-medium truncate",
                                isSelected 
                                  ? "text-blue-900 dark:text-blue-100" 
                                  : "text-gray-900 dark:text-white"
                              )}>
                                {item.name}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getCategoryColor(item.category))}
                              >
                                {item.category}
                              </Badge>
                            </div>
                            <p className={cn(
                              "text-sm truncate",
                              isSelected 
                                ? "text-blue-700 dark:text-blue-300" 
                                : "text-gray-500 dark:text-gray-400"
                            )}>
                              {item.description}
                            </p>
                          </div>
                          
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-blue-500 ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs">esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="text-xs">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}