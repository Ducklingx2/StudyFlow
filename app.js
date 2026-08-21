/* =========================================================
   VELORA
   AI STUDY PLANNER
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const PLANNER_WEBHOOK =
    "https://n8n2177819934.app.n8n.cloud/webhook-test/study-planner";

/* =========================================================
   DOM ELEMENTS
========================================================= */

const plannerForm =
    document.getElementById("planner-form");

const subjectsInput =
    document.getElementById("subjects");

const upcomingTestsInput =
    document.getElementById("upcoming-tests");

const availableStudyTimeInput =
    document.getElementById("available-study-time");

const breakIntervalInput =
    document.getElementById("break-interval");

const studyDepthInput =
    document.getElementById("study-depth");

const sleepReminderInput =
    document.getElementById("sleep-reminder");

const difficultTopicsInput =
    document.getElementById("difficult-topics");

const gradeInput =
    document.getElementById("grade");

const studyStartInput =
    document.getElementById("study-start");

const plannerResult =
    document.getElementById("planner-result");

const plannerOutput =
    document.getElementById("planner-output");

const generatePlanButton =
    document.getElementById("generate-plan");

const toast =
    document.getElementById("toast");

const dashboardTaskList =
    document.getElementById("dashboard-task-list");

const fullTaskList =
    document.getElementById("full-task-list");

const totalTasksElement =
    document.getElementById("total-tasks");

const completedTasksElement =
    document.getElementById("completed-tasks");

const pendingTasksElement =
    document.getElementById("pending-tasks");

const progressPercentElement =
    document.getElementById("progress-percent");

const progressLabelElement =
    document.getElementById("progress-label");

const progressFillElement =
    document.getElementById("progress-fill");


/* =========================================================
   APPLICATION STATE
========================================================= */

let tasks = [];


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    setupPlannerForm();

    loadTasks();

});


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navigationButtons =
        document.querySelectorAll(".nav-button");

    const pages =
        document.querySelectorAll(".page");

    navigationButtons.forEach(button => {

        button.addEventListener("click", () => {

            const targetPage =
                button.dataset.page;

            navigationButtons.forEach(btn => {

                btn.classList.remove("active");

            });

            button.classList.add("active");

            pages.forEach(page => {

                page.classList.remove("active");

            });

            const page =
                document.getElementById(
                    `${targetPage}-page`
                );

            if (page) {

                page.classList.add("active");

            }

        });

    });

}


/* =========================================================
   PLANNER FORM
========================================================= */

function setupPlannerForm() {

    if (!plannerForm) {

        console.error(
            "Planner form not found."
        );

        return;
    }


    plannerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /*
                Ask for browser notification permission
                when the user actually interacts with
                the planner.
            */

            await setupNotifications();


            /*
                Generate the study plan.
            */

            await generatePlan();

        }
    );

}


/* =========================================================
   GENERATE STUDY PLAN
========================================================= */

async function generatePlan() {

    if (!generatePlanButton) {

        return;

    }


    try {

        /* ---------------------------------------------
           READ FORM VALUES
        --------------------------------------------- */

        const subjects =
            subjectsInput?.value.trim() || "";

        const upcomingTests =
            upcomingTestsInput?.value.trim() || "";

        const availableStudyTime =
            Number(
                availableStudyTimeInput?.value || 0
            );

        const breakInterval =
            Number(
                breakIntervalInput?.value || 0
            );

        const studyDepth =
            studyDepthInput?.value || "medium";

        const sleepReminder =
            sleepReminderInput?.value || "no";

        const difficultTopics =
            difficultTopicsInput?.value.trim() || "";

        const grade =
            gradeInput?.value.trim() || "";

        const studyStart =
            studyStartInput?.value || "";


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!subjects) {

            showToast(
                "Please enter your subjects."
            );

            return;
        }


        if (!upcomingTests) {

            showToast(
                "Please enter your upcoming tests."
            );

            return;
        }


        if (!availableStudyTime) {

            showToast(
                "Please enter your available study time."
            );

            return;
        }


        if (!breakInterval) {

            showToast(
                "Please enter your break interval."
            );

            return;
        }


        /* ---------------------------------------------
           BUILD REQUEST
        --------------------------------------------- */

        const formData = {

            subjects,

            upcomingTests,

            availableStudyTime,

            breakInterval,

            studyDepth,

            sleepReminder,

            difficultTopics,

            grade,

            studyStart

        };


        console.log(
            "Sending planner data:",
            formData
        );


        /* ---------------------------------------------
           BUTTON LOADING
        --------------------------------------------- */

        generatePlanButton.disabled = true;

        generatePlanButton.innerHTML =
            "🧠 Generating...";


        /* ---------------------------------------------
           SEND TO N8N
        --------------------------------------------- */

        const response =
            await fetch(
                PLANNER_WEBHOOK,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(formData)

                }
            );


        /* ---------------------------------------------
           CHECK RESPONSE
        --------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        /* ---------------------------------------------
           READ AI RESPONSE AS TEXT
        --------------------------------------------- */

        const planText =
            await response.text();


        console.log(
            "AI RESPONSE:",
            planText
        );


        if (!planText.trim()) {

            throw new Error(
                "n8n returned an empty response."
            );

        }


        /* ---------------------------------------------
           DISPLAY PLAN
        --------------------------------------------- */

        if (plannerResult) {

            plannerResult.classList.remove(
                "hidden"
            );

        }


        if (plannerOutput) {

            plannerOutput.textContent =
                planText;

        }


        /* ---------------------------------------------
           SUCCESS
        --------------------------------------------- */

        showToast(
            "Study plan generated successfully."
        );


        /* ---------------------------------------------
           REFRESH TASKS
        --------------------------------------------- */

        setTimeout(() => {

            loadTasks();

        }, 1000);


    } catch (error) {

        console.error(
            "Velora planner error:",
            error
        );


        showToast(
            error.message ||
            "Something went wrong while generating your plan."
        );


    } finally {

        if (generatePlanButton) {

            generatePlanButton.disabled =
                false;

            generatePlanButton.innerHTML =
                "🧠 Generate Study Plan";

        }

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    if (!TASKS_WEBHOOK) {

        return;

    }


    try {

        console.log(
            "Loading Velora tasks..."
        );


        const response =
            await fetch(
                TASKS_WEBHOOK,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        const responseText =
            await response.text();


        if (!responseText.trim()) {

            console.warn(
                "Task webhook returned an empty response."
            );

            tasks = [];

            renderTasks();

            updateStatistics();

            return;

        }


        let data;


        try {

            data =
                JSON.parse(responseText);

        } catch {

            console.error(
                "Invalid task JSON:",
                responseText
            );

            throw new Error(
                "Task endpoint returned invalid JSON."
            );

        }


        /* ---------------------------------------------
           SUPPORT RESPONSE FORMATS
        --------------------------------------------- */

        if (Array.isArray(data)) {

            tasks = data;

        }

        else if (
            Array.isArray(data.tasks)
        ) {

            tasks = data.tasks;

        }

        else if (
            Array.isArray(data.data)
        ) {

            tasks = data.data;

        }

        else {

            tasks = [];

        }


        console.log(
            "Loaded tasks:",
            tasks
        );


        renderTasks();

        updateStatistics();


    } catch (error) {

        console.error(
            "Velora task loading error:",
            error
        );


        if (dashboardTaskList) {

            dashboardTaskList.innerHTML = `
                <div class="empty-state">
                    Unable to load tasks.
                </div>
            `;

        }


        if (fullTaskList) {

            fullTaskList.innerHTML = `
                <div class="empty-state">
                    Unable to load tasks.
                </div>
            `;

        }

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(task =>

            String(task.status || "")
                .toLowerCase() ===
            "completed"

        ).length;


    const pending =
        total - completed;


    const progress =
        total > 0

            ? Math.round(
                (completed / total) * 100
            )

            : 0;


    if (totalTasksElement) {

        totalTasksElement.textContent =
            total;

    }


    if (completedTasksElement) {

        completedTasksElement.textContent =
            completed;

    }


    if (pendingTasksElement) {

        pendingTasksElement.textContent =
            pending;

    }


    if (progressPercentElement) {

        progressPercentElement.textContent =
            `${progress}%`;

    }


    if (progressLabelElement) {

        progressLabelElement.textContent =
            `${progress}%`;

    }


    if (progressFillElement) {

        progressFillElement.style.width =
            `${progress}%`;

    }

}


/* =========================================================
   RENDER TASKS
========================================================= */

function renderTasks() {

    renderDashboardTasks();

    renderFullTasks();

}


/* =========================================================
   DASHBOARD TASKS
========================================================= */

function renderDashboardTasks() {

    if (!dashboardTaskList) {

        return;

    }


    if (!tasks.length) {

        dashboardTaskList.innerHTML = `
            <div class="empty-state">
                No study tasks yet.
            </div>
        `;

        return;

    }


    const dashboardTasks =
        tasks.slice(0, 5);


    dashboardTaskList.innerHTML =
        dashboardTasks
            .map(createTaskCard)
            .join("");

}


/* =========================================================
   FULL TASK LIST
========================================================= */

function renderFullTasks() {

    if (!fullTaskList) {

        return;

    }


    if (!tasks.length) {

        fullTaskList.innerHTML = `
            <div class="empty-state">
                No study tasks yet.
            </div>
        `;

        return;

    }


    fullTaskList.innerHTML =
        tasks
            .map(createTaskCard)
            .join("");

}


/* =========================================================
   CREATE TASK CARD
========================================================= */

function createTaskCard(task) {

    const subject =
        escapeHTML(
            task.subject || "General"
        );


    const topic =
        escapeHTML(
            task.topic || "Study"
        );


    const taskText =
        escapeHTML(
            task.task || "Study task"
        );


    const priority =
        escapeHTML(
            task.priority || "Medium"
        );


    const duration =
        task.duration || 0;


    const deadline =
        escapeHTML(
            task.deadline || ""
        );


    const scheduledDate =
        escapeHTML(
            task.scheduled_date || ""
        );


    const status =
        escapeHTML(
            task.status || "Pending"
        );


    return `
        <div class="task-card">

            <div class="task-card-header">

                <div>

                    <span class="task-subject">
                        ${subject}
                    </span>

                    <h4>
                        ${topic}
                    </h4>

                </div>

                <span class="task-priority priority-${priority.toLowerCase()}">
                    ${priority}
                </span>

            </div>


            <p class="task-description">
                ${taskText}
            </p>


            <div class="task-meta">

                <span>
                    ⏱ ${duration} min
                </span>

                ${
                    scheduledDate
                        ? `
                            <span>
                                📅 ${scheduledDate}
                            </span>
                          `
                        : ""
                }

                ${
                    deadline
                        ? `
                            <span>
                                ⏰ ${deadline}
                            </span>
                          `
                        : ""
                }

                <span>
                    ${status}
                </span>

            </div>

        </div>
    `;

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

/*
    This function is called when the user submits
    the planner form.

    It asks Chrome for notification permission.
*/

async function setupNotifications() {

    if (!("Notification" in window)) {

        console.warn(
            "This browser does not support notifications."
        );

        return false;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        console.log(
            "Velora notifications already enabled."
        );

        return true;

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        console.warn(
            "Velora notifications are blocked."
        );

        return false;

    }


    try {

        const permission =
            await Notification.requestPermission();


        console.log(
            "Velora notification permission:",
            permission
        );


        return (
            permission === "granted"
        );


    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );

        return false;

    }

}


/*
    THIS is the function that actually creates
    the browser notification.
*/

function showNotification(
    title,
    message
) {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        console.warn(
            "Notification permission not granted."
        );

        return;

    }


    new Notification(
        title,
        {
            body: message,

            icon:
                "/VeloraAI/assets/velorafavicon.png"
        }
    );

}


/* =========================================================
   TEST NOTIFICATION
========================================================= */

/*
    You can temporarily run:

        testNotification();

    from the browser console.

    This confirms that the browser notification
    part works BEFORE we connect n8n.
*/

function testNotification() {

    showNotification(
        "Velora Test",
        "Browser notifications are working."
    );

}

const studyMusic = new Audio(
    "assets/study-music.mp3"
);

studyMusic.loop = true;
studyMusic.volume = 0.7;

const musicVolume =
    document.getElementById("music-volume");

if (musicVolume) {

    musicVolume.addEventListener(
        "input",
        () => {

            studyMusic.volume =
                Number(musicVolume.value);

        }
    );

}

/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    return String(value)

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
