//const API_BASE_URL = "http://127.0.0.1:5000/api";
const API_BASE_URL = '"https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';

let tempPictureId = null; // 儲存臨時圖片 ID


function setupEditModal(project) {
    const editModal = document.querySelector('#edit-modal');
    const editForm = document.querySelector('#edit-form');
    const technologiesContainer = document.querySelector('#technologies-container');
    const addTechnologiesButton = document.querySelector('#add-technologies');


    // 顯示模態框
    function openModal() {
        editModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');

        // 預填其他表單字段
        document.getElementById('edit-title').value = project.title; // 項目標題
        document.getElementById('edit-description').value = project.description; // 項目描述

        // 確保 features 是數組，並轉換為多行文本
        const features = Array.isArray(project.features) ? project.features : JSON.parse(project.features);
        document.getElementById('edit-features').value = features.join('\n'); // 項目功能

        // 確保 technologies 是對象數組
        const technologies = Array.isArray(project.technologies) ? project.technologies : JSON.parse(project.technologies);

        // 預填挑戰字段
        document.getElementById('edit-challenges').value = project.challenges; // 項目挑戰

        // 渲染技術數據
        renderTechnologies(technologies);

    }

    // 隱藏模態框
    function closeModal() {
        editModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    // 在模態框外點擊時關閉模態框
    editModal.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeModal();
        }
    });

    // 遍歷 technologies JSON 數據並生成 HTML
    function renderTechnologies(technologies) {
        const technologiesContainer = document.querySelector('#technologies-container');
        technologiesContainer.innerHTML = '';

        technologies.forEach((tech, index) => {
            const technologyDiv = document.createElement('div');
            technologyDiv.classList.add('two-columns-layout', 'grid', 'grid-cols-2', 'gap-4', 'p-4', 'rounded', 'bg-gray-800', 'shadow');
            technologyDiv.innerHTML = `
            <label class="resume-subform-label col-span-1">Technology Name:
                <input type="text" class="resume-subform-input" data-index="${index}" data-field="name" value="${tech.name}">
            </label>
            <label class="resume-subform-label col-span-2">Technology Description:
                <textarea class="form-textarea text-left rows-5" data-index="${index}" data-field="description">${tech.description}</textarea>
            </label>
            <div class="col-span-2 flex justify-end gap-4">
                <button class="cancel-skills-button" data-index="${index}">Remove</button>
            </div>
        `;
            technologiesContainer.appendChild(technologyDiv);

            technologyDiv.querySelector('.cancel-skills-button').addEventListener('click', () => {
                technologies.splice(index, 1);
                renderTechnologies(technologies);
            });
        });
    }


    addTechnologiesButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(typeof(project.technologies));
        // 確保 project.technologies 是數組
        if (!Array.isArray(project.technologies)) {
            project.technologies = Array.isArray(JSON.parse(project.technologies))
                ? JSON.parse(project.technologies)
                : [];
        }
        project.technologies.push({ name: '', description: '' });
        renderTechnologies(project.technologies);
    });




    const editImg = document.querySelector('#edit-image');
    const uploadBtn = document.querySelector('#upload-button');
    const previewImage = document.querySelector('#preview-image');

    // 監聽文件輸入框的變化事件
    editImg.addEventListener('change', (event) => {
        const file = event.target.files[0]; // 獲取選中的文件
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // 將圖片的 Base64 URL 設置為預覽圖片的 src
                previewImage.src = e.target.result;
                previewImage.classList.remove('hidden'); // 顯示圖片
            };
            reader.onerror = function () {
                alert('Error reading file!'); // 處理讀取錯誤
            };
            reader.readAsDataURL(file); // 將文件讀取為 Base64 格式
        } else {
            // 如果用戶取消選擇文件，清空預覽圖片
            previewImage.src = '';
            previewImage.classList.add('hidden'); // 隱藏圖片
        }
    });

    // 綁定上傳按鈕的點擊事件
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const file = editImg.files[0];

        if (!file) {
            alert('No file selected!');
            return;
        }

        uploadFile(
            file,
            `${API_BASE_URL}/uploadTemp`, // 上傳臨時文件的接口
            'project-picture', // 文件字段名稱
            function onSuccess(data) {
                tempPictureId = data.temp_id || null;
                alert('Upload successful: ' + (tempPictureId ? `Temp ID: ${tempPictureId}` : 'No new file uploaded.'));
            },
            function onError(error) {
                alert('Upload failed: ' + error);
            }
        );
    });



    document.getElementById('edit-project-btn').addEventListener('click', openModal);
    document.getElementById('cancel-edit').addEventListener('click', closeModal);


    const token = localStorage.getItem('username'); // 從本地存儲獲取 Token

    if (token) {
        document.getElementById('edit-project-btn').style.display = 'block'; // 顯示按鈕
    } else {
        document.getElementById('edit-project-btn').style.display = 'none';
    }


    // 禁止重複刷新
    let isUpdating = false;


    editForm.addEventListener('submit', async (e) => {
        if (isUpdating) return; // 防止多次提交
        isUpdating = true;
        e.preventDefault(); // 防止表單默認行為

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const username = localStorage.getItem('username');

        const updatedProject = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            technologies: Array.from(technologiesContainer.querySelectorAll('.resume-subform-input')).map((input, index) => ({
                name: input.value,
                description: technologiesContainer.querySelector(`textarea[data-index="${index}"]`).value,
            })),
            features: document.getElementById('edit-features').value.split('\n').map(line => line.trim()),
            challenges: document.getElementById('edit-challenges').value,
            project_photo: tempPictureId, // 添加臨時圖片 ID
            username: username,
            project_id: projectId,
        };

        console.log("準備提交的數據:", updatedProject);

        try {
            const updatedData = await updateProjectData(updatedProject);

            // 確保 DOM 加載完成後再渲染
            const checkDomReady = (selector) => {
                return new Promise((resolve) => {
                    const interval = setInterval(() => {
                        const element = document.querySelector(selector);
                        if (element) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 50); // 每 50 毫秒檢查一次
                });
            };

            // 等待關鍵 DOM 元素加載完成
            await Promise.all([
                checkDomReady('#project-title'),
                checkDomReady('#project-technologies'),
                checkDomReady('#project-features'),
                checkDomReady('#project-challenges'),
            ]);

            // 渲染最新數據到頁面
            console.log("更新渲染的數據是:", updatedData);
            renderProjectData(updatedData.data);
            setupEditModal(updatedData.data);
            console.log("渲染完成");

            // 關閉模態框
            closeModal();
        } catch (error) {
            console.error("更新過程中出現錯誤:", error);
            alert('Failed to update project. Please try again.');
        } finally {
            isUpdating = false;
        }
    });



}


document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        console.error('No project ID specified in URL');
        return;
    }

    try {
        const project = await fetchProjectData(projectId);
        renderProjectData(project);
        setupEditModal(project);
    } catch (error) {
        console.error('Error loading project data:', error);
        alert('Failed to load project data');
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const userInfo = document.getElementById('userInfo');

    if (userInfo) {
        updateUserInfo(userInfo);
    }

    if (navLinks && navLinks.length > 0) {
        setActiveLink(navLinks);

        window.addEventListener('hashchange', () => setActiveLink(navLinks));
    }
});




async function fetchProjectData(projectId) {
    try {
        // 確保當前使用者已登錄
        // const username = localStorage.getItem('username');
        const username = 'gavinjoeng';
        if (!username) {
            throw new Error('Username is not available in localStorage');
        }

        // 使用 URLSearchParams 構建查詢參數
        const params = new URLSearchParams({
            project_id: projectId,
            username: username,
        });

        // 拼接 URL
        const url = `${API_BASE_URL}/getProject?${params.toString()}`;

        console.log('Fetching project data from URL:', url);

        // 發送 GET 請求
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', // 啟用跨域
            headers: { 'Content-Type': 'application/json' },
        });

        // 驗證回應
        if (!response.ok) {
            throw new Error(`Failed to fetch project data: ${response.statusText}`);
        }

        // 返回 JSON 資料
        return await response.json();
    } catch (error) {
        console.error('Error fetching project data:', error);
        throw error; // 將錯誤向外傳遞
    }
}


async function updateProjectData(updatedData) {
    try {
        console.log("更新的數據是: " + updatedData);
        const response = await fetch(`${API_BASE_URL}/updateProject`, {
            method: 'POST', // 修改為 POST 方法
            mode: "cors", // 啟用跨域
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update project: ${errorData.error || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating project data:', error);
        throw error;
    }
}


// 渲染專案內容到頁面
function renderProjectData(project) {

    console.log("DOM 渲染檢查:");
    console.log("-------------->數據是:", project);
    console.log("Title element:", document.getElementById('project-title'));
    console.log("Technologies list element:", document.getElementById('project-technologies'));
    console.log("Features list element:", document.getElementById('project-features'));


    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-description').textContent = project.description;
    document.querySelector('#project-image').src = project.project_photo;
    // 處理 technologies
    const technologiesList = document.getElementById('project-technologies');
    let technologies = [];
    if (project.technologies) {
        try {
            technologies = typeof project.technologies === 'string'
                ? JSON.parse(project.technologies)
                : project.technologies;
        } catch (error) {
            console.error("解析 technologies 時發生錯誤:", error);
            technologies = [];
        }
    }
    console.log("project"+project);
    console.log("features"+project.features);
    console.log("technologies"+project.technologies);
    console.log(technologies);
    technologiesList.innerHTML = technologies
        .map(tech => `
            <li class="bg-gray-700 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">${tech.name}</h4>
                <p class="text-sm text-gray-300">${tech.description}</p>
            </li>
        `).join('');

    const featuresList = document.getElementById('project-features');
    // 確保 project.features 是數組
    const features = typeof project.features === 'string' ? JSON.parse(project.features) : project.features;

    featuresList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');

    document.getElementById('project-challenges').textContent = project.challenges;
    console.log("渲染完成!!!")
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




/**
 * 通用文件上傳方法
 * @param {File} file - 用戶選擇的文件（可為 null）
 * @param {string} uploadUrl - 上傳文件的後端 API 地址
 * @param {string} fieldName - 上傳文件的字段名稱（默認為 'file'）
 * @param {function} onSuccess - 成功回調，返回後端數據
 * @param {function} onError - 錯誤回調，返回錯誤信息
 */
function uploadFile(file, uploadUrl, fieldName = 'file', onSuccess, onError) {
    if (!file) {
        // 如果文件為空，表示用戶未更改文件
        onSuccess && onSuccess({ success: true, message: 'No file uploaded, using existing file.' });
        return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                onSuccess && onSuccess(data);
            } else {
                onError && onError(data.error || 'Upload failed');
            }
        })
        .catch((error) => {
            console.error('Upload error:', error);
            onError && onError('An error occurred during upload');
        });
}
