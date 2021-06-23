import { promises } from "fs";
import path = require("path");
import { Logger } from "pino";
import { config } from "../../config";

const dataLocation = path.join(config.general.rootPath, "data");
const jsonExt = ".json";

let tripData = [];
let tripSummaries = [];

const toMiles = (km: number): number => (km ? km * 0.621371 : 0);
const calcCost = (miles: number, pricePerMile: number) =>
  miles ? Math.floor(miles * pricePerMile) : 0;

const createTrip = (text: string) => {
  const { id, start, end, duration, distance, locationDataPoints } =
    JSON.parse(text);

  const locations = locationDataPoints.map(
    ({
      coords: { altitude, heading, latitude, longitude, speed },
      timestamp,
    }) => ({
      timestamp,
      altitude,
      heading,
      latitude,
      longitude,
      speed,
    })
  );

  return {
    id,
    start,
    end,
    duration,
    distance,
    cost: calcCost(toMiles(distance), 14),
    locations,
  };
};

export const initialise = async (logger: Logger) => {
  tripData = [];
  tripSummaries = [];

  const dir = await promises.opendir(dataLocation);
  for await (const dirent of dir) {
    if (dirent.isFile() && path.extname(dirent.name) === jsonExt) {
      const filename = path.join(dataLocation, dirent.name);
      logger.debug({ filename }, "loading");
      const contents = await promises.readFile(filename, "utf-8");
      const trip = createTrip(contents);

      if (trip) {
        tripData.push(trip);
        const { locations, ...summary } = trip;
        tripSummaries.push(summary);
      }
    }
  }

  logger.debug({ tripSummaries }, "Loaded");
};

export const get = async (id: number): Promise<any> => {
  return tripData.find((trip) => trip.id === id);
};

export const getSummaries = async (): Promise<any[]> => {
  return tripSummaries;
};
