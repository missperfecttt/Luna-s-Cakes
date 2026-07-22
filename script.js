const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
    });
  });
}

const topBtn = document.getElementById("topBtn");
if (topBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      topBtn.style.display = "block";
    } else {
      topBtn.style.display = "none";
    }
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
});

document.querySelectorAll(".section, .card, .review").forEach((el) => {
  el.classList.add("fade-in");
  observer.observe(el);
});

const orderForm = document.getElementById("orderForm");

// ================= CLOUDINARY =================
const cloudinaryUrl =
  "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";

const cloudinaryPreset = "lunascakes_upload";

// ================= GOOGLE APPS SCRIPT =================
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxZmJQAm3qaO68x8Aw6wY8NeSVxVMgB0g3cRxcu0CoxsLeYSH9bMWCS9RyPnj8bBokWzw/exec";

// ================= ORDER FORM SUBMIT =================
if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = orderForm.querySelector("button[type='submit']");
    const fileInput = document.getElementById("referenceImage");
    const originalButtonText = submitButton ? submitButton.textContent : "Place Order";

    try {
      let imageUrl = "";

      // ================= Upload Cake Image (if selected) =================
      if (fileInput && fileInput.files && fileInput.files[0]) {
        if (submitButton) {
          submitButton.textContent = "Uploading image...";
          submitButton.disabled = true;
        }

        const file = fileInput.files[0];
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", file);
        cloudinaryData.append("upload_preset", cloudinaryPreset);

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
          method: "POST",
          body: cloudinaryData,
        });

        if (!cloudinaryResponse.ok) {
          throw new Error("Failed to upload image to Cloudinary");
        }

        const cloudinaryResult = await cloudinaryResponse.json();
        imageUrl = cloudinaryResult.secure_url || "";
      }

      // ================= Prepare Order Data =================
      if (submitButton) {
        submitButton.textContent = "Placing order...";
        submitButton.disabled = true;
      }

      const orderData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email") ? document.getElementById("email").value.trim() : "",
        occasion: document.getElementById("occasion").value,
        flavor: document.getElementById("flavor").value,
        size: document.getElementById("size").value,
        deliveryDate: document.getElementById("deliveryDate").value,
        deliveryTime: document.getElementById("deliveryTime").value,
        method: document.getElementById("method").value,
        address: document.getElementById("address") ? document.getElementById("address").value.trim() : "",
        budget: document.getElementById("budget") ? document.getElementById("budget").value : "",
        notes: document.getElementById("notes") ? document.getElementById("notes").value.trim() : "",
        imageUrl: imageUrl
      };

      console.log("Sending Order Data:", orderData);

      // ================= Send Order to Apps Script =================
      const response = await fetch(scriptURL, {
        method: "POST",
        body: new URLSearchParams(orderData),
      });

      if (!response.ok) {
        throw new Error("Server responded with error status: " + response.status);
      }

      const result = await response.json();
      console.log("Google Apps Script Result:", result);

      if (result.result === "success") {
        alert("🎉 Order submitted successfully!\n\nYour Order ID is: " + result.orderId);
        
        // Save Order ID for payment page
        localStorage.setItem("orderId", result.orderId);

        // Save customer contact info for convenience on payment page
        localStorage.setItem("customerName", orderData.name);
        localStorage.setItem("customerPhone", orderData.phone);

        // Redirect to Payment Verification page
        window.location.href = "payment.html";
      } else {
        throw new Error(result.error || "Server returned failure result");
      }

    } catch (error) {
      console.error("Order Submission Error:", error);
      alert("⚠️ Something went wrong while submitting your order: " + error.message);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}
