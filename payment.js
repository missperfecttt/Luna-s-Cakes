const paymentForm = document.getElementById("paymentForm");

const paymentDetails = document.getElementById("paymentDetails");

let selectedPayment = "";



document.getElementById("telebirrBtn").onclick = () => {


selectedPayment = "Telebirr";


paymentDetails.innerHTML = `

<h3>📱 Telebirr Payment</h3>

<p>
<b>Name:</b> Abigail Mekonnen
</p>

<p>
<b>Phone Number:</b> YOUR_TELEBIRR_NUMBER
</p>

<p>
After payment, upload the screenshot below.
</p>

`;

};



document.getElementById("cbeBtn").onclick = () => {


selectedPayment = "CBE";


paymentDetails.innerHTML = `

<h3>🏦 Commercial Bank of Ethiopia</h3>


<p>
<b>Account Name:</b> Abigail Mekonnen
</p>


<p>
<b>Account Number:</b> YOUR_CBE_ACCOUNT
</p>


<p>
After payment, upload the screenshot below.
</p>

`;

};





const paymentScriptURL =
"YOUR_PAYMENT_SCRIPT_URL";



const cloudinaryURL =
"https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";


const uploadPreset =
"lunascakes_upload";




paymentForm.addEventListener("submit", async(e)=>{


e.preventDefault();



if(selectedPayment===""){

alert("Please select Telebirr or CBE first.");

return;

}



const submitBtn =
document.getElementById("submitBtn");


submitBtn.disabled=true;

submitBtn.innerHTML="Uploading Payment...";

submitBtn.classList.add("loading");



try{


const file =
document.getElementById("paymentScreenshot").files[0];



const formData=new FormData();


formData.append("file",file);

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



const image =
await upload.json();




const paymentData={


name:
document.getElementById("name").value,


phone:
document.getElementById("phone").value,


paymentMethod:
selectedPayment,


screenshotURL:
image.secure_url


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



const result =
await response.json();




if(result.result==="success"){


submitBtn.innerHTML="✅ Submitted Successfully!";


submitBtn.classList.add("success");


alert(
"Payment verification submitted successfully!"
);



paymentForm.reset();


}

}



catch(error){


console.log(error);


alert(
"Something went wrong"
);


submitBtn.disabled=false;

submitBtn.innerHTML="Submit Verification";


}


});
