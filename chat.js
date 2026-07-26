document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.getElementById("chatButton");
  const chatWindow = document.getElementById("chatWindow");
  const closeChat = document.getElementById("closeChat");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  if (!chatButton || !chatWindow) return;

  // Toggle Chat Window
  chatButton.addEventListener("click", () => {
    chatWindow.classList.toggle("active");
    const badge = chatButton.querySelector(".chat-badge");
    if (badge) badge.style.display = "none";
  });

  if (closeChat) {
    closeChat.addEventListener("click", () => {
      chatWindow.classList.remove("active");
    });
  }

  // Quick Chips Click Event
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      const query = e.target.getAttribute("data-query") || e.target.textContent;
      handleUserMessage(query);
    });
  });

  // Send Button Click
  if (sendBtn && chatInput) {
    sendBtn.addEventListener("click", () => {
      const text = chatInput.value.trim();
      if (text) {
        handleUserMessage(text);
        chatInput.value = "";
      }
    });

    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const text = chatInput.value.trim();
        if (text) {
          handleUserMessage(text);
          chatInput.value = "";
        }
      }
    });
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender);
    
    const textDiv = document.createElement("div");
    textDiv.classList.add("msg-text");
    textDiv.innerHTML = text;
    
    msgDiv.appendChild(textDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleUserMessage(messageText) {
    appendMessage("user", messageText);

    setTimeout(() => {
      const reply = getBotReply(messageText.toLowerCase());
      appendMessage("bot", reply);
    }, 500);
  }

  function getBotReply(q) {
    if (q.includes("price") || q.includes("cost") || q.includes("money") || q.includes("💰")) {
      return "🍰 <strong>Pricing Overview:</strong><br>• Belgian Chocolate: From 1,000 ETB<br>• Classic Layer: From 1,200 ETB<br>• Graduation & Gala Tier: From 1,500 ETB<br><br>Exact prices depend on custom size and design choices!";
    } else if (q.includes("flavor") || q.includes("flavour") || q.includes("taste") || q.includes("🎂")) {
      return "🎂 <strong>Our Popular Flavors:</strong><br>• Vanilla Sponge<br>• Chocolate Fudge<br>• Red Velvet<br>• Strawberry Cream<br>• Espresso Coffee<br>• Lemon Zest";
    } else if (q.includes("delivery") || q.includes("ship") || q.includes("pickup") || q.includes("🚚")) {
      return "🚚 <strong>Delivery & Pickup Info:</strong><br>We deliver anywhere within Addis Ababa! You can also select 'Pickup' at checkout to pick up your cake directly from our bakery.";
    } else if (q.includes("payment") || q.includes("pay") || q.includes("telebirr") || q.includes("cbe") || q.includes("💳")) {
      return "💳 <strong>Payment Options:</strong><br>We accept <strong>Telebirr</strong> and <strong>CBE (Commercial Bank of Ethiopia)</strong> transfers. Once you place an order, you will receive an Order ID to complete payment verification!";
    } else if (q.includes("order") || q.includes("how") || q.includes("📋")) {
      return "📋 <strong>How to Order:</strong><br>1. Scroll to the <strong>Order Form</strong> section.<br>2. Fill in your cake details and schedule.<br>3. Submit to receive your <strong>Order ID</strong>.<br>4. Complete payment on the verification page!";
    } else {
      return "Thank you for reaching out! You can place an order directly using the Order Form on this page, or contact us on WhatsApp (+251-988175522) for custom requests! 🍰";
    }
  }
});
