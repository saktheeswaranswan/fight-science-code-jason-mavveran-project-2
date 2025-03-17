let stickMen = [];
let cannonBalls = [];
let bombs = [];
let gravity;
let lastCannonSpawn = 0;
let lastBombDrop = 0;
let spawnInterval = 2000;
let bombDropInterval = 3000;
let runnerSpeed = 10;
let stickManSpawnInterval = 2000;
let lastStickManSpawn = 0;
let cannonCount = 5;

let targetStickMan = null;  // the special red stick man that the airplane chases
let airplane;               // our plane object

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gravity = createVector(0, 0.3, 0);
  airplane = new Plane();
}

function draw() {
  background(0);
  orbitControl();
  
  if (millis() - lastStickManSpawn > stickManSpawnInterval) {
    spawnStickMan();
    lastStickManSpawn = millis();
  }

  drawGround();
  
  if (millis() - lastCannonSpawn > spawnInterval) {
    spawnCannonBalls();
    lastCannonSpawn = millis();
  }
  
  if (millis() - lastBombDrop > bombDropInterval) {
    dropBomb();
    lastBombDrop = millis();
  }

  updateStickMen();
  updateCannonBalls();
  updateBombs();
  
  drawCannons();
  
  // Update and display the airplane
  airplane.update();
  airplane.display();
}

// Draw a simple ground plane.
function drawGround() {
  push();
  rotateX(PI / 2);
  noStroke();
  fill(100, 200, 100);
  // p5's built-in plane function (do not confuse with our airplane object)
  plane(2000, 2000);
  pop();
}

// Spawn a stick man within the horizontal bounds of the cannons.
function spawnStickMan() {
  let leftBound = -width / 2 + 50;
  let rightBound = -50;
  let xPos = random(leftBound, rightBound);
  let newStickMan = new StickMan(createVector(xPos, 0, 800));
  // if there isn’t a target yet, assign this one as the target (red)
  if (!targetStickMan) {
    targetStickMan = newStickMan;
    newStickMan.isTarget = true;
  }
  stickMen.push(newStickMan);
}

// Update each stick man and choose a new target if needed.
function updateStickMen() {
  for (let i = stickMen.length - 1; i >= 0; i--) {
    stickMen[i].update();
    if (stickMen[i].hit) {
      if (stickMen[i] === targetStickMan) {
        targetStickMan = null;
      }
      stickMen.splice(i, 1);
    } else {
      stickMen[i].display();
    }
  }
  if (!targetStickMan && stickMen.length > 0) {
    let idx = floor(random(stickMen.length));
    targetStickMan = stickMen[idx];
    targetStickMan.isTarget = true;
  }
}

class StickMan {
  constructor(pos) {
    this.pos = pos.copy();
    this.hit = false;
    this.isTarget = false;
  }
  update() {
    this.pos.z -= runnerSpeed;
  }
  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    stroke(0);
    strokeWeight(2);
    fill(this.isTarget ? color(255, 0, 0) : 255);
    ellipse(0, -30, 20, 20);
    line(0, -20, 0, 20);
    line(0, 0, -15, 10);
    line(0, 0, 15, 10);
    line(0, 20, -10, 40);
    line(0, 20, 10, 40);
    pop();
  }
}

class Projectile {
  constructor(pos, velocity, col) {
    this.pos = pos.copy();
    this.vel = velocity.copy();
    this.r = 10;
    this.col = col;
  }
  update() {
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }
  display() {
    push();
    stroke(this.col);
    strokeWeight(2);
    // draw a trailing line scaled by the velocity
    line(this.pos.x, this.pos.y, this.pos.z, 
         this.pos.x - this.vel.x * 5, this.pos.y - this.vel.y * 5, this.pos.z - this.vel.z * 5);
    pop();
    
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    fill(this.col);
    noStroke();
    sphere(this.r);
    pop();
  }
}

// Cannon balls spawn from a row of cannons aimed at a random target on the far side.
function spawnCannonBalls() {
  let target = createVector(random(-200, 200), 0, 800);
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);

  for (let i = 0; i < cannonCount; i++) {
    let x = lerp(-width / 2 + 50, -50, i / (cannonCount - 1));
    let cannonPos = createVector(x, 0, 600);
    let diff = p5.Vector.sub(target, cannonPos).sub(gTerm);
    let velocity = diff.div(t);
    cannonBalls.push(new Projectile(cannonPos, velocity, 'yellow'));
  }
}

function updateCannonBalls() {
  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
  }
}

// The airplane drops bombs from its current position.
function dropBomb() {
  let bombPos = airplane.pos.copy();
  if (targetStickMan) {
    let target = targetStickMan.pos.copy();
    let t = random(30, 60);
    let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);
    let diff = p5.Vector.sub(target, bombPos).sub(gTerm);
    let velocity = diff.div(t);
    bombs.push(new Projectile(bombPos, velocity, 'blue'));
  } else {
    let velocity = createVector(random(-1, 1), random(2, 4), -5);
    bombs.push(new Projectile(bombPos, velocity, 'blue'));
  }
}

function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    bombs[i].update();
    bombs[i].display();
    if (bombs[i].pos.y >= 0) {
      explode(bombs[i].pos);
      bombs.splice(i, 1);
    }
  }
}

// Remove any stick man within the explosion radius.
function explode(position) {
  for (let i = stickMen.length - 1; i >= 0; i--) {
    if (p5.Vector.dist(stickMen[i].pos, position) < 50) {
      if (stickMen[i] === targetStickMan) {
        targetStickMan = null;
      }
      stickMen.splice(i, 1);
    }
  }
}

function drawCannons() {
  for (let i = 0; i < cannonCount; i++) {
    let x = lerp(-width / 2 + 50, -50, i / (cannonCount - 1));
    push();
    translate(x, 0, 600);
    fill(100);
    box(20, 20, 40);
    pop();
  }
}

// New Plane class that chases stick men.
class Plane {
  constructor() {
    this.pos = createVector(0, -300, 600); // starting (home) position
    this.speed = 5;
  }
  update() {
    // if no target but stick men exist, choose one randomly
    if (!targetStickMan && stickMen.length > 0) {
      let idx = floor(random(stickMen.length));
      targetStickMan = stickMen[idx];
      targetStickMan.isTarget = true;
    }
    // Chase the target stick man if available
    if (targetStickMan) {
      // The desired position is offset from the stick man (above and ahead)
      let desired = createVector(targetStickMan.pos.x, -300, targetStickMan.pos.z - 200);
      let diff = p5.Vector.sub(desired, this.pos);
      diff.limit(this.speed);
      this.pos.add(diff);
    } else {
      // Return home if no target stick man exists
      let home = createVector(0, -300, 600);
      let diff = p5.Vector.sub(home, this.pos);
      diff.limit(this.speed);
      this.pos.add(diff);
    }
  }
  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    fill(150, 0, 0);
    box(100, 20, 40);
    pop();
  }
}
