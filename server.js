require ("dotenv").config();
const express = require ("express");
var cors = require ("cors");
const app = express ();

app.use (cors());

app.use (express.static("public"));

const axios = require ("axios");

const homepage = require ("./routes/home");
const recipepage = require ("./routes/recipes");

app.use ("/" , homepage);
app.use ("/information" , recipepage);

app.get("/", (req, res) => {
  res.send("Homepage is working!");
});

app.get("/about", (req, res) => {
  res.send("about us page!");
});

app.get("/api", (req,res) => {
  const apiKey = req.query.key;
  const realKey = process.env.APIKey;
  if (apiKey !== realKey) {
    return res.status(401).json({error:"error happend here"})
  }
})

app.use ((req , res) => {
  res.status (404).send("Page not found <a href='/'>Get back home</a>");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening on port http://localhost:${port}`);
});

// // const express = require('express');
// // const app = express();

// // app.get('/', (req, res) => {
// //   res.send('✅ Hello from test server!');
// // });

// // app.listen(3333, () => {
// //   console.log('✅ Server running at http://localhost:3333');
// // });

// require("dotenv").config();
// const express = require("express");
// const path = require("path");
// const axios = require("axios");
 
// const app = express();
// const PORT = process.env.PORT || 3000;
 
// app.use(express.static("public"));
 
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "views", "index.html"));
// });
 
// app.get("/api/recipes", async (req, res) => {
//   try {
//     const response = await axios.get("https://api.spoonacular.com/recipes/random", {
//       params: {
//         apiKey: process.env.SPOON_API_KEY,
//         number: 3,
//       },
//     });
 
//     const recipes = response.data.recipes.map((r) => ({
//       title: r.title,
//       image: r.image,
//       sourceUrl: r.sourceUrl,
//     }));
 
//     res.json({ recipes });
//   } catch (error) {
//     console.error("Error fetching recipes:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to fetch recipes" });
//   }
// });
 
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });