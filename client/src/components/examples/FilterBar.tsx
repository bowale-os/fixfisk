import { FilterBar } from '../FilterBar';

export default function FilterBarExample() {
  return (
    <div>
      <FilterBar
        onSortChange={(sort) => console.log('Sort:', sort)}
        onTagsChange={(tags) => console.log('Tags:', tags)}
        onStatusFilterChange={(show) => console.log('SGA filter:', show)}
      />
      <div className="p-4">
        <p className="text-muted-foreground">Content would go here...</p>
      </div>
    </div>
  );
}
