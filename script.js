alert("Newest JavaScript loaded!");

// ================= MENU =================
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

// ================= BACK TO TOP =================
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

// ================= ANIMATION =================
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

// ================= ORDER FORM =================
const orderForm = document.getElementById("orderForm");

const scriptURL =
  "sheet.appendRow([
  "LC-" + Utilities.getUuid().substring(0,8),
  new Date(),
  data.name || "",
  data.phone || "",
  data.email || "",
  data.occasion || "",
  data.flavor || "",
  data.size || "",
  data.deliveryDate || "",
  data.deliveryTime || "",
  data.method || "",
  data.address || "",
  data.budget || "",
  data.notes || "",
  "Pending",
  data.imageURL || ""
]);";

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.clear();
  console.log("========== ORDER START ==========");

  try {
    let imageURL = "";

    const imageInput = document.getElementById("referenceImage");
    const imageFile = imageInput.files[0];

    console.log("Selected file:", imageFile);

    // ================= CLOUDINARY =================
    if (imageFile) {

      const uploadStatus = document.getElementById("uploadStatus");

      if (uploadStatus) {
        uploadStatus.innerText = "Uploading image...";
      }

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "lunascakes_upload");

      console.log("Uploading to Cloudinary...");

      const uploadResponse = await fetch(
        "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Cloudinary HTTP Status:", uploadResponse.status);

      const uploadResult = await uploadResponse.json();

      console.log("Cloudinary Response:", uploadResult);

      if (uploadResult.secure_url) {
        imageURL = uploadResult.secure_url;
      }

      console.log("Image URL:", imageURL);

      if (uploadStatus) {
        uploadStatus.innerText = "✅ Image uploaded successfully!";
      }
    } else {
      console.log("No image selected.");
    }

    // ================= ORDER DATA =================

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

    console.log("Order Data:");
    console.table(orderData);

    console.log("Sending order to Google Apps Script...");

    const response = await fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams(orderData),
    });

    console.log("Apps Script HTTP Status:", response.status);

    const result = await response.json();

    console.log("Apps Script Response:", result);

    if (result.result === "success") {
      alert("🎉 Thank you! Your order has been submitted.");
      orderForm.reset();

      const uploadStatus = document.getElementById("uploadStatus");
      if (uploadStatus) uploadStatus.innerText = "";
    } else {
      alert("There was an issue submitting your order.");
    }

  } catch (error) {
    console.error("FULL ERROR:", error);
    alert("Something went wrong.");
  }

  console.log("========== ORDER END ==========");
});
