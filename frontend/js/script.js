// login elements

const login = document.querySelector(".login")
const loginForm = login.querySelector(".login-form")
const loginInput = login.querySelectorAll(".login-input")[0] // campo de usuário
const passwordInput = document.querySelectorAll(".login-input")[1] // campo de senha

// chat elements

const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat-form")
const chatInput = chat.querySelector(".chat-input")
const chatMessages = chat.querySelector(".chat-messages")

const user = { id: "", name: "", color: "" }

const colors = [
    "cadeblue",
    "darkgoldenrod",
    "darkkhaki",
    "hotpink",
    "gold",
    "white",
    "aqua",
    "aliceblue",
    "antiquewhite",
    "aquamarine",
    "azure",
    "beige",
    "bisque",
    "blueviolet",
    "chartreuse",
    "chocolate",
    "coral",
    "cornflowerblue",
    "cornsilk",
    "crismson",
    "cyan",
    "darkblue",
    "darkcyan",
    "darkgrey",
    "darkgreen",
    "darkmagenta",
    "magenta",
    "golden",
    "darkolivegreen"
]

let websocket

const log = (msg) => {
    const el = document.getElementById("mobile-console");
    if (el) el.innerText += msg + "\n";
}

const creatMessageSelfElement = (content) => {
    const div = document.createElement("div")
    div.classList.add("message-self")
    div.innerHTML = content
    return div
}

const creatMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")
    div.classList.add("message-other")
    div.classList.add("message-self")
    span.classList.add("message-sender")
    span.style.color = senderColor
    div.appendChild(span)
    span.innerHTML = sender
    div.innerHTML += content
    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)
    const message = userId == user.id ? creatMessageSelfElement(content) : creatMessageOtherElement(content, userName, userColor)
    chatMessages.appendChild(message)
    scrollScreen()
}

const handleLogin = async (event) => {
    event.preventDefault();

    const username = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        log("Digite um usuário e uma senha válidos.");
        return;
    }

    try {
        const userRef = window.db.collection("usuarios").doc(username);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            const savedPassword = userSnap.data().password;

            if (password === savedPassword) {
                user.id = crypto.randomUUID();
                user.name = username;
                user.color = getRandomColor();

                login.style.display = "none";
                chat.style.display = "flex";

                websocket = new WebSocket("wss://bouncing.onrender.com");
                websocket.onmessage = processMessage;

                log("Usuário autorizado e conectado: " + JSON.stringify(user));
            } else {
                log("Senha incorreta.");
                window.location.href = "https://www.google.com";
            }
        } else {
            log("Usuário não encontrado. Redirecionando...");
            window.location.href = "https://www.google.com";
        }
    } catch (error) {
        log("Erro ao consultar o Firestore: " + error.message);
    }
}

const sendMenssage = (event) => {
    event.preventDefault()

    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
        log("Erro: WebSocket ainda não está conectado.");
        return;
    }

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }
    websocket.send(JSON.stringify(message))

    chatInput.value = ""
    log("Mensagem enviada: " + message.content)
}

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMenssage)
