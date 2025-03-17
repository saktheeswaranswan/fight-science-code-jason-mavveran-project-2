let stickMen = [];
let cannonBalls = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000;
let runnerSpeed = 10;
let stickManSpawnInterval = 2000;
let lastStickManSpawn = 0;
let hitProbability = 0;

let stickManHeightSlider, cannonHeightSlider;
let cannonCountSlider, stickManDensitySlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gravity = createVector(0, 0.3, 0);

  // Slider for stickman height (vertical offset, plane is at y = 0)
  stickManHeightSlider = createSlider(-200, 200, 0, 1);
  stickManHeightSlider.position(20, 20);
  stickManHeightSlider.style('width', '200px');

  // Slider for cannon height
  cannonHeightSlider = createSlider(-200, 200, 0, 1);
  cannonHeightSlider.position(20, 50);
  cannonHeightSlider.style('width', '200px');

  // Slider for number of cannons
  cannonCountSlider = createSlider(2, 20, 2, 1);
  cannonCountSlider.position(20, 80);
  cannonCountSlider.style('width', '200px');

  // Slider for stickman density (how many spawn each interval)
  stickManDensitySlider = createSlider(1, 50, 10, 1);
  stickManDensitySlider.position(20, 110);
  stickManDensitySlider.style('width', '200px');
}

function draw() {
  background(0);
  orbitControl();

  let stickManHeight = stickManHeightSlider.value();
  let cannonHeight = cannonHeightSlider.value();
  let cannonCount = cannonCountSlider.value();
  let density = stickManDensitySlider.value();

  // Spawn stickmen based on density slider
  if (millis() - lastStickManSpawn > stickManSpawnInterval) {
    for (let i = 0; i < density; i++) {
      spawnStickMan(stickManHeight);
    }
    lastStickManSpawn = millis();
  }

  // Draw ground (plane at y = 0)
  push();
  rotateX(PI / 2);
  noStroke();
  fill(100, 200, 100);
  plane(2000, 2000);
  pop();

  // Spawn cannonballs from all cannons
  if (millis() - lastCannonSpawn > spawnInterval) {
    spawnCannonBalls(cannonHeight, cannonCount);
    lastCannonSpawn = millis();
  }

  // Update & display stickmen
  for (let i = stickMen.length - 1; i >= 0; i--) {
    stickMen[i].update();
    if (!stickMen[i].hit) {
      stickMen[i].display();
    } else {
      // Optionally, show explosion here before removal
      stickMen.splice(i, 1);
    }
  }

  // Update & display cannonballs
  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
    for (let j = stickMen.length - 1; j >= 0; j--) {
      if (cannonBalls[i].hits(stickMen[j])) {
        stickMen[j].hit = true;
        hitProbability = (hitProbability * (stickMen.length - 1) + 1) / stickMen.length;
        cannonBalls.splice(i, 1);
        break;
      }
    }
  }

  // Draw cannons with current cannon count and height
  drawCannons(cannonHeight, cannonCount);
  drawStats(cannonCount, density);
}

function spawnStickMan(height) {
  let xPos = random(-200, 200);
  stickMen.push(new StickMan(createVector(xPos, height, 800)));
}

function drawStats(cannonCount, density) {
  push();
  resetMatrix();
  textSize(16);
  fill(255);
  text(`Hit Probability: ${(hitProbability * 100).toFixed(2)}%`, 20, 140);
  text(`Cannon Count: ${cannonCount}`, 20, 160);
  text(`Stickman Density: ${density}`, 20, 180);
  text(`Running Stickmen: ${stickMen.length}`, 20, 200);
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
  }
  update() {
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }
  display() {
    push();
    stroke(255, 255, 0);
    strokeWeight(2);
    line(this.pos.x, this.pos.y, this.pos.z, this.pos.x - this.vel.x * 10, this.pos.y - this.vel.y * 10, this.pos.z - this.vel.z * 10);
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

function spawnCannonBalls(height, cannonCount) {
  let target = createVector(random(-200, 200), height, 800);
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);

  let cannonPositions = [];
  // Divide cannonCount into left and right groups.
  let leftCount = floor(cannonCount / 2);
  let rightCount = cannonCount - leftCount;
  // Left cannons: x from -width/2+50 to -50
  for (let i = 0; i < leftCount; i++) {
    let x = lerp(-width / 2 + 50, -50, leftCount > 1 ? i / (leftCount - 1) : 0.5);
    cannonPositions.push(createVector(x, height, 600));
  }
  // Right cannons: x from 50 to width/2-50
  for (let i = 0; i < rightCount; i++) {
    let x = lerp(50, width / 2 - 50, rightCount > 1 ? i / (rightCount - 1) : 0.5);
    cannonPositions.push(createVector(x, height, 600));
  }

  for (let cannonPos of cannonPositions) {
    let diff = p5.Vector.sub(target, cannonPos);
    diff.sub(gTerm);
    let velocity = diff.div(t);
    cannonBalls.push(new CannonBall(cannonPos, velocity));
  }
}

function drawCannons(height, cannonCount) {
  let cannonPositions = [];
  let leftCount = floor(cannonCount / 2);
  let rightCount = cannonCount - leftCount;
  for (let i = 0; i < leftCount; i++) {
    let x = lerp(-width / 2 + 50, -50, leftCount > 1 ? i / (leftCount - 1) : 0.5);
    cannonPositions.push(createVector(x, height, 600));
  }
  for (let i = 0; i < rightCount; i++) {
    let x = lerp(50, width / 2 - 50, rightCount > 1 ? i / (rightCount - 1) : 0.5);
    cannonPositions.push(createVector(x, height, 600));
  }

  for (let pos of cannonPositions) {
    push();
    translate(pos.x, pos.y, pos.z);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}
