console.log("Chat.js loaded!");

const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");
chatButton.addEventListener("click", () => {
    alert("Chat button clicked!");
});

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
