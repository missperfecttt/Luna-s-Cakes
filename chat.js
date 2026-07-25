/* ==========================================================================
   LUNA'S CAKES — ARTISANAL CHATBOT LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const chatButton = document.getElementById("chatButton");
    const chatWindow = document.getElementById("chatWindow");
    const closeChat = document.getElementById("closeChat");
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatBadge = document.querySelector(".chat-badge");
    const chatTooltip = document.querySelector(".chat-tooltip");

    if (!chatButton || !chatWindow || !chatMessages || !chatInput || !sendBtn) {
        console.warn("Chatbot elements missing from DOM.");
        return;
    }

    // Hide tooltip after 8 seconds
    if (chatTooltip) {
        setTimeout(() => {
            chatTooltip.style.opacity = "0";
        }, 8000);
    }

    // Toggle Chat Window
    function toggleChat() {
        const isOpen = chatWindow.classList.contains("active");
        if (isOpen) {
            chatWindow.classList.remove("active");
        } else {
            chatWindow.classList.add("active");
            if (chatBadge) chatBadge.style.display = "none";
            if (chatTooltip) chatTooltip.style.display = "none";
            chatInput.focus();
            scrollToBottom();
        }
    }

    chatButton.addEventListener("click", toggleChat);

    if (closeChat) {
        closeChat.addEventListener("click", (e) => {
            e.stopPropagation();
            chatWindow.classList.remove("active");
        });
    }

    // Format current time
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Scroll chat to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add message bubble to UI
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = sender;

        const timeStr = getCurrentTime();

        if (sender === "user") {
            msgDiv.innerHTML = `
                <div class="msg-text">${escapeHTML(text)}</div>
                <span class="msg-time">${timeStr}</span>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="msg-text">${text}</div>
                <span class="msg-time">${timeStr}</span>
            `;
        }

        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    // Sanitize user text for security
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Show bot typing indicator
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.id = "typingIndicator";
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById("typingIndicator");
        if (indicator) {
            indicator.remove();
        }
    }

    // Match query to rich bot responses
    function getBotReply(userQuery) {
        const q = userQuery.toLowerCase().trim();

        // Prices & Sizes
        if (q.includes("price") || q.includes("cost") || q.includes("how much") || q.includes("rate") || q.includes("etb") || q.includes("birr") || q.includes("money") || q.includes("tier")) {
            return `
                Our gourmet cakes start from <strong>1,000 ETB</strong>:
                <br><br>
                • <strong>6 Inch</strong> (6-8 Servings): 1,000 ETB<br>
                • <strong>8 Inch</strong> (12-15 Servings): 1,200 ETB<br>
                • <strong>10 Inch</strong> (20-25 Servings): 1,500 ETB<br>
                • <strong>12 Inch+ / Multi-Tier</strong>: Custom Quote
                <br><br>
                <em>Prices vary based on flavor complexity & design detailing!</em>
            `;
        }

        // Flavors
        if (q.includes("flavor") || q.includes("flavour") || q.includes("taste") || q.includes("chocolate") || q.includes("vanilla") || q.includes("velvet") || q.includes("menu") || q.includes("type")) {
            return `
                🎂 Our popular signature cake flavors include:
                <br><br>
                • 🍫 <strong>Belgian Dark Chocolate Ganache</strong><br>
                • 🎂 <strong>Classic Vanilla & Berry Compote</strong><br>
                • 🍓 <strong>Velvet Red Velvet & Cream Cheese</strong><br>
                • ☕ <strong>Espresso Coffee Infusion</strong><br>
                • 🍋 <strong>Zesty Fresh Lemon Buttercream</strong>
                <br><br>
                
            `;
        }

        // Delivery
        if (q.includes("deliver") || q.includes("ship") || q.includes("location") || q.includes("bring") || q.includes("addis") || q.includes("pickup") || q.includes("where")) {
            return `
                🚚 <strong>Delivery & Fulfillment Info:</strong>
                <br><br>
                • We deliver across all sub-cities in <strong>Addis Ababa</strong>!<br>
                • <strong>Self-Pickup</strong> is also available from our main bakery desk.<br>
                • Delivery cost depends on exact location.
                <br><br>
                You can select pickup or delivery directly on our order form!
            `;
        }

        // Payment
        if (q.includes("pay") || q.includes("payment") || q.includes("telebirr") || q.includes("cbe") || q.includes("bank") || q.includes("card") || q.includes("transfer")) {
            return `
                💳 <strong>Payment Options:</strong>
                <br><br>
                We accept fast & secure digital transfers:
                <br>
                • 📲 <strong>Telebirr</strong> Mobile Payment<br>
                • 🏦 <strong>CBE (Commercial Bank of Ethiopia)</strong>
                <br><br>
                Once you place your order form, you will be taken to our secure payment verification screen!
            `;
        }

        // How to Order / Ordering process
        if (q.includes("order") || q.includes("buy") || q.includes("book") || q.includes("how to") || q.includes("process") || q.includes("form")) {
            return `
                📋 <strong>How to Place an Order:</strong>
                <br><br>
                1. Scroll to the <strong>Order Form</strong> on this page.<br>
                2. Fill in your contact info, occasion, flavor & size.<br>
                3. (Optional) Upload an inspiration photo of your design!<br>
                4. Submit and proceed to complete payment.
                
            `;
        }

        // Contact & Socials
        if (q.includes("contact") || q.includes("phone") || q.includes("call") || q.includes("whatsapp") || q.includes("number") || q.includes("email") || q.includes("reach")) {
            return `
                📞 <strong>Get in Touch:</strong>
                <br><br>
                • 💬 <strong>WhatsApp / Phone:</strong> +251 988 175 522<br>
                • 📧 <strong>Email:</strong> abigailmekonnen70@gmail.com<br>
                • 📍 <strong>Location:</strong> Addis Ababa, Ethiopia
                <br><br>
                Click the WhatsApp button at the bottom of the page to chat live with our bakers!
            `;
        }

        // Hours & Availability
        if (q.includes("hour") || q.includes("time") || q.includes("open") || q.includes("available") || q.includes("when") || q.includes("work")) {
            return `
                ⏰ <strong>Operating Hours:</strong>
                <br><br>
                • Website Orders: <strong>24/7</strong><br>
                • Bakery Support & Customer Care: Mon–Sat, 8:00 AM – 7:00 PM EAT
            `;
        }

        // Greetings
        if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("selam") || q.includes("good morning") || q.includes("good evening")) {
            return `
                👋 Hello! Welcome to <strong>Luna's Cakes</strong>!
                <br><br>
                How can I assist you today with your cake order?
            `;
        }

        // Thank you
        if (q.includes("thank") || q.includes("thanks") || q.includes("awesome") || q.includes("great") || q.includes("good")) {
            return `
                You're very welcome! 😊🍰 Let us know if you need anything else or feel free to submit your order form below!
            `;
        }

        // Fallback default for off-topic / unknown questions
        return `
            Thank you for reaching out! 😊 
            <br><br>
            I am specifically designed to assist with <strong>Luna's Cakes bakery inquiries</strong> (such as prices, flavors, delivery, payments, and ordering).
            <br><br>
            For further assistance or specialized questions, please feel free to contact us directly:
            <br>
            📞 <strong>Phone / WhatsApp:</strong> +251 988 175 522
            <br><br>
            Otherwise, feel free to choose from one of our bakery topics below:
            <div class="chat-chips">
                <button class="chip" data-query="Cake prices">💰 Prices</button>
                <button class="chip" data-query="Flavors">🎂 Flavors</button>
                <button class="chip" data-query="Delivery info">🚚 Delivery</button>
                <button class="chip" data-query="Payment options">💳 Payment</button>
                <button class="chip" data-query="How to order">📋 How to Order</button>
            </div>
        `;
    }

    // Process user input
    function handleSend(userText) {
        const text = userText || chatInput.value.trim();
        if (text === "") return;

        // Display user message
        addMessage(text, "user");
        if (!userText) chatInput.value = "";

        // Show typing indicator before reply
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const reply = getBotReply(text);
            addMessage(reply, "bot");
        }, 700 + Math.random() * 400);
    }

    // Event listeners
    sendBtn.addEventListener("click", () => handleSend());

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    });

    // Handle Quick Suggestion Chip clicks (Event delegation)
    chatMessages.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (chip) {
            const query = chip.getAttribute("data-query") || chip.textContent;
            handleSend(query);
        }
    });
});
