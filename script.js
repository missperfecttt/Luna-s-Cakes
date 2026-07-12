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
  "https://script.google.com/macros/s/AKfycbw9iiTZ6FfS3aN14hNs2z2gc-WRB11hVvKepAEH9y-g55q4gZdvEHIL3ZNunvPjy1YI/exec";

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const orderData = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    occasion: document.getElementById("occasion").value,
    deliveryDate: document.getElementById("deliveryDate").value,
    notes: document.getElementById("notes").value,
  };

  try {
    const response = await fetch(scriptURL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.result === "success") {
      alert("🎉 Thank you! Your order has been submitted.");

      orderForm.reset();
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");

    console.error(error);
  }
});
