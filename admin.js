const jwtToken = localStorage.getItem('jwtToken');
const BASE_PATH = "http://localhost:8080/"

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
        return response.json()
    }).then(data => {
        console.log(data)
    }).catch(error => {
        console.log('Error', error);
    });
}