require("dotenv").config();

const express = require("express");
const expresLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const connectDB = require("./server/config/db");
const app = express();
const PORT = 5000 || process.env.PORT;

// Connect to DB
connectDB();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

//Templating engine
app.use(expresLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
