/*
    STUDYFLOW FRONTEND

    Connected to n8n.

    Flow:

    StudyFlow UI
        ↓
    n8n Webhook
        ↓
    Study Plan Generator
        ↓
    Respond to Webhook
        ↓
    StudyFlow UI
*/


// ==========================================
// N8N WEBHOOK
// ==========================================

const N8N_WEBHOOK_URL =
    "https://n8n2177819934.app.n8n.cloud/webhook/study-planner";


// ==========================================
// FALLBACK / DEMO AI OUTPUT
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


document
    .querySelectorAll("[data-page-target]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(
                button.dataset.pageTarget
            );

        });

    });


// ==========================================
// TIMELINE ICONS
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


// ==========================================
// TIMELINE RENDERING
// ==========================================

function renderTimeline(container) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !studyPlan ||
        !Array.isArray(studyPlan.timetable)
    ) {

        return;

    }


    studyPlan.timetable.forEach(
        (item, index) => {

            const entry =
                document.createElement("div");

            entry.className =
                "timeline-entry";


            entry.innerHTML = `

                <div class="timeline-time">
                    ${item.start || ""}
                </div>

                <div class="timeline-marker"></div>

                <div class="timeline-info">

                    <strong>
                        ${getTypeIcon(item.type)}
                        ${item.topic || item.task || ""}
                    </strong>

                    <span>
                        ${
                            item.subject
                                ? `${item.subject} · `
                                : ""
                        }

                        ${item.task || ""}
                    </span>

                </div>

                <div class="timeline-duration">
                    ${
                        item.duration !== undefined
                            ? `${item.duration} min`
                            : ""
                    }
                </div>

            `;


            /*
                Allow clicking the timeline entry
                to start the session.
            */

            if (item.type !== "break") {

                entry.style.cursor = "pointer";

                entry.addEventListener(
                    "click",
                    () => {

                        startSession(index);

                    }
                );

            }


            container.appendChild(entry);

        }
    );

}


// ==========================================
// RENDER BOTH TIMELINES
// ==========================================

function renderAllTimelines() {

    renderTimeline(
        document.getElementById(
            "dashboardTimeline"
        )
    );


    renderTimeline(
        document.getElementById(
            "fullTimeline"
        )
    );

}


renderAllTimelines();


// ==========================================
// SESSION MODAL
// ==========================================

const sessionModal =
    document.getElementById(
        "sessionModal"
    );


const modalSubject =
    document.getElementById(
        "modalSubject"
    );


const modalTopic =
    document.getElementById(
        "modalTopic"
    );


const modalTask =
    document.getElementById(
        "modalTask"
    );


const timerElement =
    document.getElementById(
        "timer"
    );


const timerProgress =
    document.getElementById(
        "timerProgress"
    );


let timerInterval = null;

let currentSessionIndex = null;

let remainingSeconds = 0;

let totalSeconds = 0;

let timerRunning = false;


// ==========================================
// START SESSION
// ==========================================

function startSession(index) {

    const session =
        studyPlan.timetable[index];


    if (!session) {
        return;
    }


    if (session.type === "break") {

        showToast(
            "This is a break. Go touch grass."
        );

        return;

    }


    currentSessionIndex = index;


    modalSubject.textContent =
        session.subject || "";


    modalTopic.textContent =
        session.topic || "";


    modalTask.textContent =
        session.task || "";


    totalSeconds =
        Number(session.duration || 0) * 60;


    remainingSeconds =
        totalSeconds;


    timerRunning = true;


    sessionModal.classList.add(
        "active"
    );


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

                clearInterval(
                    timerInterval
                );


                timerRunning = false;


                showToast(
                    "Session complete! ✓"
                );

            }

        }, 1000);

}


// ==========================================
// TIMER
// ==========================================

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
        totalSeconds > 0
            ? remainingSeconds / totalSeconds
            : 0;


    timerProgress.style.transform =
        `scaleX(${progress})`;

}


// ==========================================
// SESSION BUTTONS
// ==========================================

document
    .querySelectorAll("[data-session]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                startSession(
                    Number(
                        button.dataset.session
                    )
                );

            }
        );

    });


const closeSessionButton =
    document.getElementById(
        "closeSession"
    );


if (closeSessionButton) {

    closeSessionButton.addEventListener(
        "click",
        closeSession
    );

}


function closeSession() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    if (sessionModal) {

        sessionModal.classList.remove(
            "active"
        );

    }

}


const pauseTimerButton =
    document.getElementById(
        "pauseTimer"
    );


if (pauseTimerButton) {

    pauseTimerButton.addEventListener(
        "click",
        event => {

            timerRunning =
                !timerRunning;


            event.target.textContent =
                timerRunning
                    ? "Pause"
                    : "Resume";

        }
    );

}


const completeSessionButton =
    document.getElementById(
        "completeSession"
    );


if (completeSessionButton) {

    completeSessionButton.addEventListener(
        "click",
        () => {

            clearInterval(
                timerInterval
            );


            timerRunning = false;


            closeSession();


            showToast(
                "Session marked complete ✓"
            );

        }
    );

}


// ==========================================
// PLAN GENERATION MODAL
// ==========================================

const planModal =
    document.getElementById(
        "planModal"
    );


const generatePlanButton =
    document.getElementById(
        "generatePlan"
    );


if (generatePlanButton) {

    generatePlanButton.addEventListener(
        "click",
        () => {

            planModal.classList.add(
                "active"
            );

        }
    );

}


const regeneratePlanButton =
    document.getElementById(
        "regeneratePlan"
    );


if (regeneratePlanButton) {

    regeneratePlanButton.addEventListener(
        "click",
        () => {

            planModal.classList.add(
                "active"
            );

        }
    );

}


const closePlanButton =
    document.getElementById(
        "closePlan"
    );


if (closePlanButton) {

    closePlanButton.addEventListener(
        "click",
        () => {

            planModal.classList.remove(
                "active"
            );

        }
    );

}


// ==========================================
// PLAN FORM
// ==========================================

const planForm =
    document.getElementById(
        "planForm"
    );


if (planForm) {

    planForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // ----------------------------------
            // READ FORM
            // ----------------------------------

            const subjects =
                document.getElementById(
                    "subjectsInput"
                ).value;


            const upcomingTests =
                document.getElementById(
                    "testsInput"
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


            const difficultTopics =
                document.getElementById(
                    "difficultInput"
                ).value;


            const topics =
                document.getElementById(
                    "topicsInput"
                ).value;


            const depth =
                document.getElementById(
                    "depthInput"
                ).value;


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


            // ----------------------------------
            // LOADING STATE
            // ----------------------------------

            const submitButton =
                planForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Generating...";

            }


            showToast(
                "Generating your study plan..."
            );


            try {

                // ----------------------------------
                // SEND DATA TO N8N
                // ----------------------------------

                const response =
                    await fetch(
                        N8N_WEBHOOK_URL,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                Subjects:
                                    subjects,

                                "Upcoming Tests":
                                    upcomingTests,

                                "How many minutes can you study today?":
                                    studyTime,

                                "Difficult Topics":
                                    difficultTopics,

                                "Topics you want to study":
                                    topics,

                                "How long are your breaks?":
                                    breakTime,

                                "How deep do you want to study?":
                                    depth,

                                "Preferred Start Time":
                                    startTime,

                                "Sleep Reminder Enabled":
                                    sleepEnabled,

                                "Sleep Time":
                                    sleepTime

                            })

                        }
                    );


                // ----------------------------------
                // CHECK RESPONSE
                // ----------------------------------

                if (!response.ok) {

                    throw new Error(
                        `n8n returned HTTP ${response.status}`
                    );

                }


                const responseText =
                    await response.text();


                if (!responseText.trim()) {

                    throw new Error(
                        "n8n returned an empty response."
                    );

                }


                // ----------------------------------
                // TRY JSON FIRST
                // ----------------------------------

                let parsedResponse = null;


                try {

                    parsedResponse =
                        JSON.parse(
                            responseText
                        );

                } catch (error) {

                    /*
                        Your current n8n workflow
                        returns normal text.

                        That's completely fine.

                        We simply display it instead
                        of trying to force it into JSON.
                    */

                    parsedResponse = null;

                }


                // ----------------------------------
                // STRUCTURED RESPONSE
                // ----------------------------------

                if (
                    parsedResponse &&
                    Array.isArray(
                        parsedResponse.timetable
                    )
                ) {

                    studyPlan =
                        parsedResponse;


                    renderAllTimelines();


                    planModal.classList.remove(
                        "active"
                    );


                    showToast(
                        "Plan generated successfully ✓"
                    );

                }


                // ----------------------------------
                // PLAIN TEXT RESPONSE
                // ----------------------------------

                else {

                    /*
                        n8n currently returns the AI
                        response as plain text.

                        Show it in the existing UI
                        without breaking the app.
                    */

                    displayTextPlan(
                        responseText
                    );


                    planModal.classList.remove(
                        "active"
                    );


                    showToast(
                        "Plan generated successfully ✓"
                    );

                }


            } catch (error) {

                console.error(
                    "StudyFlow error:",
                    error
                );


                showToast(
                    "Could not generate the plan."
                );


                console.error(
                    "Make sure your n8n workflow is active and the production webhook URL is correct."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );


// ==========================================
// DISPLAY PLAIN TEXT AI PLAN
// ==========================================

function displayTextPlan(text) {

    /*
        Try to find a sensible place for the
        generated answer.

        If your UI already has a dedicated
        answer element, use it.
    */

    const possibleContainers = [

        document.getElementById(
            "planAnswer"
        ),

        document.getElementById(
            "studyPlanAnswer"
        ),

        document.getElementById(
            "planOutput"
        )

    ];


    const container =
        possibleContainers.find(
            element => element !== null
        );


    if (container) {

        container.textContent =
            text;

        return;

    }


    /*
        If there isn't an answer container,
        put the generated text into the
        dashboard timeline area temporarily.
    */

    const timeline =
        document.getElementById(
            "dashboardTimeline"
        );


    if (timeline) {

        timeline.innerHTML = "";


        const answer =
            document.createElement(
                "div"
            );


        answer.className =
            "timeline-entry";


        answer.innerHTML = `

            <div class="timeline-info">

                <strong>
                    📚 Your Study Plan
                </strong>

                <span>
                    ${escapeHTML(text)}
                </span>

            </div>

        `;


        timeline.appendChild(
            answer
        );

    }

}


// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ==========================================
// TOAST
// ==========================================

let toastTimeout = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastText =
        document.getElementById(
            "toastText"
        );


    if (!toast || !toastText) {
        return;
    }


    toastText.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


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

const notificationsButton =
    document.getElementById(
        "notificationsButton"
    );


if (notificationsButton) {

    notificationsButton.addEventListener(
        "click",
        () => {

            showToast(
                "You have 3 study reminders today."
            );

        }
    );

}


// ==========================================
// MOBILE MENU
// ==========================================

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            showToast(
                "Use the navigation bar below."
            );

        }
    );

}


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


        if (planModal) {

            planModal.classList.remove(
                "active"
            );

        }

    }
);
