// Google AI SDK Import (මේක අනිවාර්යයි)
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- API CONFIG ---
const API_KEY = "AIzaSyBtLeTafqNFh4hu6RFb78M3pwmChzpd6uc"; 
// SDK එක Initialize කිරීම
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// AI එකට දෙන උපදෙස්
let chatHistory = [
  {
    role: "user",
    parts: [{ text: "You are Kasun AI. You act as a helpful assistant on Kasun's portfolio website. You can speak 'Singlish' (Sinhala in English letters) and English. Be friendly and cool. You can answer any general question." }],
  },
  {
    role: "model",
    parts: [{ text: "Hari machan, mama ready. Ona deyak ahanna!" }],
  },
];

// --- 1. PRELOADER & COUNTERS ---
window.addEventListener("load", function() {
    const loader = document.getElementById("preloader");
    setTimeout(function() { 
        loader.style.display = "none";
        
        // Start Counters
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const inc = target / 50; 
            const updateCount = () => {
                if (count < target) {
                    count += inc;
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCount, 30);
                } else {
                    counter.innerText = target + "+";
                }
            };
            updateCount();
        });

    }, 1500);
});

// --- 2. MAGIC CURSOR ---
const cursor = document.querySelector(".cursor");
const cursor2 = document.querySelector(".cursor2");
document.addEventListener("mousemove", function(e) {
    cursor.style.cssText = cursor2.style.cssText = "left: " + e.clientX + "px; top: " + e.clientY + "px;";
});

// --- 3. AUTO TYPING ---
const textElement = document.querySelector(".typing-text");
if(textElement) {
    const words = ["Video Editor", "Photographer", "AI Artist", "DJ & Remixer"];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    function typeEffect() {
        const currentWord = words[wordIndex];
        if (isDeleting) textElement.textContent = currentWord.substring(0, charIndex--);
        else textElement.textContent = currentWord.substring(0, charIndex++);
        
        let typeSpeed = isDeleting ? 100 : 200;
        if (!isDeleting && charIndex === currentWord.length) { isDeleting = true; typeSpeed = 2000; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; typeSpeed = 500; }
        setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();
}

// --- 4. AI CHAT (SDK METHOD - FIXED) ---
let chatSession = model.startChat({ history: chatHistory });

window.askGeminiAI = async function() {
    const input = document.getElementById('aiInput');
    const msgArea = document.getElementById('aiMessages');
    const sendBtn = document.getElementById('sendBtn');
    const userText = input.value.trim();

    if (userText === "") return;
    
    // User Message
    msgArea.innerHTML += `<div class="msg user-msg">${userText}</div>`;
    input.value = ""; 
    msgArea.scrollTop = msgArea.scrollHeight;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    sendBtn.disabled = true;

    try {
        // SDK එක හරහා මැසේජ් එක යැවීම
        const result = await chatSession.sendMessage(userText);
        const response = await result.response;
        const text = response.text();
        
        msgArea.innerHTML += `<div class="msg bot-msg">${text}</div>`;

    } catch (error) {
        console.error("AI Error:", error);
        msgArea.innerHTML += `<div class="msg bot-msg" style="color:red;">Sorry machan, podi aulak giya. Aaye try karanna. (Check internet too)</div>`;
        // Error එකක් ආවොත් Chat session එක reset කරනවා
        chatSession = model.startChat({ history: chatHistory });
    }

    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>'; 
    sendBtn.disabled = false; 
    msgArea.scrollTop = msgArea.scrollHeight;
}

// --- 5. BOOKING SYSTEM ---
window.openBooking = function() { document.getElementById('bookingModal').style.display = 'flex'; }
window.closeBooking = function() { document.getElementById('bookingModal').style.display = 'none'; }
window.sendBookingToWhatsApp = function() {
    const name = document.getElementById('clientName').value;
    const service = document.getElementById('serviceType').value;
    const budget = document.getElementById('clientBudget').value;
    const message = document.getElementById('clientMessage').value;
    if(name === "") { alert("Please enter your name!"); return; }
    
    const text = `*New Project Request* 🚀%0A👤 *Name:* ${name}%0A🎬 *Service:* ${service}%0A💰 *Budget:* ${budget} LKR%0A📝 *Details:* ${message}`;
    window.open(`https://wa.me/+94717647693?text=${text}`, '_blank');
    closeBooking();
}

// --- 6. COMMUNITY (WhatsApp Style) ---
window.postToCommunity = function() {
    const input = document.getElementById('communityInput');
    const board = document.getElementById('communityBoard');
    const text = input.value.trim();
    
    if(text !== "") {
        const now = new Date();
        const time = now.getHours() + ":" + (now.getMinutes()<10?'0':'') + now.getMinutes();
        const newMsg = `<div class="wa-msg sent"><div class="sender-name">You</div><div class="msg-text">${text}</div><div class="msg-time">${time}</div></div>`;
        board.innerHTML += newMsg;
        input.value = "";
        board.scrollTop = board.scrollHeight;
    }
}

// --- STANDARD FUNCTIONS ---
window.showPage = function(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active-page');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if(element) element.classList.add('active');
}
window.toggleAIChat = function() {
    const box = document.getElementById('aiChatBox');
    box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
    if(box.style.display === 'flex') document.getElementById('aiInput').focus();
}
window.toggleTawkChat = function() {
    if(window.Tawk_API) window.Tawk_API.toggle(); else alert("Chat loading...");
}
window.openLogin = function() { document.getElementById('loginModal').style.display = 'flex'; }
window.closeLogin = function() { document.getElementById('loginModal').style.display = 'none'; }
window.userLogin = function() { if(document.getElementById('usernameInput').value) { closeLogin(); } }
window.handleEnter = function(e) { if (e.key === 'Enter') window.askGeminiAI(); }
