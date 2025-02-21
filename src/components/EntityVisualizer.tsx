import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Search, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface EntityVisualizerProps {
  entities: {
    PERSON: string[];
    ORG: string[];
    GPE: string[];
    DATE: string[];
    PRODUCT: string[];
    EVENT: string[];
  };
  frequencies: {
    [key: string]: number;
  };
}

const COLORS = {
  PERSON: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:border-blue-300',
  ORG: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:border-green-300',
  GPE: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 hover:border-purple-300',
  DATE: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-300',
  PRODUCT: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300',
  EVENT: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 hover:border-indigo-300',
};

const ENTITY_LABELS = {
  PERSON: 'People',
  ORG: 'Organizations',
  GPE: 'Locations',
  DATE: 'Dates',
  PRODUCT: 'Products',
  EVENT: 'Events',
};

function EntityBadge({ 
  item, 
  type, 
  frequency,
  className 
}: { 
  item: string; 
  type: keyof typeof COLORS; 
  frequency: number;
  className?: string;
}) {
  const handlePerplexitySearch = () => {
    const query = encodeURIComponent(item);
    window.open(`https://www.perplexity.ai/search?q=${query}`, '_blank');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handlePerplexitySearch}
            className="group w-full text-left"
          >
            <Badge 
              className={`
                ${COLORS[type]} text-sm whitespace-nowrap pr-8 
                cursor-pointer transition-all duration-200
                hover:shadow-md relative
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                flex items-center gap-2
                ${className}
              `}
            >
              <span className="truncate font-medium">{item}</span>
              <span className="text-xs opacity-75 font-normal">({frequency})</span>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-75 group-hover:opacity-100">
                <Search className="h-3 w-3" />
                <ExternalLink className="h-3 w-3" />
              </div>
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to search &ldquo;{item}&rdquo; on Perplexity AI</p>
          <p className="text-xs text-gray-500">Mentioned {frequency} times</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function EntityVisualizer({ entities, frequencies }: EntityVisualizerProps) {
  const [layout, setLayout] = useState<'grid' | 'force'>('grid');

  // Calculate total entities and mentions
  const totalEntities = Object.values(entities).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const totalMentions = Object.values(frequencies).reduce(
    (sum, count) => sum + count,
    0
  );

  // Sort items by frequency
  const getSortedItems = (items: string[]) => {
    return [...items].sort((a, b) => (frequencies[b] || 0) - (frequencies[a] || 0));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Entity Analysis</h2>
          <p className="text-gray-500">
            {totalEntities} unique entities with {totalMentions} total mentions across {Object.keys(entities).length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={layout === 'grid' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setLayout('grid')}
          >
            Grid
          </Badge>
          <Badge
            variant={layout === 'force' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setLayout('force')}
          >
            Force
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="PERSON">
        <TabsList className="mb-4">
          {Object.entries(ENTITY_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="relative">
              {label}
              <Badge variant="secondary" className="ml-2">
                {entities[key as keyof typeof entities].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(entities).map(([type, items]) => (
          <TabsContent key={type} value={type} className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${type}-${layout}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2' : 'flex flex-wrap gap-2'}
              >
                {getSortedItems(items).map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      x: layout === 'force' ? Math.random() * 100 - 50 : 0,
                      y: layout === 'force' ? Math.random() * 100 - 50 : 0,
                    }}
                    transition={{ 
                      delay: index * 0.05,
                      type: layout === 'force' ? 'spring' : 'tween',
                      stiffness: 100
                    }}
                  >
                    <EntityBadge 
                      item={item} 
                      type={type as keyof typeof COLORS}
                      frequency={frequencies[item] || 0}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
} 