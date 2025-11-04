import { Post } from '@/app/types/post';

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-semibold text-gray-900">
            @{post.author_username}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            (ID: {post.author_id})
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          {formatDate(post.created_at)}
        </span>
      </div>
      <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
    </div>
  );
}