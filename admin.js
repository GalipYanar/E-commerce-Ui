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
            throw new Error("Product delete failed : " + response.status);
        }

        await getAllProduct();
        return true;

    }catch (error) {
        console.log('Error', error);
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
    formData.append('file', feditedSelectedImage = updateProductImage[0]);
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json'}));

    fetch(BASE_PATH + "product/update", {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Product update başarısız durum kodu : " + response.status)
        }
        getAllProduct();
        closeUpdateProductModal();
    }).then(data => {
        console.log(data)
    }).catch(error => {
        console.log('Error', error);
    });

}

function closeUpdateProductModal(){
   let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'))
   modal.hide();
}

document.addEventListener("DOMContentLoaded", async() => {
    await getAllProduct();
});