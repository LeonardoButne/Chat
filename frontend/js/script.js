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
let replyToMessageId = null;  // Variável global para armazenar a mensagem à qual se está respondendo
let replyToMessageContent = null;  // Variável global para armazenar o conteúdo da mensagem à qual se está respondendo


// Função para gerar um elemento de mensagem enviada pelo próprio usuário
const createMessageSelfElement = (content, replyContent = null, messageId) => {
    const div = document.createElement("div");
    div.classList.add("message--self");

    // Se houver uma mensagem original sendo respondida
    if (replyContent) {
        const replyDiv = document.createElement("div");
        replyDiv.classList.add("message--reply");
        replyDiv.textContent = replyContent;
        div.appendChild(replyDiv);
    }

    // Adiciona o conteúdo da nova mensagem
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message--content");
    messageDiv.textContent = content;
    div.appendChild(messageDiv);

    // Adiciona o botão "Responder"
    const replyButton = document.createElement("button");
    replyButton.classList.add("reply-button");
    replyButton.textContent = "Responder";
    replyButton.onclick = () => selectMessageToReply(messageId, content);
    div.appendChild(replyButton);

    return div;
};

// Função para gerar um elemento de mensagem enviada por outro usuário
const createMessageOtherElement = (content, replyContent = null, messageId) => {
    const div = document.createElement("div");
    div.classList.add("message--other");

    // Adiciona o conteúdo da nova mensagem
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message--content");
    messageDiv.textContent = content;
    div.appendChild(messageDiv);

    // Adiciona o botão "Responder"
    const replyButton = document.createElement("button");
    replyButton.classList.add("reply-button");
    replyButton.textContent = "Responder";
    replyButton.onclick = () => selectMessageToReply(messageId, content);
    div.appendChild(replyButton);

    return div;
};

// Função para selecionar uma mensagem para resposta
    const selectMessageToReply = (messageId, content) => {
    console.log("Respondendo a mensagem:", messageId, content, "\n");  // Adiciona log para depuração
    replyToMessageId = messageId;
    replyToMessageContent = content;

    // Atualiza o campo de entrada com a mensagem a ser respondida
    const chatInput = document.querySelector('.chat__input');
    chatInput.value = `Respondendo a: "${content}" \n`;

    // Exibe a mensagem que está sendo respondida no campo de envio
    const replyPreview = document.querySelector('.chat__reply-preview');
    replyPreview.textContent = `Respondendo a: "${content}"`;
    replyPreview.style.display = "block";  // Mostrar o preview da resposta
};


// Função para manipular o login
const handleLogin = (event) => {
    event.preventDefault();
    
    const username = document.querySelector('.login__input').value.trim();
    
    if (username === "User1104" || username === "User1307") {
        currentUser = { name: username };
        
        // Exibe o nome da outra pessoa
        otherUserNameDisplay.textContent = username === "User1104" ? "User1307" : "user1104";
        
        document.querySelector('.login').style.display = "none";
        document.querySelector('.chat').style.display = "flex";
        loadMessages();  // Carregar as mensagens do Firestore
    } else {
        alert("Usuário não autorizado.");
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
        replyTo: replyToMessageId ? replyToMessageId : null  // Referência à mensagem respondida
    };

    try {
        await addDoc(collection(db, "messages"), message);
        document.querySelector('.chat__input').value = "";
        replyToMessageId = null;  // Reseta após o envio
        document.querySelector('.chat__reply-preview').style.display = "none";  // Esconder o preview da resposta
    } catch (e) {
        console.error("Erro ao enviar mensagem:", e);
    }
};

// Função para cancelar a seleção de resposta
document.querySelector('.clear-selected-message').addEventListener("click", () => {
    replyToMessageId = null;
    document.querySelector('.chat__reply-preview').style.display = "none";
});

// Carregar mensagens do Firestore
const loadMessages = () => {
    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    onSnapshot(messagesQuery, (snapshot) => {
        const chatMessages = document.querySelector('.chat__message');
        chatMessages.innerHTML = ""; // Limpa mensagens antigas

        snapshot.forEach((doc) => {
            const message = doc.data();
            let replyContent = null;

            // Verifica se a mensagem tem uma resposta
            if (message.replyTo) {
                const originalMessage = snapshot.docs.find((d) => d.id === message.replyTo);
                if (originalMessage) {
                    replyContent = `Respondendo a: "${originalMessage.data().content}"`;
                }
            }

            // Se a mensagem foi enviada pelo usuário logado, usar função de mensagem própria
            const messageElement =
                message.userName === currentUser.name
                ? createMessageSelfElement(message.content, replyContent, doc.id)
                : createMessageOtherElement(message.content, message.userName, replyContent, doc.id);
            
            chatMessages.appendChild(messageElement);
        });

        scrollScreen();  // Rolar para a última mensagem
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
