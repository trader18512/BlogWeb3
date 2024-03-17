import React from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";
import { Principal } from "@dfinity/principal";

const BlogPost = ({ blogPost }) => {
  const { id, title, content, author, rewards } = blogPost;

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
          <Button variant="outline-dark" disabled className="w-100 py-3">
            Read More
          </Button>
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
};

export default BlogPost;
