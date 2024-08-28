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
    }).then(categories => {
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

function getCategoryAndShowModal(categoryId) {
    updateCategory(categoryId);
}

function updateCategory(categoryId){
    fetch (BASE_PATH + "category/" + categoryId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response =>{
        if(!response.ok){
            throw new Error("Category fetching failed: " + response.status)
        }
        return response.json();
    }).then(data => {
        document.getElementById('updateCategoryId').value = data.id;
        document.getElementById('updateCategoryName').value = data.name;
        
        const updateCategoryModal = new bootstrap.Modal(document.getElementById('updateCategoryModal'));
        updateCategoryModal.show();

    }).catch(error => {
        console.error('Error: ', error);
    });

}

document.addEventListener("DOMContentLoaded", async () => {
    await getAllCategory();
    //category add, form listener
    document.getElementById("addCategoryBtn").addEventListener("click", function () {
        //form  verileri al
        const categoryName = document.getElementById("categoryName").value;
        fetch(BASE_PATH + "category/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify({
                name: categoryName
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error("Category create isteği başarısız durum kodu : " + response.status)
            }
            return response.json();
        }).then(category => {
            getAllCategory();
        }).catch(error => {
            console.error('Error:', error);
        })
    })

    document.getElementById("updateCategoryBtn").addEventListener("click", function () {
        const categoryId = document.getElementById('updateCategoryId').value;
        const categoryName = document.getElementById('updateCategoryName').value;

        fetch(BASE_PATH + "category/" + categoryId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify({
                id: categoryId,
                name: categoryName
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error("Category update failed, status: " + response.status);
            }
            return response.json();
        }).then(data => {
            // Güncellenen kategorileri yeniden yükleyin
            getAllCategory();

            // Modal'ı kapat
            const updateCategoryModal = bootstrap.Modal.getInstance(document.getElementById('updateCategoryModal'));
            updateCategoryModal.hide();
        }).catch(error => {
            console.error('Error: ', error);
        });
    });
});