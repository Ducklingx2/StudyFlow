/* =========================================
   VELORA
   Main Application
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const PLANNER_WEBHOOK =
    "https://n8n2177819934.app.n8n.cloud/webhook-test/study-planner";


/* =========================================
   STATE
========================================= */

let currentPage = "dashboard";


/* =========================================
   DOM ELEMENTS
========================================= */

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-button");

const plannerForm =
    document.getElementById("planner-form");

const plannerResult =
    document.getElementById("planner-result");

const plannerOutput =
    document.getElementById("planner-output");

const generateButton =
    document.getElementById("generate-plan");

const toast =
    document.getElementById("toast");


/* =========================================
   NAVIGATION
========================================= */

function showPage(pageName) {

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navButtons.forEach(button => {
        button.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(`${pageName}-page`);

    const selectedButton =
        document.querySelector(
            `.nav-button[data-page="${pageName}"]`
        );

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    currentPage = pageName;

    if (pageName === "dashboard") {
        updateDashboard();
    }
}


/* =========================================
   NAVIGATION EVENTS
========================================= */

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;

        showPage(page);

    });

});


/* =========================================
   TOAST
========================================= */

function showToast(message, duration = 3000) {

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}


/* =========================================
   GET FORM VALUES
========================================= */

function getPlannerFormData() {

    const subjects =
        document.getElementById("subjects").value.trim();

    const grade =
        document.getElementById("grade").value;

    const upcomingTests =
        document
            .getElementById("upcoming-tests")
            .value
            .trim();

    const availableStudyTime =
        document
            .getElementById("available-study-time")
            .value;

    const breakInterval =
        document
            .getElementById("break-interval")
            .value;

    const studyStart =
        document
            .getElementById("study-start")
            .value;

    const studyDepth =
        document
            .getElementById("study-depth")
            .value;

    const sleepReminder =
        document
            .getElementById("sleep-reminder")
            .value;

    const difficultTopics =
        document
            .getElementById("difficult-topics")
            .value
            .trim();


    return {

        subjects,

        grade,

        upcoming_tests:
            upcomingTests,

        available_study_time:
            Number(availableStudyTime),

        break_interval:
            Number(breakInterval),

        study_start:
            studyStart,

        study_depth:
            studyDepth,

        sleep_reminder:
            sleepReminder,

        difficult_topics:
            difficultTopics

    };

}


/* =========================================
   VALIDATE FORM
========================================= */

function validatePlannerData(data) {

    if (!data.subjects) {
        showToast("Please enter your subjects.");
        return false;
    }

    if (!data.grade) {
        showToast("Please select your grade.");
        return false;
    }

    if (!data.upcoming_tests) {
        showToast("Please enter your upcoming tests.");
        return false;
    }

    if (!data.available_study_time ||
        data.available_study_time <= 0) {

        showToast(
            "Please enter your available study time."
        );

        return false;
    }

    if (!data.break_interval ||
        data.break_interval < 5) {

        showToast(
            "Break interval must be at least 5 minutes."
        );

        return false;
    }

    if (!data.study_start) {

        showToast(
            "Please choose when you want to start studying."
        );

        return false;
    }

    return true;

}


/* =========================================
   GENERATE STUDY PLAN
========================================= */

async function generatePlan() {

    const formData =
        getPlannerFormData();


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!validatePlannerData(formData)) {
        return;
    }


    /* -----------------------------------------
       DEBUG
    ----------------------------------------- */

    console.log(
        "VELORA → n8n:",
        formData
    );


    /* -----------------------------------------
       BUTTON STATE
    ----------------------------------------- */

    const originalButtonText =
        generateButton
            ? generateButton.innerHTML
            : "";

    if (generateButton) {

        generateButton.disabled = true;

        generateButton.innerHTML =
            "🧠 Generating plan...";

    }


    /* -----------------------------------------
       SHOW RESULT AREA
    ----------------------------------------- */

    if (plannerResult) {
        plannerResult.classList.remove("hidden");
    }

    if (plannerOutput) {

        plannerOutput.textContent =
            "Velora is creating your study plan...";

    }


    try {

        /* =====================================
           SEND TO N8N
        ===================================== */

        const response = await fetch(
            PLANNER_WEBHOOK,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(formData)
            }
        );


        console.log(
            "n8n HTTP status:",
            response.status
        );


        /* =====================================
           READ RAW RESPONSE
        ===================================== */

        const responseText =
            await response.text();


        console.log(
            "n8n raw response:",
            responseText
        );


        /* =====================================
           EMPTY RESPONSE
        ===================================== */

        if (!responseText.trim()) {

            throw new Error(
                "n8n returned an empty response."
            );

        }


        /* =====================================
           PARSE JSON
        ===================================== */

        let data;

        try {

            data =
                JSON.parse(responseText);

        } catch (jsonError) {

            console.error(
                "Invalid JSON from n8n:",
                responseText
            );

            throw new Error(
                "n8n returned invalid JSON."
            );

        }


        /* =====================================
           HTTP ERROR
        ===================================== */

        if (!response.ok) {

            const errorMessage =
                data.message ||
                data.error ||
                `n8n returned HTTP ${response.status}`;

            throw new Error(errorMessage);

        }


        /* =====================================
           GET AI PLAN
        ===================================== */

        let plan =
            data.plan;


        /*
            Some n8n configurations may return
            the AI output directly instead of:

            {
                success: true,
                plan: "..."
            }

            These fallbacks make the frontend
            more tolerant.
        */

        if (
            typeof plan === "object" &&
            plan !== null
        ) {

            plan =
                plan.output ||
                plan.text ||
                JSON.stringify(
                    plan,
                    null,
                    2
                );

        }


        if (!plan) {

            if (data.output) {

                plan =
                    data.output;

            } else {

                plan =
                    JSON.stringify(
                        data,
                        null,
                        2
                    );

            }

        }


        /* =====================================
           DISPLAY PLAN
        ===================================== */

        if (plannerOutput) {

            plannerOutput.textContent =
                plan;

        }


        showToast(
            "Study plan generated!",
            3000
        );


        /* =====================================
           UPDATE DASHBOARD
        ===================================== */

        updateDashboard();


    } catch (error) {

        console.error(
            "Velora planner error:",
            error
        );


        if (plannerOutput) {

            plannerOutput.textContent =
                `Unable to generate your study plan.

${error.message}`;

        }


        showToast(
            "Something went wrong generating the plan.",
            4000
        );

    } finally {

        /* =====================================
           RESTORE BUTTON
        ===================================== */

        if (generateButton) {

            generateButton.disabled = false;

            generateButton.innerHTML =
                originalButtonText ||
                "🧠 Generate Study Plan";

        }

    }

}


/* =========================================
   FORM SUBMIT
========================================= */

if (plannerForm) {

    plannerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await generatePlan();

        }
    );

}


/* =========================================
   DASHBOARD
========================================= */

/*
    The Data Table is NOT being fetched here yet.

    For now, these values are placeholders.
    Your reminder/task workflow can eventually
    provide the task data separately.
*/

function updateDashboard() {

    const totalTasks =
        document.getElementById("total-tasks");

    const completedTasks =
        document.getElementById("completed-tasks");

    const pendingTasks =
        document.getElementById("pending-tasks");

    const progressPercent =
        document.getElementById("progress-percent");

    const progressLabel =
        document.getElementById("progress-label");

    const progressFill =
        document.getElementById("progress-fill");


    /*
        Keep dashboard at zero until the
        reminder/task endpoint is connected.
    */

    const total = 0;
    const completed = 0;
    const pending = 0;
    const progress = 0;


    if (totalTasks) {
        totalTasks.textContent = total;
    }

    if (completedTasks) {
        completedTasks.textContent = completed;
    }

    if (pendingTasks) {
        pendingTasks.textContent = pending;
    }

    if (progressPercent) {
        progressPercent.textContent =
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


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDashboard();

        /*
            Start on dashboard.
        */

        showPage("dashboard");

    }
);
