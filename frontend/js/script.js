import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAsIlkz89CYOAsBfYmqajmxRIEaF5aIxR4",
    authDomain: "freechat-81aae.firebaseapp.com",
    projectId: "freechat-81aae",
    storageBucket: "freechat-81aae.appspot.com",
    messagingSenderId: "274435553007",
    appId: "1:274435553007:web:0de6bc444e920722f90d1a",
    measurementId: "G-GDNV7BKRYM"
  };

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usuário atual (inicialmente vazio)
let currentUser = null;

// Função para gerar um elemento de mensagem enviada pelo próprio usuário
const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = content;
    return div;
};

// Função para gerar um elemento de mensagem enviada por outro usuário
const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message--other");
    span.classList.add("message--sender");
    span.style.color = senderColor;

    div.appendChild(span);
    span.innerHTML = sender;
    div.innerHTML += content;

    return div;
};

// Função para verificar o login
const handleLogin = (event) => {
    event.preventDefault();
    
    const username = document.querySelector('.login__input').value.trim();
    
    if (username === "Leo" || username === "Emma") {
        currentUser = { name: username };
        document.querySelector('.login').style.display = "none";
        document.querySelector('.chat').style.display = "flex";
        loadMessages();  // Carregar as mensagens do Firestore
    } else {
        alert("Usuário não autorizado. Tente novamente com 'Leo' ou 'Emma'.");
    }
};

// Função para enviar mensagens
const sendMessage = async (event) => {
    event.preventDefault();
    
    const message = {
        userName: currentUser.name,
        userColor: getRandomColor(),
        content: document.querySelector('.chat__input').value,
        timestamp: Timestamp.now(),
    };

    try {
        await addDoc(collection(db, "messages"), message);
        document.querySelector('.chat__input').value = "";
    } catch (e) {
        console.error("Erro ao enviar mensagem:", e);
    }
};

// Carregar mensagens do Firestore
const loadMessages = () => {
    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(messagesQuery, (snapshot) => {
        const chatMessages = document.querySelector('.chat__message');
        chatMessages.innerHTML = ""; // Limpa mensagens antigas
        snapshot.forEach((doc) => {
            const message = doc.data();
            const messageElement =
                message.userName === currentUser.name
                ? createMessageSelfElement(message.content)
                : createMessageOtherElement(message.content, message.userName, message.userColor);
            chatMessages.appendChild(messageElement);
        });
        scrollScreen();
    });
};

// Função auxiliar para gerar uma cor aleatória
const getRandomColor = () => {
    const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Função para rolar a tela automaticamente para o final das mensagens
const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

// Adicionando os event listeners aos formulários
document.querySelector('.login__form').addEventListener("submit", handleLogin);
document.querySelector('.chat__form').addEventListener("submit", sendMessage);
