import { PostDetail } from '../PostDetail';

export default function PostDetailExample() {
  const mockPost = {
    id: "1",
    title: "Broken AC in Johnson Hall needs immediate attention",
    description: "The air conditioning in Johnson Hall has been broken for over a week now. It's extremely uncomfortable for students living there, especially during these hot days. Multiple residents have complained to the RA, but nothing has been done yet. This is affecting our ability to study and sleep properly. We need this fixed as soon as possible.",
    author: "Sarah Johnson",
    isAnonymous: false,
    timestamp: "2 hours ago",
    tags: ["Housing", "Facilities"],
    upvotes: 47,
    status: "in_progress" as const,
    hasUpvoted: true,
  };

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
    <PostDetail
      post={mockPost}
      comments={mockComments}
      isAdmin={true}
      canEdit={false}
      onBack={() => console.log('Back clicked')}
      onUpvote={() => console.log('Upvoted')}
      onStatusChange={(status) => console.log('Status changed to:', status)}
      onAddComment={(content, isAnon) => console.log('Comment added:', content, isAnon)}
    />
  );
}
