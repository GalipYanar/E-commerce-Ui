const jwtToken = localStorage.getItem("jwtToken"); //login ekranında set ettiğimiz token ı burada çekip kullanıyoruz
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

document.addEventListener("DOMContentLoaded", async function() {
    await fetchCategories();
    
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.addEventListener("change", async function(){
        await fetchProductByCategory(categorySelect.value);
    });
})