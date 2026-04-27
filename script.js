const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const ui = document.getElementById("ui");
const startBtn = document.getElementById("startBtn");
const pidInput = document.getElementById("pid");

let nodes = [];
let path = [];
let current = 0;
let errors = 0;
let startTime = null;
let mode = "A";
let results = { A: null, B: null };

// 25-point grid layout
const layout = [
  [0.1,0.1],[0.3,0.1],[0.5,0.1],[0.7,0.1],[0.9,0.1],
  [0.1,0.3],[0.3,0.3],[0.5,0.3],[0.7,0.3],[0.9,0.3],
  [0.1,0.5],[0.3,0.5],[0.5,0.5],[0.7,0.5],[0.9,0.5],
  [0.1,0.7],[0.3,0.7],[0.5,0.7],[0.7,0.7],[0.9,0.7],
  [0.1,0.9],[0.3,0.9],[0.5,0.9],[0.7,0.9],[0.9,0.9]
];

function generateLabels(testMode) {
  if (testMode === "A") {
    // Part A: Numbers 1 to 25
    return Array.from({length: 25}, (_, i) => (i + 1).toString());
  } else {
    // Part B: Alternating 1-A-2-B... until 13
    const labels = [];
    const letters = "ABCDEFGHIJKL".split(""); // A through L (12 letters)
    for (let i = 0; i < 13; i++) {
      labels.push((i + 1).toString());
      if (letters[i]) labels.push(letters[i]);
    }
    return labels; // Total 25 items: 13 numbers + 12 letters
  }
}

function generate() {
  const labels = generateLabels(mode);
  const shuffledLayout = [...layout].sort(() => Math.random() - 0.5);
  nodes = labels.map((label, i) => ({
    x: shuffledLayout[i][0] * canvas.width,
    y: shuffledLayout[i][1] * canvas.height,
    label: label,
    hit: false,
    flash: false
  }));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Path Lines
  if (path.length > 1) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "yellow";
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
  }

  // Draw Nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 25, 0, Math.PI * 2);
    
    if (n.flash) ctx.fillStyle = "red";
    else ctx.fillStyle = n.hit ? "#444" : "white";
    
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.fillStyle = (n.hit || n.flash) ? "white" : "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 20px Arial";
    ctx.fillText(n.label, n.x, n.y);
  });
}

function triggerFlash(node) {
  node.flash = true;
  draw();
  setTimeout(() => {
    node.flash = false;
    draw();
  }, 300);
}

startBtn.addEventListener("click", () => {
  if (pidInput.value.trim() === "") return alert("Enter Participant ID");
  startTest("A");
});

function startTest(selectedMode) {
  mode = selectedMode;
  current = 0;
  errors = 0;
  path = [];
  startTime = null;
  ui.style.display = "none";
  canvas.style.display = "block";
  resize();
  generate();
  draw();
}

function handle(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
  const target = nodes[current];

  let clickedAnyNode = false;
  for (let n of nodes) {
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < 25) {
      clickedAnyNode = true;
      if (n === target) {
        if (!startTime) startTime = performance.now();
        n.hit = true;
        path.push({x: n.x, y: n.y});
        current++;
        if (current === nodes.length) finishPart();
      } else if (!n.hit) {
        errors++;
        triggerFlash(n);
      }
      break;
    }
  }
  draw();
}

function finishPart() {
  const time = ((performance.now() - startTime) / 1000).toFixed(2);
  results[mode] = { time, errors };

  if (mode === "A") {
    alert(`Part A Complete!\nTime: ${time}s\nErrors: ${errors}\n\nClick OK to begin Part B (Alternating).`);
    startTest("B");
  } else {
    showFinalResults();
  }
}

function showFinalResults() {
  canvas.style.display = "none";
  ui.style.display = "block";
  ui.innerHTML = `
    <h2>Test Results</h2>
    <p><b>Participant ID:</b> ${pidInput.value}</p>
    <div style="text-align:left; display:inline-block; margin-bottom:20px;">
      <p><b>Part A (1-25):</b> ${results.A.time}s | Errors: ${results.A.errors}</p>
      <p><b>Part B (1-A-2-B...):</b> ${results.B.time}s | Errors: ${results.B.errors}</p>
    </div><br>
    <button onclick="location.reload()">Restart New Session</button>
  `;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  if (canvas.style.display === "block") { resize(); draw(); }
});

canvas.addEventListener("mousedown", handle);
canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handle(e); }, {passive: false});

window.startInstructions = () => {
  const pidInput = document.getElementById("pid");
  const ui = document.getElementById("ui");
  const canvas = document.getElementById("canvas");

  if (pidInput.value.trim() === "") {
    alert("Please enter a Participant ID");
    return;
  }
  
  ui.style.display = "none";
  canvas.style.display = "block";
  
  // Call your existing start logic
  startTest("A"); 
};