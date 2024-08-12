const jwtToken = localStorage.getItem("jwtToken"); //login ekranında set ettiğimiz token ı burada çekip kullanıyoruz
const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/Admin/Desktop/asd/E-commerce/"
let cartItems = [];

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

async function fetchProductByCategory(categoryId){
    const endPointUrl = BASE_PATH + "product/category/" + categoryId;
    try{
        const response= await fetch(endPointUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        if(!response.ok){
            throw new Error("Ürün getirme isteği başarısız, durum kodu: " + response.status)
        }

        const data= await response.json();
        displayProducts(data)
    }catch(error){
        console.error("Error fetching products: ", error)
    }
}

function displayCategories(categories) {
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML = '';

    categories.forEach(category => { //forEach ile categories içerisinde dönüp value ile id leri alıp, text ile o id ye ait olan categoriyi ekrana basıyor
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.categoryEnum;
        categorySelect.appendChild(option);
    });
}

function displayProducts(products){
    const productList = document.getElementById("productList");
    productList.innerHTML ='';

    products.forEach(product =>{
        const productCard = document.createElement("div");
        productCard.classList.add("co-md-6", "mb-4");

        const productImage = document.createElement("img");
        productImage.src = BASE_IMAGE_PATH + product.image
        productImage.alt = product.name;
        productImage.style.maxWidth = "150px";
        productImage.style.maxHeight = "150px";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.innerHTML = `
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <button class="btn btn-primary" onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        `;

        productCard.appendChild(productImage);
        productCard.appendChild(cardBody);

        productList.appendChild(productCard);
    });
}

function addToCart(product) {
    if(product.unitInStock > 0) {
        cartItems.push(product);
        updateCart();
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await fetchCategories();
    
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.addEventListener("change", async function(){
        await fetchProductByCategory(categorySelect.value);
    });
})