let stickMen = [];
let cannonBalls = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000;

// Sliders
let runnerSpeedSlider, cannonFireSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  runnerSpeedSlider = createSlider(1, 20, 10, 1);
  runnerSpeedSlider.position(20, 20);
  runnerSpeedSlider.style('width', '200px');

  cannonFireSlider = createSlider(200, 5000, 2000, 50);
  cannonFireSlider.position(20, 50);
  cannonFireSlider.style('width', '200px');

  gravity = createVector(0, 0.3, 0);

  for (let i = 0; i < 5; i++) {
    stickMen.push(createVector(random(-100, 100), 0, 800 + i * 200));
  }
}

function draw() {
  background(0);
  orbitControl();

  let runnerSpeed = runnerSpeedSlider.value();
  spawnInterval = cannonFireSlider.value();

  push();
  resetMatrix();
  textSize(16);
  fill(255);
  text("Runner Speed: " + runnerSpeed, 230, 35);
  text("Cannon Fire Interval (ms): " + spawnInterval, 230, 65);
  pop();

  push();
  rotateX(PI / 2);
  noStroke();
  fill(100, 200, 100);
  plane(2000, 2000);
  pop();

  for (let stickManPos of stickMen) {
    stickManPos.z -= runnerSpeed;
    if (stickManPos.z < -200) {
      stickManPos.z = 800;
    }
    push();
    translate(stickManPos.x, stickManPos.y, stickManPos.z);
    drawStickMan();
    pop();
  }

  if (millis() - lastCannonSpawn > spawnInterval) {
    spawnCannonBalls();
    lastCannonSpawn = millis();
  }

  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
    if (
      cannonBalls[i].pos.y > height ||
      abs(cannonBalls[i].pos.x) > width * 2 ||
      abs(cannonBalls[i].pos.z) > 2000
    ) {
      cannonBalls.splice(i, 1);
    }
  }

  drawCannons();
}

function drawStickMan() {
  push();
  fill(150);
  noStroke();
  box(40, 10, 10);
  pop();

  stroke(0);
  strokeWeight(2);
  push();
  fill(255);
  ellipse(0, -30, 20, 20);
  pop();
  line(0, -20, 0, 20);
  line(0, 0, -15, 10);
  line(0, 0, 15, 10);

  let legSwing = sin(frameCount * 0.3) * 10;
  line(0, 20, -10, 40 + legSwing);
  line(0, 20, 10, 40 - legSwing);
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
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
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
}

function spawnCannonBalls() {
  let cannonPositions = [
    createVector(-width / 3, 0, 500),
    createVector(width / 3, 0, 500)
  ];

  for (let stickManPos of stickMen) {
    let target = stickManPos.copy();
    let t = random(30, 60);
    let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);

    for (let cannonPos of cannonPositions) {
      let diff = p5.Vector.sub(target, cannonPos);
      diff.sub(gTerm);
      let velocity = diff.div(t);
      cannonBalls.push(new CannonBall(cannonPos, velocity));
    }
  }
}

function drawCannons() {
  let cannonPositions = [
    createVector(-width / 3, 0, 500),
    createVector(width / 3, 0, 500)
  ];

  for (let pos of cannonPositions) {
    push();
    translate(pos.x, pos.y, pos.z);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}
