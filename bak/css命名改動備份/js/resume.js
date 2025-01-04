document.addEventListener('DOMContentLoaded', (event) => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === '#home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Edit button functionality
    const editButton = document.getElementById('edit-resume-btn');
    const editModal = document.getElementById('edit-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const backHome = document.getElementById("backHomeButton");


    backHome.addEventListener("click", function () {
        window.location.href = "../index.html";
    });

    editButton.addEventListener('click', () => {
        // editModal.classList.remove('hidden');
        editModal.classList.add('active'); // 顯示模態框
        // Populate form with current resume data
        document.getElementById('edit-name').value = "John Doe";
        document.getElementById('edit-email').value = "john.doe@example.com";
        document.getElementById('edit-phone').value = "(123) 456-7890";
        document.getElementById('edit-location').value = "New York, NY";
        document.getElementById('edit-summary').value = "Experienced web developer with a strong background in front-end and back-end technologies. Passionate about creating responsive and user-friendly web applications. Skilled in leading development teams and mentoring junior developers.";
        document.getElementById('edit-experience').value = "Senior Web Developer\nTechCorp Inc. | 2018 - Present\n- Led development of multiple high-traffic websites\n- Implemented responsive design principles\n- Mentored junior developers\n\nWeb Developer\nWebSolutions Co. | 2015 - 2018\n- Developed and maintained client websites\n- Collaborated with design team to implement UI/UX improvements\n- Optimized website performance and SEO";
        document.getElementById('edit-education').value = "Bachelor of Science in Computer Science\nUniversity of Technology | 2011 - 2015";
        document.getElementById('edit-skills').value = "HTML5 / CSS3, JavaScript / TypeScript, React / Vue.js, Node.js / Express, Python / Django, SQL / NoSQL Databases, Git / Version Control, Agile / Scrum Methodologies";
    });

    cancelEdit.addEventListener('click', () => {
        // editModal.classList.add('hidden');
        editModal.classList.remove('active'); // 隱藏模態框
    });

    document.getElementById('edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission (update resume data)
        console.log('Resume updated');
        // You would typically send this data to a server to update the resume
        // editModal.classList.add('hidden');
        editModal.classList.remove('active');
        // Refresh the page or update the resume display with the new data
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
});


// 獲取resume信息
document.addEventListener("DOMContentLoaded",getResumeInfo);


function getResumeInfo() {
    const apiUrl = "http://127.0.0.1:5000/api/getResumeInfo?user_id=1"; // 後端 JSON 接口

    fetch("http://127.0.0.1:5000/api/getResumeInfo?user_id=1", {
        method: "GET",
        mode: "cors",  // 啟用跨域
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

            // 個人資料部分 (確保字段存在)
            const profile = data.profile || {};
            document.getElementById("name").textContent = profile.name || "N/A";
            document.getElementById("title").textContent = profile.title || "N/A";
            document.getElementById("email").textContent = profile.email || "N/A";
            document.getElementById("email").href = profile.email ? `mailto:${profile.email}` : "#";
            document.getElementById("phone").textContent = profile.phone || "N/A";
            document.getElementById("location").textContent = profile.location || "N/A";
            document.getElementById("profile-picture").src = profile.profilePicture || "placeholder.jpg";

            // 更新 Summary
            document.getElementById("summary").textContent = data.summary || "No summary available.";

            // 更新 Work Experience
            const workExperienceContainer = document.getElementById("work-experience");
            workExperienceContainer.innerHTML = ""; // 清空
            (data.workExperience || []).forEach(exp => {
                const html = `
                <div>
                    <h4>${exp.role || "N/A"}</h4>
                    <p>${exp.company || "N/A"} | ${exp.time || "N/A"}</p>
                    <ul>
                        ${(exp.responsibilities || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>`;
                workExperienceContainer.insertAdjacentHTML("beforeend", html);
            });

            // 更新 Education
            const education = data.education || {};
            document.getElementById("education-degree").textContent = education.degree || "N/A";
            document.getElementById("education-time").textContent = `${education.university || "N/A"} | ${education.time || "N/A"}`;
            document.getElementById("education-details").textContent = `Relevant coursework: ${education.coursework || "N/A"}`;

            // 更新 Skills
            const skillsList = document.getElementById("skills-list");
            skillsList.innerHTML = ""; // 清空
            (data.skills || []).forEach(skill => {
                const li = document.createElement("li");
                li.textContent = skill;
                skillsList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error fetching resume data:", error);
            document.getElementById("summary").textContent = "Failed to load resume data.";
        });
}