import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack, Alert } from "react-bootstrap";
import { Principal } from "@dfinity/principal";
import { tipBloggerForPost, deleteBlogPost, updateBlogPost } from "../../utils/blog";

const BlogPost = ({ blogPost, loggedInUser }) => {
  const { id, title, content, author, rewards } = blogPost;
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleTip = async () => {
    try {
      await tipBloggerForPost(id);
      setShowSuccess(true);
    } catch (err) {
      setShowError(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBlogPost(id);
      setShowSuccess(true);
    } catch (err) {
      setShowError(true);
    }
  };

  const handleEdit = async () => {
    try {
      const updatedData = getUpdatedData();

      await updateBlogPost(id, updatedData);
      setShowSuccess(true);
    } catch (err) {
      setShowError(true);
    }
  };

  const isAuthor = loggedInUser && Principal.from(loggedInUser).toText() === Principal.from(author).toText();

  return (
    <Col key={id}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <span className="font-monospace text-secondary">{Principal.from(author).toText()}</span>
            <Badge bg="secondary" className="ms-auto">
              {rewards} Rewards
            </Badge>
          </Stack>
        </Card.Header>
        <Card.Body className="d-flex  flex-column">
          <Card.Title>{title}</Card.Title>
          <Card.Text className="flex-grow-1">{content}</Card.Text>
          {loggedInUser && (
            <Button variant="outline-dark" onClick={handleTip} className="w-100 py-3">
              Tip Author
            </Button>
          )}
          {isAuthor && (
            <>
              <Button variant="outline-dark" onClick={handleEdit} className="w-100 py-3">
                Edit Post
              </Button>
              <Button variant="outline-dark" onClick={handleDelete} className="w-100 py-3">
                Delete Post
              </Button>
            </>
          )}
          {showSuccess && <Alert variant="success">Operation successful!</Alert>}
          {showError && <Alert variant="danger">An error occurred.</Alert>}
        </Card.Body>
      </Card>
    </Col>
  );
};

BlogPost.propTypes = {
  blogPost: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    rewards: PropTypes.number.isRequired,
  }).isRequired,
  loggedInUser: PropTypes.string,
};

export default BlogPost;
