document.addEventListener('DOMContentLoaded', (event) => {

    //編輯和添加工作經歷
    let workExperienceData = [];
    const editExpContainer = document.querySelector('#edit-experience');
    const addWorkExpButton = document.querySelector('#add-work-experience');


    //編輯和添加教育經歷
    let educationData = [];
    const editEduContainer = document.querySelector('#edit-education');
    const addEducationButton = document.querySelector('#add-education');


    // 後端 JSON 接口
    let  apiUrl = "http://127.0.0.1:5000/api/getResumeInfo?user_id=1";
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
            // 加載個人資料部分
            document.getElementById('edit-name').value = profile.name || '';
            document.getElementById('edit-email').value = profile.email || '';
            document.getElementById('edit-phone').value = profile.phone || '';
            document.getElementById('edit-location').value = profile.location || '';
            document.getElementById('edit-summary').value = profile.summary || '';
            workExperienceData = data.experience || [];

            educationData = data.education || [];

            renderWorkExperience(workExperienceData, editExpContainer);
            renderEduction(educationData, editEduContainer);
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
    editExpContainer.addEventListener('input', (e) => {
        updateData(e, workExperienceData, renderWorkExperience, editExpContainer);
    });



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
    editEduContainer.addEventListener('input', (e) => {
        updateData(e, educationData, renderEduction, editEduContainer);
    });

    // Profile picture upload functionality
    const profilePictureInput = document.getElementById('edit-profile-picture');
    profilePictureInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-picture').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });







    // 提交resume
    document.querySelector('#edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission (update resume data)
        console.log('Resume updated');
        // You would typically send this data to a server to update the resume
        // editModal.classList.add('hidden');
        editModal.classList.remove('active');
        // Refresh the page or update the resume display with the new data
    });


});


// 渲染工作經歷列表
function renderWorkExperience(workExperienceData, editExpContainer) {
    editExpContainer.innerHTML = "";
    workExperienceData.forEach((exp, index) => {
        const expDiv = document.createElement("div");
        expDiv.classList.add("experience-entry", "grid", "grid-cols-2", "gap-4", "p-4", "rounded", "bg-gray-800", "shadow");

        const responsibilities = (exp.responsibilities || []).join("\n"); // 將數組轉換為多行文本

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
    workExperienceData.push({ role: "", company: "", period: "", responsibilities: "" });
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
        eduDiv.classList.add("experience-entry", "grid", "grid-cols-2", "gap-4", "p-4", "rounded", "bg-gray-800", "shadow");

        const relevantCoursework = (edu.relevantCoursework || []).join("\n"); // 將數組轉換為多行文本

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


// 更新數據
function updateData(e, dataArray, renderFunction, container) {
    const field = e.target.dataset.field;
    const index = parseInt(e.target.dataset.index, 10);

    if (field && !isNaN(index)) {
        dataArray[index][field] = e.target.value;
        renderFunction(dataArray, container); // 更新後重新渲染
    }
}




// 獲取resume信息
document.addEventListener("DOMContentLoaded", getResumeInfo);

function getResumeInfo() {

    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === '#home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    // 後端 JSON 接口
    let apiUrl = "http://127.0.0.1:5000/api/getResumeInfo?user_id=1";

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
            console.log("Fetched Data:", data); // 檢查數據結構

            // 個人資料部分
            const profile = data;

            // 渲染 Resume Header
            const resumeHeader = document.getElementById("resume-header");
            resumeHeader.innerHTML = ""; // 清空舊內容
            const headerHTML = `
                <div class="resume-header">
                    <div class="resume-photo-name">
                        <img id="profile-picture" src="${profile.profile_photo_url || '/placeholder.svg'}?height=150&width=150" 
                             alt="${profile.name || 'N/A'}" class="resume-photo">
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
            document.getElementById("summary").textContent = profile.summary || "No summary available.";
            const summarySection = document.getElementById("summary-section");
            if (summarySection) {
                summarySection.innerHTML = ""; // 清空舊內容
                const summaryHTML = `
                <div class="mb-10">
                    <h3 class="resume-section-header">Summary</h3>
                    <p class="resume-description-text">${data.summary || "No summary available."}</p>
                </div>`;
                summarySection.insertAdjacentHTML("beforeend", summaryHTML);
            }


            // 更新 Work Experience
            const workExperienceContainer = document.getElementById("work-experience");
            workExperienceContainer.innerHTML = ""; // 清空舊內容

            if (profile.experience && profile.experience.length > 0) {
                const workExperienceHTML = `
                <div class="mb-10">
                    <h3 class="resume-section-header">Work Experience</h3>
                   ${profile.experience.map(exp => {
                            // 直接使用 responsibilities 數組
                            const responsibilities = exp.responsibilities || [];
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


            // 更新 Education
            const educationSection = document.getElementById("education-section");
            educationSection.innerHTML = ""; // 清空舊內容

            if (profile.education && profile.education.length > 0) {
                const educationHTML = `
                <div class="mb-10">
                    <h3 class="resume-section-header">Education</h3>
                    ${profile.education.map(edu => `
                        <div>
                            <h4 class="resume-section-subhead">${edu.degree || "N/A"}</h4>
                            <p class="resume-experience-time">${edu.institution || "N/A"} | ${edu.period || "N/A"}</p>
                            <p class="resume-description-text">Relevant coursework: ${edu.relevantCoursework ? edu.relevantCoursework.join(", ") : "N/A"}</p>
                        </div>
                    `).join("")}
                </div>`;
                educationSection.insertAdjacentHTML("beforeend", educationHTML);
            }


            // 更新 Skills
            const skillsSection = document.getElementById("skills-section");
            skillsSection.innerHTML = ""; // 清空舊內容

            if (profile.skills && profile.skills.length > 0) {
                const skillsHTML = `
                <h3 class="resume-section-header">Skills</h3>
                <ul class="resume-skills-unordered-list">
                    ${profile.skills.slice(0,8).map(skill => `
                        <li class="resume-skills-list">${skill}</li>
                    `).join("")}
                </ul>`;
                        skillsSection.insertAdjacentHTML("beforeend", skillsHTML);
            }

        })
        .catch(error => {
            console.error("Error fetching resume data:", error);
            document.getElementById("summary").textContent = "Failed to load resume data.";
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