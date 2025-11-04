import { getPosts } from '@/lib/api';
import PostItem from './PostItem';

export default async function PostList() {
  let posts;
  let error = null;

  try {
    posts = await getPosts();
  } catch (err) {
    error = 'Failed to load posts. Please check if the backend is running.';
    console.error(err);
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-gray-500 mt-2">
          Make sure Django is running on http://localhost:8000
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-500">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}