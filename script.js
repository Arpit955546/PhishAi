// =====================================================
// LOGGED-IN USER
// =====================================================

function getLoggedInUser() {

    const userData =
        localStorage.getItem("phishAI_user") ||
        sessionStorage.getItem("phishAI_user");

    if (!userData) {
        window.location.href = "login.html";
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        localStorage.removeItem("phishAI_user");
        sessionStorage.removeItem("phishAI_user");

        window.location.href = "login.html";

        return null;
    }
}


const loggedInUser = getLoggedInUser();


if (loggedInUser) {

    const userName =
        document.getElementById("userName");

    const userAvatar =
        document.getElementById("userAvatar");

    const userRole =
        document.getElementById("userRole");


    if (userName) {

        userName.textContent =
            loggedInUser.name || "User";

    }


    if (userAvatar) {

        const firstLetter =
            (loggedInUser.name || "U")
                .charAt(0)
                .toUpperCase();

        userAvatar.textContent =
            firstLetter;

    }


    if (userRole) {

        if (loggedInUser.role === "admin") {

            userRole.textContent =
                "Administrator";

        } else {

            userRole.textContent =
                "Security Analyst";

        }

    }
}
/* =========================================================
   PHISHAI JAVASCRIPT
   Complete corrected version
   STEP 1: AI / LOCAL ANALYSIS MODE
========================================================= */
const API_BASE_URL = "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/analyze`;
const URL_API = `${API_BASE_URL}/api/analyze-url`;

const HISTORY_KEY = "phishAIHistory";

let analysisHistory = [];
async function loadMyAnalyses() {

    const token =
        localStorage.getItem("phishAI_token") ||
        sessionStorage.getItem("phishAI_token");

    if (!token) {
        console.warn("⚠️ No authentication token found");
        return [];
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/my-analyses`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        console.log(
            "📊 My MongoDB Analyses:",
            result
        );

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to load analysis history"
            );
        }

        const mongoAnalyses =
            result.data || [];

        /*
         * Convert MongoDB format
         * into existing PhishAI
         * frontend history format.
         */

        const formattedHistory =
            mongoAnalyses.map(item => ({

                id:
                    item._id,

                email:
                    item.emailContent || "",

                score:
                    Number(
                        item.riskScore
                    ) || 0,

                riskLevel:
                    String(
                        item.riskLevel ||
                        "LOW"
                    ).toUpperCase(),

                summary:
                    item.summary ||
                    "Email analysis completed.",

                recommendation:
                    item.recommendation ||
                    "",

                analysisMode:
                    String(
                        item.analysisMode ||
                        "LOCAL"
                    ).toUpperCase(),

                date:
                    item.createdAt,

                indicators:
                    Array.isArray(
                        item.indicators
                    )
                        ? item.indicators
                        : [],

                urls:
                    Array.isArray(
                        item.urls
                    )
                        ? item.urls
                        : [],

                urlResults:
                    item.urlResults || []

            }));

        console.log(
            "🔄 Formatted MongoDB History:",
            formattedHistory
        );

        return formattedHistory;

    } catch (error) {

        console.error(
            "❌ Failed to load MongoDB history:",
            error
        );

        return [];
    }
}

/* =========================================================
   PAGE CONFIGURATION
========================================================= */

const pageConfig = {

    dashboard: {
        title: "Dashboard",
        subtitle: "AI-powered email security analysis"
    },

    analyzer: {
        title: "Analyze Email",
        subtitle: "Detect phishing threats with AI"
    },

    "url-scanner": {
        title: "URL Security Scanner",
        subtitle: "Scan suspicious URLs for potential security risks"
    },

    history: {
        title: "Analysis History",
        subtitle: "Review previously analyzed emails"
    },

    reports: {
        title: "Security Reports",
        subtitle: "Security command center"
    },

    settings: {
        title: "Settings",
        subtitle: "Manage your PhishAI preferences"
    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadHistory();

    setupNavigation();
    setupAnalyzer();
    setupURLScanner();
    setupSettings();

    renderHistory();
    updateCounts();
    updateReports();
setupHistoryControls();
    setupKeyboardShortcut();
    handleInitialRoute();

});


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const section =
                item.dataset.section;

            if (!section) return;

            showPage(section);

            window.history.replaceState(
                null,
                "",
                `#${section}`
            );

        });

    });

}


function showPage(section) {

    const pages = {

        dashboard:
            document.getElementById("dashboardPage"),

        analyzer:
            document.getElementById("analyzerPage"),

        "url-scanner":
            document.getElementById("url-scannerPage"),

        history:
            document.getElementById("historyPage"),

        reports:
            document.getElementById("reportsPage"),

        settings:
            document.getElementById("settingsPage")

    };


    Object.values(pages).forEach(page => {

        if (page) {

            page.classList.add("hidden-page");

        }

    });


    if (pages[section]) {

        pages[section].classList.remove(
            "hidden-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });


    updatePageHeader(section);


    if (section === "history") {

        renderHistory();

    }


    if (section === "reports") {

        updateCounts();
        updateReports();

    }


    if (section === "dashboard") {

        updateCounts();

    }

}


function updatePageHeader(section) {

    const config =
        pageConfig[section] ||
        pageConfig.dashboard;


    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");


    if (title) {

        title.textContent =
            config.title;

    }


    if (subtitle) {

        subtitle.textContent =
            config.subtitle;

    }

}


function handleInitialRoute() {

    const hash =
        window.location.hash.replace("#", "");


    const validSections = [

        "dashboard",
        "analyzer",
        "url-scanner",
        "history",
        "reports",
        "settings"

    ];


    if (validSections.includes(hash)) {

        showPage(hash);

    } else {

        showPage("dashboard");

        window.history.replaceState(
            null,
            "",
            "#dashboard"
        );

    }

}


/* =========================================================
   BROWSER HASH NAVIGATION
========================================================= */

window.addEventListener("hashchange", () => {

    const hash =
        window.location.hash.replace("#", "");

    const validSections = [

        "dashboard",
        "analyzer",
        "url-scanner",
        "history",
        "reports",
        "settings"

    ];

    if (validSections.includes(hash)) {

        showPage(hash);

    }

});


/* =========================================================
   ANALYZER SETUP
========================================================= */

function setupAnalyzer() {

    const analyzeBtn =
        document.getElementById("analyzeBtn");

    const analyzeBtn2 =
        document.getElementById("analyzeBtn2");

    const clearBtn =
        document.getElementById("clearBtn");

    const clearBtn2 =
        document.getElementById("clearBtn2");


    if (analyzeBtn) {

        analyzeBtn.addEventListener(
            "click",
            () => {

                const email =
                    document.getElementById(
                        "emailInput"
                    )?.value || "";

                analyzeEmail(
                    email,
                    "dashboard"
                );

            }
        );

    }


    if (analyzeBtn2) {

        analyzeBtn2.addEventListener(
            "click",
            () => {

                const email =
                    document.getElementById(
                        "emailInput2"
                    )?.value || "";

                analyzeEmail(
                    email,
                    "analyzer"
                );

            }
        );

    }


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "emailInput"
                    );

                if (input) {

                    input.value = "";

                    input.focus();

                }

            }
        );

    }


    if (clearBtn2) {

        clearBtn2.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "emailInput2"
                    );

                if (input) {

                    input.value = "";

                    input.focus();

                }

            }
        );

    }

}


/* =========================================================
   ANALYZE EMAIL
========================================================= */

async function analyzeEmail(
    email,
    source = "dashboard"
) {

    if (!email || !email.trim()) {

        showNotification(
            "Please paste an email first.",
            "warning"
        );

        return;

    }


    const aiToggle =
        document.getElementById("aiToggle");


    if (
        aiToggle &&
        !aiToggle.checked
    ) {

        showNotification(
            "AI Detection is disabled in Settings.",
            "warning"
        );

        return;

    }


    const buttons = [

        document.getElementById("analyzeBtn"),
        document.getElementById("analyzeBtn2")

    ];


    buttons.forEach(button => {

        if (button) {

            button.disabled = true;

            button.textContent =
                "⏳ Analyzing...";

        }

    });


    try {

        /* =================================================
           STEP 1: EMAIL AI ANALYSIS
        ================================================= */

        const emailResult =
            await analyzeWithBackend(email);


        /* =================================================
           STEP 2: EXTRACT URLS
        ================================================= */

        const extractedURLs =
            extractURLsFromEmail(email);


        console.log(
            "URLs found in email:",
            extractedURLs
        );


        /* =================================================
           STEP 3: SCAN URLS
        ================================================= */

        let urlResults = [];


        if (extractedURLs.length > 0) {

            showNotification(
                `${extractedURLs.length} URL(s) found. Scanning URLs...`,
                "success"
            );


            urlResults =
                await Promise.all(
                    extractedURLs.map(
                        url =>
                            scanURLWithAI(url)
                    )
                );

        }


        /* =================================================
           STEP 4: COMBINE EMAIL + URL RESULTS
        ================================================= */

        const finalResult =
            combineEmailAndURLResults(
                emailResult,
                urlResults
            );


        console.log(
            "Final security result:",
            finalResult
        );


        /* =================================================
           STEP 5: DISPLAY
        ================================================= */

        displayResult(
            finalResult,
            source
        );


        /* =================================================
           STEP 6: SAVE HISTORY
        ================================================= */

        saveHistory(
            email,
            finalResult
        );


        updateCounts();
        updateReports();
        renderHistory();


        showNotification(
            "Email + URL security analysis completed.",
            "success"
        );


    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        showNotification(
            error.message ||
            "AI analysis failed.",
            "error"
        );


    } finally {

        buttons.forEach(button => {

            if (button) {

                button.disabled = false;

                button.textContent =
                    "🤖 Analyze Email";

            }

        });

    }

}
async function analyzeWithBackend(email) {

    console.log("🔥 BACKEND FUNCTION CALLED");
    console.log("🚀 Sending request to:", API_URL);

    const token =
        localStorage.getItem("phishAI_token") ||
        sessionStorage.getItem("phishAI_token");

    console.log(
        "🔐 Token available:",
        token ? "YES" : "NO"
    );

    if (!token) {
        throw new Error(
            "Authentication required. Please login again."
        );
    }

    try {

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );

        console.log(
            "📡 Backend response:",
            response.status,
            response.statusText
        );

        const data = await response.json();

        console.log(
            "📦 Backend data:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                `Backend error: ${response.status}`
            );

        }

        if (!data.success) {

            throw new Error(
                data.message ||
                "Backend analysis failed."
            );

        }

        const result =
            data.data &&
            typeof data.data === "object"
                ? data.data
                : data;

        console.log(
            "🎯 Normalized email result:",
            result
        );

        return {

            score:
                Number(
                    result.score ??
                    result.riskScore
                ) || 0,

            riskLevel:
                String(
                    result.riskLevel || "LOW"
                ).toUpperCase(),

            threats:
                Array.isArray(result.threats)
                    ? result.threats
                    : Array.isArray(result.indicators)
                        ? result.indicators
                        : [],

            summary:
                result.summary ||
                "Email analysis completed.",

            recommendation:
                result.recommendation ||
                "",

            analysisMode:
                String(
                    result.analysisMode ||
                    "LOCAL"
                ).toUpperCase()

        };

    } catch (error) {

        console.error(
            "❌ BACKEND CONNECTION ERROR:",
            error
        );

        throw error;
    }
}


/* =========================================================
   EXTRACT URLs FROM EMAIL
========================================================= */

function extractURLsFromEmail(email) {

    if (!email) {

        return [];

    }


    const urlRegex =
        /https?:\/\/[^\s<>"']+/gi;


    const matches =
        email.match(urlRegex) || [];


    const urls =
        matches.map(url => {

            return url.replace(
                /[.,!?;:)\]}]+$/,
                ""
            );

        });


    return [
        ...new Set(urls)
    ];

}


/* =========================================================
   AI URL SCAN HELPER
========================================================= */

async function scanURLWithAI(url) {

    console.log("🔗 URL BACKEND SCAN:", url);

    try {

        const response = await fetch(
            URL_API,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: url
                })
            }
        );

        console.log(
            "📡 URL Backend response:",
            response.status,
            response.statusText
        );

        const result =
            await response.json();

        console.log(
            "📦 URL Backend data:",
            result
        );

        if (!response.ok) {

            throw new Error(
                result.message ||
                `URL backend error: ${response.status}`
            );

        }

        if (!result.success) {

            throw new Error(
                result.message ||
                "URL analysis failed."
            );

        }

        /*
         * Backend normally returns:
         *
         * {
         *   success: true,
         *   data: {...}
         * }
         *
         * Support both wrapped and direct formats.
         */

        const data =
            result.data &&
            typeof result.data === "object"
                ? result.data
                : result;

        const normalizedResult = {

            url: url,

            success: true,

            fallback: false,

            data: {

                url:
                    data.url ||
                    url,

                protocol:
                    data.protocol ||
                    "",

                hostname:
                    data.hostname ||
                    "",

                https:
                    Boolean(data.https),

                length:
                    Number(data.length) || url.length,

                score:
                    Number(data.score) || 0,

                riskLevel:
                    String(
                        data.riskLevel ||
                        "LOW"
                    ).toUpperCase(),

                threats:
                    Array.isArray(data.threats)
                        ? data.threats
                        : [],

                indicators:
                    Array.isArray(data.indicators)
                        ? data.indicators
                        : (
                            Array.isArray(data.threats)
                                ? data.threats
                                : []
                        ),

                summary:
                    data.summary ||
                    "URL analysis completed.",

                recommendation:
                    data.recommendation ||
                    "Verify the URL before proceeding.",

                analysisMode:
                    String(
                        data.analysisMode ||
                        "LOCAL"
                    ).toUpperCase()

            }

        };

        console.log(
            "🎯 Normalized URL result:",
            normalizedResult
        );

        return normalizedResult;

    } catch (error) {

        console.warn(
            `⚠️ URL backend failed for ${url}:`,
            error
        );

        /*
         * LOCAL FALLBACK
         */

        try {

            const parsedURL =
                new URL(url);

            const fallback =
                analyzeURL(parsedURL);

            const threats =
                Array.isArray(fallback.checks)
                    ? fallback.checks
                        .filter(
                            check =>
                                check.type !== "safe"
                        )
                        .map(
                            check =>
                                check.title
                        )
                    : [];

            return {

                url: url,

                success: false,

                fallback: true,

                data: {

                    url: url,

                    protocol:
                        parsedURL.protocol
                            .replace(":", ""),

                    hostname:
                        parsedURL.hostname,

                    https:
                        parsedURL.protocol ===
                        "https:",

                    length:
                        url.length,

                    score:
                        Number(fallback.score) || 0,

                    riskLevel:
                        String(
                            fallback.riskLevel ||
                            "LOW"
                        ).toUpperCase(),

                    threats: threats,

                    indicators: threats,

                    summary:
                        getURLFallbackSummary(
                            fallback.riskLevel
                        ),

                    recommendation:
                        getURLRecommendation(
                            fallback.riskLevel
                        ),

                    analysisMode:
                        "LOCAL"

                }

            };

        } catch (fallbackError) {

            console.error(
                "❌ URL local fallback failed:",
                fallbackError
            );

            return {

                url: url,

                success: false,

                fallback: true,

                data: {

                    url: url,

                    score: 50,

                    riskLevel: "MEDIUM",

                    threats: [
                        "URL could not be fully analyzed."
                    ],

                    indicators: [
                        "URL could not be fully analyzed."
                    ],

                    summary:
                        "The URL could not be completely analyzed.",

                    recommendation:
                        "Verify the destination independently before opening it.",

                    analysisMode:
                        "LOCAL"

                }

            };

        }

    }

}


/* =========================================================
   COMBINE EMAIL + URL RESULTS
   IMPORTANT:
   EMAIL AI SCORE REMAINS THE MAIN EMAIL SCORE.
========================================================= */

function combineEmailAndURLResults(
    emailResult,
    urlResults
) {

    const emailScore =
        clampScore(
            emailResult?.score
        );


    const emailRisk =
        normalizeRiskLevel(
            emailResult?.riskLevel,
            emailScore
        );


    /*
     * =====================================================
     * ANALYSIS MODE
     *
     * Backend returns:
     *
     * AI    = OpenAI analysis
     * LOCAL = Local fallback engine
     * =====================================================
     */

    const analysisMode =
        String(
            emailResult?.analysisMode ||
            "LOCAL"
        ).toUpperCase();


    let emailThreats =
        Array.isArray(
            emailResult?.threats
        )
            ? filterEmailThreats(
                emailResult.threats
            )
            : [];


    let summary =
        emailResult?.summary ||
        "AI email analysis completed.";


    let highestURLScore = 0;

    let highestURLRisk = "LOW";


    urlResults.forEach(result => {

        const urlScore =
            clampScore(
                result?.data?.score
            );


        const urlRisk =
            normalizeRiskLevel(
                result?.data?.riskLevel,
                urlScore
            );


        if (
            urlScore >
            highestURLScore
        ) {

            highestURLScore =
                urlScore;

        }


        if (
            getRiskPriority(urlRisk) >
            getRiskPriority(highestURLRisk)
        ) {

            highestURLRisk =
                urlRisk;

        }

    });


    /*
     * IMPORTANT FIX:
     *
     * URL score no longer overwrites
     * the email AI score.
     *
     * The email result remains the
     * primary result.
     */

    if (
        highestURLRisk === "HIGH"
    ) {

        emailThreats.push(
            `A high-risk URL was detected inside the email (URL score: ${highestURLScore}/100).`
        );


        summary +=
            " A high-risk URL was also detected inside the email.";

    }
    else if (
        highestURLRisk === "MEDIUM"
    ) {

        summary +=
            " A URL inside the email showed some suspicious characteristics.";

    }
    else if (
        urlResults.length > 0
    ) {

        summary +=
            " URLs found inside the email did not show major suspicious patterns.";

    }


    return {

        /*
         * PRIMARY EMAIL SCORE
         */

        score:
            emailScore,

        riskLevel:
            emailRisk,


        /*
         * STEP 1:
         * Preserve AI / LOCAL mode
         */

        analysisMode:
            analysisMode,


        threats:
            emailThreats,


        summary:
            summary,


        /*
         * Additional information
         */

        emailScore:
            emailScore,

        emailRiskLevel:
            emailRisk,

        urlScore:
            highestURLScore,

        urlRiskLevel:
            highestURLRisk,


        extractedURLs:

            urlResults.map(result => {

                const score =
                    clampScore(
                        result?.data?.score
                    );


                return {

                    url:
                        result.url,

                    score:
                        score,

                    riskLevel:
                        normalizeRiskLevel(
                            result?.data?.riskLevel,
                            score
                        ),

                    threats:
                        Array.isArray(
                            result?.data?.threats
                        )
                            ? result.data.threats
                            : [],

                    summary:
                        result?.data?.summary ||
                        "",

                    recommendation:
                        result?.data?.recommendation ||
                        "",

                    analysisMode:
                        String(
                            result?.data?.analysisMode ||
                            "LOCAL"
                        ).toUpperCase()

                };

            })

    };

}


/* =========================================================
   REMOVE URL-RELATED THREATS FROM EMAIL LIST
========================================================= */

function filterEmailThreats(threats) {

    if (!Array.isArray(threats)) {

        return [];

    }


    const urlKeywords = [

        "http://",
        "https://",
        "url",
        "domain",
        "link",
        "website",
        "lookalike domain",
        "suspicious domain",
        "domain structure",
        "url shortener",
        "shortened url",
        "raw ip",
        "ip address",
        "url length",
        "https is not enabled",
        "http is not secure"

    ];


    return threats.filter(threat => {

        const text =
            String(threat)
                .toLowerCase();


        if (
            text.startsWith("url ")
        ) {

            return false;

        }


        return !urlKeywords.some(
            keyword =>
                text.includes(keyword)
        );

    });

}


/* =========================================================
   SCORE HELPER
========================================================= */

function clampScore(score) {

    const numericScore =
        Number(score);


    if (
        !Number.isFinite(
            numericScore
        )
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.min(
            100,
            Math.round(
                numericScore
            )
        )
    );

}


function getRiskLevel(score) {

    const safeScore =
        clampScore(score);


    if (
        safeScore >= 60
    ) {

        return "HIGH";

    }


    if (
        safeScore >= 30
    ) {

        return "MEDIUM";

    }


    return "LOW";

}


/* =========================================================
   RISK HELPERS
========================================================= */

function getRiskPriority(riskLevel) {

    const risk =
        String(
            riskLevel || ""
        ).toUpperCase();


    if (
        risk === "HIGH"
    ) {

        return 3;

    }


    if (
        risk === "MEDIUM"
    ) {

        return 2;

    }


    return 1;

}


function getHighestRisk(
    risk1,
    risk2
) {

    if (
        getRiskPriority(risk1) >=
        getRiskPriority(risk2)
    ) {

        return normalizeRiskLevel(
            risk1,
            0
        );

    }


    return normalizeRiskLevel(
        risk2,
        0
    );

}


/* =========================================================
   URL FALLBACK SUMMARY
========================================================= */

function getURLFallbackSummary(
    riskLevel
) {

    if (
        riskLevel === "HIGH"
    ) {

        return (
            "The URL contains multiple potentially dangerous indicators."
        );

    }


    if (
        riskLevel === "MEDIUM"
    ) {

        return (
            "The URL contains some suspicious characteristics."
        );

    }


    return (
        "No major suspicious URL patterns were detected."
    );

}


/* =========================================================
   DISPLAY EMAIL RESULT
========================================================= */

function displayResult(
    result,
    source = "dashboard"
) {

    const score =
        clampScore(
            result?.score
        );


    const riskLevel =
        normalizeRiskLevel(
            result?.riskLevel,
            score
        );


    const threats =
        Array.isArray(
            result?.threats
        )
            ? filterEmailThreats(
                result.threats
            )
            : [];


    const summary =
        result?.summary ||
        "AI analysis completed.";


    const suffix =
        source === "analyzer"
            ? "2"
            : "";


    const riskScore =
        document.getElementById(
            `riskScore${suffix}`
        );


    const riskText =
        document.getElementById(
            `riskText${suffix}`
        );


    const riskCircle =
        document.getElementById(
            `riskCircle${suffix}`
        );


    /*
     * STEP 1:
     * AI / LOCAL MODE INDICATOR
     */

    const analysisModeElement =
        document.getElementById(
            `analysisMode${suffix}`
        );


    const analysisModeValue =
        String(
            result?.analysisMode ||
            "LOCAL"
        ).toUpperCase();


    /*
     * Actual HTML uses:
     *
     * analysisMode
     * analysisMode2
     *
     * AI:
     * 🤖 AI ANALYSIS
     *
     * LOCAL:
     * 🟡 LOCAL SECURITY ENGINE
     */

    if (analysisModeElement) {

        if (
            analysisModeValue === "AI"
        ) {

            analysisModeElement.textContent =
                "🤖 AI ANALYSIS";


            analysisModeElement.classList.remove(
                "local-mode"
            );


            analysisModeElement.classList.add(
                "ai-mode"
            );

        }
        else {

            analysisModeElement.textContent =
                "🟡 LOCAL SECURITY ENGINE";


            analysisModeElement.classList.remove(
                "ai-mode"
            );


            analysisModeElement.classList.add(
                "local-mode"
            );

        }

    }


    /*
     * IMPORTANT:
     *
     * Actual HTML uses:
     * analysisResult
     * analyzerResult
     *
     * We support both the actual IDs
     * and the older resultSection IDs.
     */

    const resultSection =
        document.getElementById(
            source === "analyzer"
                ? "analyzerResult"
                : "analysisResult"
        ) ||
        document.getElementById(
            `resultSection${suffix}`
        );


    const threatList =
        document.getElementById(
            `threatList${suffix}`
        );


    const summaryElement =
        document.getElementById(
            `aiSummary${suffix}`
        ) ||
        document.getElementById(
            `resultSummary${suffix}`
        );


    const status =
        document.getElementById(
            `resultStatus${suffix}`
        );


    if (riskScore) {

        riskScore.textContent =
            score;

    }


    if (riskCircle) {

        riskCircle.classList.remove(
            "low",
            "medium",
            "high"
        );


        riskCircle.classList.add(
            riskLevel.toLowerCase()
        );

    }


    if (riskText) {

        riskText.textContent =
            getRiskMessage(
                riskLevel,
                score
            );

    }


    if (status) {

        status.textContent =
            riskLevel;


        status.classList.remove(
            "low",
            "medium",
            "high"
        );


        status.classList.add(
            riskLevel.toLowerCase()
        );

    }


    if (resultSection) {

        resultSection.classList.remove(
            "hidden-page"
        );

    }


    if (summaryElement) {

        summaryElement.textContent =
            summary;

    }


    if (threatList) {

        threatList.innerHTML = "";


        if (
            threats.length === 0
        ) {

            threatList.innerHTML = `

                <div class="threat-item safe">

                    <span>✓</span>

                    <div>

                        <strong>
                            No major email threats detected
                        </strong>

                        <p>
                            No significant email-based phishing indicators were identified.
                        </p>

                    </div>

                </div>

            `;

        }
        else {

            threats.forEach(threat => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "threat-item danger";


                div.innerHTML = `

                    <span>⚠</span>

                    <div>

                        <strong>
                            ${escapeHTML(
                                threat
                            )}
                        </strong>

                    </div>

                `;


                threatList.appendChild(
                    div
                );

            });

        }


        /*
         * URL SECURITY ANALYSIS
         */

        if (
            Array.isArray(
                result?.extractedURLs
            ) &&
            result.extractedURLs.length > 0
        ) {

            const urlSection =
                document.createElement(
                    "div"
                );


            urlSection.className =
                "email-url-analysis";


            urlSection.innerHTML = `

                <div class="email-url-header">

                    <div>

                        <h3>
                            🔗 URL Security Analysis
                        </h3>

                        <p>
                            ${result.extractedURLs.length}
                            URL(s) automatically scanned
                        </p>

                    </div>

                </div>

            `;


            result.extractedURLs.forEach(
                urlInfo => {

                    const urlCard =
                        document.createElement(
                            "div"
                        );


                    urlCard.className =
                        "email-url-card";


                    const urlScore =
                        clampScore(
                            urlInfo?.score
                        );


                    const urlRisk =
                        normalizeRiskLevel(
                            urlInfo?.riskLevel,
                            urlScore
                        );


                    const urlThreats =
                        Array.isArray(
                            urlInfo?.threats
                        )
                            ? urlInfo.threats
                            : [];


                    urlCard.innerHTML = `

                        <div class="email-url-card-header">

                            <div>

                                <strong>
                                    URL
                                </strong>

                                <p class="email-scanned-url">

                                    ${escapeHTML(
                                        urlInfo?.url ||
                                        ""
                                    )}

                                </p>

                            </div>


                            <span
                                class="risk-badge ${urlRisk.toLowerCase()}"
                            >

                                ${escapeHTML(
                                    urlRisk
                                )}

                            </span>

                        </div>


                        <div class="email-url-score">

                            <strong>
                                Score:
                                ${urlScore}/100
                            </strong>

                        </div>


                        <div class="email-url-threats">

                            ${
                                urlThreats.length > 0

                                    ? urlThreats
                                        .map(
                                            threat => `

                                                <div class="email-url-threat">

                                                    <span>⚠</span>

                                                    <span>
                                                        ${escapeHTML(
                                                            threat
                                                        )}
                                                    </span>

                                                </div>

                                            `
                                        )
                                        .join("")

                                    : `

                                        <div class="email-url-safe">

                                            <span>✓</span>

                                            <span>
                                                No major URL threats detected.
                                            </span>

                                        </div>

                                    `
                            }

                        </div>


                        ${
                            urlInfo?.summary

                                ? `

                                    <div class="email-url-summary">

                                        ${escapeHTML(
                                            urlInfo.summary
                                        )}

                                    </div>

                                `

                                : ""
                        }


                        ${
                            urlInfo?.recommendation

                                ? `

                                    <div class="email-url-recommendation">

                                        <strong>
                                            Recommendation:
                                        </strong>

                                        ${escapeHTML(
                                            urlInfo.recommendation
                                        )}

                                    </div>

                                `

                                : ""
                        }

                    `;


                    threatList.appendChild(
                        urlCard
                    );

                }
            );

        }

    }


    /*
     * Scroll result into view
     */

    if (resultSection) {

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   NORMALIZE RISK
========================================================= */

function normalizeRiskLevel(
    riskLevel,
    score
) {

    const numericScore =
        clampScore(score);


    /*
     * Score is the source of truth.
     */

    if (
        numericScore >= 60
    ) {

        return "HIGH";

    }


    if (
        numericScore >= 30
    ) {

        return "MEDIUM";

    }


    return "LOW";

}


/* =========================================================
   RISK MESSAGE
========================================================= */

function getRiskMessage(
    riskLevel,
    score
) {

    if (
        riskLevel === "HIGH"
    ) {

        return (
            `High risk detected. Risk score ${score}/100. Review this email carefully.`
        );

    }


    if (
        riskLevel === "MEDIUM"
    ) {

        return (
            `Moderate risk detected. Risk score ${score}/100. Additional verification is recommended.`
        );

    }


    return (
        `Low risk detected. Risk score ${score}/100. No major threat indicators found.`
    );

}


/* =========================================================
   HISTORY
========================================================= */

function loadHistory() {

    try {

        const stored =
            localStorage.getItem(
                HISTORY_KEY
            );


        analysisHistory =
            stored
                ? JSON.parse(stored)
                : [];


        if (
            !Array.isArray(
                analysisHistory
            )
        ) {

            analysisHistory = [];

        }


        /*
         * Normalize old records.
         */

        analysisHistory =
            analysisHistory.map(item => {

                const score =
                    clampScore(
                        item?.score
                    );


                return {

                    ...item,

                    id:
                        item?.id ||
                        `${Date.now()}-${Math.random()}`,

                    email:
                        item?.email ||
                        "",

                    score:
                        score,

                    riskLevel:
                        normalizeRiskLevel(
                            item?.riskLevel,
                            score
                        ),

                    analysisMode:
                        String(
                            item?.analysisMode ||
                            "LOCAL"
                        ).toUpperCase(),

                    threats:
                        Array.isArray(
                            item?.threats
                        )
                            ? filterEmailThreats(
                                item.threats
                            )
                            : [],

                    summary:
                        item?.summary ||
                        "AI analysis completed.",

                    extractedURLs:
                        Array.isArray(
                            item?.extractedURLs
                        )
                            ? item.extractedURLs
                            : [],

                    date:
                        item?.date ||
                        new Date().toISOString()

                };

            });


        saveHistoryToStorage();


    } catch (error) {

        console.error(
            "History loading error:",
            error
        );


        analysisHistory = [];

    }

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory(
    email,
    result
) {

    const historyToggle =
        document.getElementById(
            "historyToggle"
        );


    /*
     * If history setting exists and
     * is disabled, don't save.
     */

    if (
        historyToggle &&
        !historyToggle.checked
    ) {

        return;

    }


    const score =
        clampScore(
            result?.score
        );


    const item = {

        id:
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        email:
            email,

        score:
            score,

        riskLevel:
            normalizeRiskLevel(
                result?.riskLevel,
                score
            ),

        /*
         * STEP 1:
         * Save AI / LOCAL mode
         */

        analysisMode:
            String(
                result?.analysisMode ||
                "LOCAL"
            ).toUpperCase(),

        threats:
            Array.isArray(
                result?.threats
            )
                ? filterEmailThreats(
                    result.threats
                )
                : [],

        summary:
            result?.summary ||
            "AI analysis completed.",

        extractedURLs:
            Array.isArray(
                result?.extractedURLs
            )
                ? result.extractedURLs
                : [],

        date:
            new Date().toISOString()

    };


    analysisHistory.unshift(
        item
    );


    /*
     * Maximum 50 records.
     */

    if (
        analysisHistory.length > 50
    ) {

        analysisHistory =
            analysisHistory.slice(
                0,
                50
            );

    }


    saveHistoryToStorage();

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveHistoryToStorage() {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(
                analysisHistory
            )
        );

    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


/* =========================================================
   DASHBOARD COUNTS
========================================================= */

function updateCounts() {

    const total =
        analysisHistory.length;


    let high = 0;
    let medium = 0;
    let low = 0;


    analysisHistory.forEach(item => {

        const score =
            clampScore(
                item?.score
            );


        const risk =
            normalizeRiskLevel(
                item?.riskLevel,
                score
            );


        if (
            risk === "HIGH"
        ) {

            high++;

        }
        else if (
            risk === "MEDIUM"
        ) {

            medium++;

        }
        else {

            low++;

        }

    });


    const average =
        total > 0

            ? Math.round(
                analysisHistory.reduce(
                    (sum, item) =>
                        sum +
                        clampScore(
                            item?.score
                        ),
                    0
                ) / total
            )

            : 0;


    setText(
        "totalAnalyses",
        total
    );


    setText(
        "threatCount",
        high
    );


    setText(
        "safeCount",
        low
    );


    setText(
        "dashboardAverageScore",
        total > 0
            ? `${average}/100`
            : "--"
    );


    setText(
        "threatsDetected",
        high
    );


    setText(
        "safeEmails",
        low
    );


    setText(
        "suspiciousEmails",
        medium
    );

}


/* =========================================================
   REPORTS
========================================================= */

function updateReports() {

    const total =
        analysisHistory.length;


    let high = 0;
    let medium = 0;
    let low = 0;


    analysisHistory.forEach(item => {

        const score =
            clampScore(
                item?.score
            );


        const risk =
            normalizeRiskLevel(
                item?.riskLevel,
                score
            );


        if (
            risk === "HIGH"
        ) {

            high++;

        }
        else if (
            risk === "MEDIUM"
        ) {

            medium++;

        }
        else {

            low++;

        }

    });


    const suspicious =
        medium;


    const average =
        total > 0

            ? Math.round(
                analysisHistory.reduce(
                    (sum, item) =>
                        sum +
                        clampScore(
                            item?.score
                        ),
                    0
                ) / total
            )

            : 0;


    setText(
        "reportTotal",
        total
    );


    setText(
        "reportThreats",
        high
    );


    setText(
        "reportSafe",
        low
    );


    setText(
        "reportSuspicious",
        suspicious
    );


    setText(
        "reportHighRisk",
        high
    );


    setText(
        "reportMediumRisk",
        medium
    );


    setText(
        "reportLowRisk",
        low
    );


    setText(
        "reportAverageScore",
        total > 0
            ? `${average}/100`
            : "--"
    );


    setText(
        "averageRiskScore",
        average
    );


    setText(
        "reportTotalAnalyses",
        total
    );


    setText(
        "emailReportCount",
        total
    );


    const status =
        document.getElementById(
            "reportAiStatus"
        );


    if (status) {

        status.textContent =
            total > 0

                ? `AI has analyzed ${total} email${total === 1 ? "" : "s"} and generated security reports.`

                : "AI-powered email analysis is active. Analyze an email to generate reports.";

    }


    updateThreatSummary();

    renderIndividualReports();

}


/* =========================================================
   THREAT SUMMARY
========================================================= */

function updateThreatSummary() {

    const container =
        document.getElementById(
            "threatSummary"
        );


    if (!container) {

        return;

    }


    if (
        analysisHistory.length === 0
    ) {

        container.innerHTML = `

            <div class="report-empty">

                <div class="empty-report-icon">
                    📊
                </div>

                <strong>
                    No threat data available
                </strong>

                <p>
                    Analyze emails to generate
                    threat intelligence.
                </p>

            </div>

        `;

        return;

    }


    const threatMap = {};


    analysisHistory.forEach(item => {

        const threats =
            Array.isArray(
                item?.threats
            )
                ? item.threats
                : [];


        threats.forEach(threat => {

            const key =
                String(
                    threat
                ).trim();


            if (!key) {

                return;

            }


            threatMap[key] =
                (
                    threatMap[key] ||
                    0
                ) + 1;

        });

    });


    const sortedThreats =
        Object.entries(
            threatMap
        )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(
                0,
                10
            );


    if (
        sortedThreats.length === 0
    ) {

        container.innerHTML = `

            <div class="report-empty">

                <div class="empty-report-icon">
                    ✓
                </div>

                <strong>
                    No threat indicators detected
                </strong>

                <p>
                    Current analysis history contains
                    no reported threat indicators.
                </p>

            </div>

        `;

        return;

    }


    const maxCount =
        sortedThreats[0][1];


    container.innerHTML = `

        <div class="threat-summary-grid">

            ${sortedThreats
                .map(
                    ([name, count]) => {

                        const width =
                            Math.max(
                                8,
                                Math.round(
                                    (
                                        count /
                                        maxCount
                                    ) * 100
                                )
                            );


                        return `

                            <div class="threat-summary-row">

                                <div
                                    class="threat-summary-name"
                                    title="${escapeHTML(name)}"
                                >

                                    ${escapeHTML(name)}

                                </div>


                                <div class="threat-bar">

                                    <div
                                        class="threat-bar-fill"
                                        style="width:${width}%"
                                    ></div>

                                </div>


                                <div class="threat-summary-count">

                                    ${count}

                                </div>

                            </div>

                        `;

                    }
                )
                .join("")}

        </div>

    `;

}


/* =========================================================
   INDIVIDUAL SECURITY REPORTS
========================================================= */

function renderIndividualReports() {

    const container =
        document.getElementById(
            "individualReports"
        );


    const count =
        document.getElementById(
            "emailReportCount"
        );


    if (count) {

        count.textContent =
            `${analysisHistory.length} Report${
                analysisHistory.length === 1
                    ? ""
                    : "s"
            }`;

    }


    if (!container) {

        return;

    }


    if (
        analysisHistory.length === 0
    ) {

        container.innerHTML = `

            <div class="report-empty">

                <div class="empty-report-icon">
                    📭
                </div>

                <strong>
                    No email reports available
                </strong>

                <p>
                    Analyze an email to generate
                    its security report.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        analysisHistory
            .map(
                (item, index) =>
                    createIndividualReport(
                        item,
                        index
                    )
            )
            .join("");

}


/* =========================================================
   CREATE INDIVIDUAL REPORT
========================================================= */

function createIndividualReport(
    item,
    index
) {

    const score =
        clampScore(
            item?.score
        );


    const risk =
        normalizeRiskLevel(
            item?.riskLevel,
            score
        );


    const threats =
        Array.isArray(
            item?.threats
        )
            ? filterEmailThreats(
                item.threats
            )
            : [];


    const analysisMode =
        String(
            item?.analysisMode ||
            "LOCAL"
        ).toUpperCase();


    const modeLabel =
        analysisMode === "AI"
            ? "🤖 AI ANALYSIS"
            : "🟡 LOCAL ENGINE";


    const threatHtml =
        threats.length > 0

            ? threats
                .map(
                    threat =>
                        `

                        <span class="threat-tag">

                            ${escapeHTML(
                                String(threat)
                            )}

                        </span>

                        `
                )
                .join("")

            : `

                <div class="no-threat-box">

                    ✓ No significant threat indicators detected.

                </div>

            `;


    const urls =
        Array.isArray(
            item?.extractedURLs
        )
            ? item.extractedURLs
            : [];


    const urlHtml =
        urls.length > 0

            ? `

                <div class="individual-report-section">

                    <h4>
                        🔗 URL Security Analysis
                    </h4>

                    <div class="individual-url-list">

                        ${urls
                            .map(
                                urlInfo => {

                                    const urlScore =
                                        clampScore(
                                            urlInfo?.score
                                        );


                                    const urlRisk =
                                        normalizeRiskLevel(
                                            urlInfo?.riskLevel,
                                            urlScore
                                        );


                                    return `

                                        <div class="individual-url-item">

                                            <div>

                                                <strong>
                                                    ${escapeHTML(
                                                        urlInfo?.url ||
                                                        ""
                                                    )}
                                                </strong>

                                                <p>

                                                    URL Risk:
                                                    ${escapeHTML(
                                                        urlRisk
                                                    )}

                                                    —
                                                    ${urlScore}/100

                                                </p>

                                            </div>


                                            <span
                                                class="risk-badge ${urlRisk.toLowerCase()}"
                                            >

                                                ${escapeHTML(
                                                    urlRisk
                                                )}

                                            </span>

                                        </div>

                                    `;

                                }
                            )
                            .join("")}

                    </div>

                </div>

            `

            : "";


    return `

        <article
            class="individual-report-card"
        >

            <div class="individual-report-header">

                <div>

                    <div class="report-number">

                        REPORT #${analysisHistory.length - index}

                    </div>


                    <div
                        class="individual-report-score"
                        style="
                            margin-top:5px;
                            font-size:20px;
                            font-weight:800;
                            color:#111827;
                        "
                    >

                        ${score}/100

                    </div>

                </div>


                <div>

                    <span
                        class="individual-risk ${risk.toLowerCase()}"
                    >

                        ${risk} RISK

                    </span>

                    <div
                        style="
                            margin-top:6px;
                            font-size:11px;
                            font-weight:700;
                            text-align:right;
                        "
                    >

                        ${escapeHTML(
                            modeLabel
                        )}

                    </div>

                </div>

            </div>


            <div class="individual-report-body">

                <div class="individual-email-preview">

                    ${escapeHTML(
                        getEmailPreview(
                            item?.email
                        )
                    )}

                </div>


                <div class="individual-report-section">

                    <h4>
                        Email Content
                    </h4>


                    <div class="individual-email-box">

                        ${escapeHTML(
                            item?.email || ""
                        )}

                    </div>

                </div>


                <div class="individual-report-section">

                    <h4>
                        Detected Indicators
                    </h4>


                    <div class="individual-threat-list">

                        ${threatHtml}

                    </div>

                </div>


                ${urlHtml}


                <div class="individual-report-section">

                    <h4>
                        AI Summary
                    </h4>


                    <div class="individual-summary">

                        ${escapeHTML(
                            item?.summary ||
                            "AI analysis completed."
                        )}

                    </div>

                </div>

            </div>

<div class="individual-report-footer">

    <span class="report-date">

        Analyzed:
        ${formatDate(
            item?.date
        )}

    </span>


    <div class="individual-report-actions">

        <button
            type="button"
            class="view-full-report-btn"
            onclick="openIndividualReport(${index})"
        >

            View Full Report →

        </button>


        <button
            type="button"
            class="delete-report-btn"
            onclick="deleteHistoryItem('${escapeAttribute(item?.id)}')"
        >

            Delete Report

        </button>

    </div>

</div>

        </article>

    `;

}
    //full report
  function openIndividualReport(index) {

    const item =
        analysisHistory[index];

    if (!item) {
        return;
    }

    const modal =
        document.getElementById(
            "individualReportModal"
        );

    const content =
        document.getElementById(
            "individualReportContent"
        );

    if (!modal || !content) {
        return;
    }

    /* =====================================================
       BASIC DATA
    ===================================================== */

    const score =
        clampScore(
            item?.score
        );

    const risk =
        normalizeRiskLevel(
            item?.riskLevel,
            score
        );

    const analysisMode =
        String(
            item?.analysisMode ||
            "LOCAL"
        ).toUpperCase();

    const modeLabel =
        analysisMode === "AI"
            ? "🤖 AI ANALYSIS"
            : "🟡 LOCAL SECURITY ENGINE";


    /* =====================================================
       THREATS
    ===================================================== */

    const threats =
        Array.isArray(
            item?.threats
        )
            ? filterEmailThreats(
                item.threats
            )
            : [];


    /* =====================================================
       URL DATA
    ===================================================== */

    const urls =
        Array.isArray(
            item?.extractedURLs
        )
            ? item.extractedURLs
            : [];


    /* =====================================================
       URL RISK
    ===================================================== */

    let highestURLScore = 0;
    let highestURLRisk = "LOW";

    urls.forEach(
        urlInfo => {

            const urlScore =
                clampScore(
                    urlInfo?.score
                );

            const urlRisk =
                normalizeRiskLevel(
                    urlInfo?.riskLevel,
                    urlScore
                );

            if (
                urlScore >
                highestURLScore
            ) {
                highestURLScore =
                    urlScore;
            }

            const riskOrder = {
                LOW: 1,
                MEDIUM: 2,
                HIGH: 3
            };

            if (
                riskOrder[urlRisk] >
                riskOrder[highestURLRisk]
            ) {
                highestURLRisk =
                    urlRisk;
            }

        }
    );


    /* =====================================================
       RISK BREAKDOWN
    ===================================================== */

    const hasSocialEngineering =
        threats.some(
            threat =>
                /urgent|pressure|immediate|fear|reward|manipulat/i
                    .test(
                        String(threat)
                    )
        );


    const hasCredentialThreat =
        threats.some(
            threat =>
                /credential|password|otp|pin|username|debit card|card number|financial information|sensitive credentials/i
                    .test(
                        String(threat)
                    )
        );


    const hasAccountThreat =
        threats.some(
            threat =>
                /suspend|suspension|closure|blocked|account verification|account update|verification|verify/i
                    .test(
                        String(threat)
                    )
        );


    const hasImpersonation =
        threats.some(
            threat =>
                /impersonation|impersonat|brand|organization/i
                    .test(
                        String(threat)
                    )
        );


    const hasSuspiciousURL =
        urls.some(
            urlInfo => {

                const urlScore =
                    clampScore(
                        urlInfo?.score
                    );

                const urlRisk =
                    normalizeRiskLevel(
                        urlInfo?.riskLevel,
                        urlScore
                    );

                return (
                    urlRisk === "HIGH" ||
                    urlRisk === "MEDIUM" ||
                    urlScore >= 40
                );

            }
        );


    /* =====================================================
       BREAKDOWN STATUS
    ===================================================== */

    function breakdownStatus(
        detected
    ) {

        return detected
            ? `
                <span class="breakdown-status detected">
                    DETECTED
                </span>
            `
            : `
                <span class="breakdown-status safe">
                    NOT DETECTED
                </span>
            `;
    }


    /* =====================================================
       THREAT FACTORS
    ===================================================== */

    const threatHtml =
        threats.length > 0
            ? threats
                .map(
                    threat =>
                        `
                        <div class="professional-threat-item">

                            <span class="threat-icon">
                                ⚠
                            </span>

                            <div>
                                <strong>
                                    Threat Indicator
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        String(threat)
                                    )}
                                </p>
                            </div>

                        </div>
                        `
                )
                .join("")
            : `
                <div class="professional-safe-box">
                    ✓ No significant threat indicators detected.
                </div>
            `;


    /* =====================================================
       URL INTELLIGENCE
    ===================================================== */

    const urlHtml =
        urls.length > 0
            ? urls
                .map(
                    urlInfo => {

                        const urlScore =
                            clampScore(
                                urlInfo?.score
                            );

                        const urlRisk =
                            normalizeRiskLevel(
                                urlInfo?.riskLevel,
                                urlScore
                            );

                        const indicators =
                            Array.isArray(
                                urlInfo?.indicators
                            )
                                ? urlInfo.indicators
                                : [];

                        const indicatorHtml =
                            indicators.length > 0
                                ? `
                                    <ul class="url-indicator-list">

                                        ${indicators
                                            .map(
                                                indicator =>
                                                    `
                                                    <li>
                                                        ${escapeHTML(
                                                            String(
                                                                indicator
                                                            )
                                                        )}
                                                    </li>
                                                    `
                                            )
                                            .join("")}

                                    </ul>
                                `
                                : `
                                    <p class="url-no-indicators">
                                        No specific URL indicators reported.
                                    </p>
                                `;

                        return `
                            <div class="professional-url-card">

                                <div class="professional-url-header">

                                    <div>

                                        <span class="url-detected-label">
                                            DETECTED URL
                                        </span>

                                        <div class="professional-url-value">
                                            ${escapeHTML(
                                                urlInfo?.url ||
                                                ""
                                            )}
                                        </div>

                                    </div>

                                    <span
                                        class="risk-badge ${urlRisk.toLowerCase()}"
                                    >
                                        ${escapeHTML(
                                            urlRisk
                                        )}
                                    </span>

                                </div>


                                <div class="url-score-row">

                                    <strong>
                                        URL Risk Score
                                    </strong>

                                    <span>
                                        ${urlScore}/100
                                    </span>

                                </div>


                                <div class="url-progress">

                                    <div
                                        class="url-progress-fill"
                                        style="width:${urlScore}%"
                                    ></div>

                                </div>


                                <div class="url-analysis-block">

                                    <strong>
                                        Detected URL Indicators
                                    </strong>

                                    ${indicatorHtml}

                                </div>


                                <div class="url-summary-block">

                                    <strong>
                                        Security Analysis
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            urlInfo?.summary ||
                                            "No additional URL analysis available."
                                        )}
                                    </p>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("")
            : `
                <div class="professional-safe-box">
                    ✓ No URLs were extracted from this email.
                </div>
            `;


    /* =====================================================
       RISK COLOR
    ===================================================== */

    const riskClass =
        risk.toLowerCase();


    /* =====================================================
       RISK EXPLANATION
    ===================================================== */

    const riskExplanation =
        risk === "HIGH"
            ? "Multiple indicators associated with phishing, social engineering, credential theft or account compromise were detected."
            : risk === "MEDIUM"
                ? "Some suspicious indicators were detected and the email should be reviewed carefully."
                : "No major phishing indicators were detected by the current security engine.";


    /* =====================================================
       RECOMMENDATION
    ===================================================== */

    let recommendation =
        item?.recommendation ||
        "";


    if (
        risk === "HIGH"
    ) {

        recommendation =
            `
            Do not click links or provide passwords, OTPs,
            PINs or financial information. Verify the sender
            through the organization's official website or
            official customer-support channel.
            `;

    }
    else if (
        risk === "MEDIUM"
    ) {

        recommendation =
            `
            Exercise caution before interacting with this
            email. Verify the sender and inspect links
            carefully before providing any information.
            `;

    }
    else {

        recommendation =
            recommendation ||
            `
            No major threat indicators were detected.
            Continue following normal email security practices.
            `;

    }


    /* =====================================================
       FULL REPORT HTML
    ===================================================== */

    content.innerHTML = `

        <div class="professional-report">


            <!-- =========================================
                 REPORT HEADER
            ========================================== -->

            <div class="professional-report-header">

                <div>

                    <span class="professional-label">
                        PHISHAI SECURITY INTELLIGENCE
                    </span>

                    <h1>
                        Email Security Report
                    </h1>

                    <p>
                        Detailed investigation of the
                        analyzed email and its associated
                        security indicators.
                    </p>

                </div>

                <div class="professional-report-number">

                    REPORT #${analysisHistory.length - index}

                </div>

            </div>



            <!-- =========================================
                 01 EMAIL IDENTITY
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        01
                    </span>

                    <h2>
                        Email Identity
                    </h2>

                </div>


                <div class="email-identity-grid">

                    <div class="email-identity-card">

                        <span>
                            EMAIL PREVIEW
                        </span>

                        <strong>
                            ${escapeHTML(
                                getEmailPreview(
                                    item?.email
                                )
                            )}
                        </strong>

                    </div>


                    <div class="email-identity-card">

                        <span>
                            ANALYZED
                        </span>

                        <strong>
                            ${formatDate(
                                item?.date
                            )}
                        </strong>

                    </div>

                </div>

            </section>



            <!-- =========================================
                 02 RISK OVERVIEW
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        02
                    </span>

                    <h2>
                        Risk Overview
                    </h2>

                </div>


                <div class="risk-overview-card">


                    <div class="risk-score-panel">

                        <div class="risk-score-number">

                            ${score}

                            <span>
                                /100
                            </span>

                        </div>

                        <div class="risk-score-label">
                            Overall Risk Score
                        </div>


                        <div
                            class="risk-meter"
                        >

                            <div
                                class="risk-meter-fill ${riskClass}"
                                style="width:${score}%"
                            ></div>

                        </div>

                    </div>


                    <div class="risk-overview-details">

                        <span
                            class="individual-risk ${riskClass}"
                        >
                            ${risk} RISK
                        </span>


                        <div class="analysis-mode-display">

                            ${escapeHTML(
                                modeLabel
                            )}

                        </div>


                        <p>
                            ${riskExplanation}
                        </p>

                    </div>

                </div>


                <!-- EMAIL / URL RISK -->

                <div class="risk-component-grid">

                    <div class="risk-component-card">

                        <span>
                            EMAIL RISK
                        </span>

                        <strong>
                            ${score}/100
                        </strong>

                        <small>
                            ${risk}
                        </small>

                    </div>


                    <div class="risk-component-card">

                        <span>
                            URL RISK
                        </span>

                        <strong>
                            ${
                                urls.length > 0
                                    ? `${highestURLScore}/100`
                                    : "N/A"
                            }
                        </strong>

                        <small>
                            ${
                                urls.length > 0
                                    ? highestURLRisk
                                    : "NO URL"
                            }
                        </small>

                    </div>

                </div>

            </section>



            <!-- =========================================
                 03 RISK BREAKDOWN
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        03
                    </span>

                    <h2>
                        Risk Breakdown
                    </h2>

                </div>


                <div class="risk-breakdown-grid">


                    <div class="breakdown-card">

                        <div class="breakdown-icon">
                            🧠
                        </div>

                        <strong>
                            Social Engineering
                        </strong>

                        <p>
                            Urgency, pressure, fear or manipulation indicators.
                        </p>

                        ${breakdownStatus(
                            hasSocialEngineering
                        )}

                    </div>


                    <div class="breakdown-card">

                        <div class="breakdown-icon">
                            🔐
                        </div>

                        <strong>
                            Credential Theft
                        </strong>

                        <p>
                            Requests for passwords, OTPs or financial information.
                        </p>

                        ${breakdownStatus(
                            hasCredentialThreat
                        )}

                    </div>


                    <div class="breakdown-card">

                        <div class="breakdown-icon">
                            🚨
                        </div>

                        <strong>
                            Account Threat
                        </strong>

                        <p>
                            Suspension, verification or account closure pressure.
                        </p>

                        ${breakdownStatus(
                            hasAccountThreat
                        )}

                    </div>


                    <div class="breakdown-card">

                        <div class="breakdown-icon">
                            🔗
                        </div>

                        <strong>
                            Suspicious URL
                        </strong>

                        <p>
                            Suspicious links detected in the analyzed email.
                        </p>

                        ${breakdownStatus(
                            hasSuspiciousURL
                        )}

                    </div>


                    <div class="breakdown-card">

                        <div class="breakdown-icon">
                            🎭
                        </div>

                        <strong>
                            Impersonation
                        </strong>

                        <p>
                            Possible brand or organization impersonation.
                        </p>

                        ${breakdownStatus(
                            hasImpersonation
                        )}

                    </div>


                </div>

            </section>



            <!-- =========================================
                 04 THREAT FACTORS
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        04
                    </span>

                    <h2>
                        Threat Factors
                    </h2>

                </div>


                <div class="professional-threat-list">

                    ${threatHtml}

                </div>

            </section>



            <!-- =========================================
                 05 EMAIL ANALYSIS
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        05
                    </span>

                    <h2>
                        Email Analysis
                    </h2>

                </div>


                <div class="professional-email-content">

                    ${escapeHTML(
                        item?.email ||
                        ""
                    )}

                </div>

            </section>



            <!-- =========================================
                 06 URL INTELLIGENCE
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        06
                    </span>

                    <h2>
                        URL Intelligence
                    </h2>

                </div>


                <div class="professional-url-list">

                    ${urlHtml}

                </div>

            </section>



            <!-- =========================================
                 07 SECURITY SUMMARY
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        07
                    </span>

                    <h2>
                        Security Summary
                    </h2>

                </div>


                <div class="professional-summary-box">

                    <div class="summary-icon">
                        🛡️
                    </div>

                    <p>
                        ${escapeHTML(
                            item?.summary ||
                            "Security analysis completed."
                        )}
                    </p>

                </div>

            </section>



            <!-- =========================================
                 08 RECOMMENDED ACTION
            ========================================== -->

            <section class="professional-section">

                <div class="professional-section-title">

                    <span>
                        08
                    </span>

                    <h2>
                        Recommended Action
                    </h2>

                </div>


                <div class="professional-recommendation-box">

                    <div class="recommendation-icon">
                        🛡️
                    </div>

                    <div>

                        <strong>
                            Security Recommendation
                        </strong>

                        <p>
                            ${escapeHTML(
                                recommendation
                            )}
                        </p>

                    </div>

                </div>

            </section>



            <!-- =========================================
                 REPORT FOOTER
            ========================================== -->

            <div class="professional-report-footer">

                <strong>
                    PhishAI Security Report
                </strong>

                <span>
                    Analysis generated by
                    ${escapeHTML(
                        modeLabel
                    )}
                </span>

            </div>


        </div>

    `;


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    modal.classList.remove(
        "hidden-page"
    );

}

/* =========================================================
   CLOSE INDIVIDUAL FULL REPORT
========================================================= */

function closeIndividualReport() {

    const modal =
        document.getElementById(
            "individualReportModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden-page"
    );
}
/* =========================================================
   DOWNLOAD INDIVIDUAL REPORT AS PDF
========================================================= */

function downloadIndividualReportPDF() {

    const report =
        document.querySelector(
            "#individualReportContent .professional-report"
        );

    if (!report) {

        alert(
            "Please open an email report first."
        );

        return;
    }


    const reportHTML =
        report.outerHTML;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1200,height=900"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to download the PDF."
        );

        return;
    }


    printWindow.document.open();


    printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>
        PhishAI Security Report
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        body {

            margin: 0;

            padding: 30px;

            background: #f8fafc;

            color: #111827;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

        }


        .professional-report {

            width: 100%;

            max-width: 1100px;

            margin: 0 auto;

        }


        /* ===============================
           HEADER
        =============================== */

        .professional-report-header {

            display: flex;

            justify-content:
                space-between;

            gap: 30px;

            padding: 30px;

            margin-bottom: 22px;

            border-radius: 18px;

            background:
                linear-gradient(
                    135deg,
                    #0f172a,
                    #1e3a8a
                );

            color: white;

            page-break-inside:
                avoid;

        }


        .professional-label {

            display: block;

            font-size: 11px;

            font-weight: 800;

            letter-spacing: .12em;

            margin-bottom: 10px;

            opacity: .8;

        }


        .professional-report-header h1 {

            margin: 0;

            font-size: 30px;

        }


        .professional-report-header p {

            margin: 10px 0 0;

            max-width: 650px;

            line-height: 1.6;

            opacity: .85;

        }


        .professional-report-number {

            font-size: 13px;

            font-weight: 800;

            white-space: nowrap;

        }


        /* ===============================
           SECTIONS
        =============================== */

        .professional-section {

            background: white;

            border: 1px solid #e5e7eb;

            border-radius: 16px;

            padding: 24px;

            margin-bottom: 18px;

            page-break-inside: avoid;

        }


        .professional-section-title {

            display: flex;

            align-items: center;

            gap: 12px;

            margin-bottom: 18px;

        }


        .professional-section-title > span {

            display: flex;

            align-items: center;

            justify-content: center;

            width: 32px;

            height: 32px;

            border-radius: 9px;

            background: #eff6ff;

            color: #1d4ed8;

            font-size: 12px;

            font-weight: 900;

        }


        .professional-section-title h2 {

            margin: 0;

            font-size: 19px;

        }


        /* ===============================
           EMAIL IDENTITY
        =============================== */

        .email-identity-grid {

            display: grid;

            grid-template-columns:
                2fr 1fr;

            gap: 14px;

        }


        .email-identity-card {

            padding: 16px;

            border: 1px solid #e5e7eb;

            border-radius: 12px;

            background: #f8fafc;

        }


        .email-identity-card span {

            display: block;

            margin-bottom: 7px;

            font-size: 10px;

            font-weight: 800;

            letter-spacing: .08em;

            color: #6b7280;

        }


        .email-identity-card strong {

            display: block;

            font-size: 13px;

            line-height: 1.5;

        }


        /* ===============================
           RISK
        =============================== */

        .risk-overview-card {

            display: grid;

            grid-template-columns:
                260px 1fr;

            gap: 25px;

            padding: 22px;

            border-radius: 15px;

            background: #f8fafc;

            border: 1px solid #e5e7eb;

        }


        .risk-score-number {

            font-size: 52px;

            font-weight: 900;

        }


        .risk-score-number span {

            font-size: 20px;

            color: #6b7280;

        }


        .risk-score-label {

            font-size: 11px;

            font-weight: 800;

            color: #6b7280;

        }


        .risk-meter {

            width: 100%;

            height: 9px;

            margin-top: 15px;

            border-radius: 999px;

            overflow: hidden;

            background: #e5e7eb;

        }


        .risk-meter-fill {

            height: 100%;

            border-radius: 999px;

        }


        .risk-meter-fill.high {

            background: #dc2626;

        }


        .risk-meter-fill.medium {

            background: #f59e0b;

        }


        .risk-meter-fill.low {

            background: #16a34a;

        }


        .individual-risk {

            display: inline-block;

            padding: 7px 11px;

            border-radius: 999px;

            font-size: 11px;

            font-weight: 900;

        }


        .individual-risk.high {

            color: #b91c1c;

            background: #fee2e2;

        }


        .individual-risk.medium {

            color: #b45309;

            background: #fef3c7;

        }


        .individual-risk.low {

            color: #15803d;

            background: #dcfce7;

        }


        .analysis-mode-display {

            margin-top: 10px;

            font-size: 12px;

            font-weight: 800;

        }


        .risk-overview-details p {

            line-height: 1.6;

            color: #4b5563;

        }


        .risk-component-grid {

            display: grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap: 14px;

            margin-top: 14px;

        }


        .risk-component-card {

            padding: 15px;

            border: 1px solid #e5e7eb;

            border-radius: 12px;

        }


        .risk-component-card span {

            display: block;

            font-size: 10px;

            font-weight: 800;

            color: #6b7280;

        }


        .risk-component-card strong {

            display: block;

            margin-top: 5px;

            font-size: 22px;

        }


        .risk-component-card small {

            font-weight: 800;

        }


        /* ===============================
           BREAKDOWN
        =============================== */

        .risk-breakdown-grid {

            display: grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap: 14px;

        }


        .breakdown-card {

            padding: 17px;

            border: 1px solid #e5e7eb;

            border-radius: 13px;

            page-break-inside:
                avoid;

        }


        .breakdown-icon {

            font-size: 23px;

            margin-bottom: 9px;

        }


        .breakdown-card strong {

            display: block;

            font-size: 14px;

        }


        .breakdown-card p {

            font-size: 12px;

            line-height: 1.5;

            color: #6b7280;

        }


        .breakdown-status {

            display: inline-block;

            padding: 5px 9px;

            border-radius: 999px;

            font-size: 9px;

            font-weight: 900;

        }


        .breakdown-status.detected {

            color: #b91c1c;

            background: #fee2e2;

        }


        .breakdown-status.safe {

            color: #15803d;

            background: #dcfce7;

        }


        /* ===============================
           THREATS
        =============================== */

        .professional-threat-item {

            display: flex;

            gap: 12px;

            padding: 13px;

            margin-bottom: 9px;

            border: 1px solid #e5e7eb;

            border-radius: 11px;

            page-break-inside:
                avoid;

        }


        .threat-icon {

            font-size: 17px;

        }


        .professional-threat-item strong {

            font-size: 12px;

        }


        .professional-threat-item p {

            margin: 4px 0 0;

            font-size: 12px;

            line-height: 1.5;

        }


        /* ===============================
           EMAIL CONTENT
        =============================== */

        .professional-email-content {

            padding: 18px;

            border-radius: 12px;

            background: #f8fafc;

            border: 1px solid #e5e7eb;

            white-space: pre-wrap;

            word-break: break-word;

            font-size: 12px;

            line-height: 1.7;

        }


        /* ===============================
           URL
        =============================== */

        .professional-url-card {

            padding: 18px;

            border: 1px solid #e5e7eb;

            border-radius: 13px;

            margin-bottom: 12px;

            page-break-inside:
                avoid;

        }


        .professional-url-header {

            display: flex;

            justify-content:
                space-between;

            gap: 15px;

        }


        .url-detected-label {

            display: block;

            font-size: 9px;

            font-weight: 900;

            letter-spacing: .08em;

            color: #6b7280;

            margin-bottom: 7px;

        }


        .professional-url-value {

            font-size: 12px;

            font-weight: 700;

            word-break: break-all;

        }


        .risk-badge {

            height: fit-content;

            padding: 6px 10px;

            border-radius: 999px;

            font-size: 10px;

            font-weight: 900;

        }


        .risk-badge.high {

            color: #b91c1c;

            background: #fee2e2;

        }


        .risk-badge.medium {

            color: #b45309;

            background: #fef3c7;

        }


        .risk-badge.low {

            color: #15803d;

            background: #dcfce7;

        }


        .url-score-row {

            display: flex;

            justify-content:
                space-between;

            margin-top: 15px;

            font-size: 12px;

        }


        .url-score-row span {

            font-weight: 900;

            font-size: 16px;

        }


        .url-progress {

            height: 7px;

            margin-top: 8px;

            background: #e5e7eb;

            border-radius: 999px;

            overflow: hidden;

        }


        .url-progress-fill {

            height: 100%;

            background: #f59e0b;

        }


        .url-indicator-list {

            margin-top: 10px;

            padding-left: 20px;

        }


        .url-indicator-list li {

            margin-bottom: 5px;

            font-size: 12px;

        }


        .url-summary-block {

            margin-top: 14px;

            padding: 13px;

            border-radius: 10px;

            background: #f8fafc;

        }


        .url-summary-block strong {

            display: block;

            font-size: 11px;

        }


        .url-summary-block p {

            margin-bottom: 0;

            font-size: 12px;

            line-height: 1.5;

        }


        /* ===============================
           SUMMARY
        =============================== */

        .professional-summary-box,

        .professional-recommendation-box {

            display: flex;

            gap: 14px;

            padding: 18px;

            border-radius: 13px;

            background: #f8fafc;

            border: 1px solid #e5e7eb;

        }


        .summary-icon,

        .recommendation-icon {

            font-size: 24px;

        }


        .professional-summary-box p,

        .professional-recommendation-box p {

            margin: 5px 0 0;

            font-size: 13px;

            line-height: 1.7;

        }


        /* ===============================
           FOOTER
        =============================== */

        .professional-report-footer {

            display: flex;

            justify-content:
                space-between;

            gap: 20px;

            padding: 20px 5px;

            font-size: 10px;

            color: #6b7280;

        }


        @page {

            size: A4;

            margin: 12mm;

        }


        @media print {

            body {

                padding: 0;

                background: white;

            }


            .professional-report {

                max-width: none;

            }


            .professional-section {

                box-shadow: none;

            }

        }


    </style>

</head>


<body>

    ${reportHTML}

    <script>

        window.onload = function() {

            setTimeout(
                function() {

                    window.print();

                },
                500
            );

        };


        window.onafterprint = function() {

            window.close();

        };

    <\/script>

</body>

</html>

    `);


    printWindow.document.close();

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

const closeIndividualReportModal =
    document.getElementById(
        "closeIndividualReportModal"
    );
    const downloadPDFButton =
    document.getElementById(
        "downloadIndividualReportPDF"
    );

if (downloadPDFButton) {

    downloadPDFButton.addEventListener(
        "click",
        downloadIndividualReportPDF
    );

}

if (closeIndividualReportModal) {

    closeIndividualReportModal.addEventListener(
        "click",
        closeIndividualReport
    );

}


/* =========================================================
   OVERLAY CLICK
========================================================= */

const individualReportModalOverlay =
    document.getElementById(
        "individualReportModalOverlay"
    );

if (individualReportModalOverlay) {

    individualReportModalOverlay.addEventListener(
        "click",
        closeIndividualReport
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeIndividualReport();

        }

    }
);


/* =========================================================
   HISTORY RENDER
========================================================= */

/* =========================================================
   ADVANCED HISTORY
========================================================= */

let currentHistoryFilter = "ALL";
let currentHistorySearch = "";
let currentHistorySort = "newest";


function renderHistory() {

    const container =
        document.getElementById(
            "historyList"
        );

    if (!container) {
        return;
    }


    let filtered =
        [...analysisHistory];


    /* SEARCH */

    if (
        currentHistorySearch
    ) {

        const search =
            currentHistorySearch
                .toLowerCase()
                .trim();

        filtered =
            filtered.filter(
                item => {

                    const email =
                        String(
                            item?.email || ""
                        )
                        .toLowerCase();

                    const summary =
                        String(
                            item?.summary || ""
                        )
                        .toLowerCase();

                    return (
                        email.includes(search) ||
                        summary.includes(search)
                    );

                }
            );

    }


    /* RISK FILTER */

    if (
        currentHistoryFilter !==
        "ALL"
    ) {

        filtered =
            filtered.filter(
                item => {

                    const score =
                        clampScore(
                            item?.score
                        );

                    const risk =
                        normalizeRiskLevel(
                            item?.riskLevel,
                            score
                        );

                    return (
                        risk ===
                        currentHistoryFilter
                    );

                }
            );

    }


    /* SORT */

    filtered.sort(
        (a, b) => {

            if (
                currentHistorySort ===
                "oldest"
            ) {

                return (
                    new Date(a.date) -
                    new Date(b.date)
                );

            }


            if (
                currentHistorySort ===
                "highest"
            ) {

                return (
                    clampScore(b.score) -
                    clampScore(a.score)
                );

            }


            if (
                currentHistorySort ===
                "lowest"
            ) {

                return (
                    clampScore(a.score) -
                    clampScore(b.score)
                );

            }


            return (
                new Date(b.date) -
                new Date(a.date)
            );

        }
    );


    /* COUNTER */

    const historyCount =
        document.getElementById(
            "historyCount"
        );

    if (historyCount) {

        historyCount.textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? "Scan"
                    : "Scans"
            }`;

    }


    const filterInfo =
        document.getElementById(
            "historyFilterInfo"
        );

    if (filterInfo) {

        if (
            currentHistorySearch ||
            currentHistoryFilter !== "ALL"
        ) {

            filterInfo.textContent =
                `Showing ${filtered.length} of ${analysisHistory.length} scans`;

        }
        else {

            filterInfo.textContent =
                "Showing all scans";

        }

    }


    /* EMPTY */

    if (
        filtered.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    🔎
                </div>

                <h3>
                    No matching scans
                </h3>

                <p>
                    Try another search or risk filter.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                item =>
                    createHistoryItem(
                        item
                    )
            )
            .join("");

}


function createHistoryItem(
    item
) {

    const score =
        clampScore(
            item?.score
        );


    const risk =
        normalizeRiskLevel(
            item?.riskLevel,
            score
        );


    const threats =
        Array.isArray(
            item?.threats
        )
            ? item.threats.length
            : 0;


    const mode =
        String(
            item?.analysisMode ||
            "LOCAL"
        ).toUpperCase();


    const modeHTML =
        mode === "AI"

            ? `
                <span class="history-mode ai">
                    🤖 AI
                </span>
            `

            : `
                <span class="history-mode local">
                    🟡 LOCAL
                </span>
            `;


    return `

        <article class="history-card">

            <div class="history-card-main">

                <div class="history-card-top">

                    <div class="history-meta">

                        <span
                            class="
                                history-risk
                                ${risk.toLowerCase()}
                            "
                        >
                            ${escapeHTML(risk)}
                        </span>

                        ${modeHTML}

                        <span class="history-date">
                            ${formatDate(item?.date)}
                        </span>

                    </div>

                </div>


                <div class="history-email-title">

                    ${escapeHTML(
                        getHistoryTitle(
                            item?.email
                        )
                    )}

                </div>


                <div class="history-preview">

                    ${escapeHTML(
                        getEmailPreview(
                            item?.email,
                            180
                        )
                    )}

                </div>


                <div class="history-card-stats">

                    <span>
                        🎯 Risk Score:
                        <strong>
                            ${score}/100
                        </strong>
                    </span>

                    <span>
                        ⚠️ Threats:
                        <strong>
                            ${threats}
                        </strong>
                    </span>

                    ${
                        item?.extractedURLs?.length
                            ? `
                                <span>
                                    🔗 URLs:
                                    <strong>
                                        ${item.extractedURLs.length}
                                    </strong>
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>


            <div class="history-card-actions">

                <div
                    class="
                        history-score
                        ${risk.toLowerCase()}
                    "
                >
                    ${score}
                    <small>/100</small>
                </div>


                <button
                    class="view-history-btn"
                    onclick="
                        viewHistoryDetails(
                            '${escapeAttribute(item?.id)}'
                        )
                    "
                >
                    👁 View Details
                </button>


                <button
                    class="delete-history-btn"
                    onclick="
                        deleteHistoryItem(
                            '${escapeAttribute(item?.id)}'
                        )
                    "
                >
                    🗑 Delete
                </button>

            </div>

        </article>

    `;

}


function getHistoryTitle(
    email
) {

    const text =
        String(
            email || ""
        )
        .replace(/\s+/g, " ")
        .trim();


    if (!text) {
        return "Untitled Analysis";
    }


    const subjectMatch =
        text.match(
            /subject\s*:\s*(.*?)(?:dear|hello|hi|$)/i
        );


    if (
        subjectMatch &&
        subjectMatch[1]
    ) {

        return subjectMatch[1]
            .trim()
            .slice(0, 100);

    }


    return text.slice(
        0,
        100
    );

}


function viewHistoryDetails(
    id
) {

    const item =
        analysisHistory.find(
            record =>
                String(record?.id) ===
                String(id)
        );


    if (!item) {
        return;
    }


    const score =
        clampScore(
            item?.score
        );


    const risk =
        normalizeRiskLevel(
            item?.riskLevel,
            score
        );


    const mode =
        String(
            item?.analysisMode ||
            "LOCAL"
        ).toUpperCase();


    const threats =
        Array.isArray(
            item?.threats
        )
            ? item.threats
            : [];


    const urls =
        Array.isArray(
            item?.extractedURLs
        )
            ? item.extractedURLs
            : [];


    const modal =
        document.getElementById(
            "historyDetailsModal"
        );

    const content =
        document.getElementById(
            "historyDetailsContent"
        );


    if (
        !modal ||
        !content
    ) {
        return;
    }


    const threatHTML =
        threats.length

            ? threats
                .map(
                    threat => `
                        <div class="detail-threat">
                            <span>✓</span>
                            <span>
                                ${escapeHTML(threat)}
                            </span>
                        </div>
                    `
                )
                .join("")

            : `
                <div class="detail-threat safe">
                    <span>✓</span>
                    <span>
                        No major threat indicators detected.
                    </span>
                </div>
            `;


    const urlHTML =
        urls.length

            ? `
                <div class="history-detail-section">

                    <h3>
                        🔗 Detected URLs
                    </h3>

                    <div class="history-url-list">
    ${
        Array.isArray(item.extractedURLs) &&
        item.extractedURLs.length
            ? item.extractedURLs
                .map((url) => {

                    const urlValue =
                        typeof url === "string"
                            ? url
                            : (
                                url?.url ||
                                url?.value ||
                                url?.href ||
                                ""
                            );

                    if (!urlValue) {
                        return "";
                    }

                    return `
                        <div class="history-url-item">
                            <span>→</span>
                            <a
                                href="${escapeAttribute(urlValue)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escapeHTML(urlValue)}
                            </a>
                        </div>
                    `;
                })
                .join("")
            : `<div class="history-no-url">No URLs detected</div>`
    }
</div>

                </div>
            `

            : "";


    content.innerHTML = `

        <div class="history-detail-top">

            <div>

                <span
                    class="
                        history-risk
                        ${risk.toLowerCase()}
                    "
                >
                    ${risk}
                </span>

                <span
                    class="
                        history-mode
                        ${mode === "AI"
                            ? "ai"
                            : "local"}
                    "
                >
                    ${
                        mode === "AI"
                            ? "🤖 AI ANALYSIS"
                            : "🟡 LOCAL SECURITY ENGINE"
                    }
                </span>

            </div>


            <div class="history-detail-score">

                <strong>
                    ${score}
                </strong>

                <span>
                    /100
                </span>

            </div>

        </div>


        <div class="history-detail-section">

            <h3>
                📧 Email Content
            </h3>

            <div class="history-email-full">

                ${escapeHTML(
                    item?.email || ""
                )}

            </div>

        </div>


        <div class="history-detail-section">

            <h3>
                ⚠️ Detected Threats
            </h3>

            <div class="detail-threat-list">

                ${threatHTML}

            </div>

        </div>


        ${urlHTML}


        <div class="history-detail-section">

            <h3>
                🧠 Analysis Summary
            </h3>

            <div class="history-summary">

                ${escapeHTML(
                    item?.summary ||
                    "No summary available."
                )}

            </div>

        </div>


        <div class="history-detail-footer">

            <span>
                Analyzed:
                ${formatDate(item?.date)}
            </span>

            <button
                class="delete-report-btn"
                onclick="
                    deleteHistoryItem(
                        '${escapeAttribute(item?.id)}'
                    );

                    closeHistoryDetails();
                "
            >
                🗑 Delete Report
            </button>

        </div>

    `;


    modal.classList.remove(
        "hidden-page"
    );

}


function closeHistoryDetails() {

    const modal =
        document.getElementById(
            "historyDetailsModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden-page"
        );

    }

}


function setupHistoryControls() {

    const search =
        document.getElementById(
            "historySearch"
        );

    const sort =
        document.getElementById(
            "historySort"
        );


    if (search) {

        search.addEventListener(
            "input",
            event => {

                currentHistorySearch =
                    event.target.value;

                renderHistory();

            }
        );

    }


    if (sort) {

        sort.addEventListener(
            "change",
            event => {

                currentHistorySort =
                    event.target.value;

                renderHistory();

            }
        );

    }


    document
        .querySelectorAll(
            ".history-filter"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".history-filter"
                            )
                            .forEach(
                                btn =>
                                    btn.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        currentHistoryFilter =
                            button.dataset.filter ||
                            "ALL";

                        renderHistory();

                    }
                );

            }
        );


    const closeButton =
        document.getElementById(
            "closeHistoryModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeHistoryDetails
        );

    }


    const overlay =
        document.querySelector(
            ".history-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeHistoryDetails
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeHistoryDetails();

            }

        }
    );

}


/* =========================================================
   DELETE HISTORY
========================================================= */

function deleteHistoryItem(
    id
) {

    const confirmed =
        confirm(
            "Delete this analysis report?"
        );


    if (!confirmed) {

        return;

    }


    analysisHistory =
        analysisHistory.filter(
            item =>
                String(item?.id) !==
                String(id)
        );


    saveHistoryToStorage();

    renderHistory();

    updateCounts();

    updateReports();


    showNotification(
        "Report deleted.",
        "success"
    );

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory(
    skipConfirmation = false
) {

    if (
        analysisHistory.length === 0
    ) {

        showNotification(
            "No analysis history to clear.",
            "warning"
        );

        return;

    }


    if (!skipConfirmation) {

        const confirmed =
            confirm(
                "Are you sure you want to clear all analysis history?"
            );


        if (!confirmed) {

            return;

        }

    }


    analysisHistory = [];


    saveHistoryToStorage();

    renderHistory();

    updateCounts();

    updateReports();


    showNotification(
        "Analysis history cleared.",
        "success"
    );

}


/* =========================================================
   URL SCANNER SETUP
========================================================= */

function setupURLScanner() {

    const urlInput =
        document.getElementById(
            "urlInput"
        );


    const scanUrlBtn =
        document.getElementById(
            "scanUrlBtn"
        );


    const clearUrlBtn =
        document.getElementById(
            "clearUrlBtn"
        );


    if (scanUrlBtn) {

        scanUrlBtn.addEventListener(
            "click",
            scanURL
        );

    }


    if (clearUrlBtn) {

        clearUrlBtn.addEventListener(
            "click",
            clearURLScanner
        );

    }


    if (urlInput) {

        urlInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    scanURL();

                }

            }
        );

    }

}


/* =========================================================
   AI URL SCANNER
========================================================= */

async function scanURL() {

    const urlInput =
        document.getElementById(
            "urlInput"
        );


    const scanUrlBtn =
        document.getElementById(
            "scanUrlBtn"
        );


    const urlResult =
        document.getElementById(
            "urlResult"
        );


    if (!urlInput) {

        return;

    }


    let rawURL =
        urlInput.value.trim();


    if (!rawURL) {

        showNotification(
            "Please enter a URL first.",
            "warning"
        );

        return;

    }


    if (
        !rawURL.startsWith(
            "http://"
        ) &&
        !rawURL.startsWith(
            "https://"
        )
    ) {

        rawURL =
            "https://" +
            rawURL;

    }


    let parsedURL;


    try {

        parsedURL =
            new URL(
                rawURL
            );

    } catch {

        showNotification(
            "Please enter a valid URL.",
            "error"
        );

        return;

    }


    if (scanUrlBtn) {

        scanUrlBtn.disabled = true;

        scanUrlBtn.textContent =
            "⏳ Scanning...";

    }


    if (urlResult) {

        urlResult.classList.remove(
            "hidden-page"
        );

    }


    try {

        displayURLBasicInformation(
            parsedURL
        );


        showURLLoadingState();


        const response =
            await fetch(
                URL_API,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        url:
                            parsedURL.href
                    })

                }
            );


        let result;


        try {

            result =
                await response.json();

        } catch {

            throw new Error(
                "Invalid response from URL backend."
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "URL analysis failed."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "AI URL analysis failed."
            );

        }


       const urlData =
    result.data &&
    typeof result.data === "object"
        ? result.data
        : result;

displayAIURLResult(
    parsedURL,
    urlData
);


        showNotification(
            "URL analysis completed.",
            "success"
        );


    } catch (error) {

        console.error(
            "URL scanner error:",
            error
        );


        /*
         * Backend unavailable =>
         * local URL scanner fallback.
         */

        const fallback =
            analyzeURL(
                parsedURL
            );


        displayURLResult(
            parsedURL,
            fallback
        );


        showNotification(
            "AI scanner unavailable. Local security scan completed.",
            "warning"
        );


    } finally {

        if (scanUrlBtn) {

            scanUrlBtn.disabled = false;

            scanUrlBtn.textContent =
                "🔍 Scan URL";

        }

    }

}


/* =========================================================
   URL LOADING STATE
========================================================= */

function showURLLoadingState() {

    const urlRiskScore =
        document.getElementById(
            "urlRiskScore"
        );


    const urlRiskBadge =
        document.getElementById(
            "urlRiskBadge"
        );


    const urlRiskCircle =
        document.getElementById(
            "urlRiskCircle"
        );


    const urlRiskText =
        document.getElementById(
            "urlRiskText"
        );


    const urlSecurityChecks =
        document.getElementById(
            "urlSecurityChecks"
        );


    const urlRecommendation =
        document.getElementById(
            "urlRecommendation"
        );


    if (urlRiskScore) {

        urlRiskScore.textContent =
            "...";

    }


    if (urlRiskBadge) {

        urlRiskBadge.textContent =
            "Analyzing";

        urlRiskBadge.className =
            "url-risk-badge";

    }


    if (urlRiskCircle) {

        urlRiskCircle.className =
            "url-risk-circle";

    }


    if (urlRiskText) {

        urlRiskText.textContent =
            "PhishAI AI engine is analyzing this URL...";

    }


    if (urlSecurityChecks) {

        urlSecurityChecks.innerHTML = `

            <div class="url-check waiting">

                <span>⏳</span>

                <div>

                    <strong>
                        AI security analysis running
                    </strong>

                    <p>
                        PhishAI is checking the URL for
                        phishing and impersonation indicators.
                    </p>

                </div>

            </div>

        `;

    }


    if (urlRecommendation) {

        urlRecommendation.textContent =
            "Please wait while PhishAI completes the analysis.";

    }

}


/* =========================================================
   BASIC URL INFORMATION
========================================================= */

function displayURLBasicInformation(
    url
) {

    setText(
        "urlProtocol",
        url.protocol
            .replace(
                ":",
                ""
            )
            .toUpperCase()
    );


    setText(
        "urlHostname",
        url.hostname
    );


    setText(
        "urlHttps",
        url.protocol === "https:"
            ? "Enabled ✓"
            : "Not Enabled ⚠"
    );


    setText(
        "urlLength",
        `${url.href.length} characters`
    );

}


/* =========================================================
   DISPLAY AI URL RESULT
========================================================= */

function displayAIURLResult(
    url,
    result
) {

    const score =
        clampScore(
            result?.score
        );


    const riskLevel =
        normalizeRiskLevel(
            result?.riskLevel,
            score
        );


    const threats =
        Array.isArray(
            result?.threats
        )
            ? result.threats
            : [];


    const summary =
        result?.summary ||
        "AI URL analysis completed.";


    const recommendation =
        result?.recommendation ||
        getURLRecommendation(
            riskLevel
        );


    const urlResult =
        document.getElementById(
            "urlResult"
        );


    const urlRiskScore =
        document.getElementById(
            "urlRiskScore"
        );


    const urlRiskBadge =
        document.getElementById(
            "urlRiskBadge"
        );


    const urlRiskCircle =
        document.getElementById(
            "urlRiskCircle"
        );


    const urlRiskText =
        document.getElementById(
            "urlRiskText"
        );


    const urlSecurityChecks =
        document.getElementById(
            "urlSecurityChecks"
        );


    const urlRecommendation =
        document.getElementById(
            "urlRecommendation"
        );


    displayURLBasicInformation(
        url
    );


    if (urlResult) {

        urlResult.classList.remove(
            "hidden-page"
        );

    }


    if (urlRiskScore) {

        urlRiskScore.textContent =
            score;

    }


    if (urlRiskBadge) {

        urlRiskBadge.textContent =
            riskLevel;


        urlRiskBadge.className =
            "url-risk-badge " +
            riskLevel.toLowerCase();

    }


    if (urlRiskCircle) {

        urlRiskCircle.className =
            "url-risk-circle " +
            riskLevel.toLowerCase();

    }


    if (urlRiskText) {

        if (
            summary
        ) {

            urlRiskText.textContent =
                summary;

        }

    }


    if (urlSecurityChecks) {

        urlSecurityChecks.innerHTML = "";


        if (
            threats.length === 0
        ) {

            urlSecurityChecks.innerHTML = `

                <div class="url-check safe">

                    <span>✓</span>

                    <div>

                        <strong>
                            No major threats detected
                        </strong>

                        <p>
                            The AI did not identify significant phishing indicators.
                        </p>

                    </div>

                </div>

            `;

        }
        else {

            threats.forEach(
                (
                    threat,
                    index
                ) => {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        riskLevel === "HIGH"
                            ? "url-check danger"
                            : riskLevel === "MEDIUM"
                                ? "url-check warning"
                                : "url-check safe";


                    div.innerHTML = `

                        <span>

                            ${
                                riskLevel === "HIGH"
                                    ? "✕"
                                    : riskLevel === "MEDIUM"
                                        ? "⚠"
                                        : "✓"
                            }

                        </span>

                        <div>

                            <strong>

                                Security Indicator
                                ${index + 1}

                            </strong>

                            <p>

                                ${escapeHTML(
                                    threat
                                )}

                            </p>

                        </div>

                    `;


                    urlSecurityChecks.appendChild(
                        div
                    );

                }
            );

        }


        /*
         * AI SUMMARY
         */

        const summaryBox =
            document.createElement(
                "div"
            );


        summaryBox.className =
            "url-check " +
            (
                riskLevel === "HIGH"
                    ? "danger"
                    : riskLevel === "MEDIUM"
                        ? "warning"
                        : "safe"
            );


        summaryBox.innerHTML = `

            <span>🤖</span>

            <div>

                <strong>
                    AI Analysis
                </strong>

                <p>
                    ${escapeHTML(
                        summary
                    )}
                </p>

            </div>

        `;


        urlSecurityChecks.appendChild(
            summaryBox
        );

    }


    if (urlRecommendation) {

        urlRecommendation.textContent =
            recommendation;

    }


    if (urlResult) {

        urlResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   LOCAL URL ANALYSIS FALLBACK
========================================================= */

function analyzeURL(
    url
) {

    let score = 0;

    const checks = [];


    /*
     * HTTPS
     */

    if (
        url.protocol === "https:"
    ) {

        checks.push({

            type: "safe",

            title:
                "HTTPS connection detected",

            description:
                "The URL uses HTTPS encryption."

        });

    }
    else {

        score += 15;

        checks.push({

            type: "warning",

            title:
                "HTTPS is not enabled",

            description:
                "The URL uses an unencrypted HTTP connection."

        });

    }


    /*
     * IP ADDRESS
     */

    const ipPattern =
        /^(\d{1,3}\.){3}\d{1,3}$/;


    if (
        ipPattern.test(
            url.hostname
        )
    ) {

        score += 25;

        checks.push({

            type: "danger",

            title:
                "IP address used instead of domain",

            description:
                "Using a raw IP address can be a phishing indicator."

        });

    }
    else {

        checks.push({

            type: "safe",

            title:
                "Domain name detected",

            description:
                "The URL uses a hostname instead of a raw IP address."

        });

    }


    /*
     * URL LENGTH
     */

    if (
        url.href.length > 120
    ) {

        score += 15;

        checks.push({

            type: "warning",

            title:
                "Unusually long URL",

            description:
                "Long URLs can sometimes hide suspicious parameters."

        });

    }
    else {

        checks.push({

            type: "safe",

            title:
                "URL length looks normal",

            description:
                "No unusually long URL pattern detected."

        });

    }


    /*
     * SUSPICIOUS KEYWORDS
     */

    const suspiciousKeywords = [

        "login",
        "signin",
        "verify",
        "verification",
        "account",
        "secure",
        "update",
        "password",
        "credential",
        "confirm",
        "suspend",
        "unlock",
        "payment",
        "wallet",
        "otp"

    ];


    const lowerURL =
        url.href.toLowerCase();


    const foundKeywords =
        suspiciousKeywords.filter(
            keyword =>
                lowerURL.includes(
                    keyword
                )
        );


    if (
        foundKeywords.length >= 2
    ) {

        score += 20;

        checks.push({

            type: "danger",

            title:
                "Multiple security-sensitive keywords",

            description:
                `Detected: ${foundKeywords.join(", ")}`

        });

    }
    else if (
        foundKeywords.length === 1
    ) {

        score += 8;

        checks.push({

            type: "warning",

            title:
                "Security-sensitive keyword detected",

            description:
                `Detected: ${foundKeywords[0]}`

        });

    }
    else {

        checks.push({

            type: "safe",

            title:
                "No common phishing keywords detected",

            description:
                "No obvious credential or verification keywords were found."

        });

    }


    /*
     * @ SYMBOL
     */

    if (
        url.href.includes("@")
    ) {

        score += 20;

        checks.push({

            type: "danger",

            title:
                "Suspicious @ character detected",

            description:
                "The @ character can be abused to disguise the actual destination."

        });

    }


    /*
     * DOUBLE SLASH
     */

    const pathWithoutProtocol =
        url.href.replace(
            /^https?:\/\//,
            ""
        );


    if (
        pathWithoutProtocol.includes(
            "//"
        )
    ) {

        score += 10;

        checks.push({

            type: "warning",

            title:
                "Multiple slash pattern detected",

            description:
                "The URL contains an unusual slash pattern."

        });

    }


    /*
     * URL SHORTENER
     */

    const shorteners = [

        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "ow.ly",
        "is.gd",
        "buff.ly"

    ];


    if (
        shorteners.some(
            domain =>
                url.hostname
                    .toLowerCase() ===
                domain
        )
    ) {

        score += 20;

        checks.push({

            type: "warning",

            title:
                "URL shortener detected",

            description:
                "Shortened URLs can hide the final destination."

        });

    }


    /*
     * SUBDOMAIN DEPTH
     */

    const parts =
        url.hostname.split(".");


    if (
        parts.length >= 4
    ) {

        score += 10;

        checks.push({

            type: "warning",

            title:
                "Deep subdomain structure",

            description:
                "The domain contains several subdomain levels."

        });

    }


    /*
     * LONG HYPHENATED DOMAIN
     */

    if (
        url.hostname.includes("-") &&
        url.hostname.length > 20
    ) {

        score += 10;

        checks.push({

            type: "warning",

            title:
                "Potentially suspicious domain structure",

            description:
                "The hostname contains a long hyphenated structure."

        });

    }


    score =
        Math.min(
            100,
            Math.max(
                0,
                score
            )
        );


    const riskLevel =
        getRiskLevel(
            score
        );


    return {

        score,

        riskLevel,

        checks,

        foundKeywords,

        analysisMode:
            "LOCAL"

    };

}


/* =========================================================
   DISPLAY LOCAL URL RESULT
========================================================= */

function displayURLResult(
    url,
    analysis
) {

    const urlResult =
        document.getElementById(
            "urlResult"
        );


    const urlRiskScore =
        document.getElementById(
            "urlRiskScore"
        );


    const urlRiskBadge =
        document.getElementById(
            "urlRiskBadge"
        );


    const urlRiskCircle =
        document.getElementById(
            "urlRiskCircle"
        );


    const urlRiskText =
        document.getElementById(
            "urlRiskText"
        );


    const urlSecurityChecks =
        document.getElementById(
            "urlSecurityChecks"
        );


    const urlRecommendation =
        document.getElementById(
            "urlRecommendation"
        );


    if (urlResult) {

        urlResult.classList.remove(
            "hidden-page"
        );

    }


    displayURLBasicInformation(
        url
    );


    const score =
        clampScore(
            analysis?.score
        );


    const riskLevel =
        normalizeRiskLevel(
            analysis?.riskLevel,
            score
        );


    if (urlRiskScore) {

        urlRiskScore.textContent =
            score;

    }


    if (urlRiskBadge) {

        urlRiskBadge.textContent =
            riskLevel;

        urlRiskBadge.className =
            "url-risk-badge " +
            riskLevel.toLowerCase();

    }


    if (urlRiskCircle) {

        urlRiskCircle.className =
            "url-risk-circle " +
            riskLevel.toLowerCase();

    }


    if (urlRiskText) {

        if (
            riskLevel === "HIGH"
        ) {

            urlRiskText.textContent =
                "This URL contains multiple potentially dangerous indicators.";

        }
        else if (
            riskLevel === "MEDIUM"
        ) {

            urlRiskText.textContent =
                "This URL contains some suspicious characteristics.";

        }
        else {

            urlRiskText.textContent =
                "No major suspicious URL patterns were detected.";

        }

    }


    if (urlSecurityChecks) {

        urlSecurityChecks.innerHTML = "";


        if (
            Array.isArray(
                analysis?.checks
            )
        ) {

            analysis.checks.forEach(
                check => {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        `url-check ${check.type}`;


                    const icon =
                        check.type === "safe"

                            ? "✓"

                            : check.type === "warning"

                                ? "⚠"

                                : "✕";


                    div.innerHTML = `

                        <span>
                            ${icon}
                        </span>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    check.title
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    check.description
                                )}
                            </p>

                        </div>

                    `;


                    urlSecurityChecks.appendChild(
                        div
                    );

                }
            );

        }

    }


    if (urlRecommendation) {

        urlRecommendation.textContent =
            getURLRecommendation(
                riskLevel
            );

    }


    if (urlResult) {

        urlResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   URL RECOMMENDATION
========================================================= */

function getURLRecommendation(
    riskLevel
) {

    if (
        riskLevel === "HIGH"
    ) {

        return (
            "Do not open this URL or enter passwords, OTPs, payment information, or other sensitive data."
        );

    }


    if (
        riskLevel === "MEDIUM"
    ) {

        return (
            "Use caution. Verify the website domain independently before entering sensitive information."
        );

    }


    return (
        "No major suspicious patterns were detected. Still verify the website before sharing sensitive information."
    );

}


/* =========================================================
   CLEAR URL SCANNER
========================================================= */

function clearURLScanner() {

    const urlInput =
        document.getElementById(
            "urlInput"
        );


    const urlResult =
        document.getElementById(
            "urlResult"
        );


    if (urlInput) {

        urlInput.value = "";

        urlInput.focus();

    }


    if (urlResult) {

        urlResult.classList.add(
            "hidden-page"
        );

    }

}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const aiToggle =
        document.getElementById(
            "aiToggle"
        );


    if (aiToggle) {

        const savedAI =
            localStorage.getItem(
                "phishAIAIEnabled"
            );


        if (
            savedAI !== null
        ) {

            aiToggle.checked =
                savedAI === "true";

        }


        aiToggle.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "phishAIAIEnabled",
                    aiToggle.checked
                );


                showNotification(
                    aiToggle.checked
                        ? "AI Detection enabled."
                        : "AI Detection disabled.",
                    "success"
                );

            }
        );

    }


    const historyToggle =
        document.getElementById(
            "historyToggle"
        );


    if (historyToggle) {

        const savedHistory =
            localStorage.getItem(
                "phishAIHistoryEnabled"
            );


        if (
            savedHistory !== null
        ) {

            historyToggle.checked =
                savedHistory === "true";

        }


        historyToggle.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "phishAIHistoryEnabled",
                    historyToggle.checked
                );


                showNotification(
                    historyToggle.checked
                        ? "Analysis history enabled."
                        : "Analysis history disabled.",
                    "success"
                );

            }
        );

    }


    const notificationToggle =
        document.getElementById(
            "notificationToggle"
        );


    if (notificationToggle) {

        const savedNotifications =
            localStorage.getItem(
                "phishAINotificationsEnabled"
            );


        if (
            savedNotifications !== null
        ) {

            notificationToggle.checked =
                savedNotifications === "true";

        }


        notificationToggle.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "phishAINotificationsEnabled",
                    notificationToggle.checked
                );


                if (
                    notificationToggle.checked
                ) {

                    showNotification(
                        "Notifications enabled.",
                        "success"
                    );

                }

            }
        );

    }


    const clearHistoryBtn =
        document.getElementById(
            "clearHistoryBtn"
        );


    if (clearHistoryBtn) {

        clearHistoryBtn.addEventListener(
            "click",
            () => {

                clearHistory();

            }
        );

    }

}


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

function setupKeyboardShortcut() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key === "Enter"
            ) {

                const currentHash =
                    window.location.hash
                        .replace(
                            "#",
                            ""
                        );


                if (
                    currentHash ===
                    "url-scanner"
                ) {

                    scanURL();

                    return;

                }


                const analyzer =
                    document.getElementById(
                        "analyzerPage"
                    );


                if (
                    analyzer &&
                    !analyzer.classList.contains(
                        "hidden-page"
                    )
                ) {

                    const input =
                        document.getElementById(
                            "emailInput2"
                        );


                    if (input) {

                        analyzeEmail(
                            input.value,
                            "analyzer"
                        );

                    }

                    return;

                }


                const dashboardInput =
                    document.getElementById(
                        "emailInput"
                    );


                if (
                    dashboardInput
                ) {

                    analyzeEmail(
                        dashboardInput.value,
                        "dashboard"
                    );

                }

            }

        }
    );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
    message,
    type = "success"
) {

    const notificationToggle =
        document.getElementById(
            "notificationToggle"
        );


    if (
        notificationToggle &&
        !notificationToggle.checked
    ) {

        return;

    }


    const old =
        document.querySelector(
            ".app-notification"
        );


    if (old) {

        old.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        `app-notification ${type}`;


    notification.textContent =
        message;


    notification.style.cssText = `

        position: fixed;

        right: 25px;

        bottom: 25px;

        z-index: 99999;

        padding: 12px 16px;

        border-radius: 9px;

        font-size: 12px;

        font-weight: 600;

        box-shadow:
            0 10px 30px rgba(15,23,42,0.15);

        background: white;

        border: 1px solid #e5e7eb;

        color: #172033;

    `;


    if (
        type === "success"
    ) {

        notification.style.borderColor =
            "#bbf7d0";

        notification.style.color =
            "#15803d";

    }


    if (
        type === "error"
    ) {

        notification.style.borderColor =
            "#fecaca";

        notification.style.color =
            "#dc2626";

    }


    if (
        type === "warning"
    ) {

        notification.style.borderColor =
            "#fde68a";

        notification.style.color =
            "#b45309";

    }


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            if (
                notification.parentNode
            ) {

                notification.remove();

            }

        },
        3000
    );

}


/* =========================================================
   UTILITY
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   EMAIL PREVIEW
========================================================= */

function getEmailPreview(
    email,
    length = 180
) {

    if (!email) {

        return (
            "No email content available."
        );

    }


    const clean =
        String(email)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        clean.length <= length
    ) {

        return clean;

    }


    return (
        clean.substring(
            0,
            length
        ) +
        "..."
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "Unknown date";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown date";

    }


    return date.toLocaleString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
   Needed by dynamically generated HTML.
========================================================= */

window.deleteHistoryItem =
    deleteHistoryItem;

window.clearHistory =
    clearHistory;

window.scanURL =
    scanURL;

window.analyzeEmail =
    analyzeEmail;
loadMyAnalyses().then(data => {

    analysisHistory = data;

    console.log(
        "✅ MongoDB history loaded:",
        analysisHistory
    );

    renderHistory();

});