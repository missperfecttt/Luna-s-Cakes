const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("active");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
  });
});

const topBtn = document.getElementById("topBtn");

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

// Cloudinary Configuration
const cloudinaryUrl = "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";
const cloudinaryPreset = "luna_cakes_preset";

// Google Apps Script Web App URL
const scriptURL = "https://script.google.com/macros/s/AKfycbzIMVfgemHrnlx1GdFpjVuRTNbZoIThFgTEEsEqPi6ZkjBGW0SBTeWFY34dt7o_4p9L/exec";

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitButton = orderForm.querySelector("button[type='submit']");
  const fileInput = document.getElementById("referenceImage");
  const originalButtonText = submitButton.textContent;

  try {
    let imageUrl = "";

    // 1. If a reference image was uploaded, send it to Cloudinary first
    if (fileInput && fileInput.files && fileInput.files[0]) {
      submitButton.textContent = "Uploading image...";
      submitButton.disabled = true;

      const file = fileInput.files[0];
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", cloudinaryPreset);

      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: "POST",
        body: cloudinaryData
      });

      if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const cloudinaryResult = await cloudinaryResponse.json();
      imageUrl = cloudinaryResult.secure_url;
    }

    // 2. Submit order data (including image URL) to Google Sheets
    submitButton.textContent = "Placing order...";
    submitButton.disabled = true;

    const orderData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      occasion: document.getElementById("occasion").value,
      flavor: document.getElementById("flavor").value,
      size: document.getElementById("size").value,
      deliveryDate: document.getElementById("deliveryDate").value,
      deliveryTime: document.getElementById("deliveryTime").value,
      method: document.getElementById("method").value,
      address: document.getElementById("address").value,
      budget: document.getElementById("budget").value,
      notes: document.getElementById("notes").value,
      imageUrl: imageUrl
    };

    const response = await fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams(orderData)
    });

    const result = await response.json();

    if (result.result === "success") {
      alert("🎉 Thank you! Your order has been submitted.");
      orderForm.reset();
    } else {
      alert("There was an issue submitting your order. Please try again.");
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");
    console.error(error);
  } finally {
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
});
