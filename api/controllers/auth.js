import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
export const register = (req, res) => {
  // 检查用户存不存在
  const q = "SELECT * FROM users WHERE username=?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("用户已存在");

    // 不存在则创建，密码哈希存储
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)";
    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
      ];
      
      db.query(q, [values], (err, data) => {
          if (err) return res.status(500).json(err)
          return res.status(200).json("用户已存在")
      })
  });
};
export const login = (req, res) => {
    const q = "SELECT * FROM users WHERE username= ?"
    
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("用户不存在")
        
        // 用户存在
        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password)
        
        if (!checkPassword) return res.status(400).json("密码错误或用户不存在")
        
        const token = jwt.sign({ id: data[0].id }, "secretkey")
        const {password,...others}=data[0]
        res.cookie("accessToken", token, {
            httpOnly:true,
        })
            .status(200)
        .json(others)
    })
};

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        secure: true,
        sameSite:"none"
    }).status(200).json("用户已退出");
};
