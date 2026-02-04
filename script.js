window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  preloader.classList.add("hide");
});
window.addEventListener('DOMContentLoaded', () => {
const recipeList = document.getElementById('recipe-list');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');

const modal = document.getElementById('recipe-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

let allRecipes = [];
window.addEventListener('scroll', () => {
let currentScroll = window.scrollY;
if(currentScroll > 0){
    document.querySelector('header').style.display = 'none';
}else{
    document.querySelector('header').style.display = 'block';
}
});

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
        recipeList.innerHTML = `<p>Unable to load recipes.</p>`;
    }
}

function displayRecipes(recipes) {
    recipeList.innerHTML = '';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        card.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h3>${recipe.strMeal}</h3>
        `;

        card.addEventListener('click', () => openModal(recipe));
        recipeList.appendChild(card);
    });
}

function openModal(recipe) {
    modalBody.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
        <h2>${recipe.strMeal}</h2>
        <p><strong>Category:</strong> ${recipe.strCategory}</p>
        <p><strong>Area:</strong> ${recipe.strArea}</p>
        <p><strong>Ingredients:</strong><br>${getIngredients(recipe)}</p>
        <p><strong>Instructions:</strong><br>${recipe.strInstructions}</p>
    `;

    modal.classList.add('show');
}

closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

function getIngredients(recipe) {
    let list = [];
    for (let i = 1; i <= 20; i++) {
        const ing = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ing && ing.trim()) {
            list.push(`${measure} ${ing}`);
        }
    }
    return list.join(', ');
}

function handleSearch() {
    fetchRecipes(searchInput.value.trim(), categorySelect.value);
}

searchInput.addEventListener('input', handleSearch);
categorySelect.addEventListener('change', handleSearch);

fetchRecipes();
});