export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'expert' | 'admin';
  reputation: number;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  tags: string[];
  type: 'discussion' | 'question' | 'experience';
  likes: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  isAnswer?: boolean;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Rating {
  userId: string;
  targetId: string;
  type: 'post' | 'comment' | 'user';
  value: number;
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  type: 'post' | 'comment' | 'user';
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: number;
} 