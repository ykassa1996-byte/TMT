const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let nodes = [];
let current = 0;
let errors = 0;
let startTime = null;

// SIMPLE FIXED LAYOUT
const layout = [
  [0.2,0.2],[0.5,0.2],[0.8,0.2],
  [0.2,0.5],[0.5,0.5],[0.8,0.5],
  [0.2,0.8],[0.5,0.8],[0.8,0.8]
];

function generate() {
  nodes = layout.map((p,i)=>({
    x: p[0]*canvas.width,
    y: p[1]*canvas.height,
    label: (i+1).toString(),
    hit:false
  }));
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  nodes.forEach(n=>{
    ctx.beginPath();
    ctx.arc(n.x,n.y,25,0,Math.PI*2);
    ctx.fillStyle = n.hit?"gray":"white";
    ctx.fill();

    ctx.fillStyle="black";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(n.label,n.x,n.y);
  });
}

function handle(e){
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const target = nodes[current];

  nodes.forEach(n=>{
    const d = Math.hypot(n.x-x,n.y-y);

    if(d<25){
      if(!startTime && n===target){
        startTime = performance.now();
      }

      if(n===target){
        n.hit=true;
        current++;

        if(current===nodes.length){
          const time = ((performance.now()-startTime)/1000).toFixed(2);
          alert(`Done: ${time}s | errors: ${errors}`);
        }
      } else {
        errors++;
      }
    }
  });

  draw();
}

canvas.addEventListener("pointerdown", handle);

generate();
draw();