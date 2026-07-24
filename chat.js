const chatButton = document.getElementById("chatButton");

const chatWindow = document.getElementById("chatWindow");

chatButton.onclick = () => {

if(chatWindow.style.display==="block"){

chatWindow.style.display="none";

}else{

chatWindow.style.display="block";

}

};
