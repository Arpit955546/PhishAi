
document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // ELEMENTS
    // ================================

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const navLinks =
        document.querySelector(".nav-links");

    const nav =
        document.querySelector(".navbar");


    // ================================
    // MOBILE MENU
    // ================================

    if (mobileMenuBtn && navLinks) {

        mobileMenuBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            navLinks.classList.toggle("active");

            const isOpen =
                navLinks.classList.contains("active");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        // ================================
        // CLOSE MENU AFTER NAV LINK CLICK
        // ================================

        const links =
            navLinks.querySelectorAll("a");

        links.forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });


        // ================================
        // CLOSE MENU WHEN CLICKING OUTSIDE
        // ================================

        document.addEventListener("click", (event) => {

            if (
                navLinks.classList.contains("active") &&
                !navLinks.contains(event.target) &&
                !mobileMenuBtn.contains(event.target)
            ) {

                navLinks.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        });


        // ================================
        // CLOSE MENU WITH ESC
        // ================================

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                navLinks.classList.contains("active")
            ) {

                navLinks.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mobileMenuBtn.focus();
            }

        });


        // ================================
        // RESET MOBILE MENU ON DESKTOP
        // ================================

        window.addEventListener("resize", () => {

            if (window.innerWidth > 720) {

                navLinks.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    // ================================
    // NAVBAR SCROLL EFFECT
    // ================================

    if (nav) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 30) {

                nav.classList.add("scrolled");

            } else {

                nav.classList.remove("scrolled");

            }

        });

    }


    // ================================
    // SMOOTH SCROLL
    // ================================

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    // ================================
    // CONSOLE
    // ================================

    console.log(
        "🛡️ PhishAI Landing Page Loaded"
    );

});
