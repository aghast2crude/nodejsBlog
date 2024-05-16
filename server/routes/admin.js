const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";

/*
 ** verify login with middleware
 */

const authMiddleWare = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log("err", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

/*
 ** GET Req
 ** admin
 */

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog create with Nodejs, Express & MongoDB",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (err) {
    console.error(err);
  }
});

/*
 ** GET Req
 ** Dashboard
 */
router.get("/dashboard", authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with Nodejs, Express & MongoDB",
    };
    const data = await Post.find();

    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (err) {
    console.log("error", err);
  }
});

/*
 ** POST Req
 ** Admin
 */

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/*
 ** POST Req
 ** Register
 */
router.post("/register", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog create with Nodejs, Express & MongoDB",
    };
    const { username, password } = req.body;
    const hashPwd = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashPwd });
      res.status(201).json({ message: "User Created", user });
    } catch (err) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User is already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
    console.log("credentails", req.body);

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
  }
});

/*
 ** GET/
 ** Admin - Create New Post
 */

router.get("/add-post", authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with Nodejs, Express & MongoDB",
    };
    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
  } catch (err) {
    console.log("err", err);
  }
});

/*
 ** POST/
 ** Admin - Create New Post
 */

router.post("/add-post", authMiddleWare, async (req, res) => {
  try {
    console.log("req", req.body);

    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log("err", err);
  }
});

/*
 ** GET/
 ** Admin - Create New Post
 */

router.get("/edit-post/:_id", authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with Nodejs, Express & MongoDB",
    };
    const data = await Post.findById(req.params._id);

    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (err) {
    console.log("err", err);
  }
});

/*
 ** PUT/
 ** Admin - Update Post
 */

router.put("/edit-post/:_id", authMiddleWare, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params._id, {
      title: req.body.title,
      body: req.body.body,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.log("err", err);
  }
});

/*
 ** DELETE/
 ** Admin - Delete Post
 */

router.delete("/delete-post/:_id", authMiddleWare, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params._id });
    res.redirect("/dashboard");
  } catch (err) {
    console.log("err", err);
  }
});

/*
 ** GET/
 ** Admin - Logout
 */

router.get("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.redirect("/admin");
  } catch (err) {
    console.log("err", err);
  }
});

module.exports = router;
