const CircularJSON = require("circular-json");
const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "blog",
    });

    console.log(
      `Database Connected: ${conn.connection.host} | ${CircularJSON.stringify(
        conn.connection.name
      )}`
    );
  } catch (error) {
    console.log("error in connecting to MongoDB", error);
  }
};

module.exports = connectDB;
