import { PostCard } from '../PostCard';

export default function PostCardExample() {
  return (
    <div className="space-y-4 p-4">
      <PostCard
        id="1"
        title="Broken AC in Johnson Hall needs immediate attention"
        description="The air conditioning in Johnson Hall has been broken for over a week. It's extremely uncomfortable for students living there, especially during these hot days."
        author="Sarah Johnson"
        isAnonymous={false}
        timestamp="2 hours ago"
        tags={["Housing", "Facilities"]}
        upvotes={47}
        commentCount={12}
        hasUpvoted={false}
      />
      
      <PostCard
        id="2"
        title="Campus WiFi constantly disconnects in library"
        description="The WiFi in the library keeps disconnecting every 10-15 minutes. This makes it impossible to complete online assignments or attend virtual meetings."
        isAnonymous={true}
        timestamp="5 hours ago"
        tags={["Technology", "Academics"]}
        upvotes={89}
        commentCount={34}
        status="in_progress"
        hasUpvoted={true}
      />

      <PostCard
        id="3"
        title="Need more vegetarian options in dining hall"
        description="There are very few vegetarian options available in the main dining hall. Many students have dietary restrictions that aren't being accommodated."
        author="Michael Davis"
        isAnonymous={false}
        timestamp="1 day ago"
        tags={["Dining"]}
        upvotes={156}
        commentCount={45}
        status="reviewing"
        isAdmin={true}
      />
    </div>
  );
}
