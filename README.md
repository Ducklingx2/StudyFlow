# ⭕ Velora AI

### AI Study Planner for people who have discovered that "I'll remember it" is not, in fact, a reliable scheduling system.

Velora is an AI-powered study planning dashboard that takes your subjects, upcoming tests, available study time, and difficult topics, then turns them into an actual study plan.

It uses **n8n + AI** behind the scenes to generate tasks and keep track of whether you've actually done them.

Because apparently we need software to tell us to study.

## ✨ What does it do?

### 🧠 AI Study Planner

Tell Velora:

- What you're studying
- What tests are coming up
- How much time you have
- How often you need breaks
- Which topics are causing you emotional damage

Velora sends this information to an AI workflow, which creates a study plan and generates tasks.

---

### 📊 Dashboard

The dashboard shows:

- 📚 Total tasks
- ✅ Completed tasks
- ⏳ Pending tasks
- 📈 Overall progress
- 📋 Your current tasks

So instead of saying:

> "I'm pretty sure I'm being productive."

you get actual numbers.

## 🛠️ Tech Stack

| Technology | What it does |
|---|---|
| HTML | Builds the app |
| CSS | Makes it look considerably less depressing |
| JavaScript | Makes things actually happen |
| n8n | Runs the AI workflows |
| n8n Data Tables | Stores the tasks |

## 📁 Project Structure

```text
Velora/
├── index.html
├── style.css
├── app.js
└── README.md
