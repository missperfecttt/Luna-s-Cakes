const paymentForm = document.getElementById("paymentForm");
const paymentDetails = document.getElementById("paymentDetails");
const orderIdBadge = document.getElementById("orderIdBadge");
const telebirrBtn = document.getElementById("telebirrBtn");
const cbeBtn = document.getElementById("cbeBtn");

let selectedPayment = "";

// Display stored Order ID and auto-fill saved info if available
document.addEventListener("DOMContentLoaded", () => {
  const storedOrderId = localStorage.getItem("orderId");
  const storedName = localStorage.getItem("customerName");
  const storedPhone = localStorage.getItem("customerPhone");

  if (storedOrderId && orderIdBadge) {
    orderIdBadge.textContent = "Order ID: " + storedOrderId;
    orderIdBadge.style.display = "inline-block";
  }

  if (storedName && document.getElementById("name")) {
    document.getElementById("name").value = storedName;
  }

  if (storedPhone && document.getElementById("phone")) {
    document.getElementById("phone").value = storedPhone;
  }
});

// ================= TELEBIRR =================
if (telebirrBtn) {
  telebirrBtn.onclick = () => {
    selectedPayment = "Telebirr";
    telebirrBtn.classList.add("selected");
    if (cbeBtn) cbeBtn.classList.remove("selected");

    paymentDetails.innerHTML = `
      <h3>📱 Telebirr Payment</h3>
      <p><b>Name:</b> Abigail Mekonnen</p>
      <p><b>Phone Number:</b> +251988175522</p>
      <p><i>After making payment, please upload your receipt screenshot below.</i></p>
    `;
  };
}

// ================= CBE =================
if (cbeBtn) {
  cbeBtn.onclick = () => {
    selectedPayment = "CBE";
    cbeBtn.classList.add("selected");
    if (telebirrBtn) telebirrBtn.classList.remove("selected");

    paymentDetails.innerHTML = `
      <h3>🏦 Commercial Bank of Ethiopia</h3>
      <p><b>Account Name:</b> Abigail Mekonnen</p>
      <p><b>Account Number:</b> 1000452634388</p>
      <p><i>After making payment, please upload your receipt screenshot below.</i></p>
    `;
  };
}

// ================= GOOGLE APPS SCRIPT =================
// Note: Use the single combined Web App URL for both orders and payments
const paymentScriptURL =
  "https://script.google.com/macros/s/AKfycbxZmJQAm3qaO68x8Aw6wY8NeSVxVMgB0g3cRxcu0CoxsLeYSH9bMWCS9RyPnj8bBokWzw/exec";

// ================= CLOUDINARY =================
const cloudinaryURL =
  "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";

const uploadPreset = "lunascakes_upload";

// ================= SUBMIT PAYMENT =================
if (paymentForm) {
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const orderId = localStorage.getItem("orderId");
    if (!orderId) {
      alert("⚠️ Order ID not found. Please place an order first before submitting payment.");
      window.location.href = "index.html#order";
      return;
    }

    if (selectedPayment === "") {
      alert("Please select a payment method (Telebirr or CBE) first.");
      return;
    }

    const fileInput = document.getElementById("paymentScreenshot");
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
      alert("Please upload your payment screenshot.");
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    const originalText = submitBtn ? submitBtn.innerHTML : "Submit Verification";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Uploading Payment Screenshot...";
      submitBtn.classList.add("loading");
    }

    try {
      // 1. Upload screenshot to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const uploadResponse = await fetch(cloudinaryURL, {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Image upload to Cloudinary failed");
      }

      const image = await uploadResponse.json();

      if (!image.secure_url) {
        throw new Error("Image upload failed: secure URL not returned");
      }

      console.log("Screenshot uploaded to Cloudinary:", image.secure_url);

      // 2. Send verification data to Google Apps Script
      const paymentData = {
        type: "payment",
        orderId: orderId,
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        paymentMethod: selectedPayment,
        screenshotURL: image.secure_url
      };

      console.log("Sending payment verification payload:", paymentData);

      if (submitBtn) {
        submitBtn.innerHTML = "Updating Order Record...";
      }

      const response = await fetch(paymentScriptURL, {
        method: "POST",
        body: new URLSearchParams(paymentData)
      });

      if (!response.ok) {
        throw new Error("Server responded with error status: " + response.status);
      }

      const result = await response.json();
      console.log("Google Apps Script payment response:", result);

      if (result.result === "success") {
        if (submitBtn) {
          submitBtn.innerHTML = "✅ Submitted Successfully!";
          submitBtn.classList.remove("loading");
          submitBtn.classList.add("success");
        }

        alert("🎉 Payment verification submitted successfully!\n\nYour order (" + orderId + ") has been updated.");

        paymentForm.reset();
        selectedPayment = "";
        if (telebirrBtn) telebirrBtn.classList.remove("selected");
        if (cbeBtn) cbeBtn.classList.remove("selected");
        if (paymentDetails) {
          paymentDetails.innerHTML = "<p>Select a payment method above to view payment instructions.</p>";
        }
      } else {
        throw new Error(result.error || "Google Script returned an error");
      }

    } catch (error) {
      console.error("Payment Submission Error:", error);
      alert("⚠️ Something went wrong with payment submission: " + error.message);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.classList.remove("loading", "success");
      }
    }
  });
}
