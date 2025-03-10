"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X, Plus, Sparkles, Code2, Users, Heart, GraduationCap, Mountain, History, Trash2 } from 'lucide-react';
import { keywordCategories } from '@/data/keywordCategories';
import { cn } from '@/lib/utils';
import { chapterData } from '@/data/chapters';
import { ChapterMetadata } from '@/types/transcript';
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
  frequencies?: Record<string, { total: number; interviews: number }>;
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
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Set active group when component mounts or when keywordGroups change
  useEffect(() => {
    if (keywordGroups.length > 0 && !activeGroupId) {
      setActiveGroupId(keywordGroups[keywordGroups.length - 1].id);
    }
  }, [keywordGroups, activeGroupId]);

  // Listen for setActiveGroup events
  useEffect(() => {
    const handleSetActiveGroup = (event: CustomEvent<{ groupId: string }>) => {
      setActiveGroupId(event.detail.groupId);
    };

    const element = document.querySelector('[data-keyword-filter]');
    if (element) {
      element.addEventListener('setActiveGroup', handleSetActiveGroup as EventListener);
    }

    return () => {
      if (element) {
        element.removeEventListener('setActiveGroup', handleSetActiveGroup as EventListener);
      }
    };
  }, []);

  // Get all unique keywords from chapter data
  const allKeywords = useMemo(() => {
    const keywordSet = new Set<string>();
    Object.values(chapterData).forEach(interview => {
      interview.metadata.forEach(chapter => {
        chapter.tags?.forEach(tag => {
          keywordSet.add(tag);
        });
      });
    });
    return Array.from(keywordSet);
  }, []);

  // Add all keywords to their respective categories or create a new "Other" category
  const enhancedCategories = useMemo(() => {
    const categorizedKeywords = new Set<string>();
    const categories = [...keywordCategories];
    
    // Add keywords to their categories
    categories.forEach(category => {
      category.keywords.forEach(keyword => {
        categorizedKeywords.add(keyword);
      });
    });
    
    // Create "Other" category for uncategorized keywords
    const uncategorizedKeywords = allKeywords.filter(keyword => !categorizedKeywords.has(keyword));
    if (uncategorizedKeywords.length > 0) {
      categories.push({
        id: 'other',
        title: 'Other Keywords',
        description: 'Additional keywords found in chapters',
        iconName: 'sparkles',
        keywords: uncategorizedKeywords,
        color: 'bg-gray-500'
      });
    }
    
    return categories;
  }, [allKeywords]);

  // Filter keywords based on search query and selected categories
  const filteredCategories = enhancedCategories
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
          ? group.keywords.includes(keyword)
            ? group // Skip if keyword already exists in this group
            : { ...group, keywords: [...group.keywords, keyword] }
          : group
      )
    );
    // Only update selectedKeywords if the keyword was actually added
    const targetGroup = keywordGroups.find(g => g.id === groupId);
    if (targetGroup && !targetGroup.keywords.includes(keyword)) {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  // Remove a keyword from a group
  const removeKeywordFromGroup = (groupId: string, keyword: string) => {
    onKeywordGroupsChange(
      keywordGroups.map(group =>
        group.id === groupId
          ? { ...group, keywords: group.keywords.filter(k => k !== keyword) }
          : group
      )
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
    const newGroup: KeywordGroup = { 
      id: Math.random().toString(), 
      keywords: [], 
      operator: 'AND' as Operator,
      groupOperator: keywordGroups.length === 0 ? 'AND' : 'OR' as Operator
    };
    onKeywordGroupsChange([...keywordGroups, newGroup]);
    setActiveGroupId(newGroup.id);
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
    if (activeGroupId) {
      const activeGroup = keywordGroups.find(group => group.id === activeGroupId);
      if (activeGroup) {
        if (activeGroup.keywords.includes(keyword)) {
          // Remove keyword from active group
          removeKeywordFromGroup(activeGroup.id, keyword);
        } else {
          // Add keyword to active group
          addKeywordToGroup(activeGroup.id, keyword);
        }
      }
    } else if (keywordGroups.length > 0) {
      // If no active group but groups exist, add to the last group
      addKeywordToGroup(keywordGroups[keywordGroups.length - 1].id, keyword);
    } else {
      // Create a new group if none exist
      const newGroup: KeywordGroup = { 
        id: Math.random().toString(), 
        keywords: [keyword], 
        operator: 'AND' as Operator,
        groupOperator: 'AND' as Operator
      };
      onKeywordGroupsChange([...keywordGroups, newGroup]);
      onKeywordsChange([...selectedKeywords, keyword]);
      setActiveGroupId(newGroup.id);
    }
  };

  const renderKeywords = (category: KeywordCategory) => {
    // Sort keywords by frequency (highest to lowest)
    const sortedKeywords = [...category.keywords].sort((a, b) => {
      const freqA = frequencies[a] || { total: 0, interviews: 0 };
      const freqB = frequencies[b] || { total: 0, interviews: 0 };
      return freqB.total - freqA.total;
    });

    // Find the active group
    const activeGroup = activeGroupId ? keywordGroups.find(group => group.id === activeGroupId) : null;

    const evaluateChapters = (chapter: ChapterMetadata, groups: KeywordGroup[]) => {
      return groups.reduce((matches, group, index) => {
        const groupMatches = group.operator === 'NOT'
          ? !group.keywords.some(keyword => chapter.tags?.includes(keyword))
          : group.operator === 'AND'
            ? group.keywords.every(keyword => chapter.tags?.includes(keyword))
            : group.keywords.some(keyword => chapter.tags?.includes(keyword));

        if (index === 0) return groupMatches;
        
        switch (group.groupOperator) {
          case 'AND': return matches && groupMatches;
          case 'OR': return matches || groupMatches;
          case 'NOT': return matches && !groupMatches;
          default: return matches;
        }
      }, true);
    };

    const getRelevantGroups = (activeGroupId: string | null): KeywordGroup[] => {
      if (!activeGroupId || keywordGroups.length === 0) return keywordGroups;
      
      const activeGroupIndex = keywordGroups.findIndex(g => g.id === activeGroupId);
      if (activeGroupIndex === -1) return keywordGroups;

      // Find the range of AND-chained groups around the active group
      let startIndex = activeGroupIndex;
      let endIndex = activeGroupIndex;

      // Look backwards for AND-chained groups
      while (startIndex > 0 && keywordGroups[startIndex].groupOperator === 'AND') {
        startIndex--;
      }

      // Look forwards for AND-chained groups
      while (endIndex < keywordGroups.length - 1 && keywordGroups[endIndex + 1].groupOperator === 'AND') {
        endIndex++;
      }

      return keywordGroups.slice(startIndex, endIndex + 1);
    };

    return (
      <div className="flex flex-wrap gap-2">
        {sortedKeywords.map((keyword) => {
          // Check if the keyword is in the active group
          const isSelected = activeGroup ? activeGroup.keywords.includes(keyword) : false;

          // Check if the keyword exists in any group (for visual feedback)
          const isInAnyGroup = keywordGroups.some(group => group.keywords.includes(keyword));

          // Get the relevant groups for evaluation
          const relevantGroups = getRelevantGroups(activeGroupId);

          // Always check if this keyword would return results based on the latest operator
          const wouldReturnResults = keywordGroups.length === 0 || 
            Object.values(chapterData).some(interview =>
              interview.metadata.some(chapter => {
                if (!chapter.tags) return false;
                
                if (!activeGroup) {
                  // If no active group, evaluate against all groups
                  return evaluateChapters(
                    { ...chapter, tags: [...(chapter.tags || []), keyword] },
                    keywordGroups
                  );
                }

                // Create a temporary version of the active group with the new keyword
                const modifiedGroups = relevantGroups.map(group =>
                  group.id === activeGroup.id
                    ? { ...group, keywords: [...group.keywords, keyword] }
                    : group
                );

                return evaluateChapters(chapter, modifiedGroups);
              })
            );

          const showVisualFeedback = keywordGroups.length > 0;

          return (
            <Badge
              key={keyword}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors flex items-center gap-1",
                isSelected
                  ? "bg-blue-600 hover:bg-blue-700"
                  : showVisualFeedback
                    ? wouldReturnResults
                      ? isInAnyGroup
                        ? "hover:bg-gray-100 border-blue-300 bg-blue-50"
                        : "hover:bg-gray-100 border-green-500"
                      : "hover:bg-gray-100 border-red-300 opacity-50"
                    : "hover:bg-gray-100"
              )}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
              <div className="flex gap-1">
                <span className={cn(
                  "text-xs rounded-sm px-1",
                  isSelected
                    ? "bg-blue-700/50"
                    : showVisualFeedback
                      ? wouldReturnResults
                        ? "bg-green-100"
                        : "bg-red-100"
                      : "bg-gray-100"
                )}>
                  {frequencies?.[keyword]?.total || 0}
                </span>
                <span className={cn(
                  "text-xs rounded-sm px-1",
                  isSelected
                    ? "bg-blue-700/50"
                    : showVisualFeedback
                      ? wouldReturnResults
                        ? "bg-green-100/50"
                        : "bg-red-100/50"
                      : "bg-gray-100/50"
                )}>
                  {frequencies?.[keyword]?.interviews || 0}🎙️
                </span>
              </div>
            </Badge>
          );
        })}
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
              <Card 
                className={cn(
                  "p-2 cursor-pointer transition-colors",
                  activeGroupId === group.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                )}
                onClick={() => setActiveGroupId(group.id)}
              >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeGroupId === group.id) {
                        setActiveGroupId(null);
                      }
                      removeGroup(group.id);
                    }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removeKeywordFromGroup(group.id, keyword);
                        }}
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