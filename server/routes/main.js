const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

//Routes
router.get("/", async (req, res) => {
  try {
    const locals = {
      title: "Nodes Blog",
      description: "Simple blog created with Nodejs, Express & MongoDB",
    };
    let perPage = 2;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.error(error);
  }
});

// GET ROUTE

router.get("/post/:id", async (reqq, res) => {
  try {
    let slug = reqq.params.id;
    console.log("slug value", slug);
    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "Simple blog created with Nodejs, Express & MongoDB",
    };
    res.render("post", { locals, data });
  } catch (err) {
    console.error(err);
  }
});

/*
 * POST /
 * POST Route - searchTerm
 */

router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Blog Search",
      description: "Simple blog created with Nodejs, Express & MongoDB",
    };

    const searchTerm = req.body.searchTerm;
    const searchTermNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchTermNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchTermNoSpecialChar, "i") } },
      ],
    });
    console.log("data after search", data);
    res.render("search", { locals, data });
  } catch (error) {
    console.error(error);
  }
});

function insertPostData() {
  Post.insertMany({
    title: "test 2",
    body: "body test 2",
  });
}

// insertPostData();

module.exports = router;
