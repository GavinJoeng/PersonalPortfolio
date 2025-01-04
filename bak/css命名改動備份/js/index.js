document.addEventListener('DOMContentLoaded', (event) => {
    const navLinks = document.querySelectorAll('.nav-link');

    function setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // 默認為 index.html
        const hash = window.location.hash;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');

            // 僅匹配 pathname 或 hash，避免重複激活
            if ((href === currentPage && !hash) || href === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setActiveLink();

    // 監聽 hash 變化
    window.addEventListener('hashchange', setActiveLink);
});


// 動態加載指定部分
fetch('projects.html')
    .then(response => response.text()) // 獲取整個 HTML 文件
    .then(html => {
        const parser = new DOMParser(); // 解析 HTML
        const doc = parser.parseFromString(html, 'text/html');
        const projectsSection = doc.querySelector('#projects'); // 提取指定部分

        if (projectsSection) {
            // 移除不需要的部分
            const unwantedDiv = projectsSection.querySelector('#viewProjects');
            if (unwantedDiv) unwantedDiv.remove();
            document.getElementById('projects-container').innerHTML = projectsSection.outerHTML;
        } else {
            console.error('Projects section not found in projects.html');
        }
    })
    .catch(error => console.error('Error loading projects.html:', error));


// 動態加載指定部分
fetch('resume.html')
    .then(response => response.text()) // 獲取整個 HTML 文件
    .then(html => {
        const parser = new DOMParser(); // 解析 HTML
        const doc = parser.parseFromString(html, 'text/html');
        const resumeSection = doc.querySelector('#resume'); // 提取指定部分

        if (resumeSection) {
            // 移除不需要的部分
            const unwantedDiv = resumeSection.querySelector('#backHome');
            if (unwantedDiv) unwantedDiv.remove();
            document.getElementById('resume-container').innerHTML = resumeSection.outerHTML;
        } else {
            console.error('resume section not found in resume.html');
        }
    })
    .catch(error => console.error('Error loading resume.html:', error));