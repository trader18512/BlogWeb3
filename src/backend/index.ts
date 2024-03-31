import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic, Principal, serialize, Result } from 'azle';
import express from 'express';
import cors from 'cors';
import { hexAddressFromPrincipal } from "azle/canisters/ledger";


/**
 * This type represents a blogger who can publish blog posts.
 */
class Blogger {
    id: string;
    username: string;
    password: string;
    balance: number;
    cryptoAddress: string;

    constructor(id: string, username: string, password: string, balance: number, cryptoAddress: string) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.balance = balance;
        this.cryptoAddress = cryptoAddress;
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




const ICRC_CANISTER_PRINCIPAL = "ryjl3-tyaaa-aaaaa-aaaba-cai";


export default Server(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    const bloggersStorage = StableBTreeMap<string, Blogger>(0);
    const blogPostsStorage = StableBTreeMap<string, BlogPost>(1);

    function findBloggerByUsernameAndPassword(username: string, password: string): Blogger | undefined {
        for (const blogger of bloggersStorage.values()) {
            if (blogger.username === username && blogger.password === password) {
                return blogger;
            }
        }
        return undefined;
    }

    app.get('/', (req, res) => {
        res.send('Welcome to the Blog API');
    });

    // Register a new blogger
    app.post("/register", (req, res) => {
        const { username, password, cryptoAddress } = req.body;
        if (username && password) {
            const id = uuidv4();
            const blogger: Blogger = { id, username, password, balance: 0, cryptoAddress };
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
        const blogPostResult = blogPostsStorage.get(blogPostId);
    
        // Check if the blog post exists
        if (blogPostResult && blogPostResult.Some) {
            const blogPost = blogPostResult.Some; // Access the 'Some' property to get the BlogPost
            if (blogPost.authorId === authorId) {
                const updatedBlogPost = { ...blogPost, title, content };
                blogPostsStorage.insert(blogPostId, updatedBlogPost);
                res.json(updatedBlogPost);
            } else {
                res.status(401).json({ message: "Unauthorized to update this blog post." });
            }
        } else {
            // Handle the case where the blog post is not found
            res.status(404).json({ message: "Blog post not found." });
        }
    });
    
    

    // Delete a blog post
    app.delete("/blog-posts/:id", (req, res) => {
        const blogPostId = req.params.id;
        const authorId = req.headers.authorization as string;
        const blogPostResult = blogPostsStorage.get(blogPostId);
    
        // Check if the blog post exists
        if (blogPostResult && blogPostResult.Some) {
            const blogPost = blogPostResult.Some; // Access the 'Some' property to get the BlogPost
            if (blogPost.authorId === authorId) {
                blogPostsStorage.remove(blogPostId);
                res.json({ message: "Blog post deleted successfully." });
            } else {
                res.status(401).json({ message: "Unauthorized to delete this blog post." });
            }
        } else {
            // Handle the case where the blog post is not found
            res.status(404).json({ message: "Blog post not found." });
        }
    });
    

    // Get all blog posts
    app.get("/blog-posts", (req, res) => {
        res.json(blogPostsStorage.values());
    });

    // Read a blog post
    app.get("/blog-posts/:id", async (req, res) => {
        const blogPostId = req.params.id;
        const blogPostResult = blogPostsStorage.get(blogPostId);
    
        // Check if the blog post exists
        if (blogPostResult.Some && blogPostResult) {
            const blogPost = blogPostResult.Some;
            blogPost.rewards += 1; // Reward the blogger for each read
    
            const authorResult = bloggersStorage.get(blogPost.authorId);
    
            // Check if the author exists
            if (authorResult && authorResult.Some) {
                const author = authorResult.Some;
    
                // Check if there's a tip query parameter
                const tipAmount = req.query.tip ? BigInt(req.query.tip as string) : BigInt(0);

    
                if (tipAmount > 0) {
                    // Call the tipBlogger function to handle the cryptocurrency transfer
                    const tipResult = await tipBlogger(author.cryptoAddress, tipAmount);
    
                    // Check the result of the tipping operation
                    if ('Ok' in tipResult) {
                        // If the tip was successful, increment the author's balance by the tip amount
                        author.balance += Number(tipAmount);
                    } else if ('Err' in tipResult) {
                        // Handle the error case appropriately
                        console.error(`Tipping failed: ${tipResult.Err}`);
                        // You might want to send a different response or status code in this case
                    }
                }
    
                // Increment balance of the author for the read
                author.balance += 1;
    
                // Update author's balance
                bloggersStorage.insert(author.id, author);
    
                // Send the blog post as the response
                res.json(blogPost);
            } else {
                res.status(404).json({ message: "Author not found." });
            }
        } else {
            res.status(404).json({ message: "Blog post not found." });
        }
    });
    
    
    

    app.get("/principal-to-address/:principalHex", (req, res) => {
        const principal = Principal.fromText(req.params.principalHex);
        res.json({ account: hexAddressFromPrincipal(principal, 0) });
    });

    return app.listen();
});


async function tipBlogger(to: string, amount: bigint): Promise<Result<any, string>> {
    try {
        // Replace with your DApp's canister principal and the appropriate method endpoint
        const response = await fetch(`icp://${ICRC_CANISTER_PRINCIPAL}/tip_blogger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // The path to your DApp's Candid interface description
                candidPath: "/path/to/your_dapp_candid.did",
                args: [{
                    // Optional values can remain as empty arrays if not used
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
        return Result.Ok(response);
    } catch (err) {
        let errorMessage = "An error occurred during the tipping process";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        return Result.Err(errorMessage);
    }
}
