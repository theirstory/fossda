"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X, Plus, Sparkles, Code2, Users, Heart, GraduationCap, Mountain, History, Trash2 } from 'lucide-react';
import { keywordCategories } from '@/data/keywordCategories';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconName } from "@/types/icons";
import { KeywordCategory } from "@/data/keywordCategories";

const iconMap: Record<IconName, React.FC<{ className?: string }>> = {
  sparkles: Sparkles,
  'code-2': Code2,
  users: Users,
  heart: Heart,
  'graduation-cap': GraduationCap,
  mountain: Mountain,
  history: History,
  code: Code2,
};

type Operator = 'AND' | 'OR' | 'NOT';

export interface KeywordGroup {
  id: string;
  keywords: string[];
  operator: Operator;
  groupOperator: Operator;
}

interface KeywordFilterProps {
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  keywordGroups: KeywordGroup[];
  onKeywordGroupsChange: (groups: KeywordGroup[]) => void;
  frequencies?: Record<string, number>;
}

export default function KeywordFilter({
  selectedKeywords,
  onKeywordsChange,
  keywordGroups,
  onKeywordGroupsChange,
  frequencies = {},
}: KeywordFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter keywords based on search query and selected categories
  const filteredCategories = keywordCategories
    .filter(category => {
      if (selectedCategories.length > 0) {
        return selectedCategories.includes(category.id);
      }
      if (!searchQuery) return true;
      
      const matchesTitle = category.title.toLowerCase().includes(searchQuery.toLowerCase());
      const hasMatchingKeywords = category.keywords.some(keyword =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesTitle || hasMatchingKeywords;
    })
    .map(category => ({
      ...category,
      keywords: searchQuery
        ? category.keywords.filter(keyword =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : category.keywords
    }));

  // Add a keyword to a group
  const addKeywordToGroup = (groupId: string, keyword: string) => {
    onKeywordGroupsChange(
      keywordGroups.map(group =>
        group.id === groupId
          ? { ...group, keywords: [...group.keywords, keyword] }
          : group
      )
    );
    onKeywordsChange([...selectedKeywords, keyword]);
  };

  // Remove a keyword from a group
  const removeKeywordFromGroup = (groupId: string, keyword: string) => {
    onKeywordGroupsChange(
      keywordGroups.map(group =>
        group.id === groupId
          ? { ...group, keywords: group.keywords.filter(k => k !== keyword) }
          : group
      ).filter(group => group.keywords.length > 0)
    );
    onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
  };

  // Remove a group
  const removeGroup = (groupId: string) => {
    const group = keywordGroups.find(g => g.id === groupId);
    if (group) {
      onKeywordsChange(selectedKeywords.filter(k => !group.keywords.includes(k)));
      onKeywordGroupsChange(keywordGroups.filter(g => g.id !== groupId));
    }
  };

  // Add a new group
  const addNewGroup = () => {
    onKeywordGroupsChange([
      ...keywordGroups,
      { 
        id: Math.random().toString(), 
        keywords: [], 
        operator: 'AND',
        groupOperator: keywordGroups.length === 0 ? 'AND' : 'OR'
      }
    ]);
  };

  // Update group operator
  const updateGroupOperator = (groupId: string, operator: Operator) => {
    onKeywordGroupsChange(
      keywordGroups.map(group =>
        group.id === groupId
          ? { ...group, operator }
          : group
      )
    );
  };

  // Update operator between groups
  const updateBetweenGroupOperator = (groupId: string, operator: Operator) => {
    onKeywordGroupsChange(
      keywordGroups.map(group =>
        group.id === groupId
          ? { ...group, groupOperator: operator }
          : group
      )
    );
  };

  const toggleKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword) && keywordGroups.length > 0) {
      addKeywordToGroup(keywordGroups[keywordGroups.length - 1].id, keyword);
    } else if (!selectedKeywords.includes(keyword)) {
      const newGroup: KeywordGroup = { 
        id: Math.random().toString(), 
        keywords: [keyword], 
        operator: 'AND',
        groupOperator: 'AND'
      };
      onKeywordGroupsChange([...keywordGroups, newGroup]);
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  const renderKeywords = (category: KeywordCategory) => {
    // Sort keywords by frequency (highest to lowest)
    const sortedKeywords = [...category.keywords].sort((a, b) => {
      const freqA = frequencies[a] || 0;
      const freqB = frequencies[b] || 0;
      return freqB - freqA;
    });

    return (
      <div className="flex flex-wrap gap-2">
        {sortedKeywords.map((keyword) => (
          <Badge
            key={keyword}
            variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors flex items-center gap-1",
              selectedKeywords.includes(keyword)
                ? "bg-blue-600 hover:bg-blue-700"
                : "hover:bg-gray-100"
            )}
            onClick={() => toggleKeyword(keyword)}
          >
            {keyword}
            <span className={cn(
              "text-xs rounded-sm px-1",
              selectedKeywords.includes(keyword)
                ? "bg-blue-700/50"
                : "bg-gray-100"
            )}>
              {frequencies[keyword] || 0}
            </span>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-[1fr,2fr] gap-4">
      {/* Left side - Groups */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Keyword Groups</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addNewGroup}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {keywordGroups.map((group, groupIndex) => (
            <React.Fragment key={group.id}>
              {groupIndex > 0 && (
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex-1 border-t border-gray-200" />
                  <Select
                    value={group.groupOperator}
                    onValueChange={(value: Operator) => updateBetweenGroupOperator(group.id, value)}
                  >
                    <SelectTrigger className="w-20 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                      <SelectItem value="NOT">NOT</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              )}
              <Card className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Group {groupIndex + 1}</span>
                  <Select
                    value={group.operator}
                    onValueChange={(value: Operator) => updateGroupOperator(group.id, value)}
                  >
                    <SelectTrigger className="w-20 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                      <SelectItem value="NOT">NOT</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove group</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="default"
                      className={cn(
                        "bg-blue-600 hover:bg-blue-700",
                        group.operator === 'NOT' && "bg-red-600 hover:bg-red-700"
                      )}
                    >
                      {keyword}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => removeKeywordFromGroup(group.id, keyword)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              </Card>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right side - Available Keywords */}
      <div className="space-y-4">
        {/* Search and Category Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search keywords..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-gray-100"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <Select
            value={selectedCategories.length > 0 ? selectedCategories[selectedCategories.length - 1] : ""}
            onValueChange={(value) => {
              setSelectedCategories(prev => {
                if (prev.includes(value)) {
                  return prev.filter(id => id !== value);
                }
                return [...prev, value];
              });
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category">
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} selected`
                  : "Filter by category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {keywordCategories.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id}
                  className={cn(
                    "cursor-pointer",
                    selectedCategories.includes(category.id) && "bg-blue-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(iconMap[category.iconName], {
                      className: "h-4 w-4"
                    })}
                    {category.title}
                    {selectedCategories.includes(category.id) && (
                      <Badge variant="secondary" className="ml-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategories([]);
                  }}
                  className="w-full mt-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear selection
                </Button>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Keywords List */}
        <div className="bg-white rounded-lg border max-h-[500px] overflow-y-auto mt-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="p-3 border-b last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                {React.createElement(iconMap[category.iconName], {
                  className: "h-4 w-4"
                })}
                <h3 className="text-sm font-medium">{category.title}</h3>
              </div>
              {renderKeywords(category)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 