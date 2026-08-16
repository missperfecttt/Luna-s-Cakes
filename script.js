// ================= CLOUDFLARE TURNSTILE CAPTCHA CALLBACKS =================
let turnstileToken = "";

// Called when Turnstile API script is loaded
function onTurnstileLoad() {
  // Widget is auto-rendered by the cf-turnstile class; callbacks handle state
  console.log("[Turnstile] Widget API loaded.");
}

// Called when user successfully completes the challenge
function onTurnstileSuccess(token) {
  turnstileToken = token;
  const btn = document.getElementById("submitOrderBtn");
  const status = document.getElementById("captchaStatus");
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
  if (status) {
    status.textContent = "✅ Security check passed! You may now place your order.";
    status.style.color = "#28a745";
  }
}

// Called when the Turnstile token expires (user took too long)
function onTurnstileExpired() {
  turnstileToken = "";
  const btn = document.getElementById("submitOrderBtn");
  const status = document.getElementById("captchaStatus");
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  }
  if (status) {
    status.textContent = "⚠️ Security check expired. Please complete it again.";
    status.style.color = "#e67e22";
  }
}

// Called when Turnstile encounters an error
function onTurnstileError() {
  turnstileToken = "";
  const btn = document.getElementById("submitOrderBtn");
  const status = document.getElementById("captchaStatus");
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  }
  if (status) {
    status.textContent = "❌ Security check failed. Please refresh the page and try again.";
    status.style.color = "#d9534f";
  }
}

// Navigation Mobile Menu Toggle
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

// Scroll to Top Button
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

// Intersection Observer for Animations
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

// ================= ENDPOINTS & CONFIG =================
// Configuration for external APIs have been moved to the Vercel backend

// ================= FILE UPLOAD DYNAMIC BUTTON FEEDBACK =================
const refImageInput = document.getElementById("referenceImage");
if (refImageInput) {
  refImageInput.addEventListener("change", function () {
    const parent = this.closest(".custom-file-input");
    const hint = parent ? parent.querySelector(".file-hint") : null;
    if (this.files && this.files.length > 0) {
      const fileName = this.files[0].name;
      if (hint) {
        hint.textContent = `✅ Attached: ${fileName}`;
        hint.classList.add("uploaded");
      }
      if (parent) parent.classList.add("has-file");
    } else {
      if (hint) {
        hint.textContent = "📷 Click to attach photo reference";
        hint.classList.remove("uploaded");
      }
      if (parent) parent.classList.remove("has-file");
    }
  });
}

// ================= PHASE 4: DYNAMIC DATE & CAPACITY LIMITS =================
let fullyBookedDates = [];

function setupDatePicker() {
  const dateInput = document.getElementById("deliveryDate");
  const dateHelp = document.getElementById("dateHelp");
  if (!dateInput) return;

  // Calculate 48 Hours Lead Time (Minimum 2 days from today)
  const now = new Date();
  const leadTimeDate = new Date(now.getTime() + (48 * 60 * 60 * 1000));
  
  // Format as YYYY-MM-DD
  const minDateStr = leadTimeDate.toISOString().split("T")[0];
  dateInput.min = minDateStr;

  // Fully booked dates are managed locally or updated manually
  // default to empty until an API is created
  fullyBookedDates = [];

  // Date selection validation listener
  dateInput.addEventListener("change", function () {
    const selectedDate = this.value;
    if (!selectedDate) return;

    // 1. Validate 48 Hours Minimum Lead Time
    if (selectedDate < minDateStr) {
      alert(`⚠️ Orders require at least 48 hours advance notice.\nPlease choose a date on or after ${minDateStr}.`);
      this.value = "";
      if (dateHelp) {
        dateHelp.textContent = `⚠️ Selected date is too soon! Minimum lead time is 48 hours (${minDateStr}).`;
        dateHelp.style.color = "#d9534f";
      }
      return;
    }

    // 2. Validate Daily Capacity Limit (Fully Booked Dates)
    if (fullyBookedDates.includes(selectedDate)) {
      alert(`❌ We are fully booked on ${selectedDate}!\nPlease select another delivery date.`);
      this.value = "";
      if (dateHelp) {
        dateHelp.textContent = `❌ ${selectedDate} is fully booked! Please pick a different date.`;
        dateHelp.style.color = "#d9534f";
      }
      return;
    }

// IndexedDB Helper to save files
function saveToDB(key, file) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LunaCakes", 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("files");
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

// Reset date help indicator if date is valid
    if (dateHelp) {
      dateHelp.textContent = "✅ Date available! (Minimum 48 hours lead time met)";
      dateHelp.style.color = "#28a745";
    }
  });
}

document.addEventListener("DOMContentLoaded", setupDatePicker);

// ================= ORDER FORM SUBMIT =================
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Anti-Spam Check
    const cfToken = turnstileToken ||
      (document.querySelector('[name="cf-turnstile-response"]')?.value) || "";

    if (!cfToken) {
      const status = document.getElementById("captchaStatus");
      if (status) {
        status.textContent = "⚠️ Please complete the security verification check first!";
        status.style.color = "#d9534f";
      }
      alert("⚠️ Please complete the security verification check before submitting your order.");
      return;
    }

    const submitButton = orderForm.querySelector("button[type='submit']");
    const fileInput = document.getElementById("referenceImage");
    const originalButtonText = submitButton ? submitButton.textContent : "Place Order";

    try {
      if (submitButton) {
        submitButton.textContent = "Processing...";
        submitButton.disabled = true;
      }

      // 2. Save Reference Image to IndexedDB (If attached)
      if (fileInput && fileInput.files && fileInput.files[0]) {
        await saveToDB("inspiration", fileInput.files[0]);
      } else {
        await saveToDB("inspiration", null); // clear old
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
        "cf-turnstile-response": cfToken
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
