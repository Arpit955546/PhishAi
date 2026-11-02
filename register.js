
const API_BASE_URL = "http://localhost:5000";

const REGISTER_API =
    `${API_BASE_URL}/api/auth/register`;

const registerForm =
    document.getElementById("registerForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const termsInput =
    document.getElementById("terms");

const messageBox =
    document.getElementById("message");

const registerBtn =
    document.getElementById("registerBtn");

const btnText =
    document.getElementById("btnText");

const strengthFill =
    document.getElementById("strengthFill");

const strengthText =
    document.getElementById("strengthText");


// ========================================
// MESSAGE
// ========================================

function showMessage(message, type) {

    messageBox.textContent = message;

    messageBox.className =
        `message ${type}`;
}


// ========================================
// PASSWORD TOGGLE
// ========================================

function setupPasswordToggle(buttonId, inputId) {

    const button =
        document.getElementById(buttonId);

    const input =
        document.getElementById(inputId);

    button.addEventListener("click", () => {

        if (input.type === "password") {

            input.type = "text";

            button.textContent = "🙈";

        } else {

            input.type = "password";

            button.textContent = "👁";
        }
    });
}


setupPasswordToggle(
    "passwordToggle",
    "password"
);

setupPasswordToggle(
    "confirmPasswordToggle",
    "confirmPassword"
);


// ========================================
// PASSWORD STRENGTH
// ========================================

passwordInput.addEventListener(
    "input",
    () => {

        const password =
            passwordInput.value;

        let strength = 0;

        if (password.length >= 6) {
            strength += 25;
        }

        if (password.length >= 8) {
            strength += 25;
        }

        if (/[A-Z]/.test(password)) {
            strength += 15;
        }

        if (/[0-9]/.test(password)) {
            strength += 15;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 20;
        }

        strengthFill.style.width =
            `${strength}%`;

        if (password.length === 0) {

            strengthText.textContent =
                "Minimum 6 characters";

        } else if (strength < 40) {

            strengthText.textContent =
                "Weak password";

        } else if (strength < 70) {

            strengthText.textContent =
                "Medium password";

        } else {

            strengthText.textContent =
                "Strong password";
        }
    }
);


// ========================================
// REGISTER
// ========================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        showMessage("", "");

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // Name validation

        if (name.length < 2) {

            showMessage(
                "Please enter a valid name.",
                "error"
            );

            nameInput.focus();

            return;
        }


        // Email validation

        if (!emailInput.checkValidity()) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();

            return;
        }


        // Password validation

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            passwordInput.focus();

            return;
        }


        // Confirm password

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            confirmPasswordInput.focus();

            return;
        }


        // Terms

        if (!termsInput.checked) {

            showMessage(
                "Please accept the Terms of Service and Privacy Policy.",
                "error"
            );

            return;
        }


        // Loading state

        registerBtn.disabled = true;

        registerBtn.classList.add("loading");


        try {

            const response =
                await fetch(REGISTER_API, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                });


            const result =
                await response.json();


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Registration failed."
                );
            }


            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerForm.reset();

            strengthFill.style.width = "0%";

            strengthText.textContent =
                "Minimum 6 characters";


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to connect to PhishAI server.",
                "error"
            );

        } finally {

            registerBtn.disabled = false;

            registerBtn.classList.remove(
                "loading"
            );
        }
    }
);
