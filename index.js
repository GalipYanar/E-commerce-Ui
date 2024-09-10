const jwtToken = localStorage.getItem("jwtToken"); //login ekranında set ettiğimiz token ı burada çekip kullanıyoruz
const customerId = localStorage.getItem("customerId");
const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/Admin/Desktop/E-commerce/"
let cartItems = [];

async function fetchCategories(){
    try{
        const response = await fetch(BASE_PATH + "category", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });
    
        const data = await response.json();
        displayCategories(data)
    }catch (error){
        console.log("error fetching categories: ", error);
        if(error.status == 403){
            window.location.href = "login.html"
        }
    }
    
}

//seçilen kategorinin ürünlerini backende istek atıp çekiyor. api-call
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
        console.error("Error fetching products: ", error);
        if(error.status == 403){
            window.location.href = "login.html"
        }
    }
}

//categorySelect id sini alıp, forEach ile category içerisinde dönüp mevcut olan nesneler için option ile yeni nesne oluşturuyor
function displayCategories(categories) {
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML = '';

    categories.forEach(category => { //forEach ile categories içerisinde dönüp value ile id leri alıp, text ile o id ye ait olan categoriyi ekrana basıyor
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.name;
        categorySelect.appendChild(option);
    });
}

//seçtiğimiz kategorinin ürünlerini ekrana basma
function displayProducts(products){
    const productList = document.getElementById("productList");
    productList.innerHTML ='';
    // ürünleri yan yana göstermme
    productList.style.display = "flex";
    productList.style.flexWrap = "wrap";

    products.forEach(product =>{
        const productCard = document.createElement("div");
        productCard.classList.add("co-md-2", "mb-4");

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

function removeFromCart(index){
    
    cartItems.splice(index, 1) [0];
    updateCart();
    updateOrderButtonVisiblity();
}


function addToCart(product) {
    console.log(cartItems);
    const productCountInCart = cartItems.filter(item => item.id === product.id).length;
    if(product.unitInStock > 0 && productCountInCart < product.unitInStock) {
        cartItems.push(product);
        updateCart();
        updateOrderButtonVisiblity();
    }
}

function updateCart(){
    const cart = document.getElementById("cart");
    cart.innerHTML = '';

    cartItems.forEach((item, index) =>{
        const cartItemElement = document.createElement("li");
        cartItemElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        const itemNameElement = document.createElement("span");
        cartItemElement.textContent = item.name + " - " + item.price;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        
        deleteButton.onclick = function (){
            removeFromCart(index);
        };

        cartItemElement.appendChild(itemNameElement);
        cartItemElement.appendChild(deleteButton);
        cart.appendChild(cartItemElement);
    }); 
}

function orderNow() {
    console.log("orderNow : ", cartItems)

    const idCountMap = new Map();
    cartItems.forEach(item => {
        const { id } = item;

        //Check if the id exists in the map
        if (idCountMap.has(id)) {
            //if it exists, increment the count
            idCountMap.set(id, idCountMap.get(id) + 1);
        } else {
            //if it doesn't exist, add it to the map
            idCountMap.set(id, 1);
        }
    })

    idCountMap.forEach((count, id) => {
        console.log("id : ", id, " count : ", count)
    });

    var orderProductInfoList = [...idCountMap].map(([productId, quantity]) => ({ productId, quantity }));
    console.log("orderProductInfoList : ", orderProductInfoList)

    fetch(BASE_PATH + "order", {
        method: 'POST',
        body: JSON.stringify({
            customerId,
            orderList: orderProductInfoList
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            
            throw new Error("Order isteği başarısız durum kodu : " + response.status)
        }
        return response.json()
    }).then(data => {
        console.log(data)
        clearCart();
    })
}

function clearCart(){
    cartItems = [];
    updateCart();
    updateOrderButtonVisiblity;
    const categorySelect = document.getElementById("categorySelect");
    fetchProductByCategory(categorySelect.value);
}

function updateOrderButtonVisiblity(){
    if(cartItems.length > 0){
        document.getElementById("orderButton").style.display = "block";
    }else {
        document.getElementById("orderButton").style.display = "none";  
    }
}

// sayfa yüklendiğinde ilk çalışan kod burası, html yüklendikten sonra category'leri çekiyor
document.addEventListener("DOMContentLoaded", async function() {
    updateOrderButtonVisiblity();
    await fetchCategories();

    const categorySelect = document.getElementById("categorySelect");
    
    // İlk kategoriyi seç ve ürünleri getir
    if (categorySelect.options.length > 0) {
        categorySelect.selectedIndex = 0;
        await fetchProductByCategory(categorySelect.value);
    }

    categorySelect.addEventListener("change", async function(){
        await fetchProductByCategory(categorySelect.value);
    });
});