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
    console.log("Sort changed to:", value);
    onSortChange?.(value);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    console.log("Tags changed to:", newTags);
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
    console.log("SGA filter:", newValue);
    onStatusFilterChange?.(newValue);
  };

  return (
    <div className="sticky top-24 md:top-28 z-40 backdrop-blur-2xl bg-white/85 dark:bg-background/85 border-b border-white/30 dark:border-white/20 shadow-md">
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-5 md:py-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={selectedSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px] rounded-full h-12 font-semibold text-base border-2 shadow-sm hover:shadow-md transition-all" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-2xl bg-white/95 dark:bg-background/95 border-2 border-white/30 dark:border-white/20 shadow-2xl rounded-2xl p-2 min-w-[220px]">
              <SelectItem value="trending" className="rounded-xl py-3 px-4 text-base font-medium cursor-pointer">
                🔥 Trending
              </SelectItem>
              <SelectItem value="recent" className="rounded-xl py-3 px-4 text-base font-medium cursor-pointer">
                🕐 Most Recent
              </SelectItem>
              <SelectItem value="upvotes" className="rounded-xl py-3 px-4 text-base font-medium cursor-pointer">
                ⬆️ Most Upvoted
              </SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full h-12 px-6 font-semibold text-base border-2 shadow-sm hover:shadow-md transition-all" data-testid="button-filter-tags">
                <SlidersHorizontal className="h-4 w-4 mr-2.5" />
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2.5 rounded-full h-6 min-w-[24px] px-2.5 font-bold">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 backdrop-blur-2xl bg-white/95 dark:bg-background/95 border-2 border-white/30 dark:border-white/20 shadow-2xl rounded-2xl p-2">
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                  className="rounded-xl py-3 px-4 text-base font-medium cursor-pointer"
                  data-testid={`checkbox-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={showSGAWorking ? "default" : "outline"}
            onClick={toggleSGAFilter}
            className="rounded-full h-12 px-6 font-semibold text-base border-2 shadow-sm hover:shadow-md transition-all"
            data-testid="button-filter-sga"
          >
            SGA Working On It
          </Button>

          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap ml-auto">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full pl-5 pr-2.5 py-2 cursor-pointer hover-elevate transition-all text-base font-semibold shadow-md"
                  data-testid={`badge-active-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1.5 p-0 hover:bg-destructive/20"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3.5 w-3.5" />
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
