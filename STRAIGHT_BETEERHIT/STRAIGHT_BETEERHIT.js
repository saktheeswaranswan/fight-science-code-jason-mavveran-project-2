let stickMen = [];
let cannonBalls = [];
let cannons = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000;
let runnerSpeed = 5;
let stickManSpawnInterval = 1000;
let lastStickManSpawn = 0;
let hitProbability = 0;
let stickManDensity;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gravity = createVector(0, 0.3, 0);

  // Slider for soldier density
  stickManDensity = createSlider(1, 50, 10, 1);
  stickManDensity.position(20, 20);
  stickManDensity.style('width', '200px');

  createCannons();
}

function draw() {
  background(0);
  orbitControl();

  // Plane
  push();
  rotateX(PI / 2);
  noStroke();
  fill(100, 200, 100);
  plane(2000, 2000);
  pop();

  if (millis() - lastStickManSpawn > stickManSpawnInterval) {
    spawnStickMen();
    lastStickManSpawn = millis();
  }

  if (millis() - lastCannonSpawn > spawnInterval) {
    fireCannons();
    lastCannonSpawn = millis();
  }

  for (let i = stickMen.length - 1; i >= 0; i--) {
    stickMen[i].update();
    if (!stickMen[i].hit) {
      stickMen[i].display();
    } else {
      push();
      translate(stickMen[i].pos.x, stickMen[i].pos.y, stickMen[i].pos.z);
      textSize(32);
      text("💥", 0, 0);
      pop();
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

function spawnStickMen() {
  let num = stickManDensity.value();
  for (let i = 0; i < num; i++) {
    let xPos = random(-200, 200);
    stickMen.push(new StickMan(createVector(xPos, 0, 800)));
  }
}

function createCannons() {
  for (let i = 0; i < 10; i++) {
    cannons.push(createVector(-width / 2 + 100 * i, 0, 600));
    cannons.push(createVector(width / 2 - 100 * i, 0, 600));
  }
}

function fireCannons() {
  let target = createVector(random(-200, 200), 0, 800);
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);
  
  for (let cannon of cannons) {
    let diff = p5.Vector.sub(target, cannon);
    diff.sub(gTerm);
    let velocity = diff.div(t);
    cannonBalls.push(new CannonBall(cannon, velocity));
  }
}

function drawStats() {
  push();
  resetMatrix();
  textSize(16);
  fill(255);
  text(`Hit Probability: ${(hitProbability * 100).toFixed(2)}%`, 20, 50);
  text(`Soldiers: ${stickMen.length}`, 20, 70);
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
    this.trajectory = [];
  }

  update() {
    this.trajectory.push(this.pos.copy());
    if (this.trajectory.length > 50) {
      this.trajectory.shift();
    }
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }

  display() {
    push();
    stroke(255, 255, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let pos of this.trajectory) {
      vertex(pos.x, pos.y, pos.z);
    }
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

function drawCannons() {
  for (let cannon of cannons) {
    push();
    translate(cannon.x, cannon.y, cannon.z);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}
