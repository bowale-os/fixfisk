import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (post: {
    title: string;
    description: string;
    tags: string[];
    isAnonymous: boolean;
    image?: File;
  }) => void;
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

export function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (title.trim() && description.trim() && selectedTags.length > 0) {
      console.log("Submitting post:", {
        title,
        description,
        tags: selectedTags,
        isAnonymous,
        image: imageFile,
      });
      onSubmit?.({
        title,
        description,
        tags: selectedTags,
        isAnonymous,
        image: imageFile || undefined,
      });
      
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      setIsAnonymous(false);
      setImagePreview(null);
      setImageFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-2xl bg-white/95 dark:bg-background/95 border-white/20" data-testid="dialog-create-post">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold tracking-tight">Submit a Suggestion</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of the issue..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-14 text-lg rounded-xl"
              data-testid="input-title"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="text-lg leading-relaxed rounded-xl resize-none"
              data-testid="input-description"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Tags * (select all that apply)</Label>
            <div className="flex flex-wrap gap-3">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover-elevate active-elevate-2 transition-all"
                  onClick={() => toggleTag(tag)}
                  data-testid={`badge-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Image (optional)</Label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                  data-testid="img-preview"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-3 right-3 rounded-full shadow-lg"
                  onClick={removeImage}
                  data-testid="button-remove-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover-elevate active-elevate-2 transition-all backdrop-blur-sm bg-accent/50"
                data-testid="label-image-upload"
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  data-testid="input-image"
                />
                <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-base font-medium text-muted-foreground">
                  Click to upload an image
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </label>
            )}
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-xl bg-accent/30">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              data-testid="checkbox-anonymous"
              className="h-5 w-5"
            />
            <Label
              htmlFor="anonymous"
              className="text-base font-medium cursor-pointer"
            >
              Post anonymously
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={
                !title.trim() ||
                !description.trim() ||
                selectedTags.length === 0
              }
              className="flex-1 h-14 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              data-testid="button-submit-post"
            >
              Submit Suggestion
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-14 px-8 rounded-full"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
