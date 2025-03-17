let video;
let stickManPos;
let stickManVel;
let cannonBalls = [];
let leftCannons = [];
let rightCannons = [];
let gravity;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Set up full-canvas live webcam feed as the background.
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();
  
  // The stick man runs fast along the center of the corridor.
  stickManPos = createVector(0, 0, 800);
  stickManVel = createVector(0, 0, -10); // fast running along the z-axis
  
  // Gravity for parabolic motion (y increases downward).
  gravity = createVector(0, 0.3, 0);
  
  // Create arrays of cannons along the corridor’s sides.
  // Left cannons: fixed at x = -300, evenly spaced along z.
  let numCannons = 5;
  let startZ = 300;
  let spacing = 150;
  for (let i = 0; i < numCannons; i++) {
    let posLeft = createVector(-300, 0, startZ + i * spacing);
    leftCannons.push(new Cannon(posLeft));
  }
  
  // Right cannons: fixed at x = 300, staggered (offset by half spacing) to avoid direct opposition.
  for (let i = 0; i < numCannons; i++) {
    let posRight = createVector(300, 0, startZ + spacing/2 + i * spacing);
    rightCannons.push(new Cannon(posRight));
  }
}

function draw() {
  background(0);
  orbitControl();
  
  // --- Draw full-canvas live webcam background ---
  push();
    resetMatrix(); // reset to 2D mode
    image(video, 0, 0, width, height);
  pop();
  
  // --- Draw the 3D scene ---
  // Ground plane.
  push();
    rotateX(PI / 2);
    noStroke();
    fill(100, 200, 100);
    plane(2000, 2000);
  pop();
  
  // Update the stick man's position (running fast down the corridor).
  stickManPos.add(stickManVel);
  
  // Draw the stick man riding his platform.
  push();
    translate(stickManPos.x, stickManPos.y, stickManPos.z);
    drawStickMan();
  pop();
  
  // Update and display all cannons (they fire parabolic projectiles aimed at the stick man).
  for (let cannon of leftCannons) {
    cannon.update();
    cannon.display();
  }
  for (let cannon of rightCannons) {
    cannon.update();
    cannon.display();
  }
  
  // Update and display each cannon ball.
  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
    // Remove projectiles that go offscreen or too far.
    if (cannonBalls[i].pos.y > height || 
        abs(cannonBalls[i].pos.x) > width * 2 ||
        cannonBalls[i].pos.z < -1000) {
      cannonBalls.splice(i, 1);
    }
  }
}

// Draw the stick man riding on a simple platform with a running animation.
function drawStickMan() {
  // Platform as a box.
  push();
    fill(150);
    noStroke();
    box(40, 10, 10);
  pop();
  
  // Stick man figure.
  stroke(0);
  strokeWeight(2);
  // Head.
  push();
    fill(255);
    ellipse(0, -30, 20, 20);
  pop();
  // Body.
  line(0, -20, 0, 20);
  // Arms.
  line(0, 0, -15, 10);
  line(0, 0, 15, 10);
  // Legs with swinging motion.
  let legSwing = sin(frameCount * 0.3) * 10;
  line(0, 20, -10, 40 + legSwing);
  line(0, 20, 10, 40 - legSwing);
}

// Cannon class: each fixed cannon fires parabolic projectiles aimed (with variation) at the stick man.
class Cannon {
  constructor(pos) {
    this.pos = pos.copy();
    this.lastFireTime = 0;
    this.fireInterval = random(1000, 2000); // fire every 1-2 seconds
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
  
  // Fire a cannon ball aimed at the stick man with a parabolic trajectory.
  // We choose a random flight time (t) between 30 and 60 frames, which gives variation in angles.
  fire() {
    // Target is the current stick man position plus a small random offset.
    let target = p5.Vector.add(stickManPos, createVector(random(-30, 30), 0, 0));
    let t = random(30, 60);
    // Compute the necessary initial velocity using:
    // v0 = (target - pos - 0.5 * gravity * t^2) / t
    let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);
    let diff = p5.Vector.sub(target, this.pos);
    diff.sub(gTerm);
    let v0 = diff.div(t);
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

// CannonBall class: each projectile follows a parabolic trajectory under gravity and leaves a thick green trail.
class CannonBall {
  constructor(pos, velocity) {
    this.pos = pos.copy();
    this.vel = velocity.copy();
    this.r = 10;
    this.trajectory = [];
  }
  
  update() {
    // Record current position for the trajectory trail.
    this.trajectory.push(this.pos.copy());
    if (this.trajectory.length > 50) {
      this.trajectory.shift();
    }
    // Update velocity and position (apply gravity).
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }
  
  display() {
    // Draw the trajectory as a thick green line.
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
    // Draw the cannon ball.
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      fill(50);
      noStroke();
      sphere(this.r);
    pop();
  }
}
