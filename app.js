const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbServer();

const convertmovieNameToPascal = (DbObject) => {
  return {
    movieName: DbObject.movie_name,
  };
};
//Get movie list Api
app.get("/movies/", async (request, response) => {
  const getMovieListQuery = `
  SELECT 
  movie_name 
  FROM 
  movie`;
  const movieList = await db.all(getMovieListQuery);
  response.send(
    movieList.map((eachMovie) => convertmovieNameToPascal(eachMovie))
  );
});
//create new Movie Api

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    )`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

const convertDbObjectTOServerResponse = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

//get movie list based on movie_id api
//Get movie list Api
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieListQuery = `
  SELECT
   * 
  FROM 
  movie 
  WHERE movie_id=${movieId}`;
  const movieList = await db.get(getMovieListQuery);
  console.log(movieList);
  response.send(convertDbObjectTOServerResponse(movieList));
});
//
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE 
  movie 
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE 
  movie_id=${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
///
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE
  FROM movie
  WHERE 
  movie_id=${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//list of all directors api
const convertDirectorObjectTOPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorListQuery = `
  SELECT *
  FROM director`;
  const movieList = await db.all(getDirectorListQuery);
  response.send(
    movieList.map((eachlist) => convertDirectorObjectTOPascalCase(eachlist))
  );
});
///list of directors movie api
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorListQuery = `
  SELECT
   movie_name
  FROM 
  director INNER JOIN movie ON director.director_id=movie.director_id
  WHERE director.director_id=${directorId}`;
  const movieList = await db.all(getDirectorListQuery);

  response.send(
    movieList.map((eachmovie) => convertmovieNameToPascal(eachmovie))
  );
});

module.exports = app;
