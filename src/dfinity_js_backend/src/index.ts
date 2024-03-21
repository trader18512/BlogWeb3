
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { hexAddressFromPrincipal } from "azle/canisters/ledger";
import { fetch } from 'node-fetch';

const ICRC_CANISTER_PRINCIPAL = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const JWT_SECRET = "your_jwt_secret";

/**
 * This type represents a blogger who can publish blog posts.
 */
class Blogger {
    id: string;
    username: string;
    passwordHash: string;
    balance: number;
    cryptoAddress: string;

    constructor(id: string, username: string, password: string, balance: number, cryptoAddress: string) {
        this.id = id;
        this.username = username;
        this.passwordHash = bcrypt.hashSync(password, 10);
        this.balance = balance;
        this.cryptoAddress = cryptoAddress;
    }

    verifyPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.passwordHash);
    }
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

    constructor(id: string, authorId: string, title: string, content: string, rewards: number) {
        this.id = id;
        this.authorId = authorId;
        this.title = title;
        this.content = content;
        this.rewards = rewards;
    }
}

const bloggersStorage = new Map<string, Blogger>();
const blogPostsStorage = new Map<string, BlogPost>();

const app = express();
app.use(cors());
app.use(express.json());

// Register a new blogger
app.post("/register", (req, res) => {
    const { username, password, cryptoAddress } = req.body;
    if (username && password) {
        const id = uuidv4();
        const blogger = new Blogger(id, username, password, 0, cryptoAddress);
        bloggersStorage.set(id, blogger);
        res.json({ id });
    } else {
        res.status(400).json({ message: "Username and password are required." });
    }
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const blogger = [...bloggersStorage.values()].find(b => b.username === username);
    if (blogger && blogger.verifyPassword(password)) {
        const token = jwt.sign({ id: blogger.id }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).json({ message: "Invalid username or password." });
    }
});

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Create a new blog post
app.post("/blog-posts", authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const authorId = req.user.id;
    if (title && content) {
        const id = uuidv4();
        const blogPost = new BlogPost(id, authorId, title, content, 0);
        blogPostsStorage.set(id, blogPost);
        res.json({ id });
    } else {
        res.status(400).json({ message: "Title and content are required." });
    }
});

// Update a blog post
app.put("/blog-posts/:id", authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const blogPostId = req.params.id;
    const authorId = req.user.id;
    const blogPost = blogPostsStorage.get(blogPostId);

    if (blogPost && blogPost.authorId === authorId) {
        const updatedBlogPost = { ...blogPost, title, content };
        blogPostsStorage.set(blogPostId, updatedBlogPost);
        res.json(updatedBlogPost);
    } else {
        res.status(401).json({ message: "Unauthorized to update this blog post." });
    }
});

// Delete a blog post
app.delete("/blog-posts/:id", authenticateToken, (req, res) => {
    const blogPostId = req.params.id;
    const authorId = req.user.id;
    const blogPost = blogPostsStorage.get(blogPostId);

    if (blogPost && blogPost.authorId === authorId) {
        blogPostsStorage.delete(blogPostId);
        res.json({ message: "Blog post deleted successfully." });
    } else {
        res.status(401).json({ message: "Unauthorized to delete this blog post." });
    }
});

// Get all blog posts
app.get("/blog-posts", (req, res) => {
    res.json([...blogPostsStorage.values()]);
});

// Read a blog post
app.get("/blog-posts/:id", async (req, res) => {
    const blogPostId = req.params.id;
    const blogPost = blogPostsStorage.get(blogPostId);

    if (blogPost) {
        blogPost.rewards += 1; // Reward the blogger for each read
        const author = bloggersStorage.get(blogPost.authorId);
        
        if (author) {
            const tipAmount = req.query.tip ? BigInt(req.query.tip) : BigInt(0);
            if (tipAmount > 0) {
                try {
                    const tipResult = await tipBlogger(author.cryptoAddress, tipAmount);
                    if ('Ok' in tipResult) {
                        author.balance += Number(tipAmount);
                    } else if ('Err' in tipResult) {
                        console.error(`Tipping failed: ${tipResult.Err}`);
                    }
                } catch (error) {
                    console.error(`Tipping failed: ${error.message}`);
                }
            }
            author.balance += 1;
            bloggersStorage.set(author.id, author);
            res.json(blogPost);
        } else {
            res.status(404).json({ message: "Author not found." });
        }
    } else {
        res.status(404).json({ message: "Blog post not found." });
    }
});

// Helper function to tip a blogger
async function tipBlogger(to: string, amount: bigint) {
    try {
        const response = await fetch(`icp://${ICRC_CANISTER_PRINCIPAL}/tip_blogger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidPath: "/path/to/your_dapp_candid.did",
                args: [{
                    tipper_subaccount: [],
                    created_at_time: [],
                    memo: [],
                    amount,
                    fee: [],
                    from: { owner: ic.caller(), subaccount: [] },
                    to: { owner: Principal.fromText(to), subaccount: [] }
                }]
            })
        });
        return await response.json();
    } catch (err) {
        throw new Error("An error occurred during the tipping process");
    }
