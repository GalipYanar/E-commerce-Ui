const BASE_PATH = "http://localhost:8080/"

function submitForm(){
    const formData= {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        lastName: document.getElementById('lastName').value,
        adress:{
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            district: document.getElementById('district').value,
            postCode: document.getElementById('postCode').value,
            adressLine: document.getElementById('adressLine').value
        }
    };

    fetch(BASE_PATH + "customer/register", {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(!response.ok){
            throw new Error("Kayıt işlemi başarısız oldu, durum kodu: " + response.status)
        }
        return response.json()
    }).then(data => {
        window.location.href = "login.html"
    }).catch(error => {
        console.error('Error', error);
    });
}