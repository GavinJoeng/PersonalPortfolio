let tempPictureId = null; // 儲存臨時圖片 ID
//const API_BASE_URL = "http://127.0.0.1:5000/api";
const API_BASE_URL = '"https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';

document.addEventListener('DOMContentLoaded', (event) => {



    //編輯和添加工作經歷
    let workExperienceData = [];
    const editExpContainer = document.querySelector('#edit-experience');
    const addWorkExpButton = document.querySelector('#add-work-experience');


    //編輯和添加教育經歷
    let educationData = [];
    const editEduContainer = document.querySelector('#edit-education');
    const addEducationButton = document.querySelector('#add-education');

    // 編輯添加/修改skills
    let skillsData = [];
    const editSkillsContainer = document.querySelector('#edit-skills');
    const addSkillsButton = document.querySelector("#add-skills"); // 添加技能按钮


    // 获取模态窗口
    const editModal = document.querySelector('#edit-modal');
    if (!editModal) {
        console.error('Error: #edit-modal not found in DOM.');
        return; // 提前退出，避免后续错误
    }

    // 後端 JSON 接口
    let apiUrl = `${API_BASE_URL}/getResumeInfo?user_id=1`;
    // 從後端獲取數據
    fetch(apiUrl, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {

            // 個人資料部分
            const profile = data;

            //renderResumeData(data, editExpContainer, editEduContainer, editSkillsContainer);

            // 加載個人資料部分
            document.getElementById('edit-name').value = profile.name || '';
            document.getElementById('edit-title').value = profile.title || '';
            document.getElementById('edit-email').value = profile.email || '';
            document.getElementById('edit-phone').value = profile.phone || '';
            document.getElementById('edit-location').value = profile.location || '';
            document.getElementById('edit-summary').value = profile.summary || '';
            workExperienceData = data.experience || [];

            educationData = data.education || [];

            skillsData = data.skills || [];

            renderWorkExperience(workExperienceData, editExpContainer);
            renderEduction(educationData, editEduContainer);
            renderSkills(skillsData, editSkillsContainer);
        });





    // Profile picture upload functionality
    const profilePictureInput = document.querySelector('#edit-profile-picture');
    const profileUploadButton = document.querySelector('#upload-button');
    const previewImage = document.querySelector('#preview-image');

    // 監聽文件輸入框的變化事件
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // 獲取選中的文件
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // 將圖片的 Base64 URL 設置為預覽圖片的 src
                previewImage.src = e.target.result;
                previewImage.style.display = 'block'; // 顯示圖片
            };
            reader.onerror = function () {
                alert('Error reading file!'); // 處理讀取錯誤
            };
            reader.readAsDataURL(file); // 將文件讀取為 Base64 格式
        } else {
            // 如果用戶取消選擇文件，清空預覽圖片
            previewImage.src = '';
            previewImage.style.display = 'none'; // 隱藏圖片
        }
    });



    profileUploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        const file = profilePictureInput.files[0];
        uploadFile(
            file,
            `${API_BASE_URL}/uploadTemp`, // 上傳臨時文件的接口
            'profile-picture', // 文件字段名稱
            function onSuccess(data) {
                tempPictureId = data.temp_id || null;
                alert('Upload successful: ' + (tempPictureId ? `Temp ID: ${tempPictureId}` : 'No new file uploaded.'));
            },
            function onError(error) {
                alert('Upload failed: ' + error);
            }
        );

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('edit-profile-picture').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }


    })




    const token = localStorage.getItem('username'); // 從本地存儲獲取 Token

    if (token) {
        document.getElementById('edit-resume-btn').style.display = 'block'; // 顯示按鈕
    } else {
        document.getElementById('edit-resume-btn').style.display = 'none';
    }


    // 提交 resume
    document.querySelector('#edit-form').addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('Resume updated');

        workExperienceData = collectWorkExperienceData(editExpContainer);
        educationData = collectEducationData(editEduContainer);
        skillsData = collectSkillsData(editSkillsContainer);


        // 确保 editModal 存在时再操作
        if (editModal) {
            const resumeData = collectFormData(workExperienceData, educationData, skillsData); // 收集數據
            submitFormData(resumeData)
                .then(data => {


                    // 後端返回的數據在 `data.data` 中
                    const profile = data.data;
                    //resume主頁渲染
                    renderResumeInfo(profile);
                    // 更新個人資料表單
                    document.getElementById('edit-name').value = profile.name || '';
                    document.getElementById('edit-title').value = profile.title || '';
                    document.getElementById('edit-email').value = profile.email || '';
                    document.getElementById('edit-phone').value = profile.phone || '';
                    document.getElementById('edit-location').value = profile.location || '';
                    document.getElementById('edit-summary').value = profile.summary || '';

                    // 更新數據
                    workExperienceData = profile.experience || [];
                    educationData = profile.education || [];
                    skillsData = profile.skills || [];

                    // 渲染界面
                    renderWorkExperience(workExperienceData, editExpContainer);
                    renderEduction(educationData, editEduContainer);
                    renderSkills(skillsData, editSkillsContainer);
                })
                .catch(error => {
                    // 處理錯誤
                    console.error('Error updating data:', error);
                    alert('更新數據失敗，請稍後再試。');
                });

            closeModal(editModal);
        } else {
            console.error('editModal is not defined or null.');
        }
    });




    // 點擊模態框背景關閉模態框
    editModal.addEventListener('click', (event) => {
        // 確保只有點擊在背景區域（而不是內容區域）時才關閉模態框
        if (event.target === editModal) {
            closeModal(editModal);
        }
    });



    // 綁定添加工作經歷按鈕
    addWorkExpButton.addEventListener('click', (e) => {
        e.preventDefault();
        addWorkExperience(workExperienceData, (data) => renderWorkExperience(data, editExpContainer));
    });

    // 綁定刪除工作經歷按鈕（事件委託）
    editExpContainer.addEventListener('click', (e) => {
        removeWorkExperience(e, workExperienceData, (data) => renderWorkExperience(data, editExpContainer));
    });

    // 綁定動態更新
    // editExpContainer.addEventListener('input', (e) => {
    //     updateData(e, workExperienceData, renderWorkExperience, editExpContainer);
    // });


    // 綁定添加教育經歷按鈕
    addEducationButton.addEventListener('click', (e) => {
        e.preventDefault();
        addEduction(educationData, (data) => renderEduction(data, editEduContainer));
    });

    // 綁定刪除教育經歷按鈕（事件委託）
    editEduContainer.addEventListener('click', (e) => {
        removeEduction(e, educationData, (data) => renderEduction(data, editEduContainer));
    });


    // 綁定動態更新
    // editEduContainer.addEventListener('input', (e) => {
    //     updateData(e, educationData, renderEduction, editEduContainer);
    // });


    // 绑定添加技能按钮
    addSkillsButton.addEventListener("click", (e) => {
        e.preventDefault();
        addSkills(skillsData, (data) => renderSkills(data, editSkillsContainer));
    });

    // 綁定刪除技能按鈕（事件委託）
    editSkillsContainer.addEventListener('click', (e) => {
        removeSkills(e, skillsData, (data) => renderSkills(data, editSkillsContainer));
    });

    // 綁定動態更新
    // editSkillsContainer.addEventListener('input', (e) => {
    //     updateData(e, skillsData, renderEduction, editSkillsContainer);
    // });


});



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


// 渲染技能列表
function renderSkills(skillsData, editSkillsContainer) {
    editSkillsContainer.innerHTML = ""; // 清空容器

    let rowContainer; // 定义行容器
    skillsData.forEach((skill, index) => {
        // 如果是每三个技能的开头，创建一个新的行容器
        if (index % 3 === 0) {
            rowContainer = document.createElement("div");
            rowContainer.classList.add("grid", "grid-cols-3", "gap-4", "mb-4"); // 每行三列布局
            editSkillsContainer.appendChild(rowContainer); // 将行容器添加到主容器
        }

        // 创建技能块容器
        const skillBlock = document.createElement("div");
        skillBlock.classList.add("three-columns-layout"); // 每个技能块占据一列

        // 添加 Skill Label
        const skillLabel = document.createElement("label");
        skillLabel.classList.add("resume-skills-label");
        skillLabel.textContent = `Skill ${index + 1}:`;

        // 添加输入框
        const skillInput = document.createElement("input");
        skillInput.type = "text";
        skillInput.value = skill || "";
        skillInput.classList.add("resume-skills-input");
        skillInput.dataset.index = index;

        // 添加删除按钮
        const cancelButton = document.createElement("button");
        cancelButton.classList.add("cancel-skills-button");
        cancelButton.dataset.index = index;
        cancelButton.textContent = "Remove";

        // 将技能块的子元素添加到技能块容器
        skillBlock.appendChild(skillLabel);
        skillBlock.appendChild(skillInput);
        skillBlock.appendChild(cancelButton);

        // 将技能块容器添加到行容器
        rowContainer.appendChild(skillBlock);
    });
}


// 添加技能
function addSkills(skillsData, renderFunction) {
    if (skillsData.length < 9) { // 限制技能数量最多为8
        skillsData.push(""); // 添加一个空技能
        renderFunction(skillsData); // 重新渲染
    } else {
        alert("You can add up to 9 skills only."); // 超过8个时提示
    }
}

// 移除技能
function removeSkills(e, skillsData, renderFunction) {
    e.preventDefault();
    if (e.target.classList.contains("cancel-skills-button")) {
        const index = parseInt(e.target.dataset.index, 10);
        if (!isNaN(index)) {
            skillsData.splice(index, 1);
            renderFunction(skillsData);
        }
    }
}


// 渲染工作經歷列表
function renderWorkExperience(workExperienceData, editExpContainer) {
    editExpContainer.innerHTML = "";
    workExperienceData.forEach((exp, index) => {
        const expDiv = document.createElement("div");
        expDiv.classList.add("two-columns-layout", "grid", "grid-cols-2", "gap-4", "p-4", "rounded", "bg-gray-800", "shadow");

        const responsibilities = Array.isArray(exp.responsibilities)? exp.responsibilities.join("\n") : ""; // 空字符串处理

        expDiv.innerHTML = `
            <label class="resume-subform-label col-span-1">Role:
                <input type="text" class="resume-subform-input" value="${exp.role || ''}" data-index="${index}" data-field="role" />
            </label>
            <label class="resume-subform-label col-span-1">Company:
                <input type="text" class="resume-subform-input" value="${exp.company || ''}" data-index="${index}" data-field="company" />
            </label>
            <label class="resume-subform-label col-span-1">Period:
                <input type="text" class="resume-subform-input" value="${exp.period || ''}" data-index="${index}" data-field="period" />
            </label>
            <label class="resume-subform-label col-span-2">Responsibilities:
                <textarea class="form-textarea" rows="5" name="responsibilities" data-index="${index}" data-field="responsibilities">${responsibilities}</textarea>
            </label>
            <div class="col-span-2 flex justify-end gap-4">
                <button class="cancel-button" data-index="${index}">Remove</button>
            </div>
        `;

        // 添加到主容器中
        editExpContainer.appendChild(expDiv);
    });

}




// 添加工作經歷
function addWorkExperience(workExperienceData, renderFunction) {
    workExperienceData.push({role: "", company: "", period: "", responsibilities: ""});
    renderFunction(workExperienceData);
}

// 移除工作經歷
function removeWorkExperience(e, workExperienceData, renderFunction) {
    e.preventDefault();
    if (e.target.classList.contains("cancel-button")) {
        const index = parseInt(e.target.dataset.index, 10);
        if (!isNaN(index)) {
            workExperienceData.splice(index, 1);
            renderFunction(workExperienceData);
        }
    }
}


// 渲染教育經歷
function renderEduction(educationData, editEduContainer) {
    editEduContainer.innerHTML = "";
    educationData.forEach((edu, index) => {
        const eduDiv = document.createElement("div");
        eduDiv.classList.add("two-columns-layout", "grid", "grid-cols-2", "gap-4", "p-4", "rounded", "bg-gray-800", "shadow");

        const relevantCoursework = Array.isArray(edu.relevantCoursework)? edu.relevantCoursework.join("\n"): ""; // 默认空字符串

        eduDiv.innerHTML = `
            <label class="resume-subform-label col-span-1">Degree:
                <input type="text" class="resume-subform-input" value="${edu.degree || ''}" data-index="${index}" data-field="degree" />
            </label>
            <label class="resume-subform-label col-span-1">Institution:
                <input type="text" class="resume-subform-input" value="${edu.institution || ''}" data-index="${index}" data-field="institution" />
            </label>
            <label class="resume-subform-label col-span-1">Period:
                <input type="text" class="resume-subform-input" value="${edu.period || ''}" data-index="${index}" data-field="period" />
            </label>
            <label class="resume-subform-label col-span-2">RelevantCoursework:
                <textarea class="form-textarea" rows="5" name="relevantCoursework" data-index="${index}" data-field="relevantCoursework">${relevantCoursework}</textarea>
            </label>
            <div class="col-span-2 flex justify-end gap-4">
                <button class="cancel-button" data-index="${index}">Remove</button>
            </div>
        `;

        // 添加到主容器中
        editEduContainer.appendChild(eduDiv);
    });
}

// 添加教育經歷
function addEduction(educationData, renderFunction) {
    educationData.push({
        degree: "",
        institution: "",
        period: "",
        relevantCoursework: []
    });
    renderFunction(educationData);
}

// 移除教育經歷
function removeEduction(e, educationData, renderFunction) {
    e.preventDefault();
    if (e.target.classList.contains("cancel-button")) {
        const index = parseInt(e.target.dataset.index, 10);
        if (!isNaN(index)) {
            educationData.splice(index, 1);
            renderFunction(educationData);
        }
    }
}


// 更新數據（僅更新受影響的部分）
function updateData(e, dataArray, renderFunction, container) {
    const field = e.target.dataset.field;
    const index = parseInt(e.target.dataset.index, 10);

    if (field && !isNaN(index)) {
        // 更新數據
        dataArray[index][field] = e.target.value;

        // 不整體重繪，只更新相關元素（例如，不重新渲染整個表單）
        const updatedElement = container.querySelector(`[data-index="${index}"][data-field="${field}"]`);
        if (updatedElement && updatedElement !== e.target) {
            updatedElement.value = e.target.value;
        }
    }
}


/**
 * 收集表單數據
 */
function collectFormData(workExperienceData, educationData, skillsData) {

    console.log(tempPictureId);
    return {
        name: document.getElementById('edit-name').value,
        title: document.getElementById('edit-title').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        location: document.getElementById('edit-location').value,
        summary: document.getElementById('edit-summary').value,
        experience: workExperienceData,
        education: educationData,
        skills: skillsData,
        //TODO: 照片上傳功能

        profile_photo: tempPictureId, // 添加臨時圖片 ID（如果有）
    };
}


/**
 * 收集工作经历数据
 */
function collectWorkExperienceData(editExpContainer) {
    if (!editExpContainer || !(editExpContainer instanceof HTMLElement)) {
        console.error("Invalid container: editExpContainer must be a DOM element.");
        return []; // 返回空数组以避免后续出错
    }

    const workExperienceData = [];
    const experienceItems = editExpContainer.querySelectorAll(".two-columns-layout");

    experienceItems.forEach((item, index) => {
        const role = item.querySelector(`input[data-index="${index}"][data-field="role"]`)?.value || "";
        const company = item.querySelector(`input[data-index="${index}"][data-field="company"]`)?.value || "";
        const period = item.querySelector(`input[data-index="${index}"][data-field="period"]`)?.value || "";
        const responsibilities = item
            .querySelector(`textarea[data-index="${index}"][data-field="responsibilities"]`)
            ?.value.split("\n")
            .filter(line => line.trim()); // 分割为数组并过滤空行

        workExperienceData.push({
            role,
            company,
            period,
            responsibilities,
        });
    });

    return workExperienceData;
}

/**
 * 从动态生成的教育经历中收集数据
 */
function collectEducationData(editEduContainer) {
    const educationData = [];
    const educationItems = editEduContainer.querySelectorAll(".two-columns-layout"); // 查找每个教育条目

    educationItems.forEach((item, index) => {
        const degree = item.querySelector(`input[data-index="${index}"][data-field="degree"]`)?.value || "";
        const institution = item.querySelector(`input[data-index="${index}"][data-field="institution"]`)?.value || "";
        const period = item.querySelector(`input[data-index="${index}"][data-field="period"]`)?.value || "";
        const relevantCoursework = item
            .querySelector(`textarea[data-index="${index}"][data-field="relevantCoursework"]`)
            ?.value.split("\n")
            .filter(line => line.trim()) || []; // 将多行文本拆分为数组并过滤空行

        console.log(`Index: ${index}, Relevant Coursework Element:`, relevantCoursework);

        educationData.push({
            degree,
            institution,
            period,
            relevantCoursework,
        });
    });

    return educationData;
}



/**
 * 从动态生成的技能列表中收集数据
 */
function collectSkillsData(editSkillsContainer) {
    const skillsData = [];
    const skillInputs = editSkillsContainer.querySelectorAll(".resume-skills-input");

    skillInputs.forEach(input => {
        const skill = input.value.trim(); // 去掉多余的空格
        if (skill) {
            skillsData.push(skill); // 仅添加非空的技能
        }
    });

    return skillsData;
}




/**
 * 發送表單數據到後端
 * @param {Object} data - 收集到的表單數據
 */
function submitFormData(data) {
    return fetch(`${API_BASE_URL}/saveResumeInfo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to save resume. Please try again.');
            }
        })
        .then(data => {
            console.log('Resume saved successfully:', data);
            alert('Resume saved successfully!');
            closeModal(); // 提交成功後關閉模態窗口
            return data; // 成功時返回數據
        })
        .catch(error => {
            console.error('Error saving resume:', error);
            throw error; // 失敗時讓錯誤傳遞出去
        });
}


/**
 * 關閉模態窗口
 */
function closeModal(editModal) {
    if (editModal) {
        editModal.classList.remove('active'); // 根據模態窗口的激活樣式修改此處
        editModal.classList.add('hidden');   // 隱藏模態窗口
        document.body.classList.remove('overflow-hidden'); // 允許背景滾動
    }
}


// 獲取resume信息
document.addEventListener("DOMContentLoaded", getResumeInfo);

function getResumeInfo() {

    const navLinks = document.querySelectorAll('.nav-link');
    const userInfo = document.getElementById('userInfo');

    if (userInfo) {
        console.log('DOM fully loaded, updating userInfo');
        updateUserInfo(userInfo);
        //document.querySelector('.navbar-signup').classList.add('hidden');
    } else {
        console.warn('Element with id="userInfo" not found in DOM');
    }

    if (navLinks && navLinks.length > 0) {
        // 初始调用
        setActiveLink(navLinks);

        // 監聽 hash 變化
        window.addEventListener('hashchange', () => setActiveLink(navLinks));
    }

    // 後端 JSON 接口
    let apiUrl = `${API_BASE_URL}/getResumeInfo?user_id=1`;

    fetch(apiUrl, {
        method: "GET",
        mode: "cors", // 啟用跨域
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            renderResumeInfo(data); // 調用渲染數據方法
        })
        .catch(error => {
            console.error("Error fetching resume data:", error);
            const summarySection = document.getElementById("summary-section");
            if (summarySection) {
                summarySection.innerHTML = `<p class="resume-error-text">Failed to load resume data.</p>`;
            }
        });

    // Edit button functionality
    const editButton = document.querySelector('#edit-resume-btn');
    const editModal = document.querySelector('#edit-modal');
    const cancelEdit = document.querySelector('#cancel-edit');
    const backHome = document.querySelector("#backHomeButton");

    // 返回主頁
    backHome.addEventListener("click", function () {
        window.location.href = "index.html";
    });

    // 編輯resume
    editButton.addEventListener('click', () => {
        console.log('Edit button clicked'); // 檢查事件是否觸發
        editModal.classList.add('active'); // 顯示模態框
    });

    // 取消編輯
    cancelEdit.addEventListener('click', () => {
        editModal.classList.remove('active'); // 隱藏模態框
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



// 渲染數據的方法
function renderResumeInfo(profile) {
    // 渲染 Resume Header
    const resumeHeader = document.getElementById("resume-header");
    resumeHeader.innerHTML = ""; // 清空舊內容
    const headerHTML = `
        <div class="resume-header">
            <div class="resume-photo-name">
                <img id="profile-picture" 
                     src="${profile.profile_photo || '/placeholder.svg'}" 
                     alt="${profile.name || 'N/A'}" 
                     class="resume-photo">
                <div>
                    <h3 class="resume-name-font">${profile.name || 'N/A'}</h3>
                    <p class="resume-title">${profile.title || 'N/A'}</p>
                </div>
            </div>
            <div class="text-right">
                <a href="mailto:${profile.email || '#'}" class="resume-email">Email: ${profile.email || 'N/A'}</a>
                <p class="mb-1">Phone Number: ${profile.phone || 'N/A'}</p>
                <p>Location: ${profile.location || 'N/A'}</p>
            </div>
        </div>`;
    resumeHeader.insertAdjacentHTML("beforeend", headerHTML);

    // 渲染 Summary
    const summarySection = document.getElementById("summary-section");
    if (summarySection) {
        summarySection.innerHTML = ""; // 清空舊內容
        const summaryHTML = `
        <div class="mb-10">
            <h3 class="resume-section-header">Summary</h3>
            <p class="resume-description-text">${profile.summary || "No summary available."}</p>
        </div>`;
        summarySection.insertAdjacentHTML("beforeend", summaryHTML);
    }

    // 渲染 Work Experience
    const workExperienceContainer = document.getElementById("work-experience");
    workExperienceContainer.innerHTML = ""; // 清空舊內容
    if (profile.experience && profile.experience.length > 0) {
        const workExperienceHTML = `
        <div class="mb-10">
            <h3 class="resume-section-header">Work Experience</h3>
           ${profile.experience.map(exp => {
            const responsibilities = Array.isArray(exp.responsibilities)
                ? exp.responsibilities
                : (typeof exp.responsibilities === 'string' ? exp.responsibilities.split('\n') : []);
            return `
                    <div class="mb-6">
                        <h4 class="resume-section-subhead">${exp.role || "N/A"}</h4>
                        <p class="resume-experience-time">${exp.company || "N/A"} | ${exp.period || "N/A"}</p>
                        <ul class="resume-list-text">
                            ${responsibilities.map(item => `<li>${item}</li>`).join("")}
                        </ul>
                    </div>`;
        }).join("")}
        </div>`;
        workExperienceContainer.insertAdjacentHTML("beforeend", workExperienceHTML);
    }

    // 渲染 Education
    const educationSection = document.getElementById("education-section");
    educationSection.innerHTML = ""; // 清空舊內容
    if (profile.education && profile.education.length > 0) {
        const educationHTML = `
        <div class="mb-10">
            <h3 class="resume-section-header">Education</h3>
            ${profile.education.map(edu => {
            const coursework = Array.isArray(edu.relevantCoursework)
                ? edu.relevantCoursework.join(", ")
                : "N/A";
            return `
                <div>
                    <h4 class="resume-section-subhead">${edu.degree || "N/A"}</h4>
                    <p class="resume-experience-time">${edu.institution || "N/A"} | ${edu.period || "N/A"}</p>
                    <p class="resume-description-text">Relevant coursework: ${coursework}</p>
                </div>`;
        }).join("")}
        </div>`;
        educationSection.insertAdjacentHTML("beforeend", educationHTML);
    }

    // 渲染 Skills
    const skillsSection = document.getElementById("skills-section");
    skillsSection.innerHTML = ""; // 清空舊內容
    if (profile.skills && profile.skills.length > 0) {
        const validSkills = profile.skills.filter(skill => skill); // 過濾空值
        const skillsHTML = `
            <h3 class="resume-section-header">Skills</h3>
            <ul class="resume-skills-unordered-list">
                ${validSkills.slice(0, 8).map(skill => `<li class="resume-skills-list">${skill}</li>`).join("")}
            </ul>`;
        skillsSection.insertAdjacentHTML("beforeend", skillsHTML);
    }
}
