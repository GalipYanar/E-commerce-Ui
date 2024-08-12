const jwtToken = localStorage.getItem("jwtToken");
const BASE_PATH = "http://localhost:8080/"

async function fetchCategories(){
    const response = await fetch(BASE_PATH + "category", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    });
    const data = await response.json();
    displayCategories(data)
}

function displayCategories(categories) {
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.categoryEnum;
        categorySelect.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", async function() {
    await fetchCategories();
})