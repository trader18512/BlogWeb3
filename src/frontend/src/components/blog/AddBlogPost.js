import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { createBlogPost } from "../../utils/blog";


const AddBlogPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const isFormFilled = () => title && content;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const save = async (blogPost) => {
    try {
      await createBlogPost(blogPost);
    } catch (err) {
      console.log({ error });
    }
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus"></i>
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Blog Post</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputTitle"
              label="Title"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Enter title of the blog post"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputContent"
              label="Content"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="Enter content of the blog post"
                style={{ height: "200px" }}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                title,
                content,
              });
              handleClose();
            }}
          >
            Save Blog Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddBlogPost;
