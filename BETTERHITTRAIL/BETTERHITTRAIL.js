let stickMen = [];
let cannonBalls = [];
let cannons = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000;
let runnerSpeed = 10;
let stickManSpawnInterval = 2000;
let lastStickManSpawn = 0;
let hitProbability = 0;
let soldierDensitySlider, fireRateSlider;
let maxFireButton, minFireButton;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gravity = createVector(0, 0.3, 0);

  soldierDensitySlider = createSlider(1, 50, 10, 1);
  soldierDensitySlider.position(20, 20);
  
  fireRateSlider = createSlider(500, 5000, 2000, 50);
  fireRateSlider.position(20, 50);
  
  maxFireButton = createButton("MAX FIRE");
  maxFireButton.position(20, 80);
  maxFireButton.mousePressed(() => spawnInterval = 500);
  
  minFireButton = createButton("MIN FIRE");
  minFireButton.position(100, 80);
  minFireButton.mousePressed(() => spawnInterval = 5000);

  setupCannons();
}

function setupCannons() {
  let spacing = 200;
  for (let i = 0; i < 10; i++) {
    let xOffset = i % 2 === 0 ? -width / 3 : width / 3;
    let zOffset = 600 + i * spacing;
    cannons.push(createVector(xOffset, 0, zOffset));
  }
}

function draw() {
  background(0);
  orbitControl();

  let density = soldierDensitySlider.value();
  spawnInterval = fireRateSlider.value();
  
  if (millis() - lastStickManSpawn > stickManSpawnInterval) {
    for (let i = 0; i < density; i++) {
      spawnStickMan();
    }
    lastStickManSpawn = millis();
  }

  drawGround();

  if (millis() - lastCannonSpawn > spawnInterval) {
    spawnCannonBalls();
    lastCannonSpawn = millis();
  }

  for (let i = stickMen.length - 1; i >= 0; i--) {
    stickMen[i].update();
    if (!stickMen[i].hit) {
      stickMen[i].display();
    } else {
      stickMen.splice(i, 1);
    }
  }

  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
    for (let j = stickMen.length - 1; j >= 0; j--) {
      if (cannonBalls[i].hits(stickMen[j])) {
        stickMen[j].hit = true;
        cannonBalls.splice(i, 1);
        break;
      }
    }
  }

  drawCannons();
  drawStats();
}

function drawGround() {
  push();
  rotateX(PI / 2);
  noStroke();
  fill(100, 200, 100);
  plane(2000, 2000);
  pop();
}

function spawnStickMan() {
  let xPos = random(-100, 100);
  stickMen.push(new StickMan(createVector(xPos, 10, 800)));
}

class StickMan {
  constructor(pos) {
    this.pos = pos.copy();
    this.hit = false;
  }

  update() {
    this.pos.z -= runnerSpeed;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    stroke(0);
    strokeWeight(2);
    fill(255);
    ellipse(0, -30, 20, 20);
    line(0, -20, 0, 20);
    line(0, 0, -15, 10);
    line(0, 0, 15, 10);
    let legSwing = sin(frameCount * 0.3) * 10;
    line(0, 20, -10, 40 + legSwing);
    line(0, 20, 10, 40 - legSwing);
    pop();
  }
}

class CannonBall {
  constructor(pos, velocity) {
    this.pos = pos.copy();
    this.vel = velocity.copy();
    this.r = 10;
  }

  update() {
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    fill(50);
    noStroke();
    sphere(this.r);
    pop();
  }

  hits(stickMan) {
    let d = dist(this.pos.x, this.pos.y, this.pos.z, stickMan.pos.x, stickMan.pos.y, stickMan.pos.z);
    return d < this.r + 10;
  }
}

function spawnCannonBalls() {
  let target = createVector(random(-100, 100), 10, 800);
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);

  for (let cannonPos of cannons) {
    let diff = p5.Vector.sub(target, cannonPos);
    diff.sub(gTerm);
    let velocity = diff.div(t);
    cannonBalls.push(new CannonBall(cannonPos, velocity));
  }
}

function drawCannons() {
  for (let pos of cannons) {
    push();
    translate(pos.x, pos.y, pos.z);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}

function drawStats() {
  push();
  resetMatrix();
  textSize(16);
  fill(255);
  text(`Hit Probability: ${(hitProbability * 100).toFixed(2)}%`, 20, 35);
  text(`Soldiers Running: ${stickMen.length}`, 20, 55);
  pop();
}
