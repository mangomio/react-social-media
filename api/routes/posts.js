import express from "express";
import {
  getPosts,
  addPosts,
  deletePost,
  getFollowedPosts,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", addPosts);
router.delete("/:id", deletePost);
router.get("/followed", getFollowedPosts);
export default router;
