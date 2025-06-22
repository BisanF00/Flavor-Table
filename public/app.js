const container = document.getElementById("recipesContainer");
const recipeButton =document.getElementById ("recipeBtn");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");

function favoriteRecipes (recipe) {
  let favorites = JSON.parse (localStorage.getItem("favorites")) || [];

  const exists = favorites.some (r => r.id === recipe.id);
  if (exists) {
    alert("Recipe already saved!");
    return;
  }

  favorites.push (recipe);

  localStorage.setItem("favorites" , 
    JSON.stringify(favorites)
  );
  alert("Recipe saved to favorites!");
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
      <div><button class="saveBtn">Save to Favorites</button></div>
    </div>
    `;

    container.style.display = "block";
    resultsContainer.style.display = "none";

    document.querySelector(".saveBtn").addEventListener("click", () => {
    const simplified = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    ingredients: recipe.extendedIngredients
      .map(i => i.original)
      .join(", "),
    instructions: recipe.instructions || "No instructions provided.",
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
        <div><button class="saveBtn" data-index="${index}">Save to Favorites</button></div>
      </div>
    `).join("");

    container.style.display = "none";
    resultsContainer.style.display = "block";

    document.querySelectorAll(".saveBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        const recipe = data[index];

        const simplified = {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          ingredients: recipe.usedIngredients
          .concat(recipe.missedIngredients)
          .map(ing => ing.name || ing)
          .join(", "),
          instructions: "No instructions available from ingredient-based search.",
        };

        favoriteRecipes(simplified);
      });
    });


  } catch (err) {
    resultsContainer.innerHTML = `<p style="color:red;">Error fetching recipes.</p>`;
    console.error(err);
  }
}

recipeButton.addEventListener("click", fetchRecipes);
searchBtn.addEventListener("click", searchRecipes);

fetchRecipes();

