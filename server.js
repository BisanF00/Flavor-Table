require ("dotenv").config();
const express = require ("express");
var cors = require ("cors");
const pg = require ("pg");
const app = express ();

app.use (cors());

// const client = new pg.Client(DATABASE_URL);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.use (express.static("public"));
app.use (express.json());

const homepage = require ("./routes/home");
const recipepage = require ("./routes/recipes");

app.use ("/" , homepage);
app.use ("/information" , recipepage);

app.get("/api", (req,res) => {
  const apiKey = req.query.key;
  const realKey = process.env.APIKey;
  if (apiKey !== realKey) {
    return res.status(401).json({error:"error happend here"})
  }
});

app.get("/api/recipes/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");
    res.json(result.rows);
  } catch (error) {
    console.log("error showing the data", error);
    res.status(500).send("Error fetching");
  }
});

app.get("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Recipe not found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching recipe by ID:", error);
    res.status(500).send("Server error");
  }
});


app.post("/api/recipes/insert", async (req, res) => {
  const { title, image, instructions, ingredients , readyin } = req.body;

  console.log("Trying to insert recipe:", req.body);

  try {
    const result = await pool.query(
      "INSERT INTO recipes ( title, image, instructions, ingredients , readyin) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [ title, image, instructions, ingredients , readyin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving recipe");
  }
});

  app.put("/api/recipes/update/:id", async (req, res) => {
  const { id } = req.params;
  const { title, image, instructions, ingredients , readyin } = req.body;

  console.log("Update data received:", { title, image, instructions, ingredients, readyin });

  const safeImage = image || null;

  try {
    const result = await pool.query(
      "UPDATE recipes SET title=$1, image=$2, instructions=$3, ingredients=$4 , readyin=$5  WHERE id=$6 RETURNING *",
      [title, safeImage, instructions, ingredients, readyin, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error while updating recipe:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

  app.delete("/api/recipes/:id", async (req, res) => {
    const { id } = req.params;
    try {
    const result = await pool.query("DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.log("error showing the data", error);
    res.status(500).send("Error fetching");
  }
  });

app.use ((req , res) => {
  res.status (404).send("Page not found <a href='/'>Get back home</a>");
});

const port = process.env.PORT || 3000;

// pool 
//   .connect ()
//   .then ( () => {
//     app.listen(port, () => {
//     console.log(`app listening on port http://localhost:${port}`);
//       });
//     })
//   .catch ((err) => {
//     console.error ("Could not connect to database :" , err);
//   });

pool
  .connect()
  .then((client) => {
    return client
      .query("SELECT current_database(), current_user")
      .then((res) => {
        client.release();
 
        const dbName = res.rows[0].current_database;
        const dbUser = res.rows[0].current_user;
 
        console.log(
          `Connected to PostgreSQL as user '${dbUser}' on database '${dbName}'`
        );
 
        console.log(`App listening on port http://localhost:${port}`);
      });
  })
  .then(() => {
    app.listen(port);
  })
  .catch((err) => {
    console.error("Could not connect to database:", err);
  });