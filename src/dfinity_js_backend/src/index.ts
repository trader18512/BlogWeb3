import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic, Principal, serialize, Result } from 'azle';
import express from 'express';
import cors from 'cors';

/**
 * This type represents a blogger who can publish blog posts.
 */
class Blogger {
    id: string;
    username: string;
    password: string;
    balance: number;
}

/**
 * This type represents a blog post published by a blogger.
 */
class BlogPost {
    id: string;
    authorId: string;
    title: string;
    content: string;
    rewards: number;
}

const bloggersStorage = StableBTreeMap<string, Blogger>(0);
const blogPostsStorage = StableBTreeMap<string, BlogPost>(1);

export default Server(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Register a new blogger
    app.post("/register", (req, res) => {
        const { username, password } = req.body;
        if (username && password) {
            const id = uuidv4();
            const blogger: Blogger = { id, username, password, balance: 0 };
            bloggersStorage.insert(id, blogger);
            res.json({ id });
        } else {
            res.status(400).json({ message: "Username and password are required." });
        }
    });

    // Login
    app.post("/login", (req, res) => {
        const { username, password } = req.body;
        const blogger = findBloggerByUsernameAndPassword(username, password);
        if (blogger) {
            res.json({ id: blogger.id });
        } else {
            res.status(401).json({ message: "Invalid username or password." });
        }
    });

    // Create a new blog post
    app.post("/blog-posts", (req, res) => {
        const { title, content } = req.body;
        const authorId = req.headers.authorization as string;
        if (authorId && title && content) {
            const id = uuidv4();
            const blogPost: BlogPost = { id, authorId, title, content, rewards: 0 };
            blogPostsStorage.insert(id, blogPost);
            res.json({ id });
        } else {
            res.status(400).json({ message: "Title and content are required." });
        }
    });

    // Update a blog post
    app.put("/blog-posts/:id", (req, res) => {
        const { title, content } = req.body;
        const blogPostId = req.params.id;
        const authorId = req.headers.authorization as string;
        const blogPost = blogPostsStorage.get(blogPostId).Some;
        if (blogPost.authorId === authorId) {
            const updatedBlogPost = { ...blogPost, title, content };
            blogPostsStorage.insert(blogPostId, updatedBlogPost);
            res.json(updatedBlogPost);
        } else {
            res.status(401).json({ message: "Unauthorized to update this blog post." });
        }
    });

    // Delete a blog post
    app.delete("/blog-posts/:id", (req, res) => {
        const blogPostId = req.params.id;
        const authorId = req.headers.authorization as string;
        const blogPost = blogPostsStorage.get(blogPostId).Some;
        if (blogPost.authorId === authorId) {
            blogPostsStorage.remove(blogPostId);
            res.json({ message: "Blog post deleted successfully." });
        } else {
            res.status(401).json({ message: "Unauthorized to delete this blog post." });
        }
    });

    // Get all blog posts
    app.get("/blog-posts", (req, res) => {
        res.json(blogPostsStorage.values());
    });

    // Read a blog post
    app.get("/blog-posts/:id", (req, res) => {
        const blogPostId = req.params.id;
        const blogPost = blogPostsStorage.get(blogPostId).Some;
        blogPost.rewards += 1; // Reward the blogger for each read
        const author = bloggersStorage.get(blogPost.authorId).Some;
        author.balance += 1; // Increment balance of the author
        bloggersStorage.insert(author.id, author); // Update author's balance
        res.json(blogPost);
    });

    return app.listen();
});

function findBloggerByUsernameAndPassword(username: string, password: string): Blogger | undefined {
    for (const blogger of bloggersStorage.values()) {
        if (blogger.username === username && blogger.password === password) {
            return blogger;
        }
    }
    return undefined;
}
