/* =========================================================
   VELORA
   AI STUDY PLANNER
   Frontend ↔ n8n
========================================================= */


/* =========================================================
   n8n CONFIGURATION
========================================================= */

const N8N_BASE_URL =
    "https://n8n2177819934.app.n8n.cloud";


const API = {

    /*
     * Currently using the TEST webhook.
     *
     * When you deploy the workflow, change this to:
     *
     * /webhook/study-planner
     */

    createPlan:
        `${N8N_BASE_URL}/webhook-test/study-planner`,


    /*
     * IMPORTANT:
     *
     * Put your actual task-reading endpoint here.
     *
     * Example:
     *
     * `${N8N_BASE_URL}/webhook/study-tasks`
     *
     * If you haven't created it yet, leave it empty.
     */

    getTasks:
        "",


    /*
     * Put your task completion endpoint here when ready.
     */

    completeTask:
        ""
};


/* =========================================================
   APPLICATION STATE
========================================================= */

let tasks = [];

let toastTimer;


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupPlanner();

        /*
         * Only load tasks if an endpoint exists.
         *
         * This prevents Velora from screaming about
         * a missing endpoint before you've created one.
         */

        if (API.getTasks) {
            loadTasks();
        }
        else {
            updateStatistics();

            renderDashboardTasks();

            renderTasks();
        }

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-button"
        );


    const pages =
        document.querySelectorAll(
            ".page"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageName =
                    button.dataset.page;


                /*
                 * Remove active state
                 */

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                /*
                 * Activate clicked button
                 */

                button.classList.add(
                    "active"
                );


                /*
                 * Hide pages
                 */

                pages.forEach(page => {

                    page.classList.remove(
                        "active"
                    );

                });


                /*
                 * Show selected page
                 */

                const page =
                    document.getElementById(
                        `${pageName}-page`
                    );


                if (page) {

                    page.classList.add(
                        "active"
                    );

                }


                /*
                 * Refresh tasks when needed
                 */

                if (
                    (
                        pageName === "dashboard" ||
                        pageName === "tasks"
                    ) &&
                    API.getTasks
                ) {

                    loadTasks();

                }

            }
        );

    });

}


/* =========================================================
   PLANNER
========================================================= */

function setupPlanner() {

    const form =
        document.getElementById(
            "planner-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await generatePlan();

        }
    );

}


/* =========================================================
   GENERATE STUDY PLAN
========================================================= */

async function generatePlan() {

    const button =
        document.getElementById(
            "generate-plan"
        );


    const result =
        document.getElementById(
            "planner-result"
        );


    const output =
        document.getElementById(
            "planner-output"
        );


    /*
     * Read form values
     */

    const subjectsElement =
        document.getElementById(
            "subjects"
        );


    const upcomingTestsElement =
        document.getElementById(
            "upcoming-tests"
        );


    const availableTimeElement =
        document.getElementById(
            "available-study-time"
        );


    const breakIntervalElement =
        document.getElementById(
            "break-interval"
        );


    const difficultTopicsElement =
        document.getElementById(
            "difficult-topics"
        );


    const studyDepthElement =
        document.getElementById(
            "study-depth"
        );


    const sleepReminderElement =
        document.getElementById(
            "sleep-reminder"
        );


    /*
     * Make sure the elements actually exist.
     */

    if (
        !subjectsElement ||
        !upcomingTestsElement ||
        !availableTimeElement ||
        !breakIntervalElement ||
        !difficultTopicsElement ||
        !studyDepthElement ||
        !sleepReminderElement
    ) {

        console.error(
            "Velora planner form is missing one or more fields."
        );

        showToast(
            "Planner form is missing a field."
        );

        return;

    }


    const subjects =
        subjectsElement.value.trim();


    const upcomingTests =
        upcomingTestsElement.value.trim();


    const availableStudyTime =
        Number(
            availableTimeElement.value
        );


    const breakInterval =
        Number(
            breakIntervalElement.value
        );


    const difficultTopics =
        difficultTopicsElement.value.trim();


    const studyDepth =
        studyDepthElement.value;


    const sleepReminder =
        sleepReminderElement.value;


    /*
     * Validation
     */

    if (!subjects) {

        showToast(
            "Enter your subjects."
        );

        subjectsElement.focus();

        return;

    }


    if (!upcomingTests) {

        showToast(
            "Enter your upcoming tests."
        );

        upcomingTestsElement.focus();

        return;

    }


    if (
        !availableStudyTime ||
        availableStudyTime <= 0
    ) {

        showToast(
            "Enter your available study time."
        );

        availableTimeElement.focus();

        return;

    }


    if (
        !breakInterval ||
        breakInterval < 5
    ) {

        showToast(
            "Break interval must be at least 5 minutes."
        );

        breakIntervalElement.focus();

        return;

    }


    /*
     * Loading state
     */

    if (button) {

        button.disabled = true;

        button.textContent =
            "🧠 Creating plan...";

    }


    if (result) {

        result.classList.remove(
            "hidden"
        );

    }


    if (output) {

        output.textContent =
            "Velora is building your study plan...";

    }


    try {

        /*
         * Send the form to n8n
         */

        const response =
            await fetch(
                API.createPlan,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        subjects:
                            subjects,

                        upcoming_tests:
                            upcomingTests,

                        available_study_time:
                            availableStudyTime,

                        break_interval:
                            breakInterval,

                        difficult_topics:
                            difficultTopics,

                        study_depth:
                            studyDepth,

                        sleep_reminder:
                            sleepReminder

                    })
                }
            );


        /*
         * HTTP error
         */

        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        /*
         * Read n8n response
         */

        const data =
            await response.json();


        console.log(
            "Velora n8n response:",
            data
        );


        /*
         * Find the actual study-plan output.
         *
         * Respond to Webhook can return:
         *
         * {
         *     plan: "..."
         * }
         *
         * or:
         *
         * {
         *     output: "..."
         * }
         */

        let aiOutput;


        if (
            data &&
            typeof data.plan === "string"
        ) {

            aiOutput =
                data.plan;

        }

        else if (
            data &&
            typeof data.output === "string"
        ) {

            aiOutput =
                data.output;

        }

        else if (
            data &&
            typeof data.answer === "string"
        ) {

            aiOutput =
                data.answer;

        }

        else if (
            data &&
            typeof data.message === "string"
        ) {

            aiOutput =
                data.message;

        }

        else {

            /*
             * Last resort:
             * display returned JSON.
             */

            aiOutput =
                JSON.stringify(
                    data,
                    null,
                    2
                );

        }


        /*
         * Display study plan
         */

        if (output) {

            output.textContent =
                cleanPlanOutput(
                    aiOutput
                );

        }


        if (result) {

            result.classList.remove(
                "hidden"
            );

        }


        showToast(
            "Study plan created! ✓"
        );


        /*
         * If a task endpoint exists,
         * refresh the dashboard.
         */

        if (API.getTasks) {

            await loadTasks();

        }

    }


    catch (error) {

        console.error(
            "Velora planner error:",
            error
        );


        if (output) {

            output.textContent =
                "The study plan could not be created.";

        }


        showToast(
            "Study planner failed."
        );

    }


    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "🧠 Generate Study Plan";

        }

    }

}


/* =========================================================
   CLEAN AI OUTPUT
========================================================= */

function cleanPlanOutput(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "No study plan was returned.";

    }


    /*
     * If n8n somehow sends an object,
     * format it nicely.
     */

    if (
        typeof value === "object"
    ) {

        return JSON.stringify(
            value,
            null,
            2
        );

    }


    let text =
        String(value);


    /*
     * Remove accidental surrounding quotes.
     */

    if (
        text.startsWith('"') &&
        text.endsWith('"')
    ) {

        try {

            text =
                JSON.parse(text);

        }

        catch {

            text =
                text.slice(
                    1,
                    -1
                );

        }

    }


    /*
     * Convert escaped newlines
     * into actual newlines.
     */

    text =
        text.replaceAll(
            "\\n",
            "\n"
        );


    /*
     * Convert escaped quotes.
     */

    text =
        text.replaceAll(
            '\\"',
            '"'
        );


    return text.trim();

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    if (!API.getTasks) {

        tasks = [];

        updateStatistics();

        renderDashboardTasks();

        renderTasks();

        return;

    }


    const dashboardList =
        document.getElementById(
            "dashboard-task-list"
        );


    const taskList =
        document.getElementById(
            "full-task-list"
        );


    if (dashboardList) {

        dashboardList.innerHTML =
            `
                <div class="loading">
                    Loading tasks...
                </div>
            `;

    }


    if (taskList) {

        taskList.innerHTML =
            `
                <div class="loading">
                    Loading tasks...
                </div>
            `;

    }


    try {

        const response =
            await fetch(
                API.getTasks,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /*
         * Support several response structures.
         */

        if (Array.isArray(data)) {

            tasks =
                data;

        }

        else if (
            data &&
            Array.isArray(data.tasks)
        ) {

            tasks =
                data.tasks;

        }

        else if (
            data &&
            Array.isArray(data.data)
        ) {

            tasks =
                data.data;

        }

        else {

            tasks =
                [];

        }


        updateStatistics();

        renderDashboardTasks();

        renderTasks();

    }


    catch (error) {

        console.error(
            "Velora task loading error:",
            error
        );


        tasks =
            [];


        if (dashboardList) {

            dashboardList.innerHTML =
                `
                    <div class="empty-state">
                        Could not load tasks.
                    </div>
                `;

        }


        if (taskList) {

            taskList.innerHTML =
                `
                    <div class="empty-state">
                        Could not load tasks.
                    </div>
                `;

        }


        showToast(
            "Could not load tasks."
        );

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                String(
                    task.status || ""
                ).toLowerCase() ===
                "completed"
        ).length;


    const pending =
        tasks.filter(
            task =>
                String(
                    task.status || ""
                ).toLowerCase() !==
                "completed"
        ).length;


    const progress =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    const totalElement =
        document.getElementById(
            "total-tasks"
        );


    const completedElement =
        document.getElementById(
            "completed-tasks"
        );


    const pendingElement =
        document.getElementById(
            "pending-tasks"
        );


    const progressElement =
        document.getElementById(
            "progress-percent"
        );


    const progressLabel =
        document.getElementById(
            "progress-label"
        );


    const progressFill =
        document.getElementById(
            "progress-fill"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (progressElement) {

        progressElement.textContent =
            `${progress}%`;

    }


    if (progressLabel) {

        progressLabel.textContent =
            `${progress}%`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }

}


/* =========================================================
   DASHBOARD TASKS
========================================================= */

function renderDashboardTasks() {

    const container =
        document.getElementById(
            "dashboard-task-list"
        );


    if (!container) {
        return;
    }


    if (tasks.length === 0) {

        container.innerHTML =
            `
                <div class="empty-state">
                    No study tasks yet.
                    Generate a study plan to get started.
                </div>
            `;

        return;

    }


    const visibleTasks =
        tasks.slice(
            0,
            6
        );


    container.innerHTML =
        visibleTasks
            .map(
                task =>
                    createTaskCard(task)
            )
            .join("");

}


/* =========================================================
   FULL TASK PAGE
========================================================= */

function renderTasks() {

    const container =
        document.getElementById(
            "full-task-list"
        );


    if (!container) {
        return;
    }


    if (tasks.length === 0) {

        container.innerHTML =
            `
                <div class="empty-state">
                    No tasks yet.
                </div>
            `;

        return;

    }


    container.innerHTML =
        tasks
            .map(
                task =>
                    createTaskCard(task)
            )
            .join("");

}


/* =========================================================
   CREATE TASK CARD
========================================================= */

function createTaskCard(task) {

    /*
     * n8n Data Table provides its own
     * system ID.
     */

    const id =
        task.id ??
        task.ID ??
        task._id ??
        task.rowId;


    const subject =
        escapeHTML(
            task.subject ||
            "General"
        );


    const topic =
        escapeHTML(
            task.topic ||
            ""
        );


    const title =
        escapeHTML(
            task.task ||
            task.title ||
            "Study Task"
        );


    const priority =
        String(
            task.priority ||
            "Medium"
        );


    const status =
        String(
            task.status ||
            "Pending"
        );


    const duration =
        Number(
            task.duration ||
            task.minutes ||
            0
        );


    const deadline =
        escapeHTML(
            task.deadline ||
            "No deadline"
        );


    const scheduledDate =
        escapeHTML(
            task.scheduled_date ||
            task.date ||
            ""
        );


    const priorityClass =
        priority
            .toLowerCase();


    const statusClass =
        status
            .toLowerCase();


    const completed =
        statusClass ===
        "completed";


    /*
     * Only show Complete if
     * we actually have an ID and
     * a completion endpoint.
     */

    const showCompleteButton =
        !completed &&
        id !== undefined &&
        id !== null &&
        API.completeTask;


    return `
        <div class="task-card">

            <div class="task-main">

                <div class="task-subject">
                    ${subject}
                </div>

                <div class="task-title">
                    ${title}
                </div>

                ${
                    topic
                        ? `
                            <div class="task-topic">
                                ${topic}
                            </div>
                        `
                        : ""
                }

                <div class="task-meta">

                    <span
                        class="badge ${priorityClass}"
                    >
                        ${escapeHTML(priority)}
                    </span>

                    <span class="badge">
                        ${duration} min
                    </span>

                    <span class="badge">
                        Deadline:
                        ${deadline}
                    </span>

                    ${
                        scheduledDate
                            ? `
                                <span class="badge">
                                    📅
                                    ${scheduledDate}
                                </span>
                            `
                            : ""
                    }

                    <span
                        class="badge ${statusClass}"
                    >
                        ${escapeHTML(status)}
                    </span>

                </div>

            </div>


            ${
                showCompleteButton
                    ? `
                        <button
                            class="complete-button"
                            data-task-id="${escapeHTML(id)}"
                        >
                            ✓ Complete
                        </button>
                    `
                    : ""
            }

        </div>
    `;

}


/* =========================================================
   COMPLETE TASK BUTTON HANDLER
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".complete-button"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.taskId;


        completeTask(id);

    }
);


/* =========================================================
   COMPLETE TASK
========================================================= */

async function completeTask(id) {

    if (!API.completeTask) {

        showToast(
            "Task completion endpoint is not configured yet."
        );

        return;

    }


    if (
        id === undefined ||
        id === null ||
        id === "" ||
        id === "undefined"
    ) {

        showToast(
            "This task does not have a valid ID."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API.completeTask,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        id: id
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        showToast(
            "Task completed ✓"
        );


        await loadTasks();

    }


    catch (error) {

        console.error(
            "Velora complete-task error:",
            error
        );


        showToast(
            "Could not complete task."
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
