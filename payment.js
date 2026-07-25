document.addEventListener("DOMContentLoaded", () => {
  const paymentForm = document.getElementById("paymentForm");

  // Replace with your current Google Apps Script Exec Web App URL
  const scriptURL = "https://script.google.com/macros/s/AKfycbz4QFJfVynRDT9f_-wL-2m-6AWoYmYWpXgIOYbWPbta45v2irp13S-CfRLXK8y5S8wp1w/exec";
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";
  const cloudinaryPreset = "lunascakes_upload";

  if (!paymentForm) return;

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const storedOrder = localStorage.getItem("pendingOrder");
    if (!storedOrder) {
      alert("⚠️ No pending order details found. Please fill out the order form first.");
      window.location.href = "index.html";
      return;
    }

    const pendingOrder = JSON.parse(storedOrder);
    const receiptFileInput = document.getElementById("receiptImage") || document.getElementById("receiptScreenshot");

    if (!receiptFileInput || !receiptFileInput.files || !receiptFileInput.files[0]) {
      alert("⚠️ Please upload a screenshot of your payment receipt.");
      return;
    }

    const submitBtn = paymentForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn ? submitBtn.textContent : "Submit Payment";

    try {
      if (submitBtn) {
        submitBtn.textContent = "Uploading receipt...";
        submitBtn.disabled = true;
      }

      // 1. Upload Payment Receipt Screenshot to Cloudinary
      const file = receiptFileInput.files[0];
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", cloudinaryPreset);

      const cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: cloudinaryData
      });

      if (!cloudRes.ok) {
        throw new Error("Receipt image upload failed. Please try uploading again.");
      }

      const cloudJson = await cloudRes.json();
      const receiptUrl = cloudJson.secure_url || "";

      if (submitBtn) {
        submitBtn.textContent = "Finalizing order...";
      }

      // 2. Combine Pending Order with Receipt URL
      const fullPayload = {
        ...pendingOrder,
        receiptUrl: receiptUrl
      };

      const formData = new URLSearchParams();
      for (const key in fullPayload) {
        formData.append(key, fullPayload[key]);
      }

      // 3. Send Everything to Google Sheet
      const response = await fetch(scriptURL, {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.result === "success") {
        alert("🎉 Payment submitted successfully!\n\nYour official Order ID is: " + result.orderId + "\nAn email confirmation has been sent to " + (pendingOrder.email || "your email"));
        localStorage.removeItem("pendingOrder"); // Clear local storage after successful submit
        window.location.href = "index.html";
      } else {
        throw new Error(result.error || "Payment submission failed.");
      }

    } catch (err) {
      console.error("Payment Submission Error:", err);
      alert("⚠️ Error submitting payment: " + err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
});
