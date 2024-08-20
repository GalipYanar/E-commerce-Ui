const jwtToken = localStorage.getItem('jwtToken');
const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/Admin/Desktop/asd/E-commerce/"


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
    console.log("post product: ")
    await fetch(BASE_PATH + "product/create", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Produc ekleme başarısız durum kodu : " + response.status)
        }
        
    }).then(data => {
        console.log(data)
    }).catch(error => {
        console.log('Error', error);
    });
}

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


let selectedProductId = null;
function showDeleteProductModal(productId){
    selectedProductId = productId;
    const deleteProductModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    deleteProductModal.show();
}

document.getElementById('confirmDeleteButton').addEventListener('click', async () =>{
   if(selectedProductId){
    const isDeleted = await deleteProduct(selectedProductId);
    if(isDeleted) {
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        deleteModal.hide();
    }
    selectedProductId = null;
   } 
});

async function deleteProduct(productId) {
    try {
        const response = await fetch(BASE_PATH + "product/" + productId, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if(!response.ok){
            throw new Error("Product delete failed : " + response.status);
        }

        await getAllProduct();
        return true;
    }catch (error) {
        console.log('Error', error);
    }
}

document.addEventListener("DOMContentLoaded", async() => {
    await getAllProduct();
});