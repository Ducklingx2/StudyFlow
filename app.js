/*
    STUDYFLOW FRONTEND

    For now this uses fake data.

    Later, replace `studyPlan` with the JSON coming
    from n8n workflow.
*/


// ==========================================
// FAKE AI OUTPUT
// ==========================================

let studyPlan = {

    answer:
        "Focus on active practice, worked examples, timed problems and error correction.",

    timetable: [

        {
            start: "17:00",
            end: "17:45",
            duration: 45,
            type: "study",
            subject: "Maths",
            topic: "Differentiation",
            task:
                "Deep concept review and worked examples. Review derivative rules and solve three worked examples."
        },

        {
            start: "17:45",
            end: "17:55",
            duration: 10,
            type: "break",
            subject: "",
            topic: "Break",
            task: "Take a break."
        },

        {
            start: "17:55",
            end: "18:40",
            duration: 45,
            type: "study",
            subject: "Maths",
            topic: "Differentiation Practice",
            task:
                "Complete 6–8 timed problems and immediately correct mistakes."
        },

        {
            start: "18:40",
            end: "18:50",
            duration: 10,
            type: "break",
            subject: "",
            topic: "Break",
            task: "Take a break."
        },

        {
            start: "18:50",
            end: "19:00",
            duration: 10,
            type: "revision",
            subject: "Maths",
            topic: "Final Self-Test",
            task:
                "Recall the derivative rules from memory and solve one mixed problem."
        }

    ],

    sleep_reminder: {
        enabled: true,
        time: "22:00"
    }

};


// ==========================================
// PAGE NAVIGATION
// ==========================================

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(
    ".nav-item, .mobile-nav-item"
);

function showPage(pageName) {

    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageName
        );

    });


    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navItems.forEach(item => {

    item.addEventListener("click", () => {

        showPage(item.dataset.page);

    });

});


document.querySelectorAll("[data-page-target]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.pageTarget);

        });

    });


// ==========================================
// TIMELINE RENDERING
// ==========================================

function getTypeIcon(type) {

    switch (type) {

        case "study":
            return "📚";

        case "break":
            return "☕";

        case "test":
            return "📝";

        case "revision":
            return "🧠";

        default:
            return "•";

    }

}


function renderTimeline(container) {

    container.innerHTML = "";

    studyPlan.timetable.forEach((item, index) => {

        const entry = document.createElement("div");

        entry.className = "timeline-entry";

        entry.innerHTML = `

            <div class="timeline-time">
                ${item.start}
            </div>

            <div class="timeline-marker"></div>

            <div class="timeline-info">

                <strong>
                    ${getTypeIcon(item.type)}
                    ${item.topic || item.task}
                </strong>

                <span>
                    ${
                        item.subject
                            ? `${item.subject} · `
                            : ""
                    }
                    ${item.task}
                </span>

            </div>

            <div class="timeline-duration">
                ${item.duration} min
            </div>

        `;

        container.appendChild(entry);

    });

}


renderTimeline(
    document.getElementById("dashboardTimeline")
);

renderTimeline(
    document.getElementById("fullTimeline")
);


// ==========================================
// SESSION MODAL
// ==========================================

const sessionModal =
    document.getElementById("sessionModal");

const modalSubject =
    document.getElementById("modalSubject");

const modalTopic =
    document.getElementById("modalTopic");

const modalTask =
    document.getElementById("modalTask");

const timerElement =
    document.getElementById("timer");

const timerProgress =
    document.getElementById("timerProgress");

let timerInterval = null;

let currentSessionIndex = null;

let remainingSeconds = 0;

let totalSeconds = 0;

let timerRunning = false;


function startSession(index) {

    const session =
        studyPlan.timetable[index];

    if (!session) {
        return;
    }

    if (session.type === "break") {

        showToast("This is a break. Go touch grass.");

        return;
    }

    currentSessionIndex = index;

    modalSubject.textContent =
        session.subject;

    modalTopic.textContent =
        session.topic;

    modalTask.textContent =
        session.task;

    totalSeconds =
        session.duration * 60;

    remainingSeconds =
        totalSeconds;

    timerRunning = true;

    sessionModal.classList.add("active");

    updateTimer();

    clearInterval(timerInterval);

    timerInterval =
        setInterval(() => {

            if (!timerRunning) {
                return;
            }

            remainingSeconds--;

            updateTimer();

            if (remainingSeconds <= 0) {

                clearInterval(timerInterval);

                timerRunning = false;

                showToast(
                    "Session complete! ✓"
                );

            }

        }, 1000);

}


function updateTimer() {

    const minutes =
        Math.floor(
            remainingSeconds / 60
        );

    const seconds =
        remainingSeconds % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const progress =
        remainingSeconds / totalSeconds;

    timerProgress.style.transform =
        `scaleX(${progress})`;

}


document
    .querySelectorAll("[data-session]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                startSession(
                    Number(button.dataset.session)
                );

            }
        );

    });


document
    .getElementById("closeSession")
    .addEventListener("click", () => {

        closeSession();

    });


function closeSession() {

    clearInterval(timerInterval);

    timerRunning = false;

    sessionModal.classList.remove(
        "active"
    );

}


document
    .getElementById("pauseTimer")
    .addEventListener("click", event => {

        timerRunning = !timerRunning;

        event.target.textContent =
            timerRunning
                ? "Pause"
                : "Resume";

    });


document
    .getElementById("completeSession")
    .addEventListener("click", () => {

        clearInterval(timerInterval);

        timerRunning = false;

        closeSession();

        showToast(
            "Session marked complete ✓"
        );

    });


// ==========================================
// PLAN GENERATION MODAL
// ==========================================

const planModal =
    document.getElementById("planModal");


document
    .getElementById("generatePlan")
    .addEventListener("click", () => {

        planModal.classList.add("active");

    });


document
    .getElementById("regeneratePlan")
    .addEventListener("click", () => {

        planModal.classList.add("active");

    });


document
    .getElementById("closePlan")
    .addEventListener("click", () => {

        planModal.classList.remove("active");

    });


// ==========================================
// FORM
// ==========================================

document
    .getElementById("planForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const subjects =
            document.getElementById(
                "subjectsInput"
            ).value;

        const studyTime =
            Number(
                document.getElementById(
                    "studyTimeInput"
                ).value
            );

        const breakTime =
            Number(
                document.getElementById(
                    "breakInput"
                ).value
            );

        const startTime =
            document.getElementById(
                "startTimeInput"
            ).value;

        const sleepEnabled =
            document.getElementById(
                "sleepInput"
            ).checked;

        const sleepTime =
            document.getElementById(
                "sleepTimeInput"
            ).value;


        /*
            TEMPORARY DEMO BEHAVIOUR.

            Later this exact form data will be
            sent to your n8n webhook.
        */

        console.log("FORM DATA:", {

            subjects,

            upcomingTests:
                document.getElementById(
                    "testsInput"
                ).value,

            studyTime,

            breakTime,

            difficultTopics:
                document.getElementById(
                    "difficultInput"
                ).value,

            topics:
                document.getElementById(
                    "topicsInput"
                ).value,

            depth:
                document.getElementById(
                    "depthInput"
                ).value,

            startTime,

            sleepEnabled,

            sleepTime

        });


        planModal.classList.remove(
            "active"
        );

        showToast(
            "Plan generated successfully ✓"
        );

    });


// ==========================================
// TOAST
// ==========================================

let toastTimeout = null;


function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastText =
        document.getElementById(
            "toastText"
        );

    toastText.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

}


// ==========================================
// NOTIFICATIONS
// ==========================================

document
    .getElementById("notificationsButton")
    .addEventListener("click", () => {

        showToast(
            "You have 3 study reminders today."
        );

    });


// ==========================================
// MOBILE MENU
// ==========================================

document
    .getElementById("mobileMenu")
    .addEventListener("click", () => {

        showToast(
            "Use the navigation bar below."
        );

    });


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        closeSession();

        planModal.classList.remove(
            "active"
        );

    }
);
