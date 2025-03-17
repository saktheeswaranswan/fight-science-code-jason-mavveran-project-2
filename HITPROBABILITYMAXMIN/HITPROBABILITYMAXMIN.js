let stickMen = [];
let cannonBalls = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000;
let runnerSpeed = 10;
let stickManSpawnInterval = 1000;
let lastStickManSpawn = 0;
let hitProbability = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gravity = createVector(0, 0.3, 0);
}

function draw() {
  background(0);
  orbitControl();

  if (millis() - lastStickManSpawn > stickManSpawnInterval) {
    spawnStickMan();
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
        stickMen[j].fallApart();
        cannonBalls.splice(i, 1);
        break;
      }
    }
  }

  drawCannons();
  drawStats();
}

function spawnStickMan() {
  let xPos = random(-200, 200);
  let speed = random(5, 12);
  stickMen.push(new StickMan(createVector(xPos, 0, 800), speed));
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
  constructor(pos, speed) {
    this.pos = pos.copy();
    this.speed = speed;
    this.hit = false;
  }

  update() {
    this.pos.z -= this.speed;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y - 20, this.pos.z);
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

  fallApart() {
    this.hit = true;
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
    if (this.pos.y > 0) this.vel.y *= -0.6;
  }

  display() {
    push();
    stroke(255, 0, 0);
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

function spawnCannonBalls() {
  let target = createVector(random(-200, 200), 0, 800);
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);

  let cannonPositions = [
    createVector(-width / 2 + 50, 0, 600),
    createVector(width / 2 - 50, 0, 600)
  ];

  for (let cannonPos of cannonPositions) {
    let diff = p5.Vector.sub(target, cannonPos);
    diff.sub(gTerm);
    let velocity = diff.div(t);
    cannonBalls.push(new CannonBall(cannonPos, velocity));
  }
}

function drawCannons() {
  let cannonPositions = [
    createVector(-width / 2 + 50, 0, 600),
    createVector(width / 2 - 50, 0, 600)
  ];

  for (let pos of cannonPositions) {
    push();
    translate(pos.x, pos.y, pos.z);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}
