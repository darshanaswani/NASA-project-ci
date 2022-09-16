const http = require("http");
const app = require("./app");
const { loadData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");
const { mongoConnect } = require("./services/mongo");
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  await mongoConnect();
  await loadData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

startServer();
