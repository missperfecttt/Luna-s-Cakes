console.log("Chat.js Loaded!");

const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");

const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");

// Open / Close
chatButton.addEventListener("click", () => {

    if(chatWindow.style.display==="flex"){

        chatWindow.style.display="none";

    }

    else{

        chatWindow.style.display="flex";

    }

});

sendBtn.addEventListener("click", answerQuestion);

chatInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        answerQuestion();

    }

});

function answerQuestion(){

    const question=chatInput.value.toLowerCase().trim();

    if(question==="") return;

    addUser(question);

    let answer="Sorry, I don't understand that yet.";

    if(question.includes("price") || question.includes("cost")){

        answer="Our cakes usually start from around 1,000 ETB. Custom cakes may cost more depending on the design.";

    }

    else if(question.includes("delivery")){

        answer="Yes! We deliver inside Addis Ababa. Delivery fee depends on your location.";

    }

    else if(question.includes("pickup")){

        answer="Yes. You can choose Pickup while placing your order.";

    }

    else if(question.includes("payment")){

        answer="We currently accept Telebirr and Commercial Bank of Ethiopia (CBE).";

    }

    else if(question.includes("flavor")){

        answer="We offer Vanilla, Chocolate, Red Velvet, Strawberry, Coffee and Lemon.";

    }

    else if(question.includes("order")){

        answer="Fill the Order Form, submit it, then proceed to the payment page.";

    }

    else if(question.includes("hello") || question.includes("hi")){

        answer="Hello 😊 How can I help you today?";

    }

    addBot(answer);

    chatInput.value="";

}

function addUser(text){

    chatBody.innerHTML+=`

    <div class="userMessage">

        ${text}

    </div>

    `;

    chatBody.scrollTop=chatBody.scrollHeight;

}

function addBot(text){

    chatBody.innerHTML+=`

    <div class="botMessage">

        ${text}

    </div>

    `;

    chatBody.scrollTop=chatBody.scrollHeight;

}
