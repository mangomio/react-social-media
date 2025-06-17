// like.js
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId= ?";
  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map((like) => like.userId));
  });
};

export const addLikes = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("没有登陆");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token 无效");
    const q = "INSERT INTO likes (`userId`,`postId`) VALUES (?, ?)"; // 注意这里的改动
    const values = [userInfo.id, req.body.postId]; // 直接传递数组
    db.query(q, values, (err, data) => {
      // 传递 values 数组
      if (err) return res.status(500).json(err);
      return res.status(200).json("已点赞");
    });
  });
};
export const deleteLikes = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("没有登陆");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token 无效");
    const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
    db.query(q, [userInfo.id, req.query.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("点赞已删除");
    });
  });
};


