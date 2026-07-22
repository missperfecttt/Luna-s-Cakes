const paymentForm = document.getElementById("paymentForm");


const paymentScriptURL =
"PASTE_YOUR_PAYMENT_APPS_SCRIPT_URL_HERE";


const cloudinaryURL =
"https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";


const uploadPreset =
"lunascakes_upload";



paymentForm.addEventListener("submit", async(e)=>{


e.preventDefault();



let screenshotURL="";



const file =
document.getElementById("paymentScreenshot")
.files[0];



try{


if(file){


const formData = new FormData();


formData.append(
"file",
file
);


formData.append(
"upload_preset",
uploadPreset
);



const upload =
await fetch(
cloudinaryURL,
{
method:"POST",
body:formData
}
);



const result =
await upload.json();



screenshotURL =
result.secure_url;


}



const paymentData = {


name:
document.getElementById("name").value,


phone:
document.getElementById("phone").value,


paymentMethod:
document.getElementById("paymentMethod").value,


screenshotURL:screenshotURL


};



const response =
await fetch(
paymentScriptURL,
{

method:"POST",

body:
new URLSearchParams(paymentData)

}

);



const data =
await response.json();



if(data.result==="success"){


alert(
"Payment verification submitted successfully!"
);


paymentForm.reset();


}
else{

alert(
"Something went wrong"
);

}



}

catch(error){

console.log(error);

alert(
"Error submitting payment"
);

}


});
