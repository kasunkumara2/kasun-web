// --- Page Navigation ---
function showPage(pageId, element) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    // Show selected page (If exists)
    const targetPage = document.getElementById(pageId);
    if(targetPage) {
        targetPage.classList.add('active-page');
    }
    
    // Update Menu Icon Color
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if(element) element.classList.add('active');
}

// --- Tawk.to Chat Toggle ---
// Chat අයිකන් එක එබුවම Chat එක පේන්න ගන්නවා
function toggleTawkChat() {
    if(window.Tawk_API){
        window.Tawk_API.toggle();
    }
}

// --- Login Modal ---
function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// --- User Logic (Simulated) ---
let currentUser = "Guest";

function userLogin() {
    const nameInput = document.getElementById('usernameInput').value;
    if(nameInput.trim() !== "") {
        currentUser = nameInput;
        alert("Welcome " + currentUser + "!");
        closeLogin();
    } else {
        alert("Please enter a name");
    }
}

// --- Community Post (Local Storage Only) ---
function postToCommunity() {
    const input = document.getElementById('communityInput');
    const board = document.getElementById('communityBoard');
    const text = input.value;

    if(text.trim() !== "") {
        board.innerHTML = `
            <div class="post">
                <div class="post-header"><strong>${currentUser}</strong> <span>Just Now</span></div>
                <p>${text}</p>
            </div>
        ` + board.innerHTML;
        input.value = "";
    }
}
