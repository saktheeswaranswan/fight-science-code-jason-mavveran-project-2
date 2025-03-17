let stickManPos;
let cannonBalls = [];
let gravity;
let lastCannonSpawn = 0;
let spawnInterval = 2000; // initial spawn interval in ms

// Sliders
let runnerSpeedSlider, cannonFireSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Create sliders
  runnerSpeedSlider = createSlider(1, 20, 10, 1);
  runnerSpeedSlider.position(20, 20);
  runnerSpeedSlider.style('width', '200px');
  
  cannonFireSlider = createSlider(200, 5000, 2000, 50);
  cannonFireSlider.position(20, 50);
  cannonFireSlider.style('width', '200px');
  
  // Stick man starts far away (z = 800) and runs forward (negative z)
  stickManPos = createVector(0, 0, 800);
  
  // Gravity for parabolic motion (y positive is downward)
  gravity = createVector(0, 0.3, 0);
}

function draw() {
  background(0);
  orbitControl();
  
  // Update sliders' parameters
  let runnerSpeed = runnerSpeedSlider.value();       // How fast the stick man runs
  spawnInterval = cannonFireSlider.value();            // How frequently cannons fire
  
  // Draw slider labels
  push();
    resetMatrix();
    textSize(16);
    fill(255);
    text("Runner Speed: " + runnerSpeed, 230, 35);
    text("Cannon Fire Interval (ms): " + spawnInterval, 230, 65);
  pop();
  
  // Draw a large ground plane
  push();
    rotateX(PI / 2);
    noStroke();
    fill(100, 200, 100);
    plane(2000, 2000);
  pop();
  
  // Update stick man position (simulate running forward)
  stickManPos.z -= runnerSpeed;
  
  // Reset the stick man and clear cannon balls if he reaches the end of the plane
  if (stickManPos.z < -200) {
    stickManPos.z = 800;
    cannonBalls = [];
  }
  
  // Draw the stick man riding his platform
  push();
    translate(stickManPos.x, stickManPos.y, stickManPos.z);
    drawStickMan();
  pop();
  
  // Periodically spawn cannon balls from left and right sides aimed at the running person
  if (millis() - lastCannonSpawn > spawnInterval) {
    spawnCannonBalls();
    lastCannonSpawn = millis();
  }
  
  // Update and display each cannon ball
  for (let i = cannonBalls.length - 1; i >= 0; i--) {
    cannonBalls[i].update();
    cannonBalls[i].display();
    // Remove a cannon ball if it goes too far or off-screen
    if (
      cannonBalls[i].pos.y > height ||
      abs(cannonBalls[i].pos.x) > width * 2 ||
      abs(cannonBalls[i].pos.z) > 2000
    ) {
      cannonBalls.splice(i, 1);
    }
  }
  
  // Draw simple cannons on the left and right sides relative to the stick man
  drawCannons();
}

function drawStickMan() {
  // Draw the platform as a simple box
  push();
    fill(150);
    noStroke();
    box(40, 10, 10);
  pop();
  
  // Draw the stick man: head, body, arms, and legs (with running animation)
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
  
  // Legs: use a sine function to simulate running
  let legSwing = sin(frameCount * 0.3) * 10;
  line(0, 20, -10, 40 + legSwing);
  line(0, 20, 10, 40 - legSwing);
}

class CannonBall {
  constructor(pos, velocity) {
    this.pos = pos.copy();
    this.vel = velocity.copy();
    this.r = 10;
    this.trajectory = []; // Store past positions for trajectory display
  }
  
  update() {
    // Record current position for the trajectory trail
    this.trajectory.push(this.pos.copy());
    if (this.trajectory.length > 50) {
      this.trajectory.shift();
    }
    // Apply gravity to the velocity and update position
    this.vel.add(gravity);
    this.pos.add(this.vel);
  }
  
  display() {
    // Draw the trajectory as a shining laser red line
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
    
    // Draw the cannon ball itself
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      fill(50);
      noStroke();
      sphere(this.r);
    pop();
  }
}

function spawnCannonBalls() {
  // Fire at the running person by computing the required initial velocity:
  // v0 = (target - cannonPos - 0.5*g*t^2) / t
  // Use the stick man’s current position as the target with a slight random offset.
  let target = p5.Vector.add(stickManPos, createVector(random(-20, 20), random(-20, 20), 0));
  
  // Choose a random flight time (in frames)
  let t = random(30, 60);
  let gTerm = p5.Vector.mult(gravity, 0.5 * t * t);
  
  // Left cannon position
  let leftCannonPos = createVector(-width/2 + 50, 0, stickManPos.z + 200);
  let diffLeft = p5.Vector.sub(target, leftCannonPos);
  diffLeft.sub(gTerm);
  let leftVel = diffLeft.div(t);
  cannonBalls.push(new CannonBall(leftCannonPos, leftVel));
  
  // Right cannon position
  let rightCannonPos = createVector(width/2 - 50, 0, stickManPos.z + 200);
  let diffRight = p5.Vector.sub(target, rightCannonPos);
  diffRight.sub(gTerm);
  let rightVel = diffRight.div(t);
  cannonBalls.push(new CannonBall(rightCannonPos, rightVel));
}

function drawCannons() {
  push();
    // Draw left cannon
    push();
      translate(-width/2 + 50, 0, stickManPos.z + 200);
      fill(100);
      box(20, 20, 40);
    pop();
    
    // Draw right cannon
    push();
      translate(width/2 - 50, 0, stickManPos.z + 200);
      fill(100);
      box(20, 20, 40);
    pop();
  pop();
}
