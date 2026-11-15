/* =========================================================
   Student Portfolio & Academic Planner JavaScript (js/script.js)
   Features:
   - Mobile Navigation Menu Toggle
   - Dynamic Greeting & Footer Year
   - Interactive Academic Planner (Add, Complete, Delete, Filter)
   - Contact Form Validation (Non-empty, Valid Email, Digits-Only Phone)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  updateFooterYear();
  updateDynamicGreeting();
  initAcademicPlanner();
  initContactForm();
});

/* ---------------------------------------------------------
   1. Mobile Navigation Toggle
   --------------------------------------------------------- */
function initNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");

  if (!menuToggle || !siteNav) return;

  menuToggle.addEventListener("click", function () {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu automatically when a mobile user taps a navigation link
  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------------------------------------------------
   2. Dynamic Footer Year & Time-Based Welcome Greeting
   --------------------------------------------------------- */
function updateFooterYear() {
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function updateDynamicGreeting() {
  const greetingEl = document.getElementById("dynamicGreeting");
  if (!greetingEl) return;

  const hour = new Date().getHours();
  if (hour < 12) {
    greetingEl.textContent = "Good Morning! Welcome to my Academic Portfolio";
  } else if (hour < 18) {
    greetingEl.textContent = "Good Afternoon! Welcome to my Academic Portfolio";
  } else {
    greetingEl.textContent = "Good Evening! Welcome to my Academic Portfolio";
  }
}

/* ---------------------------------------------------------
   3. Interactive Academic Planner
   --------------------------------------------------------- */
const STORAGE_KEY = "cos106_academic_tasks";
let academicTasks = loadTasksFromStorage();
let currentFilter = "all";

function loadTasksFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }

  return [
    {
      id: 1,
      title: "Review Semantic HTML5 & CSS Grid Notes",
      course: "COS 106",
      dueDate: "2026-11-20",
      completed: true
    },
    {
      id: 2,
      title: "Complete JavaScript DOM Manipulation Lab",
      course: "COS 106",
      dueDate: "2026-11-25",
      completed: false
    }
  ];
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(academicTasks));
}

function initAcademicPlanner() {
  const taskForm = document.getElementById("taskForm");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (!taskForm) return;

  renderTasks();

  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleAddTask();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      button.classList.add("active");
      currentFilter = button.getAttribute("data-filter");
      renderTasks();
    });
  });
}

function handleAddTask() {
  const titleInput = document.getElementById("taskTitle");
  const courseSelect = document.getElementById("taskCourse");
  const dueDateInput = document.getElementById("taskDueDate");
  const taskError = document.getElementById("taskError");

  const title = titleInput.value.trim();
  const course = courseSelect.value;
  const dueDate = dueDateInput.value;

  if (title === "") {
    taskError.textContent = "Please enter a task name before adding.";
    titleInput.classList.add("input-error");
    return;
  }

  taskError.textContent = "";
  titleInput.classList.remove("input-error");

  const newTask = {
    id: Date.now(),
    title: title,
    course: course,
    dueDate: dueDate || "No due date",
    completed: false
  };

  academicTasks.push(newTask);
  saveTasksToStorage();
  renderTasks();

  titleInput.value = "";
  dueDateInput.value = "";
}

function toggleTaskStatus(taskId) {
  academicTasks = academicTasks.map(function (task) {
    if (task.id === taskId) {
      return {
        id: task.id,
        title: task.title,
        course: task.course,
        dueDate: task.dueDate,
        completed: !task.completed
      };
    }
    return task;
  });

  saveTasksToStorage();
  renderTasks();
}

function deleteTask(taskId) {
  academicTasks = academicTasks.filter(function (task) {
    return task.id !== taskId;
  });

  saveTasksToStorage();
  renderTasks();
}

function updateTaskStats() {
  const totalEl = document.getElementById("totalTasksCount");
  const pendingEl = document.getElementById("pendingTasksCount");
  const completedEl = document.getElementById("completedTasksCount");

  if (!totalEl || !pendingEl || !completedEl) return;

  const total = academicTasks.length;
  const completed = academicTasks.filter(function (t) {
    return t.completed;
  }).length;
  const pending = total - completed;

  totalEl.textContent = total;
  pendingEl.textContent = pending;
  completedEl.textContent = completed;
}

function renderTasks() {
  const taskListEl = document.getElementById("taskList");
  const emptyMsgEl = document.getElementById("emptyTaskMessage");

  if (!taskListEl) return;

  updateTaskStats();
  taskListEl.innerHTML = "";

  const filteredTasks = academicTasks.filter(function (task) {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "pending") return !task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    emptyMsgEl.style.display = "block";
    return;
  }

  emptyMsgEl.style.display = "none";

  filteredTasks.forEach(function (task) {
    const li = document.createElement("li");
    li.className = task.completed ? "task-item completed" : "task-item";

    const leftDiv = document.createElement("div");
    leftDiv.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark " + task.title + " as completed");
    checkbox.addEventListener("change", function () {
      toggleTaskStatus(task.id);
    });

    const infoDiv = document.createElement("div");
    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title;

    const metaSpan = document.createElement("span");
    metaSpan.className = "task-meta";
    metaSpan.textContent = task.course + " • Due: " + task.dueDate;

    infoDiv.appendChild(titleSpan);
    infoDiv.appendChild(metaSpan);

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(infoDiv);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      deleteTask(task.id);
    });

    li.appendChild(leftDiv);
    li.appendChild(deleteBtn);
    taskListEl.appendChild(li);
  });
}

/* ---------------------------------------------------------
   4. Contact Page JavaScript Form Validation
   --------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    validateContactForm();
  });
}

function validateContactForm() {
  const nameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("emailAddress");
  const phoneInput = document.getElementById("phoneNumber");
  const messageInput = document.getElementById("messageText");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const messageError = document.getElementById("messageError");
  const successBanner = document.getElementById("formSuccessMessage");

  [nameInput, emailInput, phoneInput, messageInput].forEach(function (input) {
    input.classList.remove("input-error");
  });
  [nameError, emailError, phoneError, messageError].forEach(function (err) {
    err.textContent = "";
  });
  successBanner.classList.remove("visible");
  successBanner.textContent = "";

  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const phoneValue = phoneInput.value.trim();
  const messageValue = messageInput.value.trim();

  let isValid = true;

  // 1. Check Name is not empty
  if (nameValue === "") {
    nameError.textContent = "Name is required.";
    nameInput.classList.add("input-error");
    isValid = false;
  }

  // 2. Check Email is not empty and has valid format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailValue === "") {
    emailError.textContent = "Email address is required.";
    emailInput.classList.add("input-error");
    isValid = false;
  } else if (!emailPattern.test(emailValue)) {
    emailError.textContent = "Please enter a valid email address (e.g., name@domain.com).";
    emailInput.classList.add("input-error");
    isValid = false;
  }

  // 3. Check Phone Number is not empty and contains digits only
  const digitsOnlyPattern = /^\d+$/;
  if (phoneValue === "") {
    phoneError.textContent = "Phone number is required.";
    phoneInput.classList.add("input-error");
    isValid = false;
  } else if (!digitsOnlyPattern.test(phoneValue)) {
    phoneError.textContent = "Phone number must contain only digits (0-9).";
    phoneInput.classList.add("input-error");
    isValid = false;
  }

  // 4. Check Message is not empty
  if (messageValue === "") {
    messageError.textContent = "Message cannot be empty.";
    messageInput.classList.add("input-error");
    isValid = false;
  }

  if (isValid) {
    successBanner.textContent =
      "Thank you, " + nameValue + "! Your message has been submitted successfully.";
    successBanner.classList.add("visible");
    document.getElementById("contactForm").reset();
  }
}
