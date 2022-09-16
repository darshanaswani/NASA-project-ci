const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planetsModel = require("../models/planets.mongo");

const isHabitablePlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

const loadData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject("Error in loading data", err);
      })
      .on("end", async () => {
        const countOfPlanets = (await getAllPlanets()).length;
        console.log(`${countOfPlanets} habitable planets found`);
        resolve();
      });
  });
};

const getAllPlanets = async () => {
  return await planetsModel.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
};

const savePlanet = async (planet) => {
  try {
    await planetsModel.updateOne(
      {
        kepler_name: planet.kepler_name,
      },
      {
        kepler_name: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save a planet ${err}`);
  }
};

module.exports = { getAllPlanets, loadData };
