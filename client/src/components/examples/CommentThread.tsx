import { CommentThread } from '../CommentThread';

export default function CommentThreadExample() {
  const mockComments = [
    {
      id: "1",
      author: "Emily Carter",
      isAnonymous: false,
      content: "I completely agree! The AC has been unbearable. We've been complaining to the RA for days with no response.",
      timestamp: "1 hour ago",
      upvotes: 23,
      hasUpvoted: true,
      canEdit: true,
      replies: [
        {
          id: "2",
          isAnonymous: true,
          content: "Same here. I can't sleep at night because of the heat.",
          timestamp: "45 minutes ago",
          upvotes: 8,
        },
      ],
    },
    {
      id: "3",
      author: "David Thompson",
      isAnonymous: false,
      content: "Has anyone contacted facilities directly? Maybe we need to escalate this beyond the RA.",
      timestamp: "30 minutes ago",
      upvotes: 15,
      canEdit: false,
    },
  ];

  return (
    <div className="p-4 max-w-4xl">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>
      <CommentThread
        comments={mockComments}
        onReply={(id, content) => console.log(`Reply to ${id}:`, content)}
        onUpvote={(id) => console.log(`Upvoted comment ${id}`)}
        onEdit={(id, content) => console.log(`Edit comment ${id}:`, content)}
        onDelete={(id) => console.log(`Delete comment ${id}`)}
      />
    </div>
  );
}
