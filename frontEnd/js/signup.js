document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
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