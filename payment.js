const paymentForm = document.getElementById("paymentForm");

const paymentDetails = document.getElementById("paymentDetails");

let selectedPayment = "";


// ================= TELEBIRR =================

document.getElementById("telebirrBtn").onclick = () => {

    selectedPayment = "Telebirr";

    paymentDetails.innerHTML = `

    <h3>📱 Telebirr Payment</h3>

    <p>
    <b>Name:</b> Abigail Mekonnen
    </p>

    <p>
    <b>Phone Number:</b> +251988175522
    </p>

    <p>
    After payment, upload the screenshot below.
    </p>

    `;

};



// ================= CBE =================


document.getElementById("cbeBtn").onclick = () => {

    selectedPayment = "CBE";

    paymentDetails.innerHTML = `

    <h3>🏦 Commercial Bank of Ethiopia</h3>

    <p>
    <b>Account Name:</b> Abigail Mekonnen
    </p>

    <p>
    <b>Account Number:</b> 1000452634388
    </p>

    <p>
    After payment, upload the screenshot below.
    </p>

    `;

};



// ================= GOOGLE APPS SCRIPT =================


const paymentScriptURL =
"https://script.google.com/macros/s/AKfycbwflRxtcmySNkahi5e4JDCOoorNwolYHMK7x9hhrSPWHDJxRjPdlW_tGDyQnELbfG1M8g/exec";




// ================= CLOUDINARY =================


const cloudinaryURL =
"https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";


const uploadPreset =
"lunascakes_upload";





// ================= SUBMIT =================


paymentForm.addEventListener("submit", async(e)=>{


e.preventDefault();



if(selectedPayment===""){

alert("Please select Telebirr or CBE first.");

return;

}



const file =
document.getElementById("paymentScreenshot").files[0];



if(!file){

alert("Please upload your payment screenshot.");

return;

}



const submitBtn =
document.getElementById("submitBtn");



submitBtn.disabled=true;

submitBtn.innerHTML="Uploading Payment...";

submitBtn.classList.add("loading");



try{


// Upload screenshot to Cloudinary


const formData=new FormData();


formData.append("file",file);

formData.append(
"upload_preset",
uploadPreset
);



const uploadResponse =
await fetch(
cloudinaryURL,
{
method:"POST",
body:formData
}
);



const image =
await uploadResponse.json();



if(!image.secure_url){

throw new Error("Image upload failed");

}



console.log("Screenshot URL:", image.secure_url);




// Send verification data to Google Sheets


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




console.log("Sending payment data:", paymentData);



const response =
await fetch(
paymentScriptURL,
{

method:"POST",

body:
new URLSearchParams(paymentData)

}

);



console.log(
"Google Script Status:",
response.status
);



const result =
await response.json();



console.log(
"Google Script Response:",
result
);




if(result.result==="success"){



submitBtn.innerHTML=
"✅ Submitted Successfully!";


submitBtn.classList.add("success");



alert(
"Payment verification submitted successfully!"
);



paymentForm.reset();



selectedPayment="";



}

else{


throw new Error(
"Google Script returned error"
);


}



}



catch(error){


console.error(
"FULL ERROR:",
error
);



alert(
"Something went wrong. Please try again."
);



submitBtn.disabled=false;

submitBtn.innerHTML=
"Submit Verification";

submitBtn.classList.remove("loading");


}



});
