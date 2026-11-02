
const API_BASE_URL = "http://localhost:5000";

const LOGIN_API =
    `${API_BASE_URL}/api/auth/login`;


const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const rememberMe =
    document.getElementById("rememberMe");

const loginBtn =
    document.getElementById("loginBtn");

const btnText =
    document.getElementById("btnText");

const messageBox =
    document.getElementById("message");

const passwordToggle =
    document.getElementById("passwordToggle");

const forgotPassword =
    document.getElementById("forgotPassword");


// ========================================
// MESSAGE
// ========================================

function showMessage(message, type) {

    messageBox.textContent = message;

    messageBox.className =
        `message ${type}`;
}


// ========================================
// PASSWORD SHOW / HIDE
// ========================================

passwordToggle.addEventListener(
    "click",
    () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            passwordToggle.textContent = "🙈";

        } else {

            passwordInput.type = "password";

            passwordToggle.textContent = "👁";
        }
    }
);


// ========================================
// FORGOT PASSWORD
// ========================================

forgotPassword.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        showMessage(
            "Password recovery will be available soon.",
            "error"
        );
    }
);


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        showMessage("", "");

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        // ================================
        // VALIDATION
        // ================================

        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            emailInput.focus();

            return;
        }


        if (!emailInput.checkValidity()) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();

            return;
        }


        if (!password) {

            showMessage(
                "Please enter your password.",
                "error"
            );

            passwordInput.focus();

            return;
        }


        // ================================
        // LOADING
        // ================================

        loginBtn.disabled = true;

        loginBtn.classList.add("loading");


        try {

            const response =
                await fetch(LOGIN_API, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                });


            const result =
                await response.json();


            // ================================
            // BACKEND ERROR
            // ================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Login failed."
                );
            }


            // ================================
            // USER DATA
            // ================================

            const token =
                result.data?.token;

            const user =
                result.data?.user;


            if (!token || !user) {

                throw new Error(
                    "Invalid login response from server."
                );
            }


            // ================================
            // SAVE AUTH DATA
            // ================================

            const storage =
                rememberMe.checked
                    ? localStorage
                    : sessionStorage;


            storage.setItem(
                "phishAI_token",
                token
            );

            storage.setItem(
                "phishAI_user",
                JSON.stringify(user)
            );


            // ================================
            // SUCCESS
            // ================================

            showMessage(
                `Welcome back, ${user.name}! Redirecting...`,
                "success"
            );


            // ================================
            // ROLE BASED REDIRECT
            // ================================

            setTimeout(() => {

                if (user.role === "admin") {

                    window.location.href =
                        "admin-dashboard.html";

                } else {

                    window.location.href =
                        "index.html";
                }

            }, 800);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to connect to PhishAI server.",
                "error"
            );

        } finally {

            loginBtn.disabled = false;

            loginBtn.classList.remove(
                "loading"
            );
        }
    }
);
