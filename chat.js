const chatButton=document.getElementById("chatButton");

const chatWindow=document.getElementById("chatWindow");

const closeChat=document.getElementById("closeChat");

const chatMessages=document.getElementById("chatMessages");

const chatInput=document.getElementById("chatInput");

const sendBtn=document.getElementById("sendBtn");

chatButton.onclick=()=>{

chatWindow.style.display="block";

};

closeChat.onclick=()=>{

chatWindow.style.display="none";

};

function addMessage(text,type){

const div=document.createElement("div");

div.className=type;

div.innerHTML=text;

chatMessages.appendChild(div);

chatMessages.scrollTop=chatMessages.scrollHeight;

}

function botReply(message){

message=message.toLowerCase();

let reply="Sorry, I don't understand.<br><br>Try asking about prices, payment, delivery or flavors.";

if(message.includes("price")||message.includes("cost")){

reply="Our cakes start from <b>1000 ETB</b> depending on the size and design.";

}

else if(message.includes("delivery")){

reply="Yes 😊 We deliver throughout Addis Ababa.";

}

else if(message.includes("payment")){

reply="You can pay using <b>Telebirr</b> or <b>CBE</b> after placing your order.";

}

else if(message.includes("flavor")){

reply="Popular flavors include Vanilla, Chocolate, Red Velvet, Strawberry and Lemon.";

}

else if(message.includes("hour")){

reply="We accept orders 24/7 through the website.";

}

else if(message.includes("hello")||message.includes("hi")){

reply="Hello 👋 Welcome to Luna's Cakes!";

}

setTimeout(()=>{

addMessage(reply,"bot");

},500);

}

function sendMessage(){

const text=chatInput.value.trim();

if(text==="")return;

addMessage(text,"user");

chatInput.value="";

botReply(text);

}

sendBtn.onclick=sendMessage;

chatInput.addEventListener("keypress",function(e){

if(e.key==="Enter"){

sendMessage();

}

});
