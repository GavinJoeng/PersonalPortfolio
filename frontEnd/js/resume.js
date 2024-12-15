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
        window.location.href = "index.html";
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