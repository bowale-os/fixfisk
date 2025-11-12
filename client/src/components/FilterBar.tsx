import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface FilterBarProps {
  onSortChange?: (sort: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onStatusFilterChange?: (showSGAWorking: boolean) => void;
}

const availableTags = [
  "Housing",
  "Dining",
  "Academics",
  "Campus Safety",
  "Facilities",
  "Technology",
  "Events",
  "Other",
];

export function FilterBar({
  onSortChange,
  onTagsChange,
  onStatusFilterChange,
}: FilterBarProps) {
  const [selectedSort, setSelectedSort] = useState("trending");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSGAWorking, setShowSGAWorking] = useState(false);

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange?.(value);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onTagsChange?.(newTags);
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    onTagsChange?.(newTags);
  };

  const toggleSGAFilter = () => {
    const newValue = !showSGAWorking;
    setShowSGAWorking(newValue);
    onStatusFilterChange?.(newValue);
  };

  return (
    <div className="sticky top-20 md:top-24 z-40 glass border-b-2 border-border/30 shadow-lg animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          {/* Sort Dropdown */}
          <Select value={selectedSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] md:w-[200px] rounded-full h-10 md:h-11 font-bold text-sm md:text-base border-2 hover:border-primary transition-all" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="glass shadow-2xl rounded-2xl p-2 border-2 min-w-[200px] md:min-w-[220px]">
              <SelectItem value="trending" className="rounded-xl py-3 pr-4 pl-11 text-sm md:text-base font-semibold cursor-pointer hover:bg-accent">
                🔥 Trending
              </SelectItem>
              <SelectItem value="recent" className="rounded-xl py-3 pr-4 pl-11 text-sm md:text-base font-semibold cursor-pointer hover:bg-accent">
                🕐 Most Recent
              </SelectItem>
              <SelectItem value="upvotes" className="rounded-xl py-3 pr-4 pl-11 text-sm md:text-base font-semibold cursor-pointer hover:bg-accent">
                ⬆️ Most Upvoted
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Tags Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="rounded-full h-10 md:h-11 px-4 md:px-6 font-bold text-sm md:text-base border-2 hover:border-primary hover:bg-primary/5 transition-all" 
                data-testid="button-filter-tags"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tags</span>
                {selectedTags.length > 0 && (
                  <Badge className="ml-2 rounded-full h-5 md:h-6 min-w-[20px] md:min-w-[24px] px-1.5 md:px-2 font-bold text-xs bg-secondary text-secondary-foreground border-0">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 md:w-64 glass shadow-2xl rounded-2xl p-2 border-2">
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                  className="rounded-xl py-3 pr-4 pl-11 text-sm md:text-base font-semibold cursor-pointer hover:bg-accent"
                  data-testid={`checkbox-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SGA Filter */}
          <Button
            variant={showSGAWorking ? "default" : "outline"}
            onClick={toggleSGAFilter}
            className={`rounded-full h-10 md:h-11 px-4 md:px-6 font-bold text-sm md:text-base border-2 transition-all ${
              showSGAWorking 
                ? 'bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg' 
                : 'hover:border-primary hover:bg-primary/5'
            }`}
            data-testid="button-filter-sga"
          >
            <span className="hidden sm:inline">SGA Working On It</span>
            <span className="sm:hidden">SGA</span>
          </Button>

          {/* Active Tags */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  className="rounded-full pl-3 md:pl-4 pr-2 py-1.5 md:py-2 cursor-pointer hover-lift text-xs md:text-sm font-bold shadow-md bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/30 hover:from-primary/20 hover:to-primary/10"
                  data-testid={`badge-active-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 md:h-6 md:w-6 ml-1 md:ml-1.5 p-0 hover:bg-destructive/20 rounded-full"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
