const jwtToken = localStorage.getItem('jwtToken');
const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/Admin/Desktop/E-commerce/"


async function addProduct() {
    const fileInput = document.getElementById('productImage');
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productUnitInStock = document.getElementById('productUnitInStock').value;
    const productCategoryId = document.getElementById('productCategoryId').value;
    const productActive = document.getElementById('productActive').checked;

    const formData = new FormData();
    console.log("formData: ")
    formData.append('file', fileInput.files[0]);

    const productData = {
        name: productName,
        price: productPrice,
        unitInStock: productUnitInStock,
        categoryId: productCategoryId,
        active: productActive
    };

    

    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json'}));
    
    try{
        const response = await fetch(BASE_PATH + "product/create", {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: formData
        });

        if(!response.ok){
            const errorData = await response.json();
            showFailAlert(errorData.message || "product create failed");
            throw new Error("product create failed, status: " + response.status);
        }

        await getAllProduct();
        closeAddProductModal();
        showSuccessAlert("product create successfully");
        
    }catch (error){
        console.log('Error: ', error);
    }
}

// backend'e istek atıp datayı çekiyoruz, renderProductTable fonksiyonu ile ekrana basıyoruz
async function getAllProduct() {
    try{

        const response = await fetch(BASE_PATH + "product/all", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        }); 
        if (!response.ok){
            throw new Error("fail to get products, status: " + response.status)
        }
        const productList = await response.json();
        console.log("productList : ", productList)
        await renderProductTable(productList);
    }catch(error){
        console.log("error: ", error)
    }
    
}

//sayfaya giriş yaptığımızda ürün detaylarının olduğu sütünlara denk gelen bilgileri ekrana basıyoruz.
async function renderProductTable(productList) {
    const productTableBody = document.getElementById('productTableBody');
    productTableBody.innerHTML = "";

    productList.forEach(product => {
        const row = productTableBody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.unitInStock}</td>
            <td>${product.categoryId}</td>
            <td><img src="${BASE_IMAGE_PATH}${product.image}" alt="${product.name}" width="100"></td>
            <td>${product.active ? "Yes" : "No"}</td>
            <td>
                <button class="btn btn-warning" onclick="updateProduct(${product.id})">Update</button>
                <button class="btn btn-danger" onclick="showDeleteProductModal(${product.id})">Delete</button>
            </td>
            `;
    });
}

// delete modalı gösteriyoruz ve ürün id'sini seçilen ürün id'si olarak tanımlıyoruz.
let selectedProductId = null;
function showDeleteProductModal(productId){
    selectedProductId = productId;
    const deleteProductModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    deleteProductModal.show();
}

//açılan modalda delete butonuna tıklandığında, seçilen ürün id'si silindiyse modalı kapatıyoruz
document.getElementById('confirmDeleteButton').addEventListener('click', async () =>{
   if(selectedProductId){
    const isDeleted = await deleteProduct(selectedProductId);
    if(isDeleted) {
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        deleteModal.hide();
        showSuccessAlert("product deleted successfully.");
    }
    selectedProductId = null;
    } 
});

//backend'e delete isteği atıp seçtiğimiz ürünü siliyoruz
async function deleteProduct(productId) {
    try {
        const response = await fetch(BASE_PATH + "product/" + productId, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if(!response.ok){
            const errorData = await response.json();
            showFailAlert(errorData.message || "Product delete failed.");
            throw new Error("Product delete failed: " + response.status);
        }

        await getAllProduct();
        return true;

    }catch (error) {
        console.log('Error', error);
        showFailAlert("Product delete failed.");
    }
}

//backend e get isteği atıp, ürün bilgilerini çekip, ilgili alanlara basıyoruz
function updateProduct(productId){
    fetch (BASE_PATH + "product/" + productId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response =>{
        if(!response.ok){
            throw new Error("Product fetching failed: " + response.status)
        }
        return response.json();
    }).then(data => {
        document.getElementById('updateProductId').value = data.id;
        document.getElementById('updateProductName').value = data.name;
        document.getElementById('updateProductPrice').value = data.price;
        document.getElementById('updateProductUnitInStock').value = data.unitInStock;
        document.getElementById('updateProductCategoryId').value = data.categoryId;
        document.getElementById('updateProductActive').checked = data.active;
        const updateProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'));
        updateProductModal.show();

    }).catch(error => {
        console.error('Error: ', error);
        showFailAlert("Urun bilgilerini getirirken bir hata oluştu.");
    });

}

// backend'den çektiğimiz bilgilerin içinde değiştirilmiş olanlar varsa, hepsiyle beraber kayıt ediyoruz
function saveUpdateProduct() {
    const updateProductId = document.getElementById('updateProductId').value;
    const updateProductName = document.getElementById('updateProductName').value;
    const updateProductPrice = document.getElementById('updateProductPrice').value;
    const updateProductUnitInStock = document.getElementById('updateProductUnitInStock').value;
    const updateProductCategoryId = document.getElementById('updateProductCategoryId').value;
    const updateProductActive = document.getElementById('updateProductActive').checked;

    const updateProductImage = document.getElementById('updateProductImage');

    const productData = {
        id: updateProductId,
        name: updateProductName,
        price: updateProductPrice,
        unitInStock: updateProductUnitInStock,
        categoryId: updateProductCategoryId,
        active: updateProductActive
    };

    const formData = new FormData();
    if (updateProductImage) {
        formData.append('file', updateProductImage);
    }
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    fetch(BASE_PATH + "product/update", {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Product updated failed, status: " + response.status);
        }
        return response.json();
    }).then(data => {
        getAllProduct();
        closeUpdateProductModal();
        showSuccessAlert("product update successfully.");
    }).catch(error => {
        console.log('Error:', error);
        showFailAlert("product update failed.");
    });

}

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

async function loadCategories() {
    try {
        const response = await fetch(BASE_PATH + "category", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch categories, status: " + response.status);
        }

        const categories = await response.json();
        const categorySelect = document.getElementById('productCategoryId');
        categorySelect.innerHTML = ''; // Mevcut seçenekleri temizle

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading categories: ", error);
    }
}

function closeUpdateProductModal(){
   let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'))
   modal.hide();
}

function closeAddProductModal(){
   let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addProductModal'))
   modal.hide();
}


document.addEventListener("DOMContentLoaded", async() => {
    await getAllProduct();
    await loadCategories();
});