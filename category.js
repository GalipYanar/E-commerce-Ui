const jwtToken = localStorage.getItem('jwtToken');
const BASE_PATH = "http://localhost:8080/"

function getAllCategory(){
    fetch(BASE_PATH + "category", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok){
            throw new Error("fail to get category, status: " + response.status)
        }
        return response.json();
    }).then(category => {
        displayCategories(categories)
    }).catch(error => {
        console.error('Error', error);
    });
}

function displayCategories(categories) {
    const categoryTableBody = document.getElementById("categoryTableBody");
    categoryTableBody.innerHTML = "";
    categories.forEach(category => {
        const row = categoryTableBody.insertRow();
        row.innerHTML = `
        <td>${category.id}</td>
        <td>${category.name}</td>
        <td>
            <button class="btn btn-warning" onclick="getCategoryAndShowModal(${category.id})">Update</button>
            <button class="btn btn-danger" onclick="showDeleteCategoryModal(${category.id})">Delete</button>
        </td>
        `;
    });
}

document.addEventListener("DOMContentLoaded", async () =>{
    await getAllCategory();

    //category addd, form listener
    document.getElementById("addCategoryForm").addEventListener("click", function() {
        const categoryName = document.getElementById("categoryName").value;
        fetch(BASE_PATH + "category/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify({
                name: categoryName
            }).then(response => {
                if (!response.ok) {
                    throw new Error("Category oluşturma isteği başarısız durum kodu : " + response.status)
                }
                return response.json()
            }).then(data => {
                getAllCategory();
            }).catch(error => {
                console.error('Error', error);
            })
        })
    })
});