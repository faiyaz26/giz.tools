'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Shield, Lock, Eye, Server, Database, Code, Globe, Laptop } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const articles = [
  {
    title: 'Why Online Tools Can Be a Privacy Risk (And How We Solve It)',
    description: 'Learn about the privacy concerns with typical online tools and how DevTools Hub protects your data.',
    href: '/articles/privacy-concerns',
    icon: Shield,
    date: 'May 15, 2025',
    readTime: '5 min read',
    category: 'Privacy',
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    title: 'The Power of Portable Developer Tools: Browser vs Desktop',
    description: 'Discover why browser-based tools like DevTools Hub offer advantages over installed desktop applications.',
    href: '/articles/portable-tools',
    icon: Globe,
    date: 'May 20, 2025',
    readTime: '6 min read',
    category: 'Productivity',
    gradient: 'from-green-500 to-blue-500',
  },
  {
    title: 'Coming Soon: More Articles',
    description: 'We\'re working on more articles to help you understand web development tools and best practices.',
    href: '#',
    icon: BookOpen,
    date: 'Coming Soon',
    readTime: '',
    category: 'Announcement',
    gradient: 'from-gray-500 to-gray-600',
  }
];

export default function ArticlesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            DevTools
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Articles{' '}
            </span>
          </h1>
          <div className="absolute -top-2 -left-2 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-2 -right-2 w-32 h-32 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Insights, tutorials, and best practices for developers. Learn more about our tools and how to use them effectively.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {articles.map((article) => {
          const Icon = article.icon;
          const isAvailable = article.href !== '#';
          
          return (
            <Card 
              key={article.title} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl group border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800",
                isAvailable ? "hover:scale-[1.02] cursor-pointer" : "opacity-75"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", article.gradient)}></div>
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className={cn("p-3 rounded-xl bg-gradient-to-br", article.gradient)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {article.date}
                    </span>
                    {article.readTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2">
                        {article.readTime}
                      </span>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl dark:text-white mt-4">{article.title}</CardTitle>
                <CardDescription className="text-base dark:text-gray-300">{article.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="relative">
                {isAvailable ? (
                  <Button asChild className="w-full">
                    <Link href={article.href}>
                      Read Article
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

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to try our tools?</h2>
        <p className="text-xl mb-8 text-blue-100">
          Check out our collection of developer tools designed with privacy and security in mind.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/tools">
              Explore Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}