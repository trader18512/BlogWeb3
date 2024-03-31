import { approve } from "./icrc2_ledger";
import { createCanisterActor } from "./canisterFactory";
import { idlFactory as blogIDL } from "../../../declarations/backend/backend.did.js";
import IcHttp from "./ichttp";

// Assuming process.env.BACKEND_CANISTER_ID contains the ID of the blog canister
const blogCanisterId = process.env.BACKEND_CANISTER_ID;

// Create a canister actor for the blog canister
const blogCanister = await createCanisterActor(blogCanisterId, blogIDL);

const httpClient = new IcHttp(blogCanister);

// Function to create a new blog post
export async function createBlogPost(data) {
    return httpClient.POST({ path: "/blog-posts", data });
}

// Function to get a blog post by its ID
export async function getBlogPostById(id) {
    return httpClient.GET({ path: `/blog-posts/${id}` });
}

export async function getAddressFromPrincipal(principalHex) {
    return httpClient.GET({path: `/principal-to-address/${principalHex}`});
}

// Function to update an existing blog post
export async function updateBlogPost(id, data) {
    return httpClient.PUT({ path: `/blog-posts/${id}`, data });
}

// Function to delete a blog post by its ID
export async function deleteBlogPost(id) {
    return httpClient.DELETE({ path: `/blog-posts/${id}` });
}

// Function to get all blog posts
export async function getAllBlogPosts() {
    return httpClient.GET({ path: "/blog-posts" });
}

// Function to tip a blogger for a specific blog post
export async function tipBloggerForPost(postId, tipAmount) {
    const blogPost = await getBlogPostById(postId);
    const bloggerId = blogPost.authorId;

    // Approve the tip amount
    await approve(process.env.BACKEND_CANISTER_ID, tipAmount);

    // Tip the blogger
    return httpClient.POST({ 
        path: `/blog-posts/${postId}/tip`, 
        data: { 
            tipAmount, 
            bloggerId 
        } 
    });
}