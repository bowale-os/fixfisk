import { useState } from 'react';
import { CreatePostDialog } from '../CreatePostDialog';
import { Button } from '@/components/ui/button';

export default function CreatePostDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>
        Open Create Post Dialog
      </Button>
      <CreatePostDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(post) => console.log('Post submitted:', post)}
      />
    </div>
  );
}
