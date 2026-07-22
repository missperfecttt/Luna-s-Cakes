function copyNumber(number){

    navigator.clipboard.writeText(number);

    alert("Copied: " + number);

}



const paymentForm = document.getElementById("paymentForm");


paymentForm.addEventListener("submit", function(e){

    e.preventDefault();


    const name =
    document.getElementById("customerName").value;


    const image =
    document.getElementById("paymentImage").files[0];



    if(!image){

        alert("Please upload your payment screenshot");

        return;

    }



    alert(
        "Thank you " + name +
        "! Your payment verification has been received."
    );



    paymentForm.reset();


});
