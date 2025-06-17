import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// 获取“我关注了谁”
export const getRelationships = (req, res) => {
  const q = "SELECT followedUserId FROM relationships WHERE followerUserId = ?";

  db.query(q, [req.query.followerUserId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res
      .status(200)
      .json(data.map((relationship) => relationship.followedUserId));
  });
};


export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("没有登陆");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token 无效");
    const q =
      "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?)";

    const values = [userInfo.id, req.body.userId];
    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("已关注");
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("没有登陆");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token 无效");

    // 先查出关系id
    const selectQ =
      "SELECT id FROM relationships WHERE followerUserId = ? AND followedUserId = ?";
    db.query(selectQ, [userInfo.id, req.query.userId], (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) return res.status(404).json("关注关系不存在");

      const relationshipId = results[0].id;

      const deleteQ = "DELETE FROM relationships WHERE id = ?";
      db.query(deleteQ, [relationshipId], (err2, data) => {
        if (err2) return res.status(500).json(err2);
        return res.status(200).json("取消关注成功");
      });
    });
  });
};
