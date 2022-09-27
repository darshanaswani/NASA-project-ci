const {
  getAllLaunches,
  existsLaunchId,
  abortLaunch,
  saveLaunch,
  scheduleNewLaunch,
} = require("../../models/launches.model");

const getPagination = require("../query");

const httpGetAllLaunches = async (req, res) => {
  const { limit, skip } = getPagination(req.query);
  const launches = await getAllLaunches(limit, skip);
  return res.status(200).json(launches);
};

const httpAddNewLaunch = async (req, res) => {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required Launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

const httpAbortLaunch = async (req, res) => {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchId(launchId);
  if (!existsLaunch) {
    console.log("gg");
    return res.status(404).json({
      error: "mssing launch id",
    });
  }
  const aborted = await abortLaunch(launchId);

  if (aborted) {
    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({
    err: "flight not found",
  });
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
