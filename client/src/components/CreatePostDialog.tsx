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
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass border-2 animate-slide-up" data-testid="dialog-create-post">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight gradient-text">Submit a Suggestion</DialogTitle>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Help improve campus life by sharing your ideas</p>
        </DialogHeader>

        <div className="space-y-4 md:space-y-5 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your suggestion..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 md:h-11 text-sm md:text-base rounded-xl border-2 focus:border-primary transition-all"
              data-testid="input-title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your suggestion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="text-sm md:text-base leading-relaxed rounded-xl resize-none border-2 focus:border-primary transition-all"
              data-testid="input-description"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tags * <span className="text-xs font-normal text-muted-foreground">(select all that apply)</span></Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  className={`cursor-pointer rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-semibold uppercase tracking-wide transition-all hover:scale-105 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg border-0'
                      : 'bg-muted/50 text-foreground border-2 border-border hover:border-primary'
                  }`}
                  onClick={() => toggleTag(tag)}
                  data-testid={`badge-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Image Upload */}
<div className="space-y-2">
  <Label className="text-sm font-semibold">Image <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
  {imagePreview ? (
    <div className="relative rounded-xl border-2 border-border bg-muted/30 p-4 min-h-[200px]">
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 h-9 w-9 rounded-full shadow-2xl z-10 hover:scale-110 transition-transform"
        style={{ right: '0.5rem', left: 'auto' }}
        onClick={removeImage}
        data-testid="button-remove-image"
      >
        <X className="h-5 w-5" />
      </Button>
      <div className="flex items-center justify-center min-h-[184px]">
        <img
          src={imagePreview}
          alt="Preview"
          className="max-w-full h-auto max-h-64 object-contain rounded-lg"
          data-testid="img-preview"
        />
      </div>
    </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center h-56 md:h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover-lift transition-all bg-accent/30 hover:bg-accent/50 hover:border-primary"
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
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-base font-bold text-foreground">
                  Click to upload an image
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG, JPG up to 10MB
                </p>
              </label>
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-accent/50 to-accent/30 border border-border/50">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              data-testid="checkbox-anonymous"
              className="h-5 w-5 md:h-6 md:w-6"
            />
            <div>
              <Label
                htmlFor="anonymous"
                className="text-base font-bold cursor-pointer"
              >
                Post anonymously
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Your identity will be hidden from other students</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={
                !title.trim() ||
                !description.trim() ||
                selectedTags.length === 0
              }
              className="flex-1 h-12 md:h-14 text-base md:text-lg rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-submit-post"
            >
              Submit Suggestion
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 md:h-14 px-6 md:px-8 rounded-2xl border-2 hover:bg-accent"
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
