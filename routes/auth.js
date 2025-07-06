const bcrypt = require ("bcrypt");
const jwt = require ("jsonwebtoken");
require ("dotenv").config();
const express = require ("express");
const router = express.Router();
const pg = require ("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const routeGuard = require ("../middleware/verifyToken");

router.get("/secret", routeGuard, async (req, res) => {
  res.send("Hello , this is a protected route");
});

router.post("/register", async (req, res) => {
  const { username , email , password } = req.body;

  try {
    const hashedpassword = await bcrypt.hash (password , 10);

    const result = await pool.query(
      "INSERT INTO users ( username , email , password ) VALUES ($1, $2, $3) RETURNING id , username , email",
      [ username , email , hashedpassword ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("error inserting", error);
    if (error.code === "23505") {
      res.status(409).send("username or email already exsist");
    }
    res.status(500).send("Error");
  }
});

router.post("/login", async (req, res) => {
  const { username , email , password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [ username , email ]
    );

    const user = userResult.rows[0];
    if (!user) return res.status(404).send("username not found");

    const isMatched = await bcrypt.compare (password , user.password);
    if (!isMatched) return res.status(401).send("invalid credintials");

    const token = jwt.sign (
      {id: user.id , username : user.username , email: user.email},
      process.env.JWT_SECRET,
      {expiresIn : "30d"}
    );

    res.send({token});
  } catch (error) {
    console.log("error loggin in", error);
    res.status(500).send("Error");
  }
});

router.get("/profile", routeGuard, async (req, res) => {
  const { username , email} = req.user;
  
  try {
    const result = await pool.query(
      "SELECT username, email FROM users WHERE username = $1 And email = $2",
      [ username , email ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.log("error showing the data", error);
    res.status(500).send("Error fetching");
  }
});

module.exports = router;