"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class CommunityManager {
    constructor() {
        this.users = new Map();
        this.posts = new Map();
        this.comments = new Map();
        this.ratings = new Map();
        this.reports = new Map();
        this.loadData();
    }
    static getInstance() {
        if (!CommunityManager.instance) {
            CommunityManager.instance = new CommunityManager();
        }
        return CommunityManager.instance;
    }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [users, posts, comments, ratings, reports] = yield Promise.all([
                    async_storage_1.default.getItem('@community_users'),
                    async_storage_1.default.getItem('@community_posts'),
                    async_storage_1.default.getItem('@community_comments'),
                    async_storage_1.default.getItem('@community_ratings'),
                    async_storage_1.default.getItem('@community_reports'),
                ]);
                if (users)
                    this.users = new Map(JSON.parse(users));
                if (posts)
                    this.posts = new Map(JSON.parse(posts));
                if (comments)
                    this.comments = new Map(JSON.parse(comments));
                if (ratings)
                    this.ratings = new Map(JSON.parse(ratings));
                if (reports)
                    this.reports = new Map(JSON.parse(reports));
            }
            catch (error) {
                console.error('Failed to load community data:', error);
            }
        });
    }
    saveData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all([
                    async_storage_1.default.setItem('@community_users', JSON.stringify(Array.from(this.users))),
                    async_storage_1.default.setItem('@community_posts', JSON.stringify(Array.from(this.posts))),
                    async_storage_1.default.setItem('@community_comments', JSON.stringify(Array.from(this.comments))),
                    async_storage_1.default.setItem('@community_ratings', JSON.stringify(Array.from(this.ratings))),
                    async_storage_1.default.setItem('@community_reports', JSON.stringify(Array.from(this.reports))),
                ]);
            }
            catch (error) {
                console.error('Failed to save community data:', error);
            }
        });
    }
    // 帖子管理
    createPost(post) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPost = Object.assign(Object.assign({}, post), { id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now(), status: 'pending', likes: 0, views: 0 });
            this.posts.set(newPost.id, newPost);
            yield this.saveData();
            return newPost;
        });
    }
    updatePost(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = this.posts.get(id);
            if (!post)
                throw new Error('Post not found');
            const updatedPost = Object.assign(Object.assign(Object.assign({}, post), updates), { updatedAt: Date.now() });
            this.posts.set(id, updatedPost);
            yield this.saveData();
            return updatedPost;
        });
    }
    // 评论管理
    addComment(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const newComment = Object.assign(Object.assign({}, comment), { id: Date.now().toString(), createdAt: Date.now(), status: 'pending', likes: 0 });
            this.comments.set(newComment.id, newComment);
            yield this.saveData();
            return newComment;
        });
    }
    // 评分系统
    rateContent(rating) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRating = Object.assign(Object.assign({}, rating), { createdAt: Date.now() });
            const existingRatings = this.ratings.get(rating.targetId) || [];
            const updatedRatings = [
                ...existingRatings.filter(r => r.userId !== rating.userId),
                newRating,
            ];
            this.ratings.set(rating.targetId, updatedRatings);
            yield this.saveData();
            // 更新用户声望
            if (rating.type === 'user') {
                const user = this.users.get(rating.targetId);
                if (user) {
                    user.reputation = this.calculateReputation(rating.targetId);
                    yield this.saveData();
                }
            }
        });
    }
    // 内容审核
    reportContent(report) {
        return __awaiter(this, void 0, void 0, function* () {
            const newReport = Object.assign(Object.assign({}, report), { id: Date.now().toString(), createdAt: Date.now(), status: 'pending' });
            this.reports.set(newReport.id, newReport);
            yield this.saveData();
            return newReport;
        });
    }
    moderateContent(reportId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const report = this.reports.get(reportId);
            if (!report)
                throw new Error('Report not found');
            report.status = action === 'approve' ? 'resolved' : 'rejected';
            if (action === 'approve') {
                switch (report.type) {
                    case 'post':
                        const post = this.posts.get(report.targetId);
                        if (post)
                            post.status = 'rejected';
                        break;
                    case 'comment':
                        const comment = this.comments.get(report.targetId);
                        if (comment)
                            comment.status = 'rejected';
                        break;
                    case 'user':
                        const user = this.users.get(report.targetId);
                        if (user)
                            user.reputation = Math.max(0, user.reputation - 50);
                        break;
                }
            }
            yield this.saveData();
        });
    }
    // 辅助方法
    calculateReputation(userId) {
        const userRatings = this.ratings.get(userId) || [];
        return userRatings.reduce((sum, rating) => sum + rating.value, 0);
    }
    // 查询方法
    getPosts(type, status = 'approved') {
        return Array.from(this.posts.values())
            .filter(post => (!type || post.type === type) && post.status === status)
            .sort((a, b) => b.createdAt - a.createdAt);
    }
    getComments(postId, status = 'approved') {
        return Array.from(this.comments.values())
            .filter(comment => comment.postId === postId && comment.status === status)
            .sort((a, b) => b.createdAt - a.createdAt);
    }
    getUser(id) {
        return this.users.get(id);
    }
    getContentRating(targetId) {
        const ratings = this.ratings.get(targetId) || [];
        return ratings.reduce((sum, rating) => sum + rating.value, 0) / (ratings.length || 1);
    }
    getPendingReports() {
        return Array.from(this.reports.values())
            .filter(report => report.status === 'pending')
            .sort((a, b) => b.createdAt - a.createdAt);
    }
}
exports.communityManager = CommunityManager.getInstance();
