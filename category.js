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

let selectedCategorytId = 0;
function showDeleteCategoryModal(categoryId){
    selectedCategorytId = categoryId
    const deleteCategoryModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
    deleteCategoryModal.show();
}

document.getElementById('confirmDeleteButton').addEventListener('click', async () =>{
    if(selectedCategorytId){
        const isDeleted = await deleteCategory(selectedCategorytId);
        if(isDeleted){
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'));
            deleteModal.hide();
        }
        selectedProductId = null;
    }
});

async function deleteCategory(categoryId) {
    try {
        const response = await fetch(BASE_PATH + "category/delete/" + categoryId, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if(!response.ok){
            const errorData = await response.json();
            const errorMessage = errorData.message;
            showFailAlert(errorMessage);
            throw new Error("Category delete failed : " + response.status);
        }

        await getAllCategory();
        showSuccessAlert("Category deleted successfully")

    }catch (error) {
        console.log('Error', error.message);
    }finally{
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'))
        deleteModal.hide();
    }
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
        //update e tıkladığımızda gelen modalın içinin dolu olması için, backend'den aldığı değerleri set ediyoruz
        document.getElementById('updateCategoryId').value = data.id;
        document.getElementById('updateCategoryName').value = data.name;
        
        const updateCategoryModal = new bootstrap.Modal(document.getElementById('updateCategoryModal'));
        updateCategoryModal.show();
        

    }).catch(error => {
        console.error('Error: ', error);
    });

}



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

        showSuccessAlert("Category updated successfully"); // Doğru mesaj
    }).catch(error => {
        console.error('Error: ', error);
    });
});

function showSuccessAlert(message) {
    let alert = document.getElementById('success-alert');
    alert.style.display = 'block';
    alert.style.opacity = 1;

    let alertMessage = document.getElementById('successAlertMessage');
    alertMessage.textContent = message;

    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none';
            }
            alert.style.opacity = opacity;
            opacity -= opacity * 0.01;
        }, 50);
    }, 1500);
}

function showFailAlert(message) {
    let alert = document.getElementById('fail-alert');
    alert.style.display = 'block';
    alert.style.opacity = 1;

    let alertMessage = document.getElementById('failAlertMessage');
    alertMessage.textContent = message;

    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none';
            }
            alert.style.opacity = opacity;
            opacity -= opacity * 0.01;
        }, 50);
    }, 1500);
}

document.addEventListener("DOMContentLoaded", async () => {
    await getAllCategory();

    // Category add, form listener
    document.getElementById("addCategoryBtn").addEventListener("click", function () {
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
                return response.json().then(errorData => {
                    const errorMessage = errorData.message || "Failed to create category. It might already exist.";
                    showFailAlert(errorMessage);
                    throw new Error(errorMessage);
                });
            }
            return response.json();
        }).then(category => {
            getAllCategory();
            showSuccessAlert("Category created successfully"); // Doğru mesaj
        }).catch(error => {
            console.error('Error:', error);
        });
    });
});

