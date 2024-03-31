import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddBlogPost from "./AddBlogPost";
import BlogPost from "./BlogPost";
import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
  getAllBlogPosts as getBlogPostList,
  createBlogPost,
} from "../../utils/blog";

const BlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // function to get the list of blog posts
  const getBlogPosts = useCallback(async () => {
    try {
      setLoading(true);
      setBlogPosts(await getBlogPostList());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, []);

  const addBlogPost = async (data) => {
    try {
      setLoading(true);
      createBlogPost(data).then((resp) => {
        getBlogPosts();
      });
      toast(<NotificationSuccess text="Blog post added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a blog post." />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlogPosts();
  }, []);

  return (
    <>
      {!loading ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fs-4 fw-bold mb-0">Blog Posts</h1>
            <AddBlogPost save={addBlogPost} />
          </div>
          <Row xs={1} md={2} lg={3} className="g-3 mb-5">
            {blogPosts.map((_blogPost) => (
              <BlogPost
                key={_blogPost.id}
                blogPost={{
                  ..._blogPost,
                }}
              />
            ))}
          </Row>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default BlogPosts;
