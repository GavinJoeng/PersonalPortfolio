document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('edit-button');
    const modalOverlay = document.getElementById('modal-overlay');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');

    const usernameDisplay = document.getElementById('username-display');
    const phoneDisplay = document.getElementById('phone-display');
    const emailDisplay = document.getElementById('email-display');
    const welcomeTextDisplay = document.getElementById('welcome-text-display');
    const introTextDisplay = document.getElementById('intro-text-display');

    const usernameInput = document.getElementById('username-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const welcomeTextInput = document.getElementById('welcome-text-input');
    const introTextInput = document.getElementById('intro-text-input');

    // 打开模态窗口
    editButton.addEventListener('click', () => {
        usernameInput.value = usernameDisplay.textContent;
        phoneInput.value = phoneDisplay.textContent;
        emailInput.value = emailDisplay.textContent;
        welcomeTextInput.value = welcomeTextDisplay.textContent;
        introTextInput.value = introTextDisplay.textContent;

        modalOverlay.classList.remove('hidden');
    });

    // 关闭模态窗口
    cancelButton.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    // 保存并更新展示信息
    saveButton.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止默认提交行为

        usernameDisplay.textContent = usernameInput.value.trim();
        phoneDisplay.textContent = phoneInput.value.trim();
        emailDisplay.textContent = emailInput.value.trim();
        welcomeTextDisplay.textContent = welcomeTextInput.value.trim();
        introTextDisplay.textContent = introTextInput.value.trim();

        modalOverlay.classList.add('hidden');
        alert('個人展示信息已更新！');
    });


    const navLinks = document.querySelectorAll('.nav-link');
    const userInfo = document.getElementById('userInfo');

    if (userInfo) {
        console.log('DOM fully loaded, updating userInfo');
        updateUserInfo(userInfo);
        // document.querySelector('.navbar-signup').classList.add('hidden');
    } else {
        console.warn('Element with id="userInfo" not found in DOM');
    }

    if (navLinks && navLinks.length > 0) {
        // 初始调用
        setActiveLink(navLinks);

        // 監聽 hash 變化
        window.addEventListener('hashchange', () => setActiveLink(navLinks));
    }

});


function updateUserInfo(userInfo) {
    const username = localStorage.getItem('username');
    const navbarSignup = document.querySelector('.navbar-signup');

    if (username) {
        userInfo.innerHTML = `
           <div class="relative inline-block">
                <span class="nav-link dropdown-trigger">${username}</span>
                <div class="dropdown-menu hidden absolute bg-gray-800 border border-gray-300 rounded shadow-lg mt-2 z-50 transition-all duration-300 transform opacity-0 scale-95 min-w-max">
                    <a href="personal-center.html" class="block px-4 py-2 nav-link">Personal Center</a>
                    <a href="#" class="block px-4 py-2 nav-link logout">Logout</a>
                </div>
            </div>
        `;

        const dropdownTrigger = userInfo.querySelector('.dropdown-trigger');
        const dropdownMenu = userInfo.querySelector('.dropdown-menu');

        const setDropdownWidth = () => {
            dropdownMenu.style.minWidth = `${dropdownTrigger.offsetWidth}px`;
        };
        setDropdownWidth();
        window.addEventListener('resize', setDropdownWidth);

        const toggleDropdown = (show) => {
            clearTimeout(dropdownMenu.hideTimeout);
            if (show) {
                dropdownMenu.classList.remove('hidden', 'opacity-0', 'scale-95');
            } else {
                dropdownMenu.hideTimeout = setTimeout(() => {
                    dropdownMenu.classList.add('opacity-0', 'scale-95');
                    setTimeout(() => dropdownMenu.classList.add('hidden'), 300);
                }, 300);
            }
        };

        dropdownTrigger.addEventListener('mouseenter', () => toggleDropdown(true));
        dropdownMenu.addEventListener('mouseenter', () => toggleDropdown(true));
        dropdownTrigger.addEventListener('mouseleave', () => toggleDropdown(false));
        dropdownMenu.addEventListener('mouseleave', () => toggleDropdown(false));

        const logoutButton = userInfo.querySelector('.logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('username');
                alert('Logged out successfully');
                window.location.href = 'index.html';
            });
        }

        // 傳統寫法檢查 navbarSignup 是否存在
        if (navbarSignup) {
            navbarSignup.classList.add('hidden');
        }
    } else {
        userInfo.innerHTML = `<a href="login.html" class="navbar-login text-blue-500 hover:underline">Login</a>`;

        // 傳統寫法檢查 navbarSignup 是否存在
        if (navbarSignup) {
            navbarSignup.classList.add('active');
        }
    }
}


function setActiveLink(navLinks) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // 當前頁面
    const currentHash = window.location.hash; // 當前 hash，例如 #contact

    navLinks.forEach(link => {
        const href = link.getAttribute('href'); // 獲取鏈接 href

        // 檢查完整 href 是否匹配當前頁面 + hash
        if (href === `${currentPath}${currentHash}` || href === currentHash) {
            link.classList.add('active');
        }
        // 如果當前頁面沒有 hash，僅匹配純頁面
        else if (!currentHash && href === currentPath) {
            link.classList.add('active');
        }
        // 移除其他鏈接的激活狀態
        else {
            link.classList.remove('active');
        }
    });
}

