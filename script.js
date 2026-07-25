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

// ================= INPUT SANITIZATION =================
function sanitizeInput(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const orderForm = document.getElementById("orderForm");

// ================= ENDPOINTS =================
const cloudinaryUrl = "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";
const cloudinaryPreset = "lunascakes_upload";

// ================= ORDER FORM SUBMIT =================
if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Anti-Spam Check
    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;
    if (!turnstileResponse) {
      alert("⚠️ Please complete the security verification check before submitting your order.");
      return;
    }

    const submitButton = orderForm.querySelector("button[type='submit']");
    const fileInput = document.getElementById("referenceImage");
    const originalButtonText = submitButton ? submitButton.textContent : "Place Order";

    try {
      let imageUrl = "";

      // 2. Upload Reference Image to Cloudinary (If attached)
      if (fileInput && fileInput.files && fileInput.files[0]) {
        if (submitButton) {
          submitButton.textContent = "Uploading image...";
          submitButton.disabled = true;
        }

        const file = fileInput.files[0];
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", file);
        cloudinaryData.append("upload_preset", cloudinaryPreset);

        try {
          const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: "POST",
            body: cloudinaryData,
          });

          if (cloudinaryResponse.ok) {
            const cloudinaryResult = await cloudinaryResponse.json();
            imageUrl = cloudinaryResult.secure_url || "";
          }
        } catch (imgErr) {
          console.error("Cloudinary error:", imgErr);
        }
      }

      // 3. Save Order Details Temporarily in Browser Storage
      const pendingOrder = {
        name: sanitizeInput(document.getElementById("name").value.trim()),
        phone: sanitizeInput(document.getElementById("phone").value.trim()),
        email: sanitizeInput(document.getElementById("email") ? document.getElementById("email").value.trim() : ""),
        occasion: document.getElementById("occasion").value,
        flavor: document.getElementById("flavor").value,
        size: document.getElementById("size").value,
        deliveryDate: document.getElementById("deliveryDate").value,
        deliveryTime: document.getElementById("deliveryTime").value,
        method: document.getElementById("method").value,
        address: sanitizeInput(document.getElementById("address") ? document.getElementById("address").value.trim() : ""),
        budget: document.getElementById("budget") ? document.getElementById("budget").value : "",
        notes: sanitizeInput(document.getElementById("notes") ? document.getElementById("notes").value.trim() : ""),
        imageUrl: imageUrl
      };

      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      // Redirect directly to payment page
      window.location.href = "payment.html";

    } catch (error) {
      console.error("Submission Error:", error);
      alert("⚠️ Notice: " + error.message);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}
