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
        `${N8N_BASE_URL}/webhook-test/study-planner`

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

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".nav-button");

    const pages =
        document.querySelectorAll(".page");


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageName =
                    button.dataset.page;


                buttons.forEach(btn => {

                    btn.classList.remove("active");

                });


                button.classList.add("active");


                pages.forEach(page => {

                    page.classList.remove("active");

                });


                const page =
                    document.getElementById(
                        `${pageName}-page`
                    );


                if (page) {

                    page.classList.add("active");

                }


                if (
                    pageName === "dashboard" ||
                    pageName === "tasks"
                ) {

                }

            }
        );

    });

}


/* =========================================================
   PLANNER SETUP
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


    /* =========================================
       READ FORM
    ========================================= */

    const subjects =
        document.getElementById(
            "subjects"
        ).value.trim();


    const upcomingTests =
        document.getElementById(
            "upcoming-tests"
        ).value.trim();


    const availableStudyTime =
        Number(
            document.getElementById(
                "available-study-time"
            ).value
        );


    const breakInterval =
        Number(
            document.getElementById(
                "break-interval"
            ).value
        );


    const difficultTopics =
        document.getElementById(
            "difficult-topics"
        ).value.trim();


    /* =========================================
       VALIDATION
    ========================================= */

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
            "Break interval must be at least 5 minutes."
        );

        return;

    }


    /* =========================================
       PREPARE UI
    ========================================= */

    button.disabled = true;

    button.textContent =
        "🧠 Creating plan...";


    result.classList.remove(
        "hidden"
    );


    output.textContent =
        "Creating your study plan...";


    /* =========================================
       PAYLOAD
    ========================================= */

    const payload = {

        subjects:
            subjects,

        upcoming_tests:
            upcomingTests,

        available_study_time:
            availableStudyTime,

        difficult_topics:
            difficultTopics,

        break_interval:
            breakInterval

    };


    console.log(
        "StudyFlow → n8n:",
        payload
    );


    try {

        /* =====================================
           SEND REQUEST
        ===================================== */

        const response =
            await fetch(
                API.createPlan,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                `n8n returned HTTP ${response.status}`
            );

        }


        /* =====================================
           READ RESPONSE
        ===================================== */

        const data =
            await response.json();


        console.log(
            "n8n → StudyFlow:",
            data
        );


        /* =====================================
           EXTRACT OUTPUT
        ===================================== */

        let aiOutput = "";


        if (Array.isArray(data)) {

            const first =
                data[0];


            if (first) {

                aiOutput =
                    first.output ??
                    first.answer ??
                    first.message ??
                    first.response ??
                    "";

            }

        }

        else if (
            data &&
            typeof data === "object"
        ) {

            aiOutput =
                data.output ??
                data.answer ??
                data.message ??
                data.response ??
                "";

        }


        /* =====================================
           MAKE SURE IT IS DISPLAYABLE
        ===================================== */

        if (
            typeof aiOutput !== "string"
        ) {

            aiOutput =
                JSON.stringify(
                    aiOutput,
                    null,
                    2
                );

        }


        if (!aiOutput.trim()) {

            throw new Error(
                "n8n returned an empty study plan."
            );

        }


        /* =====================================
           DISPLAY ONLY THE PLAN
        ===================================== */

        output.textContent =
            aiOutput;


        showToast(
            "Study plan created! 🎉"
        );


        /* =====================================
           REFRESH TASKS
        ===================================== */

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


/* =========================================================
   COMPLETE TASK
========================================================= */

async function completeTask(id) {

    if (
        id === undefined ||
        id === null ||
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

                    body:
                        JSON.stringify({
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
