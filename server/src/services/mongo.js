const mongoose = require("mongoose");

mongoose.connection.once("open", () => {
  console.log("Mongodb connection ready");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const MONGO_URL =
  "mongodb+srv://nasaproject:EDpIWLzeYnZT9fEA@nasa-api.momoogz.mongodb.net/?retryWrites=true&w=majority";

const mongoConnect = async () => {
  await mongoose.connect(MONGO_URL);
};

const mongoDisconnect = async () => {
  await mongoose.disconnect();
};

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
