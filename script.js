// Preloader
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    preloader.classList.add("hide");
});

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {

    const recipeList = document.getElementById('recipe-list');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');

    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let allRecipes = [];

    // Header hide on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.style.display = window.scrollY > 0 ? 'none' : 'block';
    });

    // Fetch full recipe by ID (for category results)
    async function fetchRecipeById(id) {
        try {
            const res = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
            );
            const data = await res.json();
            return data.meals[0];
        } catch (err) {
            console.error("Error fetching recipe by ID:", err);
            return null;
        }
    }

    // Fetch recipes (search or category)
    async function fetchRecipes(query = '', category = '') {
        let url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

        if (category) {
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
        } else if (query) {
            url += query;
        } else {
            url = 'https://www.themealdb.com/api/json/v1/1/search.php?f=a';
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            allRecipes = data.meals || [];
            displayRecipes(allRecipes);
        } catch (error) {
            recipeList.innerHTML = `<p>Unable to load recipes. Please try again later.</p>`;
            console.error("Error fetching recipes:", error);
        }
    }

    // Display recipe cards
    function displayRecipes(recipes) {
        recipeList.innerHTML = '';

        if (!recipes || recipes.length === 0) {
            recipeList.innerHTML = `<p>No recipes found.</p>`;
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            card.innerHTML = `
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <h3>${recipe.strMeal}</h3>
            `;

            card.addEventListener('click', async () => {
                // If instructions exist, use current recipe; else fetch full details
                const fullRecipe = recipe.strInstructions
                    ? recipe
                    : await fetchRecipeById(recipe.idMeal);

                if (fullRecipe) openModal(fullRecipe);
                else alert("Sorry, unable to load recipe details.");
            });

            recipeList.appendChild(card);
        });
    }

    // Open modal popup
    function openModal(recipe) {
        modalBody.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h2>${recipe.strMeal}</h2>
            <p><strong>Category:</strong> ${recipe.strCategory || 'N/A'}</p>
            <p><strong>Area:</strong> ${recipe.strArea || 'N/A'}</p>
            <p><strong>Ingredients:</strong><br>${getIngredients(recipe)}</p>
            <p><strong>Instructions:</strong><br>${recipe.strInstructions || 'N/A'}</p>
        `;
        modal.classList.add('show');
    }

    // Close modal
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('show');
    });

    // Extract ingredients
    function getIngredients(recipe) {
        const list = [];
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ing && ing.trim()) list.push(`${measure} ${ing}`);
        }
        return list.join(', ');
    }

    // Search & filter
    function handleSearch() {
        fetchRecipes(searchInput.value.trim(), categorySelect.value);
    }

    searchInput.addEventListener('input', handleSearch);
    categorySelect.addEventListener('change', handleSearch);

    // Initial fetch
    fetchRecipes();
});
