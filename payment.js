document.addEventListener("DOMContentLoaded", () => {
  const paymentForm   = document.getElementById("paymentForm");
  const telebirrBtn   = document.getElementById("telebirrBtn");
  const cbeBtn        = document.getElementById("cbeBtn");
  const paymentDetails = document.getElementById("paymentDetails");
  const receiptFileInput = document.getElementById("paymentScreenshot") || document.getElementById("receiptImage");

  const scriptURL       = "https://script.google.com/macros/s/AKfycbyGWqGNMa7BbM8PnZNsKF6GErNVxiWFYvbFocheSQMcUpL5ieVgprm3xgXFGxlyLtQEcg/exec";
  const cloudinaryUrl   = "https://api.cloudinary.com/v1_1/xpzpo4yy/image/upload";
  const cloudinaryPreset = "lunascakes_upload";

  // ---- Pre-fill name & phone from stored order ----
  const storedOrderRaw = localStorage.getItem("pendingOrder");
  if (storedOrderRaw) {
    try {
      const stored = JSON.parse(storedOrderRaw);
      const nameEl  = document.getElementById("name");
      const phoneEl = document.getElementById("phone");
      if (nameEl  && stored.name)  nameEl.value  = stored.name;
      if (phoneEl && stored.phone) phoneEl.value = stored.phone;
    } catch (_) {}
  }

  // ================= BANK CARD DATA =================
  const bankData = {
    telebirr: {
      title: "📱 Telebirr Direct Transfer",
      accountName: "Family Bakery (Abigail Mekonnen)",
      accountNo: "0988175522",
      label: "Phone Number:",
      instructions: "Open your Telebirr App → 'Send Money' or 'Pay Merchant' → enter the number below:"
    },
    cbe: {
      title: "🏦 Commercial Bank of Ethiopia (CBE)",
      accountName: "Family Bakery / Abigail Mekonnen",
      accountNo: "1000988175522",
      label: "Account Number:",
      instructions: "Use CBE Birr, Mobile Banking, or ATM to transfer to the account below:"
    }
  };

  // ================= RENDER PAYMENT DETAILS =================
  function renderPaymentDetails(providerKey) {
    const data = bankData[providerKey];
    if (!data || !paymentDetails) return;

    document.querySelectorAll(".payment-card").forEach(btn => btn.classList.remove("selected"));
    const activeBtn = document.getElementById(providerKey === "telebirr" ? "telebirrBtn" : "cbeBtn");
    if (activeBtn) activeBtn.classList.add("selected");

    paymentDetails.innerHTML = `
      <div class="bank-details-card">
        <h4>${data.title}</h4>
        <p class="bank-instructions">${data.instructions}</p>
        <div class="detail-row">
          <span class="detail-label">Recipient Name:</span>
          <span class="detail-val"><strong>${data.accountName}</strong></span>
        </div>
        <div class="detail-row copy-row">
          <span class="detail-label">${data.label}</span>
          <span class="detail-val target-number"><strong>${data.accountNo}</strong></span>
          <button type="button" class="btn-copy" id="copyNumberBtn" data-copy="${data.accountNo}">
            📋 Copy Number
          </button>
        </div>
        <div id="copyToast" class="copy-toast" style="display:none;">✓ Copied to clipboard!</div>
      </div>
    `;

    const copyBtn   = document.getElementById("copyNumberBtn");
    const copyToast = document.getElementById("copyToast");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(copyBtn.getAttribute("data-copy")).then(() => {
          copyBtn.textContent = "Copied! ✓";
          if (copyToast) copyToast.style.display = "block";
          setTimeout(() => {
            copyBtn.textContent = "📋 Copy Number";
            if (copyToast) copyToast.style.display = "none";
          }, 2500);
        }).catch(() => {
          copyBtn.textContent = "Use long-press to copy";
        });
      });
    }
  }

  // Attach click listeners to payment cards
  if (telebirrBtn) telebirrBtn.addEventListener("click", () => renderPaymentDetails("telebirr"));
  if (cbeBtn)      cbeBtn.addEventListener("click",      () => renderPaymentDetails("cbe"));

  // Auto-select Telebirr on load so details are always visible
  renderPaymentDetails("telebirr");

  // ================= RECEIPT FILE UPLOAD FEEDBACK =================
  if (receiptFileInput) {
    receiptFileInput.addEventListener("change", function () {
      const parent = this.closest(".custom-file-input");
      const hint   = parent ? parent.querySelector(".file-hint") : null;
      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;
        if (hint) {
          hint.textContent = "📎 Attached!";
          hint.classList.add("uploaded");
        }
        if (parent) parent.classList.add("has-file");
      } else {
        if (hint) {
          hint.textContent = "📄 Tap to upload payment receipt screenshot";
          hint.classList.remove("uploaded");
        }
        if (parent) parent.classList.remove("has-file");
      }
    });
  }

  // ================= QR CODE SUCCESS MODAL =================
  function showSuccessModal(orderId, email) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(orderId)}&bgcolor=ffffff&color=3B1554&margin=12`;

    const overlay = document.getElementById("successOverlay");
    if (!overlay) {
      alert("🎉 Order submitted!\n\nOrder ID: " + orderId);
      window.location.href = "index.html";
      return;
    }

    document.getElementById("qrOrderId").textContent    = orderId;
    document.getElementById("qrCodeImage").src          = qrUrl;
    document.getElementById("qrDownloadBtn").href       = qrUrl;
    document.getElementById("qrDownloadBtn").download   = `FamilyBakery-${orderId}-QR.png`;
    const emailNote = document.getElementById("qrEmailNote");
    if (emailNote) {
      emailNote.innerHTML = email
        ? `📧 A confirmation with this QR code has been sent to <strong>${email}</strong>`
        : "📧 Your order has been recorded successfully.";
    }

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  window.goHome = function () {
    window.location.href = "index.html";
  };

  window.downloadQR = async function () {
    const img = document.getElementById("qrCodeImage");
    if (!img) return;
    try {
      const resp = await fetch(img.src);
      const blob = await resp.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = document.getElementById("qrDownloadBtn").download || "order-qr.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {
      window.open(img.src, "_blank");
    }
  };

  // ================= PAYMENT FORM SUBMISSION =================
  if (!paymentForm) return;

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const storedOrder = localStorage.getItem("pendingOrder");
    if (!storedOrder) {
      alert("⚠️ No pending order found. Please fill out the order form first.");
      window.location.href = "index.html";
      return;
    }

    const pendingOrder = JSON.parse(storedOrder);

    if (!receiptFileInput || !receiptFileInput.files || !receiptFileInput.files[0]) {
      alert("⚠️ Please upload a screenshot of your payment receipt.");
      return;
    }

    const submitBtn     = paymentForm.querySelector("button[type='submit']");
    const origBtnText   = submitBtn ? submitBtn.textContent : "Submit Payment Verification";

    try {
      if (submitBtn) { submitBtn.textContent = "Uploading receipt..."; submitBtn.disabled = true; }

      const file = receiptFileInput.files[0];
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", cloudinaryPreset);

      const cloudRes = await fetch(cloudinaryUrl, { method: "POST", body: cloudinaryData });
      if (!cloudRes.ok) throw new Error("Receipt image upload failed. Please try again.");
      const cloudJson  = await cloudRes.json();
      const receiptUrl = cloudJson.secure_url || "";

      if (submitBtn) submitBtn.textContent = "Finalizing order...";

      const fullPayload = { ...pendingOrder, receiptUrl };
      const formData    = new URLSearchParams();
      for (const key in fullPayload) formData.append(key, fullPayload[key]);

      const response = await fetch(scriptURL, { method: "POST", body: formData });
      const result   = await response.json();

      if (result.result === "success") {
        localStorage.removeItem("pendingOrder");
        showSuccessModal(result.orderId, pendingOrder.email || "");
      } else {
        throw new Error(result.error || "Payment submission failed.");
      }

    } catch (err) {
      console.error("Payment Error:", err);
      alert("⚠️ Error: " + err.message);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origBtnText; }
    }
  });
});
