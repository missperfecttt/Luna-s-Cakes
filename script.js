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

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const scriptURL =
  "https://script.google.com/macros/s/AKfycbwHBzNpRRKF2Bi8wQIjEmEdBTJY3xJhO0gydXvHjjmzZ6zjOE-yP02esAQOAHcD6UQw/exec";

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

 let imageURL = "";

const imageFile = document.getElementById("referenceImage").files[0];

if (imageFile) {
  document.getElementById("uploadStatus").innerText = "Uploading image...";

  const formData = new FormData();

  formData.append("file", imageFile);
  formData.append("upload_preset", "lunascakes_upload");

  const uploadResponse = await fetch(
    "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadResult = await uploadResponse.json();

  imageURL = uploadResult.secure_url;

  document.getElementById("uploadStatus").innerText =
    "✅ Image uploaded successfully!";
}

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
  imageURL: imageURL,
};
  try {
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
  }
});
