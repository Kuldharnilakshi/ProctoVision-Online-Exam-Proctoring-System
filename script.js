/* ---------------- QUESTIONS ---------------- */
const questions = [
  {
    q: "What is the main function of a router?",
    options: ["Forward data packets", "Store data", "Process signals", "Encrypt messages"],
    answer: 0
  },
  {
    q: "Which protocol is used to send emails?",
    options: ["FTP", "SMTP", "HTTP", "TCP"],
    answer: 1
  },
  {
    q: "Which layer does IP belong to?",
    options: ["Application", "Transport", "Network", "Data Link"],
    answer: 2
  },
  {
    q: "What does DNS do?",
    options: ["Encrypt data", "Resolve domain names", "Route packets", "Control congestion"],
    answer: 1
  },
  {
    q: "Which device works at Layer 2?",
    options: ["Router", "Hub", "Switch", "Gateway"],
    answer: 2
  },
  {
    q: "Which protocol is connectionless?",
    options: ["TCP", "HTTP", "UDP", "FTP"],
    answer: 2
  },
  {
    q: "What is the default port number for HTTP?",
    options: ["21", "25", "80", "443"],
    answer: 2
  },
  {
    q: "Which protocol is used to automatically assign IP addresses?",
    options: ["DNS", "DHCP", "ARP", "ICMP"],
    answer: 1
  }
];

let currentQuestion = 0;
let userAnswers = new Array(questions.length).fill(null);

/* ---------------- PROCTORING ---------------- */
const video = document.getElementById("video");
const statusBox = document.getElementById("statusBox");
const violationCountEl = document.getElementById("violationCount");

let violations = 0;
let lastViolationTime = 0;
let examFlagged = false;

/* Start webcam */
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(() => {
    statusBox.innerText = "❌ Camera access denied";
    statusBox.className = "status violation";
  });

/* Detect tab switch / minimize */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) addViolation("Tab switched");
});

/* Add violation */
function addViolation(reason) {
  const now = Date.now();
  if (now - lastViolationTime < 3000) return;

  lastViolationTime = now;
  violations++;
  violationCountEl.innerText = violations;

  statusBox.className = "status warning";
  statusBox.innerText = "🟡 Violation detected";

  if (violations >= 3) {
    examFlagged = true;
    statusBox.className = "status violation";
    statusBox.innerText = "🚫 Exam Flagged Due to Violations";
  }
}

/* ---------------- RANDOM FAKE WARNING ---------------- */
let fakeWarningTriggered = false;
function maybeTriggerFakeWarning() {
  if (fakeWarningTriggered || examFlagged) return;

  const randomQuestion = Math.floor(Math.random() * questions.length);
  if (currentQuestion === randomQuestion) {
    statusBox.className = "status warning";
    statusBox.innerText = "🟡 Warning: Face not found, do not leave screen";

    violations++;
    violationCountEl.innerText = violations;

    setTimeout(() => {
      if (!examFlagged) {
        statusBox.className = "status normal";
        statusBox.innerText = "🟢 Status: Normal";
      }
    }, 2000);

    fakeWarningTriggered = true;
  }
}

/* ---------------- LOAD QUESTION ---------------- */
function loadQuestion() {
  const q = questions[currentQuestion];
  const container = document.getElementById("questionContainer");

  container.innerHTML = `
    <div class="question-box">
      <p><strong>Q${currentQuestion + 1}.</strong> ${q.q}</p>
      ${q.options.map((opt, i) => `
        <label>
          <input type="radio" name="answer" value="${i}"
            ${userAnswers[currentQuestion] === i ? "checked" : ""}>
          ${opt}
        </label>
      `).join("")}
    </div>
  `;

  document.getElementById("prevBtn").disabled = currentQuestion === 0;
  document.getElementById("nextBtn").style.display =
    currentQuestion === questions.length - 1 ? "none" : "inline-block";
  document.getElementById("submitBtn").style.display =
    currentQuestion === questions.length - 1 ? "inline-block" : "none";

  maybeTriggerFakeWarning();
}

/* ---------------- NAVIGATION ---------------- */
document.addEventListener("change", e => {
  if (e.target.name === "answer") {
    userAnswers[currentQuestion] = parseInt(e.target.value);
  }
});

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

/* ---------------- SUBMIT & REPORT ---------------- */
function submitExam() {
  let score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) score++;
  });

  document.getElementById("scoreText").innerText =
    `Score: ${score} / ${questions.length}`;
  document.getElementById("violationText").innerText =
    `Violations: ${violations}`;

  let statusText = "";
  if (examFlagged) {
    statusText = "Status: ❌ Exam Flagged";
  } else if (score < 5) {
    statusText = "Status: ❌ Exam Not Clear";
  } else {
    statusText = "Status: ✅ Exam Cleared";
  }

  document.getElementById("finalStatus").innerText = statusText;
  document.getElementById("resultModal").style.display = "block";
}

function closeReport() {
  document.getElementById("resultModal").style.display = "none";
}

/* ---------------- INIT ---------------- */
loadQuestion();
