//用户操作
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "未登录" });

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) {
      console.error("Token 验证失败", err);
      return res.status(403).json({ error: "Token 无效或已过期" });
    }

    const { name, city, website, coverPic, profilePic } = req.body;
    const userId = userInfo.id;

    // 假设 q 是一个参数化的 SQL 查询语句
    const q =
      "UPDATE users SET name = ?, city = ?, website = ?, coverPic = ?, profilePic = ? WHERE id = ?";

    db.query(
      q,
      [name, city, website, coverPic, profilePic, userId],
      (err, data) => {
        if (err) {
          console.error("数据库更新失败", err);
          return res.status(500).json({ error: "服务器错误" });
        }

        if (data.affectedRows > 0) {
          return res.json({ message: "更新成功" });
        } else {
          return res.status(403).json({ error: "只能更新自己的信息" });
        }
      }
    );
  });
};

export const getSuggestions = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("未登录");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token 无效");

    const q = `
      SELECT id, name, profilePic FROM users
      WHERE id != ?
      ORDER BY RAND()
      LIMIT 5
    `;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};
