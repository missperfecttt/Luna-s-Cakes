console.log("Chat.js loaded!");

const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");

console.log(chatButton);
console.log(chatWindow);

chatButton.addEventListener("click", () => {
    alert("Chat button clicked!");

    if (chatWindow.style.display === "block") {
        chatWindow.style.display = "none";
    } else {
        chatWindow.style.display = "block";
    }
});
