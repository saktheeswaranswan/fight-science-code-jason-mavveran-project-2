let video;
let stickManPos;
let stickManVel;
let cannonBalls = [];
let leftCannons = [];
let rightCannons = [];
let gravity;
const flightTime = 40; // flight time (in frames) for cannonballs

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Set up a full-canvas live webcam capture for the background
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();
  
  // The stick man starts far down the corridor and runs very fast in the center
  stickManPos = createVector(0, 0, 800);
  stickManVel = createVector(0, 0, -10);
  
  // Gravity for projectile motion (y increases downward)
  gravity = createVector(0, 0.3, 0);
  
  // Create two arrays of cannons on opposite sides
  let numCannons = 5;
  let startZ = 200;
  let spacing = 150;
  for (let i = 0; i < numCannons; i++) {
    // Left cannons positioned at x = -300
    let posLeft = createVector(-300, 0, startZ + i * spacing);
    leftCannons.push(new Cannon(posLeft, "left", i));
    // Right cannons positioned at x = 300
    let posRight = createVector(300, 0, startZ + i * spacing);
    rightCannons.push(new Cannon(posRight, "right", i));
  }
}

function draw() {
  background(0);
  orbitControl();
  
  // --- Draw the full-canvas live webcam background ---
  push();
    resetMatrix(); // Reset to 2D for drawing the video
    image(video, 0, 0, width, height);
  pop();
  
  // --- Draw the 3D scene ---
  // Ground plane
  push();
    rotateX(PI / 2);
    noStroke();
    fill(100, 200, 100);
    plane(2000, 2000);
  pop();
  
  // Update the stick man's position (running fast down the corridor)
  stickManPos.add(stickManVel);
  
  // Draw the stick man in the center
  push();
    translate(stickManPos.x, stickManPos.y, stickManPos.z);
    drawStickMan();
  pop();
  
  // Update and display cannons; they fire at their corresponding opposite cannon
  for (let cannon of leftCannons) {
    cannon.update();
    cannon.display();
  }
  for (let cannon of rightCannons) {
    cannon.update();
    cannon.display();
  }
  
  // Update and display all cannon balls
  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
    // Remove projectile if it goes offscreen or too far
    if (
      cannonBalls[i].pos.y > height ||
      abs(cannonBalls[i].pos.x) > width * 2 ||
      abs(cannonBalls[i].pos.z) > 2000
    ) {
      cannonBalls.splice(i, 1);
    }
  }
}

// Draw the stick man riding his platform with a simple running animation
function drawStickMan() {
  // Draw the platform as a box
  push();
    fill(150);
    noStroke();
    box(40, 10, 10);
  pop();
  
  // Draw the stick man figure
  stroke(0);
  strokeWeight(2);
  // Head
  push();
    fill(255);
    ellipse(0, -30, 20, 20);
  pop();
  // Body
  line(0, -20, 0, 20);
  // Arms
  line(0, 0, -15, 10);
  line(0, 0, 15, 10);
  // Legs with a swinging motion
  let legSwing = sin(frameCount * 0.3) * 10;
  line(0, 20, -10, 40 + legSwing);
  line(0, 20, 10, 40 - legSwing);
}

// Cannon class: fixed cannons that fire at their corresponding partner cannon
class Cannon {
  constructor(pos, side, index) {
    this.pos = pos.copy();
    this.side = side; // "left" or "right"
    this.index = index;
    this.lastFireTime = 0;
    this.fireInterval = random(1000, 2000); // Fire every 1-2 seconds
  }
  
  update() {
    if (millis() - this.lastFireTime > this.fireInterval) {
      this.lastFireTime = millis();
      let ball = this.fire();
      if (ball) {
        cannonBalls.push(ball);
      }
    }
  }
  
  // Fire a cannon ball toward the corresponding opposite cannon
  fire() {
    let target;
    if (this.side === "left") {
      target = rightCannons[this.index].pos;
    } else {
      target = leftCannons[this.index].pos;
    }
    // Calculate the necessary initial velocity to hit the target under gravity:
    // v0 = (target - pos - 0.5 * gravity * flightTime^2) / flightTime
    let gTerm = p5.Vector.mult(gravity, 0.5 * flightTime * flightTime);
    let diff = p5.Vector.sub(target, this.pos);
    diff.sub(gTerm);
    let v0 = diff.div(flightTime);
    return new CannonBall(this.pos, v0);
  }
  
  display() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      fill(100);
      box(20, 20, 40);
    pop();
  }
}

// CannonBall class: each projectile follows a parabolic trajectory under gravity
// and leaves a thick green trail representing its path.
class CannonBall {
  constructor(pos, velocity) {
    this.pos = pos.copy();
    this.vel = velocity.copy();
    this.r = 10;
    this.trajectory = [];
  }
  
  update() {
    // Record current position to build the trajectory trail
    this.trajectory.push(this.pos.copy());
    if (this.trajectory.length > 50) {
      this.trajectory.shift();
    }
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }
  
  display() {
    // Draw the trajectory as a thick green line
    push();
      noFill();
      stroke(0, 255, 0);
      strokeWeight(4);
      beginShape();
      for (let p of this.trajectory) {
        vertex(p.x, p.y, p.z);
      }
      endShape();
    pop();
    // Draw the cannon ball itself
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      fill(50);
      noStroke();
      sphere(this.r);
    pop();
  }
}
