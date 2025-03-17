let stickMen = [];
let cannonBalls = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000;
let runnerSpeed = 5;
let stickManSpawnInterval = 2000;
let lastStickManSpawn = 0;
let hitProbability = 0;
let maxFire = false;
let stickMenDensitySlider, fireRateSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gravity = createVector(0, 0.3, 0);

  stickMenDensitySlider = createSlider(5, 50, 20, 1);
  stickMenDensitySlider.position(20, 20);
  stickMenDensitySlider.style('width', '200px');

  fireRateSlider = createSlider(500, 5000, 2000, 100);
  fireRateSlider.position(20, 50);
  fireRateSlider.style('width', '200px');

  let maxFireButton = createButton("MAX FIRE");
  maxFireButton.position(20, 80);
  maxFireButton.mousePressed(() => spawnInterval = 500);

  let minFireButton = createButton("MIN FIRE");
  minFireButton.position(100, 80);
  minFireButton.mousePressed(() => spawnInterval = 5000);
}

function draw() {
  background(0);
  orbitControl();

  if (millis() - lastStickManSpawn > stickManSpawnInterval) {
    spawnStickMen(stickMenDensitySlider.value());
    lastStickManSpawn = millis();
  }

  push();
  rotateX(PI / 2);
  noStroke();
  fill(100, 200, 100);
  plane(2000, 2000);
  pop();

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

function spawnStickMen(num) {
  for (let i = 0; i < num; i++) {
    let xPos = random(-200, 200);
    stickMen.push(new StickMan(createVector(xPos, 0, 800)));
  }
}

function drawStats() {
  push();
  resetMatrix();
  textSize(16);
  fill(255);
  text(`Hit Probability: ${(hitProbability * 100).toFixed(2)}%`, 20, 35);
  pop();
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
    translate(this.pos.x, this.pos.y - 10, this.pos.z);
    stroke(255);
    strokeWeight(2);
    fill(255);
    ellipse(0, -30, 20, 20);
    line(0, -20, 0, 20);
    line(0, 0, -15, 10);
    line(0, 0, 15, 10);
    line(0, 20, -10, 40);
    line(0, 20, 10, 40);
    pop();
  }
}

class CannonBall {
  constructor(pos, velocity) {
    this.pos = pos.copy();
    this.vel = velocity.copy();
    this.r = 10;
    this.trajectory = [];
  }
  update() {
    this.trajectory.push(this.pos.copy());
    if (this.trajectory.length > 50) this.trajectory.shift();
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }
  display() {
    push();
    noFill();
    stroke(255, 255, 0);
    strokeWeight(2);
    beginShape();
    for (let pos of this.trajectory) vertex(pos.x, pos.y, pos.z);
    endShape();
    pop();

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
  let target = createVector(random(-200, 200), 0, 800);
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);
  let cannonPositions = [];

  for (let i = -500; i <= 500; i += 100) {
    cannonPositions.push(createVector(i, 0, 600));
  }

  for (let cannonPos of cannonPositions) {
    let diff = p5.Vector.sub(target, cannonPos);
    diff.sub(gTerm);
    let velocity = diff.div(t);
    cannonBalls.push(new CannonBall(cannonPos, velocity));
  }
}

function drawCannons() {
  let cannonPositions = [];
  for (let i = -500; i <= 500; i += 100) {
    cannonPositions.push(createVector(i, 0, 600));
  }
  for (let pos of cannonPositions) {
    push();
    translate(pos.x, pos.y, pos.z);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}
