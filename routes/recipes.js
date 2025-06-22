const express = require ("express");
const axios = require ("axios");

const router = express.Router();

router.get ("/recipes/random" , async (req , res) => {
  try {
    const response = await axios.get (
      "https://api.spoonacular.com/recipes/random",
      {
    params: {
      apiKey: process.env.APIKey || "FAKE_KEY"
    }
  }
    );
    res.json (response.data);
    console.log(response.data);

  } catch (error) {
    console.log("error happened here :" , error);
  }
});

router.get ("/recipes/search" , async (req , res) => {
  const ingredients = req.query.ingredients;
  
  if (!ingredients) {
    return res.status(400).json({ error: "Missing ingredients parameter" });
  }

  try {
    const response = await axios.get (
      "https://api.spoonacular.com/recipes/findByIngredients",
      {
    params: {
      apiKey: process.env.APIKey || "FAKE_KEY",
      ingredients: ingredients,
      number: 5
    }
  }
    );
    const simplified = response.data.map(recipe => ({
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients.map(ing => ing.name),
      missedIngredients: recipe.missedIngredients.map(ing => ing.name)
    }));

    res.json (simplified);
    console.log(simplified);

  } catch (error) {
    console.log("error happened here :" , error);
  }
});

module.exports = router ;