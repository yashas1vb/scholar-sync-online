
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
}

interface CourseDiscussionProps {
  courseId: string;
  isEnrolled: boolean;
}

const CourseDiscussion: React.FC<CourseDiscussionProps> = ({ courseId, isEnrolled }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Mock discussion data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      text: 'I found the section on CSS Grid particularly helpful. The examples really clarified how to use it effectively.',
      userId: '1',
      userName: 'John Student',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      timestamp: new Date(2023, 4, 15),
      replies: [
        {
          id: '101',
          text: "I'm glad you found it useful! Don't forget to check out the additional resources I posted in Lecture 2.",
          userId: '2',
          userName: 'Jane Instructor',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          timestamp: new Date(2023, 4, 16),
        }
      ]
    },
    {
      id: '2',
      text: "Could someone explain the difference between flexbox and grid again? I'm still confused about when to use each one.",
      userId: '1',
      userName: 'John Student',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      timestamp: new Date(2023, 4, 10),
      replies: []
    }
  ]);

  const handlePostComment = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post comments",
        variant: "destructive",
      });
      return;
    }

    if (!isEnrolled) {
      toast({
        title: "Enrollment required",
        description: "You need to enroll in this course to participate in discussions",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting",
        variant: "destructive",
      });
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      timestamp: new Date(),
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');

    toast({
      title: "Comment posted",
      description: "Your comment has been added to the discussion",
    });
  };

  const handlePostReply = (commentId: string) => {
    if (!user || !isEnrolled || !replyText.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      text: replyText,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      timestamp: new Date()
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, reply]
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setReplyingTo(null);
    setReplyText('');

    toast({
      title: "Reply posted",
      description: "Your reply has been added to the discussion",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Discussion Forum</h2>
      
      {isEnrolled ? (
        <div className="mb-8 bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">Post a Comment</h3>
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.name.substring(0, 2) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <Textarea
                placeholder="Share your thoughts, questions or insights about this course..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button onClick={handlePostComment}>Post Comment</Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            You need to enroll in this course to participate in discussions.
          </p>
        </div>
      )}
      
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg border p-4">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>{comment.userName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{comment.userName}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{comment.text}</p>
                  
                  {isEnrolled && (
                    <div className="mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        {replyingTo === comment.id ? "Cancel" : "Reply"}
                      </Button>
                    </div>
                  )}
                  
                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-100">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="mb-2 text-sm"
                      />
                      <Button size="sm" onClick={() => handlePostReply(comment.id)}>
                        Post Reply
                      </Button>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.userAvatar} />
                            <AvatarFallback>{reply.userName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-baseline">
                              <h5 className="font-semibold text-sm">{reply.userName}</h5>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
        </div>
      )}
    </div>
  );
};

export default CourseDiscussion;
