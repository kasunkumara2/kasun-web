import { GoogleGenerativeAI } from "@google/generative-ai";

// --- API CONFIG (GEMINI AI SDK) ---
const API_KEY = "AIzaSyBtLeTafqNFh4hu6RFb78M3pwmChzpd6uc"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let chatSession = model.startChat({
    history: [
        {
            role: "user",
            parts: [{ text: "You are Kasun AI. You speak Singlish or English. Be helpful and cool. You know Kasun is a Video Editor, Photographer, AI Artist and DJ." }],
        },
        {
            role: "model",
            parts: [{ text: "Hari machan, mama ready. Ona deyak ahanna!" }],
        },
    ]
});

// --- 1. CLICK OUTSIDE TO CLOSE MODALS (NEW) ---
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

// --- 2. PRELOADER & COUNTERS ---
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

// --- 3. MAGIC CURSOR ---
const cursor = document.querySelector(".cursor");
const cursor2 = document.querySelector(".cursor2");
document.addEventListener("mousemove", function(e) {
    cursor.style.cssText = cursor2.style.cssText = "left: " + e.clientX + "px; top: " + e.clientY + "px;";
});

// --- 4. AUTO TYPING ---
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

// --- 5. AI CHAT (SDK METHOD) ---
window.askGeminiAI = async function() {
    const input = document.getElementById('aiInput');
    const msgArea = document.getElementById('aiMessages');
    const sendBtn = document.getElementById('sendBtn');
    const userText = input.value.trim();

    if (userText === "") return;
    
    msgArea.innerHTML += `<div class="msg user-msg">${userText}</div>`;
    input.value = ""; 
    msgArea.scrollTop = msgArea.scrollHeight;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    sendBtn.disabled = true;

    try {
        const result = await chatSession.sendMessage(userText);
        const response = await result.response;
        const text = response.text();
        msgArea.innerHTML += `<div class="msg bot-msg">${text}</div>`;
    } catch (error) {
        console.error("AI Error:", error);
        msgArea.innerHTML += `<div class="msg bot-msg" style="color:red;">Internet check karanna machan.</div>`;
        chatSession = model.startChat(); // Reset on error
    }

    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>'; 
    sendBtn.disabled = false; 
    msgArea.scrollTop = msgArea.scrollHeight;
}

// --- 6. SETTINGS & AUTH LOGIC ---
window.openSettings = function() { document.getElementById('settingsModal').style.display = 'flex'; }
window.closeSettings = function() { document.getElementById('settingsModal').style.display = 'none'; }

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName + 'Tab').style.display = 'block';
    event.currentTarget.classList.add('active');
}

window.toggleAuth = function(type) {
    document.getElementById('signInForm').style.display = (type === 'signin') ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = (type === 'signup') ? 'block' : 'none';
    document.getElementById('signInBtn').classList.toggle('active', type === 'signin');
    document.getElementById('signUpBtn').classList.toggle('active', type === 'signup');
}

window.setTheme = function(theme) {
    document.body.className = 'theme-' + theme;
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
    document.querySelector('.theme-card.' + theme).classList.add('selected');
}

// --- 7. BOOKING & COMMUNITY ---
window.openBooking = function() { document.getElementById('bookingModal').style.display = 'flex'; }
window.closeBooking = function() { document.getElementById('bookingModal').style.display = 'none'; }

window.sendBookingToWhatsApp = function() {
    const name = document.getElementById('clientName').value;
    const service = document.getElementById('serviceType').value;
    const budget = document.getElementById('clientBudget').value;
    const message = document.getElementById('clientMessage').value;
    if(name === "") { alert("Enter Name"); return; }
    
    const text = `*New Booking* 🚀%0A👤 Name: ${name}%0A🎬 Service: ${service}%0A💰 Budget: ${budget} LKR%0A📝 Msg: ${message}`;
    window.open(`https://wa.me/+94717647693?text=${text}`, '_blank');
    closeBooking();
}

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

// --- STANDARD NAV ---
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
