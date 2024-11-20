import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Post, Comment, Rating, Report } from '../types/community';

class CommunityManager {
  private static instance: CommunityManager;
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private comments: Map<string, Comment> = new Map();
  private ratings: Map<string, Rating[]> = new Map();
  private reports: Map<string, Report> = new Map();

  private constructor() {
    this.loadData();
  }

  static getInstance(): CommunityManager {
    if (!CommunityManager.instance) {
      CommunityManager.instance = new CommunityManager();
    }
    return CommunityManager.instance;
  }

  private async loadData(): Promise<void> {
    try {
      const [users, posts, comments, ratings, reports] = await Promise.all([
        AsyncStorage.getItem('@community_users'),
        AsyncStorage.getItem('@community_posts'),
        AsyncStorage.getItem('@community_comments'),
        AsyncStorage.getItem('@community_ratings'),
        AsyncStorage.getItem('@community_reports'),
      ]);

      if (users) this.users = new Map(JSON.parse(users));
      if (posts) this.posts = new Map(JSON.parse(posts));
      if (comments) this.comments = new Map(JSON.parse(comments));
      if (ratings) this.ratings = new Map(JSON.parse(ratings));
      if (reports) this.reports = new Map(JSON.parse(reports));
    } catch (error) {
      console.error('Failed to load community data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('@community_users', JSON.stringify(Array.from(this.users))),
        AsyncStorage.setItem('@community_posts', JSON.stringify(Array.from(this.posts))),
        AsyncStorage.setItem('@community_comments', JSON.stringify(Array.from(this.comments))),
        AsyncStorage.setItem('@community_ratings', JSON.stringify(Array.from(this.ratings))),
        AsyncStorage.setItem('@community_reports', JSON.stringify(Array.from(this.reports))),
      ]);
    } catch (error) {
      console.error('Failed to save community data:', error);
    }
  }

  // 帖子管理
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Post> {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'pending',
      likes: 0,
      views: 0,
    };

    this.posts.set(newPost.id, newPost);
    await this.saveData();
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const post = this.posts.get(id);
    if (!post) throw new Error('Post not found');

    const updatedPost = {
      ...post,
      ...updates,
      updatedAt: Date.now(),
    };

    this.posts.set(id, updatedPost);
    await this.saveData();
    return updatedPost;
  }

  // 评论管理
  async addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'status'>): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: Date.now(),
      status: 'pending',
      likes: 0,
    };

    this.comments.set(newComment.id, newComment);
    await this.saveData();
    return newComment;
  }

  // 评分系统
  async rateContent(rating: Omit<Rating, 'createdAt'>): Promise<void> {
    const newRating: Rating = {
      ...rating,
      createdAt: Date.now(),
    };

    const existingRatings = this.ratings.get(rating.targetId) || [];
    const updatedRatings = [
      ...existingRatings.filter(r => r.userId !== rating.userId),
      newRating,
    ];

    this.ratings.set(rating.targetId, updatedRatings);
    await this.saveData();

    // 更新用户声望
    if (rating.type === 'user') {
      const user = this.users.get(rating.targetId);
      if (user) {
        user.reputation = this.calculateReputation(rating.targetId);
        await this.saveData();
      }
    }
  }

  // 内容审核
  async reportContent(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: Date.now(),
      status: 'pending',
    };

    this.reports.set(newReport.id, newReport);
    await this.saveData();
    return newReport;
  }

  async moderateContent(reportId: string, action: 'approve' | 'reject'): Promise<void> {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.status = action === 'approve' ? 'resolved' : 'rejected';

    if (action === 'approve') {
      switch (report.type) {
        case 'post':
          const post = this.posts.get(report.targetId);
          if (post) post.status = 'rejected';
          break;
        case 'comment':
          const comment = this.comments.get(report.targetId);
          if (comment) comment.status = 'rejected';
          break;
        case 'user':
          const user = this.users.get(report.targetId);
          if (user) user.reputation = Math.max(0, user.reputation - 50);
          break;
      }
    }

    await this.saveData();
  }

  // 辅助方法
  private calculateReputation(userId: string): number {
    const userRatings = this.ratings.get(userId) || [];
    return userRatings.reduce((sum, rating) => sum + rating.value, 0);
  }

  // 查询方法
  getPosts(type?: Post['type'], status: Post['status'] = 'approved'): Post[] {
    return Array.from(this.posts.values())
      .filter(post => (!type || post.type === type) && post.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getComments(postId: string, status: Comment['status'] = 'approved'): Comment[] {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId && comment.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getContentRating(targetId: string): number {
    const ratings = this.ratings.get(targetId) || [];
    return ratings.reduce((sum, rating) => sum + rating.value, 0) / (ratings.length || 1);
  }

  getPendingReports(): Report[] {
    return Array.from(this.reports.values())
      .filter(report => report.status === 'pending')
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const communityManager = CommunityManager.getInstance(); 