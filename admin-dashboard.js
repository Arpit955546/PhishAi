const API_BASE_URL = "http://localhost:5000";


/* =========================================================
   AUTH
========================================================= */

function getToken() {

    return (
        localStorage.getItem("phishAI_token") ||
        sessionStorage.getItem("phishAI_token")
    );

}


function getCurrentUser() {

    try {

        const storedUser =
            localStorage.getItem("phishAI_user") ||
            sessionStorage.getItem("phishAI_user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch (error) {

        console.error(
            "❌ Unable to read user data:",
            error
        );

        return null;
    }

}


/* =========================================================
   API REQUEST
========================================================= */

async function fetchAdminDashboard() {

    const token = getToken();

    if (!token) {

        console.error(
            "❌ Admin authentication token not found"
        );

        redirectToLogin();

        return null;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/dashboard`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        const result =
            await response.json();


        console.log(
            "📊 Admin Dashboard API:",
            result
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            console.error(
                "❌ Admin authorization failed"
            );

            redirectToLogin();

            return null;
        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load admin dashboard"
            );

        }


        return result.data;


    } catch (error) {

        console.error(
            "❌ Admin Dashboard API Error:",
            error
        );

        showDashboardError(
            error.message
        );

        return null;
    }

}


/* =========================================================
   UPDATE PROFILE
========================================================= */

function updateAdminProfile() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const profileName =
        document.querySelector(
            ".profile-info strong"
        );

    const welcomeHeading =
        document.querySelector(
            ".dashboard-heading h1"
        );


    if (profileName) {

        profileName.textContent =
            user.name || "Admin";

    }


    if (welcomeHeading) {

        welcomeHeading.innerHTML =
            `Welcome back, ${
                user.name || "Admin"
            } <span>👋</span>`;

    }


    const avatar =
        document.querySelector(
            ".profile-avatar"
        );


    if (avatar) {

        const name =
            user.name || "A";

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   KPI CARDS
========================================================= */

function updateKPICards(data) {

    const totalUsers =
        document.querySelector(
            ".users-card .stat-value"
        );


    const emailScans =
        document.querySelector(
            ".email-card .stat-value"
        );


    const urlScans =
        document.querySelector(
            ".url-card .stat-value"
        );


    const threats =
        document.querySelector(
            ".threats-card .stat-value"
        );


    /*
     * TOTAL USERS
     */

    if (totalUsers) {

        totalUsers.textContent =
            formatNumber(
                data.totalUsers
            );

    }


    /*
     * EMAIL SCANS
     */

    if (emailScans) {

        emailScans.textContent =
            formatNumber(
                data.totalEmailAnalyses
            );

    }


    /*
     * URL SCANS
     *
     * Backend URL statistics are not
     * available yet.
     */

    if (urlScans) {

        urlScans.textContent = "—";

    }


    /*
     * THREATS
     */

    if (threats) {

        threats.textContent =
            formatNumber(
                data.threatsDetected
            );

    }


    /*
     * Remove fake percentage
     * values because current API
     * does not provide comparison
     * statistics.
     */

    document
        .querySelectorAll(
            ".stat-card .stat-change"
        )
        .forEach(element => {

            element.textContent =
                "Live data";

        });


    document
        .querySelectorAll(
            ".stat-card small"
        )
        .forEach(element => {

            element.textContent =
                "From MongoDB";

        });

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function renderRecentActivity(
    analyses
) {

    const container =
        document.querySelector(
            ".activity-list"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(analyses) ||
        analyses.length === 0
    ) {

        container.innerHTML = `

            <div class="activity-item">

                <div class="activity-icon success">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <div class="activity-info">

                    <strong>
                        No recent analyses
                    </strong>

                    <span>
                        No activity found
                    </span>

                </div>

            </div>

        `;

        return;
    }


    container.innerHTML =
        analyses
            .map(
                analysis =>
                    createActivityItem(
                        analysis
                    )
            )
            .join("");

}


/* =========================================================
   CREATE ACTIVITY ITEM
========================================================= */

function createActivityItem(
    analysis
) {

    const risk =
        String(
            analysis.riskLevel ||
            "LOW"
        ).toUpperCase();


    const riskClass =
        getRiskClass(
            risk
        );


    const icon =
        getRiskIcon(
            risk
        );


    const user =
        analysis.user;


    const userEmail =
        user?.email ||
        "Unknown user";


    const subject =
        analysis.subject ||
        "Email analysis";


    const activityTitle =
        getActivityTitle(
            risk
        );


    const time =
        formatRelativeTime(
            analysis.createdAt
        );


    return `

        <div class="activity-item">

            <div class="activity-icon ${riskClass}">
                <i class="${icon}"></i>
            </div>

            <div class="activity-info">

                <strong>
                    ${escapeHTML(activityTitle)}
                </strong>

                <span>
                    ${escapeHTML(userEmail)}
                </span>

            </div>

            <span class="risk-badge ${riskClass}">
                ${escapeHTML(risk)}
            </span>

            <time>
                ${escapeHTML(time)}
            </time>

        </div>

    `;

}


/* =========================================================
   THREAT DISTRIBUTION
========================================================= */

function updateThreatDistribution(
    analyses
) {

    const counts = {

        HIGH: 0,
        CRITICAL: 0,
        MEDIUM: 0,
        LOW: 0

    };


    if (Array.isArray(analyses)) {

        analyses.forEach(
            analysis => {

                const risk =
                    String(
                        analysis.riskLevel ||
                        "LOW"
                    ).toUpperCase();


                if (
                    counts.hasOwnProperty(
                        risk
                    )
                ) {

                    counts[risk]++;

                }

            }
        );

    }


    const total =
        Object.values(
            counts
        ).reduce(
            (sum, value) =>
                sum + value,
            0
        );


    /*
     * Current backend only sends
     * recent analyses, so this
     * distribution represents the
     * returned recent data.
     */

    const high =
        counts.HIGH +
        counts.CRITICAL;


    const medium =
        counts.MEDIUM;


    const low =
        counts.LOW;


    const highPercent =
        percentage(
            high,
            total
        );


    const mediumPercent =
        percentage(
            medium,
            total
        );


    const lowPercent =
        percentage(
            low,
            total
        );


    const centerNumber =
        document.querySelector(
            ".donut-center strong"
        );


    if (centerNumber) {

        centerNumber.textContent =
            formatNumber(
                high + medium
            );

    }


    const riskItems =
        document.querySelectorAll(
            ".risk-list .risk-item"
        );


    if (
        riskItems.length >= 3
    ) {

        riskItems[0]
            .querySelector("strong")
            .textContent =
                `${highPercent}%`;


        riskItems[1]
            .querySelector("strong")
            .textContent =
                `${mediumPercent}%`;


        riskItems[2]
            .querySelector("strong")
            .textContent =
                `${lowPercent}%`;

    }

}


/* =========================================================
   TOP ACTIVE USERS
========================================================= */

function updateTopUsers(
    analyses
) {

    const tbody =
        document.querySelector(
            ".users-table-card tbody"
        );


    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(analyses) ||
        analyses.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;"
                >
                    No user activity found
                </td>

            </tr>

        `;

        return;
    }


    const userStats =
        {};


    analyses.forEach(
        analysis => {

            const user =
                analysis.user;


            if (!user?._id) {
                return;
            }


            const userId =
                String(
                    user._id
                );


            if (!userStats[userId]) {

                userStats[userId] = {

                    name:
                        user.name ||
                        "Unknown",

                    email:
                        user.email ||
                        "Unknown",

                    analyses: 0,

                    threats: 0

                };

            }


            userStats[userId]
                .analyses++;


            const risk =
                String(
                    analysis.riskLevel ||
                    "LOW"
                ).toUpperCase();


            if (
                risk === "HIGH" ||
                risk === "CRITICAL"
            ) {

                userStats[userId]
                    .threats++;

            }

        }
    );


    const users =
        Object.values(
            userStats
        )
        .sort(
            (a, b) =>
                b.analyses -
                a.analyses
        )
        .slice(
            0,
            5
        );


    tbody.innerHTML =
        users
            .map(
                (user, index) => `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                user.email
                            )}
                        </td>

                        <td>

                            <span
                                class="table-role"
                            >
                                User
                            </span>

                        </td>

                        <td>
                            ${user.analyses}
                        </td>

                        <td>

                            <span
                                class="threat-number"
                            >
                                ${user.threats}
                            </span>

                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   SYSTEM STATUS
========================================================= */

async function checkSystemHealth() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/health`
            );


        const data =
            await response.json();


        console.log(
            "❤️ System Health:",
            data
        );


        const systemItems =
            document.querySelectorAll(
                ".system-list .system-item"
            );


        if (!systemItems.length) {
            return;
        }


        /*
         * API SERVER
         */

        updateSystemItem(
            systemItems[0],
            response.ok
        );


        /*
         * DATABASE
         *
         * Backend health currently
         * confirms backend service.
         */

        updateSystemItem(
            systemItems[1],
            response.ok
        );


        /*
         * THREAT DETECTION
         */

        updateSystemItem(
            systemItems[2],
            Boolean(
                data.emailAnalysis
            )
        );


        /*
         * EMAIL ANALYSIS
         */

        updateSystemItem(
            systemItems[3],
            Boolean(
                data.emailAnalysis
            )
        );


        /*
         * URL ANALYSIS
         */

        updateSystemItem(
            systemItems[4],
            Boolean(
                data.urlAnalysis
            )
        );


    } catch (error) {

        console.error(
            "❌ Health check failed:",
            error
        );

    }

}


/* =========================================================
   SYSTEM ITEM
========================================================= */

function updateSystemItem(
    element,
    online
) {

    if (!element) {
        return;
    }


    const status =
        element.querySelector(
            "strong"
        );


    if (!status) {
        return;
    }


    if (online) {

        status.className =
            "online";

        status.innerHTML = `
            <i class="fa-solid fa-circle"></i>
            Online
        `;

    } else {

        status.className =
            "offline";

        status.innerHTML = `
            <i class="fa-solid fa-circle"></i>
            Offline
        `;

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            localStorage.removeItem(
                "phishAI_token"
            );

            localStorage.removeItem(
                "phishAI_user"
            );


            sessionStorage.removeItem(
                "phishAI_token"
            );

            sessionStorage.removeItem(
                "phishAI_user"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

function setupAdminSearch() {

    const searchInput =
        document.getElementById(
            "adminSearch"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function() {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            if (!search) {

                renderRecentActivity(
                    window.adminAnalyses || []
                );

                return;

            }


            const filtered =
                (
                    window.adminAnalyses ||
                    []
                )
                .filter(
                    analysis => {

                        const email =
                            String(
                                analysis
                                    .user
                                    ?.email ||
                                ""
                            )
                            .toLowerCase();


                        const name =
                            String(
                                analysis
                                    .user
                                    ?.name ||
                                ""
                            )
                            .toLowerCase();


                        const subject =
                            String(
                                analysis
                                    .subject ||
                                ""
                            )
                            .toLowerCase();


                        const risk =
                            String(
                                analysis
                                    .riskLevel ||
                                ""
                            )
                            .toLowerCase();


                        return (
                            email.includes(
                                search
                            ) ||
                            name.includes(
                                search
                            ) ||
                            subject.includes(
                                search
                            ) ||
                            risk.includes(
                                search
                            )
                        );

                    }
                );


            renderRecentActivity(
                filtered
            );

        }
    );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function setupNotifications() {

    const button =
        document.getElementById(
            "notificationBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            console.log(
                "🔔 Notifications clicked"
            );

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".admin-nav-item"
        );


    navItems.forEach(
        item => {

            if (
                item.classList.contains(
                    "logout-btn"
                )
            ) {
                return;
            }


            item.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    navItems.forEach(
                        nav =>
                            nav.classList
                                .remove(
                                    "active"
                                )
                    );


                    this.classList.add(
                        "active"
                    );


                    const label =
                        this
                            .querySelector(
                                "span"
                            )
                            ?.textContent
                            ?.trim();


                    console.log(
                        `📌 Admin section selected: ${label}`
                    );

                }
            );

        }
    );

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showDashboardError(
    message
) {

    console.error(
        "Dashboard Error:",
        message
    );


    const heading =
        document.querySelector(
            ".dashboard-heading p"
        );


    if (heading) {

        heading.textContent =
            `Unable to load live data: ${message}`;

    }

}


/* =========================================================
   REDIRECT LOGIN
========================================================= */

function redirectToLogin() {

    localStorage.removeItem(
        "phishAI_token"
    );

    sessionStorage.removeItem(
        "phishAI_token"
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-IN"
    );

}


function percentage(
    value,
    total
) {

    if (!total) {
        return 0;
    }


    return Math.round(
        (
            value /
            total
        ) * 100
    );

}


function getRiskClass(
    risk
) {

    if (
        risk === "HIGH" ||
        risk === "CRITICAL"
    ) {

        return "danger";

    }


    if (
        risk === "MEDIUM"
    ) {

        return "warning";

    }


    return "success";

}


function getRiskIcon(
    risk
) {

    if (
        risk === "HIGH" ||
        risk === "CRITICAL"
    ) {

        return "fa-solid fa-triangle-exclamation";

    }


    if (
        risk === "MEDIUM"
    ) {

        return "fa-solid fa-link";

    }


    return "fa-solid fa-envelope";

}


function getActivityTitle(
    risk
) {

    if (
        risk === "CRITICAL"
    ) {

        return "Critical threat detected";

    }


    if (
        risk === "HIGH"
    ) {

        return "High-risk email detected";

    }


    if (
        risk === "MEDIUM"
    ) {

        return "Suspicious email detected";

    }


    return "Email scanned";

}


function formatRelativeTime(
    date
) {

    if (!date) {
        return "Unknown";
    }


    const timestamp =
        new Date(
            date
        ).getTime();


    if (
        Number.isNaN(
            timestamp
        )
    ) {

        return "Unknown";

    }


    const diff =
        Date.now() -
        timestamp;


    const seconds =
        Math.floor(
            diff / 1000
        );


    if (seconds < 60) {

        return "Just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes} min ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours} hour${
            hours === 1 ? "" : "s"
        } ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    return `${days} day${
        days === 1 ? "" : "s"
    } ago`;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

async function initializeAdminDashboard() {

    console.log(
        "🚀 Initializing PhishAI Admin Dashboard..."
    );


    updateAdminProfile();


    setupLogout();


    setupAdminSearch();


    setupNotifications();


    setupNavigation();


    const data =
        await fetchAdminDashboard();


    if (!data) {
        return;
    }


    /*
     * Store recent analyses globally
     * for search and other dashboard
     * functions.
     */

    window.adminAnalyses =
        Array.isArray(
            data.recentAnalyses
        )
            ? data.recentAnalyses
            : [];


    /*
     * Update dashboard
     */

    updateKPICards(
        data
    );


    renderRecentActivity(
        window.adminAnalyses
    );


    updateThreatDistribution(
        window.adminAnalyses
    );


    updateTopUsers(
        window.adminAnalyses
    );


    /*
     * Check backend health
     */

    await checkSystemHealth();


    console.log(
        "✅ PhishAI Admin Dashboard Ready"
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminDashboard
);