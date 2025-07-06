const container = document.getElementById("recipesContainer");
const recipeButton =document.getElementById ("recipeBtn");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const favoritesContainer = document.getElementById("favoritesContainer");

function loadFavorites (token) {
axios.get("http://localhost:5321/api/recipes/all")
    .then(response => {
      const favorites = response.data;

      if (favorites.length === 0) {
      favoritesContainer.innerHTML = `<p class="favoriteFront">No favorites yet.</p>`;
    } else {
      favoritesContainer.innerHTML = favorites.map((recipe) => `
        <div class="card">
          <h3>${recipe.title}</h3>
          <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 200px;">
          <p><strong>Ingredients:</strong> ${Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients}</p>
          <div><strong>Instructions:</strong> ${recipe.instructions}</div>
          <div><strong>Ready In:</strong> ${recipe.readyin} Minutes</div>
          <button class="ubdateBtn" onclick="ubdateFavorite(${recipe.id})">Ubdate</button>
          <button class="removeBtn" onclick="removeFavorite(${recipe.id})">Remove</button>
        </div>
      `).join("");
    }
    }).catch(err => console.error("Error loading favorites", err));
};
console.log("favorites page loaded");

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("favorites.html")) {
    loadFavorites();
  }
});


function favoriteRecipes (recipe) {
    let ingredients = [];

  if (Array.isArray(recipe.ingredients)) {
    ingredients = recipe.ingredients;
  } else if (recipe.extendedIngredients) {
    ingredients = recipe.extendedIngredients.map(i => i.original);
  } else if (recipe.usedIngredients || recipe.missedIngredients) {
    ingredients = [...(recipe.usedIngredients || []), ...(recipe.missedIngredients || [])].map(i => i.name || i);
  }

  const simplified = {
  title: recipe.title,
  image: recipe.image,
  instructions: recipe.instructions || "No instructions provided",
  ingredients: JSON.stringify(ingredients),
  readyin: recipe.readyInMinutes || 0,
};
 axios.post("http://localhost:5321/api/recipes/insert", simplified)
    .then(() => {
      alert("Recipe saved to favorites!");
      loadFavorites ();
    })
    .catch(err => console.error("Error saving recipe", err));
};

  function ubdateFavorite(id) {
    window.location.href = `editRecipe.html?id=${id}`;
  };

 function removeFavorite(id) {
      axios.delete(`http://localhost:5321/api/recipes/${id}`)
      .then (() => {
        alert ("Recipe deleted");
        loadFavorites ();
      }).catch (error => {
        console.error("Delete failed", error);
      });
    };

async function fetchRecipes() {
  try {
    const response = await fetch("/information/recipes/random");
    const data = await response.json();
    const recipe = data.recipes[0];

    console.log("Recipe loaded:", recipe);

    const ingredients = recipe.extendedIngredients
      .map(i => i.original)
      .join(", ");

    const instructions = recipe.instructions || "No instructions provided.";

    container.innerHTML = `
    <div class="card">
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" style="max-width:300px; border-radius:10px; display:block; margin-bottom: 1rem;">
      <p><strong>Ingredients:</strong> ${ingredients}</p>
      <div><strong>Instructions:</strong> ${instructions}</div>
      <div><strong>Ready In:</strong> ${recipe.readyInMinutes} Minutes</div>
      <div><button class="saveBtn">Save to Favorites</button></div>
    </div>
    `;

    container.classList.remove("hidden");          
    resultsContainer.classList.add("hidden");

    document.querySelector(".saveBtn").addEventListener("click", () => {
    const simplified = {
    title: recipe.title,
    image: recipe.image,
    ingredients: recipe.extendedIngredients
      .map(i => i.original),
    instructions: recipe.instructions || "No instructions provided.",
    readyin: recipe.readyInMinutes || 0,
     };
    favoriteRecipes(simplified);
});


  } catch (error) {
    console.error("Error loading recipe:", error);
    container.innerHTML = "<p style='color:red;'>Failed to load recipe.</p>";
  }
}

async function searchRecipes() {
  const input = document.getElementById("ingredientsInput").value;

  resultsContainer.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`/information/recipes/search?ingredients=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (data.error) {
      resultsContainer.innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    if (data.length === 0) {
      resultsContainer.innerHTML = `<p>No recipes found.</p>`;
      return;
    }

    resultsContainer.innerHTML = data.map((recipe, index) => `
      <div class="card">
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" />
        <div class="section-title">Used Ingredients:</div>
        <ul>${recipe.usedIngredients.map(ing => `<li>${ing.name || ing}</li>`).join("")}</ul>
        <div class="section-title">Missing Ingredients:</div>
        <ul>${recipe.missedIngredients.map(ing => `<li>${ing.name || ing}</li>`).join("")}</ul>
        ${(recipe.readyInMinutes || recipe.readyin) ? `<div><strong>Ready In:</strong> ${recipe.readyInMinutes || recipe.readyin} Minutes</div>` : ""}
        <div><button class="saveBtn" data-index="${index}">Save to Favorites</button></div>
      </div>
    `).join("");

    container.classList.add("hidden");          
    resultsContainer.classList.remove("hidden"); 

    document.querySelectorAll(".saveBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        const recipe = data[index];

        const simplified = {
          title: recipe.title,
          image: recipe.image,
          ingredients: recipe.usedIngredients
          .concat(recipe.missedIngredients)
          .map(ing => ing.name || ing),
          instructions: "No instructions available from ingredient-based search.",
          readyin: recipe.readyInMinutes || 0,
        };

        favoriteRecipes(simplified);
      });
    });


  } catch (err) {
    resultsContainer.innerHTML = `<p style="color:red;">Error fetching recipes.</p>`;
    console.error(err);
  }
}

if (recipeButton) {
  recipeButton.addEventListener("click", fetchRecipes);
}

if (searchBtn) {
  searchBtn.addEventListener("click", searchRecipes);
}

fetchRecipes();

