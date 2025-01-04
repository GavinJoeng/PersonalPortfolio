const API_BASE_URL = 'http://127.0.0.1:8080/api';
//const API_BASE_URL = 'https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';

document.addEventListener('DOMContentLoaded', () => {
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

    fetchIndexInfo();

    const sendMsgBtn = document.querySelector('#send-msg-btn');

    sendMsgBtn.addEventListener('click', async(e) => {
        e.preventDefault();
        const msg = {
            name: document.querySelector("#name").value,
            email: document.querySelector("#email").value,
            message: document.querySelector("#message").value,
        }

        if (!msg.name || !msg.email || !msg.message) {
            alert('Please fill in all required fields.');
            return;
        }


        try {
            const response = await fetch(`${API_BASE_URL}/sendMsg`, {
                method: 'POST',
                mode: "cors", // 啟用跨域
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg),
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

            // 清除列表消息
            document.querySelector("#name").value = '';
            document.querySelector("#email").value = '';
            document.querySelector("#message").value = '';

            alert('已留言,請等待用戶回應！');
        } catch (error) {
            console.error('Failed to update personal information:', error);
            alert('更新個人展示信息失敗，請稍後再試。');
        }

    })



});

async function fetchIndexInfo(){

    try {
        // 从 localStorage 获取用户名
        // const username = localStorage.getItem('username');
        const username = 'gavinjoeng';
        if (!username) {
            throw new Error('Username is not defined. Please log in.');
        }

        const response = await fetch(`${API_BASE_URL}/getIndexInfo?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            mode: 'cors', // 啟用跨域
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`Error fetching personal information: ${response.status}`);
        }

        // 解析 JSON 数据
        const indexInfo = await response.json();

        if (indexInfo.error) {
            alert(`Error: ${indexInfo.error}`);
            return;
        }

        // 更新 DOM 内容
        const welcomeText = document.querySelector('#welcome-text');
        const introText = document.querySelector('#intro-text');

        welcomeText.textContent = indexInfo.welcome_text; // 更新文本内容
        introText.textContent = indexInfo.introduction; // 更新文本内容

    }catch (error) {
            console.error('Failed to fetch personal information:', error);
            alert('Failed to load personal information. Please try again later.');
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






