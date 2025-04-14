const API_BASE_URL = '/api';
// const API_BASE_URL = 'https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';


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
    saveButton.addEventListener('click', async(e) => {
        e.preventDefault(); // 阻止默认提交行为
        const username = localStorage.getItem('username');
        const updatedInfo = {
            user_username: usernameInput.value.trim(),
            user_phone: phoneInput.value.trim(),
            user_email: emailInput.value.trim(),
            user_welcome_text: welcomeTextInput.value.trim(),
            user_introduction: introTextInput.value.trim(),
            username: username,
        };

        if (!updatedInfo.user_username || !updatedInfo.user_phone || !updatedInfo.user_email) {
            alert('Please fill in all required fields.');
            return;
        }


        try {
            const response = await fetch(`${API_BASE_URL}/updatePersonalInfo`, {
                method: 'POST',
                mode: "cors", // 啟用跨域
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedInfo),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update personal information: ${errorData.error || response.statusText}`);
            }

            const result = await response.json();

            if (result.error) {
                alert(`Error: ${result.error}`);
                return;
            }

            // 更新页面显示内容
            usernameDisplay.textContent = updatedInfo.user_username;
            phoneDisplay.textContent = updatedInfo.user_phone;
            emailDisplay.textContent = updatedInfo.user_email;
            welcomeTextDisplay.textContent = updatedInfo.user_welcome_text;
            introTextDisplay.textContent = updatedInfo.user_introduction;

            modalOverlay.classList.add('hidden');
            alert('個人展示信息已成功更新！');
        } catch (error) {
            console.error('Failed to update personal information:', error);
            alert('更新個人展示信息失敗，請稍後再試。');
        }

    });

    fetchPersonalInfo();


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




async function fetchPersonalInfo(){
    const username = localStorage.getItem('username'); // 從 localStorage 獲取用戶名
    if (!username) {
        alert('Username not found in localStorage. Please log in.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/getPersonalInfo?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            mode: 'cors', // 啟用跨域
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`Error fetching personal information: ${response.status}`);
        }

        const personalInfo = await response.json();

        if (personalInfo.error) {
            alert(`Error: ${personalInfo.error}`);
            return;
        }

        // 渲染項目數據
        renderPersonalInfo(personalInfo);
    } catch (error) {
        console.error('Failed to fetch personal information:', error);
        alert('Failed to load personal information. Please try again later.');
    }

}

function renderPersonalInfo(personalInfo) {
    // 渲染個人信息
    const usernameDisplay = document.getElementById('username-display');
    const phoneDisplay = document.getElementById('phone-display');
    const emailDisplay = document.getElementById('email-display');
    const welcomeTextDisplay = document.getElementById('welcome-text-display');
    const introTextDisplay = document.getElementById('intro-text-display');

    if (personalInfo.user_username) {
        usernameDisplay.textContent = personalInfo.user_username;
    }
    if (personalInfo.user_phone) {
        phoneDisplay.textContent = personalInfo.user_phone;
    }
    if (personalInfo.user_email) {
        emailDisplay.textContent = personalInfo.user_email;
    }
    if (personalInfo.user_welcome_text) {
        welcomeTextDisplay.textContent = personalInfo.user_welcome_text;
    }
    if (personalInfo.user_introduction) {
        introTextDisplay.textContent = personalInfo.user_introduction;
    }

    // 渲染消息列表
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer && Array.isArray(personalInfo.messages)) {
        // 清空現有消息
        messagesContainer.innerHTML = '';

        // 動態添加消息
        personalInfo.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('p-4', 'border', 'border-gray-300', 'rounded-md', 'shadow-sm');

            const messageName = document.createElement('p');
            messageName.classList.add('resume-description-text');
            messageName.textContent = `Name: ${message.message_name}`;

            const messageEmail = document.createElement('p');
            messageEmail.classList.add('resume-description-text');
            messageEmail.textContent = `Email: ${message.message_email}`;

            const messageContent = document.createElement('p');
            messageContent.classList.add('resume-description-text');
            messageContent.textContent = `Message: ${message.message_content}`;

            messageElement.appendChild(messageName);
            messageElement.appendChild(messageEmail);
            messageElement.appendChild(messageContent);

            messagesContainer.appendChild(messageElement);
        });
    }
}



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

