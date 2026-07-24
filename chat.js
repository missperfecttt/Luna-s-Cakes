console.log("Chat.js loaded!");

const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

console.log(chatButton);
console.log(chatWindow);

// Open / Close Chat

chatButton.addEventListener("click", () => {

    if(chatWindow.style.display==="flex"){

        chatWindow.style.display="none";

    }else{

        chatWindow.style.display="flex";

    }

});

// Send Message

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendMessage();

    }

});

function sendMessage(){

    const text=userInput.value.trim();

    if(text==="") return;

    addUserMessage(text);

    userInput.value="";

    setTimeout(()=>{

        addBotReply(text);

    },500);

}

function addUserMessage(text){

    chatMessages.innerHTML+=`

        <div class="user-message">

            ${text}

        </div>

    `;

    chatMessages.scrollTop=chatMessages.scrollHeight;

}

function addBotReply(question){

    question=question.toLowerCase();

    let reply="Sorry, I don't understand that yet.";

    if(question.includes("price")){

        reply="Prices depend on the cake size and design. Please place an order and we'll provide a quotation.";

    }

    else if(question.includes("delivery")){

        reply="We provide delivery within Addis Ababa. Delivery charges depend on the location.";

    }

    else if(question.includes("payment")){

        reply="We currently accept Telebirr and Commercial Bank of Ethiopia.";

    }

    else if(question.includes("flavour") || question.includes("flavor")){

        reply="Available flavours include Vanilla, Chocolate, Red Velvet and more.";

    }

    else if(question.includes("hello") || question.includes("hi")){

        reply="Hello! 👋 Welcome to Luna's Cakes.";

    }

    chatMessages.innerHTML+=`

        <div class="bot-message">

            ${reply}

        </div>

    `;

    chatMessages.scrollTop=chatMessages.scrollHeight;

}
