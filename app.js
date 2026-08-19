/* =========================================================
   STUDYFLOW
   Frontend ↔ n8n
========================================================= */


/* =========================================================
   n8n CONFIGURATION
========================================================= */

const N8N_BASE_URL =
    "https://n8n2177819934.app.n8n.cloud";

const API = {

    createPlan:
        `${N8N_BASE_URL}/webhook/study-planner`,

    getTasks:
        `${N8N_BASE_URL}/webhook/study-tasks`,

    completeTask:
        `${N8N_BASE_URL}/webhook/complete-task`

};


/* =========================================================
   APPLICATION STATE
========================================================= */

let tasks = [];

let toastTimer = null;


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupPlanner();

        setupRefreshButtons();

        loadTasks();

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

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );

                pages.forEach(page => {

                    page.classList.remove(
                        "active"
                    );

                });

                const page =
                    document.getElementById(
                        `${pageName}-page`
                    );

                if (page) {

                    page.classList.add(
                        "active"
                    );

                }

                if (
                    pageName === "dashboard" ||
                    pageName === "tasks"
                ) {

                    loadTasks();

                }

            }
        );

    });

}


/* =========================================================
   REFRESH BUTTONS
========================================================= */

function setupRefreshButtons() {

    const dashboardButton =
        document.getElementById(
            "refresh-dashboard"
        );

    const tasksButton =
        document.getElementById(
            "refresh-tasks"
        );

    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            async () => {

                dashboardButton.disabled = true;

                await loadTasks();

                dashboardButton.disabled = false;

            }
        );

    }

    if (tasksButton) {

        tasksButton.addEventListener(
            "click",
            async () => {

                tasksButton.disabled = true;

                await loadTasks();

                tasksButton.disabled = false;
t
            }
        );

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

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
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        tasks =
            normalizeTasks(data);

        updateStatistics();

        renderDashboardTasks();

        renderTasks();

    }

    catch (error) {

        console.error(
            "StudyFlow task loading error:",
            error
        );

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
   NORMALIZE n8n RESPONSE
========================================================= */

function normalizeTasks(data) {

    if (Array.isArray(data)) {

        return data;

    }

    if (
        data &&
        Array.isArray(data.tasks)
    ) {

        return data.tasks;

    }

    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }

    if (
        data &&
        data.data &&
        Array.isArray(data.data.tasks)
    ) {

        return data.data.tasks;

    }

    return [];

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task =>
                String(
                    task.status ?? ""
                ).trim().toLowerCase()
                === "completed"
        ).length;

    const pending =
        total - completed;

    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
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
                No study tasks yet.<br>
                Generate a study plan to get started.
            </div>
            `;

        return;

    }

    container.innerHTML =
        tasks
            .slice(0, 6)
            .map(createTaskCard)
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
            .map(createTaskCard)
            .join("");

}


/* =========================================================
   CREATE TASK CARD
========================================================= */

function createTaskCard(task) {

    const id =
        task.id ??
        task.ID ??
        task._id ??
        task.rowId ??
        task.row_id;

    const subject =
        escapeHTML(
            task.subject ??
            "General"
        );

    const topic =
        escapeHTML(
            task.topic ??
            ""
        );

    const title =
        escapeHTML(
            task.task ??
            task.title ??
            "Study Task"
        );

    const priority =
        String(
            task.priority ??
            "Medium"
        );

    const status =
        String(
            task.status ??
            "Pending"
        );

    const duration =
        task.duration ??
        task.minutes ??
        0;

    const deadline =
        escapeHTML(
            task.deadline ??
            "No deadline"
        );

    const scheduledDate =
        escapeHTML(
            task.scheduled_date ??
            task.scheduledDate ??
            task.date ??
            ""
        );

    const priorityClass =
        priority
            .toLowerCase()
            .replace(/\s+/g, "-");

    const statusClass =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");

    const completed =
        statusClass === "completed";

    let completeButton = "";

    if (!completed && id !== undefined) {

        const safeId =
            encodeURIComponent(
                String(id)
            );

        completeButton =
            `
            <button
                class="complete-button"
                data-task-id="${escapeHTML(safeId)}"
            >
                ✓ Complete
            </button>
            `;

    }

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

                    <span class="badge ${priorityClass}">
                        ${escapeHTML(priority)}
                    </span>

                    <span class="badge">
                        ${escapeHTML(duration)} min
                    </span>

                    <span class="badge">
                        Deadline:
                        ${deadline}
                    </span>

                    ${
                        scheduledDate
                            ? `
                                <span class="badge">
                                    📅 ${scheduledDate}
                                </span>
                            `
                            : ""
                    }

                    <span class="badge ${statusClass}">
                        ${escapeHTML(status)}
                    </span>

                </div>

            </div>

            ${completeButton}

        </div>
    `;

}


/* =========================================================
   COMPLETE BUTTON EVENTS
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

        const encodedId =
            button.dataset.taskId;

        if (!encodedId) {

            showToast(
                "This task does not have a valid ID."
            );

            return;

        }

        completeTask(
            decodeURIComponent(
                encodedId
            )
        );

    }
);


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
   GENERATE PLAN
========================================================= */

async function generatePlan() {

    const button =
        document.getElementById("generate-plan");

    const result =
        document.getElementById("planner-result");

    const output =
        document.getElementById("planner-output");


    // ==========================================
    // READ FORM VALUES
    // ==========================================

    const subjects =
        document.getElementById("subjects").value.trim();

    const upcomingTests =
        document.getElementById("upcoming-tests").value.trim();

    const availableStudyTime =
        Number(
            document.getElementById("available-study-time").value
        );

    const breakInterval =
        Number(
            document.getElementById("break-interval").value
        );

    const difficultTopics =
        document.getElementById("difficult-topics").value.trim();


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!subjects) {
        showToast("Enter your subjects.");
        return;
    }

    if (!upcomingTests) {
        showToast("Enter your upcoming tests.");
        return;
    }

    if (!availableStudyTime || availableStudyTime <= 0) {
        showToast("Enter your available study time.");
        return;
    }

    if (!breakInterval || breakInterval < 5) {
        showToast(
            "Enter a break interval of at least 5 minutes."
        );
        return;
    }


    // ==========================================
    // LOADING STATE
    // ==========================================

    button.disabled = true;
    button.textContent = "🧠 Creating plan...";

    result.classList.remove("hidden");

    output.textContent =
        "Creating your study plan...";


    // ==========================================
    // PAYLOAD
    // ==========================================

    const payload = {

        subjects: subjects,

        upcoming_tests: upcomingTests,

        available_study_time: availableStudyTime,

        difficult_topics: difficultTopics,

        break_interval: breakInterval

    };


    console.log(
        "Sending StudyFlow data:",
        payload
    );


    try {

        // ==========================================
        // SEND TO n8n
        // ==========================================

        const response =
            await fetch(
                API.createPlan,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        // ==========================================
        // READ RESPONSE
        // ==========================================

        const data =
            await response.json();


        console.log(
            "StudyFlow n8n response:",
            data
        );


        // ==========================================
        // EXTRACT AI OUTPUT
        // ==========================================

        let aiOutput = "";


        /*
         * n8n commonly returns:
         *
         * [
         *   {
         *      "output": "..."
         *   }
         * ]
         */


        if (Array.isArray(data)) {

            if (data.length > 0) {

                const firstItem =
                    data[0];


                aiOutput =
                    firstItem.output ??
                    firstItem.answer ??
                    firstItem.message ??
                    firstItem.response ??
                    "";

            }

        }


        /*
         * n8n can also return:
         *
         * {
         *     "output": "..."
         * }
         */

        else if (
            typeof data === "object" &&
            data !== null
        ) {

            aiOutput =
                data.output ??
                data.answer ??
                data.message ??
                data.response ??
                "";

        }


        // ==========================================
        // HANDLE EMPTY RESPONSE
        // ==========================================

        if (!aiOutput) {

            console.error(
                "Unexpected n8n response:",
                data
            );

            throw new Error(
                "n8n returned no study plan."
            );

        }


        // ==========================================
        // DISPLAY PLAN
        // ==========================================

        output.textContent =
            String(aiOutput);


        showToast(
            "Study plan created! 🎉"
        );


        // ==========================================
        // REFRESH TASKS
        // ==========================================

        await loadTasks();

    }


    catch (error) {

        console.error(
            "StudyFlow planner error:",
            error
        );


        output.textContent =
            "The study plan could not be created.";

        showToast(
            "Study planner failed."
        );

    }


    finally {

        button.disabled = false;

        button.textContent =
            "🧠 Generate Study Plan";

    }

}

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!subjects) {

        showToast(
            "Enter your subjects."
        );

        return;

    }

    if (!upcomingTests) {

        showToast(
            "Enter your upcoming tests."
        );

        return;

    }

    if (
        !availableStudyTime ||
        availableStudyTime <= 0
    ) {

        showToast(
            "Enter your available study time."
        );

        return;

    }

    if (
        !breakInterval ||
        breakInterval < 5
    ) {

        showToast(
            "Enter a break interval of at least 5 minutes."
        );

        return;

    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (button) {

        button.disabled = true;

        button.textContent =
            "🧠 Creating your plan...";

    }

    if (result) {

        result.classList.remove(
            "hidden"
        );

    }

    if (output) {

        output.textContent =
            "Your AI planner is working...";

    }


    /* =====================================================
       SEND TO n8n
    ===================================================== */

    try {

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

                        subjects,

                        upcoming_tests:
                            upcomingTests,

                        available_study_time:
                            availableStudyTime,

                        difficult_topics:
                            difficultTopics,

                        break_interval:
                            breakInterval

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /* =================================================
           EXTRACT AI RESPONSE
        ================================================= */

        const aiOutput =
            data?.output ??
            data?.answer ??
            data?.message ??
            data?.response ??
            data;


        if (output) {

            if (
                typeof aiOutput ===
                "string"
            ) {

                output.textContent =
                    aiOutput;

            }

            else {

                output.textContent =
                    JSON.stringify(
                        aiOutput,
                        null,
                        2
                    );

            }

        }


        showToast(
            "Study plan created ✓"
        );


        /* =================================================
           REFRESH TASKS
        ================================================= */

        await loadTasks();

    }

    catch (error) {

        console.error(
            "StudyFlow planner error:",
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
   COMPLETE TASK
========================================================= */

async function completeTask(id) {

    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
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
            "StudyFlow complete-task error:",
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
