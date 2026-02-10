import { GoogleGenerativeAI } from "@google/generative-ai";

// --- API CONFIG (GEMINI AI) ---
const API_KEY = "AIzaSyBtLeTafqNFh4hu6RFb78M3pwmChzpd6uc"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const chatHistory = [
  {
    role: "user",
    parts: [{ text: "You are Kasun AI. You speak Singlish or English. You are helpful and cool. You know Kasun is a Video Editor, Photographer, AI Artist and DJ." }],
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
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / 100;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
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

// --- 4. 3D TILT EFFECT ---
document.addEventListener('mousemove', function(e) {
    document.querySelectorAll('.glass-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
            const rotateX = ((y - rect.height/2) / (rect.height/2)) * -5;
            const rotateY = ((x - rect.width/2) / (rect.width/2)) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        } else {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        }
    });
});

// --- 5. AI CHAT ---
window.askGeminiAI = async function() {
    const input = document.getElementById('aiInput');
    const msgArea = document.getElementById('aiMessages');
    const sendBtn = document.getElementById('sendBtn');
    const userText = input.value.trim();

    if (userText === "") return;
    msgArea.innerHTML += `<div class="msg user-msg">${userText}</div>`;
    input.value = ""; msgArea.scrollTop = msgArea.scrollHeight;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; sendBtn.disabled = true;

    try {
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userText);
        const text = result.response.text();
        msgArea.innerHTML += `<div class="msg bot-msg">${text}</div>`;
        chatHistory.push({ role: "user", parts: [{ text: userText }] });
        chatHistory.push({ role: "model", parts: [{ text: text }] });
    } catch (error) {
        msgArea.innerHTML += `<div class="msg bot-msg" style="color:red;">Error. Check internet.</div>`;
    }
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>'; sendBtn.disabled = false; msgArea.scrollTop = msgArea.scrollHeight;
}

// --- 6. BOOKING SYSTEM ---
window.openBooking = function() { document.getElementById('bookingModal').style.display = 'flex'; }
window.closeBooking = function() { document.getElementById('bookingModal').style.display = 'none'; }
window.sendBookingToWhatsApp = function() {
    const name = document.getElementById('clientName').value;
    const service = document.getElementById('serviceType').value;
    const budget = document.getElementById('clientBudget').value;
    const message = document.getElementById('clientMessage').value;
    if(name === "") { alert("Enter Name"); return; }
    
    const text = `*New Booking* 🚀%0A👤 Name: ${name}%0A🎬 Service: ${service}%0A💰 Budget: ${budget}%0A📝 Msg: ${message}`;
    window.open(`https://wa.me/+94717647693?text=${text}`, '_blank');
    closeBooking();
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
window.postToCommunity = function() {
    const input = document.getElementById('communityInput');
    const board = document.getElementById('communityBoard');
    if(input.value.trim() !== "") {
        board.innerHTML = `<div class="post"><div class="post-header"><strong>Guest</strong> <span>Just Now</span></div><p>${input.value}</p></div>` + board.innerHTML;
        input.value = "";
    }
}
window.openLogin = function() { document.getElementById('loginModal').style.display = 'flex'; }
window.closeLogin = function() { document.getElementById('loginModal').style.display = 'none'; }
window.userLogin = function() { if(document.getElementById('usernameInput').value) { closeLogin(); } }
window.handleEnter = function(e) { if (e.key === 'Enter') window.askGeminiAI(); }
