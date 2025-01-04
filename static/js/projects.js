// const API_BASE_URL = 'http://127.0.0.1:8080/api';
const API_BASE_URL = 'https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';

document.addEventListener('DOMContentLoaded', (event) => {
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

    // 初始化
    fetchAndRenderProjects();

    // 為 "View All Projects" 按鈕添加事件監聽器
    const viewAllButton = document.querySelector("#viewProjects .view-all-button");
    viewAllButton.addEventListener("click", (event) => {
        event.preventDefault();

        fetchAllProjects();
        viewAllButton.style.display = "none";
    });

    const backToTopButton = document.getElementById("scroll-top");

    // 滾動顯示/隱藏按鈕
    window.addEventListener("scroll", () => {
        if (window.scrollY > 350) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    });

    // 點擊返回頂部
    backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });


});


async function fetchAllProjects() {

    // const username = localStorage.getItem('username'); // 從 localStorage 獲取用戶名

    const username = 'gavinjoeng';
    if (!username) {
        alert('Username not found in localStorage. Please log in.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/getAllProjects?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            mode: 'cors', // 啟用跨域
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Error fetching projects: ${response.status}`);
        }

        const projectsData = await response.json();

        if (projectsData.error) {
            alert(`Error: ${projectsData.error}`);
            return;
        }

        // 渲染項目數據
        renderProjects(projectsData);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        alert('Failed to load projects. Please try again later.');
    }


}

// 從後端獲取數據並渲染到頁面
async function fetchAndRenderProjects() {
    // const username = localStorage.getItem('username'); // 從 localStorage 獲取用戶名
    const username = 'gavinjoeng';
    if (!username) {
        alert('Username not found in localStorage. Please log in.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/getFourProjects?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            mode: 'cors', // 啟用跨域
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Error fetching projects: ${response.status}`);
        }

        const projectsData = await response.json();

        if (projectsData.error) {
            alert(`Error: ${projectsData.error}`);
            return;
        }

        // 渲染項目數據
        renderProjects(projectsData);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        alert('Failed to load projects. Please try again later.');
    }
}

// 渲染項目到 HTML 頁面
function renderProjects(projects) {
    const projectsContainer = document.querySelector(".projects-card");

    // 清空現有內容
    projectsContainer.innerHTML = "";

    // 動態添加每個項目
    projects.forEach(project => {
        console.log("Processing Project:", project);

        const projectPhoto = project.project_photo || "default-placeholder.png"; // 默認圖片
        const projectTitle = project.title || "Untitled Project";
        const projectDescription = project.description || "No description available";

        const projectCard = document.createElement("div");
        projectCard.classList.add("subproject-card");

        projectCard.innerHTML = `
      <img src="${projectPhoto}" alt="${projectTitle}" class="subproject-img">
      <h3 class="heading-h3">${projectTitle}</h3>
      <p class="paragraph-font">${projectDescription}</p>
      <a href="project-detail.html?id=${project.project_id}" class="form-button">Learn More</a>
    `;

        projectsContainer.appendChild(projectCard);
    });
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