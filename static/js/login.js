const API_BASE_URL = '/api';
// const API_BASE_URL = 'https://cmt120personalportfolio-cmt120-personal-portfolio.apps.containers.cs.cf.ac.uk/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // 後端 JSON 接口
    let apiUrl = `${API_BASE_URL}/login`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors', // 啟用跨域
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem("username", data.username);
            // 跳轉或顯示成功信息
            alert("Login successful!");
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            errorMessage.textContent = data.msg || 'Invalid username or password';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred during login';
        errorMessage.classList.remove('hidden');
    }
});