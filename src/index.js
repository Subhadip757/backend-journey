import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    ath: "./.env",
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        "MONGODB connections failed !!!", err;
    });

/*
import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("Error", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listning on ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error: ", error);
    throw err;
  }
})();

*/
