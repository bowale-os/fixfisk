import { SlidersHorizontal } from "lucide-react";
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
    <div className="sticky top-0 z-10 bg-background border-b py-3 px-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="upvotes">Most Upvoted</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="button-filter-tags">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
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
          data-testid="button-filter-sga"
        >
          SGA Working On It
        </Button>

        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full cursor-pointer"
                onClick={() => removeTag(tag)}
                data-testid={`badge-active-tag-${tag.toLowerCase()}`}
              >
                {tag}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
