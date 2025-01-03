const API_BASE_URL = '"https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            mode: 'cors', // 啟用跨域
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: name, email, password }),
        });

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            const data = await response.json();
            errorMessage.textContent = data.msg || 'An error occurred during registration';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred during registration';
        errorMessage.classList.remove('hidden');
    }
});