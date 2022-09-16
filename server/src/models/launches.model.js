const { default: axios } = require("axios");
const launchesModel = require("./launches.mongo");
const planetsModel = require("./planets.mongo");

const DEFAULT_FLGHT_NUMBER = 100;

const getAllLaunches = async (limit, skip) => {
  return await launchesModel
    .find({}, { _id: 0, __v: 0 })
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
};

const getLatestFlightNumber = async () => {
  const latestLaunch = await launchesModel.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
};

const findLaunch = async (filter) => {
  return await launchesModel.findOne(filter);
};

const SPACEX_URL = "https://api.spacexdata.com/v4/launches/query";

const populateLaunches = async () => {
  const reponse = await axios.post(SPACEX_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  const launchDocs = reponse.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => payload["customers"]);
    // console.log(customers);

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    saveLaunch(launch);
  }
};

const loadLaunchesData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("launch data already loaded ");
    return;
  } else {
    await populateLaunches();
  }
};

const saveLaunch = async (launch) => {
  await launchesModel.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
};

const scheduleNewLaunch = async (launch) => {
  const planetFound = await planetsModel.findOne({
    kepler_name: launch.target,
  });
  if (!planetFound) {
    throw new Error("No Matching planets found ");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["NASA", "ISRO"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
};

const existsLaunchId = async (launchId) => {
  return await launchesModel.findOne({
    flightNumber: launchId,
  });
};

const abortLaunch = async (launchId) => {
  const abortedLaunch = await launchesModel.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return abortedLaunch.modifiedCount === 1;
};

module.exports = {
  getAllLaunches,
  existsLaunchId,
  abortLaunch,
  loadLaunchesData,
  saveLaunch,
  getLatestFlightNumber,
  scheduleNewLaunch,
};
