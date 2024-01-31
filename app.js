const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
app.use(express.json());
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDb();
//API1
const ConvertStateDb1 = (objectItem) => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  };
};
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT * FROM state;`;
  const states = await db.all(getStatesQuery);
  response.send(states.map((eachState) => ConvertStateDb1(eachState)));
});
//API2
const ConvertStateDb2 = (objectItem) => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  };
};
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM state WHERE state_id=${stateId};`;
  const getState = await db.get(getStateQuery);
  response.send(ConvertStateDb2(getState));
});
//API3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrictQuery = `
    INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const dbResponse = await db.run(addDistrictQuery);

  response.send("District Successfully Added");
});
//API4
const ConvertStateDb3 = (objectItem) => {
  return {
    districtId: objectItem.district_id,
    districtName: objectItem.district_name,
    stateId: objectItem.state_id,
    cases: objectItem.cases,
    cured: objectItem.cured,
    active: objectItem.active,
    deaths: objectItem.deaths,
  };
};
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * FROM district WHERE district_id=${districtId};`;
  const getDistrict = await db.get(getDistrictQuery);
  response.send(ConvertStateDb3(getDistrict));
});
//API5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `
    DELETE FROM district
    WHERE district_id=${districtId};`;
  await db.get(deleteQuery);
  response.send("District Removed");
});
//API6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `
    UPDATE district
    SET 
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
  WHERE
  district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});
//API7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `SELECT sum(cases) AS totalCases,sum(cured) AS totalCured,
    sum(active) AS totalActive,sum(deaths) AS totalDeaths FROM district WHERE state_id=${stateId}`;
  const getStats = await db.get(getStatsQuery);
  response.send(getStats);
});
//API8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT state_id FROM district WHERE district_id=${districtId}`;
  const getDistrict = await db.get(getDistrictQuery);
  const getStateNameQuery = `SELECT state_name AS stateName FROM state WHERE 
    state_id=${getDistrict.state_id}`;
  const getStateName = await db.get(getStateNameQuery);
  response.send(getStateName);
});
module.exports = app;
