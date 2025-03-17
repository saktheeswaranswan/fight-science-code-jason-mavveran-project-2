let cols = 5;  // Number of squares in a row
let rows = 5;  // Number of squares in a column
let subDiv = 10;  // Number of meshes per square
let squareSize = 100;  // Size of each square
let maxHeight = 150;  // Max height of the mesh
let grid = [];

let heightSlider, heightInput;  // UI controls for height

let boundaryConditions = {};  // Store boundary conditions for each selected square
let selectedSquare = null;  // Track which square is selected

function setup() {
  createCanvas(800, 800, WEBGL);

  // Initialize grid with mesh data for PDE solution
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = {
        x: j * squareSize - (cols * squareSize) / 2,
        y: i * squareSize - (rows * squareSize) / 2,
        z: Array(subDiv).fill().map(() => Array(subDiv).fill(0)), // Mesh elevations
        boundary: { top: 0, bottom: 0, left: 0, right: 0 },  // Boundary conditions
        selected: false
      };
    }
  }

  // Create sliders and input boxes
  heightSlider = createSlider(0, maxHeight, 0, 1);
  heightSlider.position(10, height + 10);
  heightSlider.style('width', '200px');

  heightInput = createInput('0');
  heightInput.position(220, height + 10);
  heightInput.size(50);
  heightInput.input(() => {
    let val = int(heightInput.value());
    heightSlider.value(val);
    updateSelectedHeight(val);
  });
}

function draw() {
  background(10);
  orbitControl();  // Enable mouse rotation
  rotateX(PI / 6);
  rotateZ(PI / 12);

  // Update selected height and solve PDE if square is selected
  updateSelectedHeight(heightSlider.value());

  // Render the high-density mesh grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let slab = grid[i][j];
      let sx = slab.x;
      let sy = slab.y;

      if (slab.selected) {
        // Apply PDE solver after selecting a square
        solvePDE(slab);
      }

      // Draw the mesh grid with updated values
      for (let x = 0; x < subDiv - 1; x++) {
        beginShape(TRIANGLE_STRIP);
        for (let y = 0; y < subDiv; y++) {
          let px1 = sx + (x / subDiv) * squareSize;
          let py1 = sy + (y / subDiv) * squareSize;
          let pz1 = slab.z[x][y];

          let px2 = sx + ((x + 1) / subDiv) * squareSize;
          let py2 = sy + (y / subDiv) * squareSize;
          let pz2 = slab.z[x + 1][y];

          fill(slab.selected ? 'red' : 150);
          stroke(255);
          vertex(px1, py1, pz1);
          vertex(px2, py2, pz2);
        }
        endShape();
      }
    }
  }
}

function mousePressed() {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  // Select the closest square
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let slab = grid[i][j];
      let d = dist(mx, my, slab.x, slab.y);
      if (d < squareSize / 2) {
        if (selectedSquare) selectedSquare.selected = false;
        slab.selected = true;
        selectedSquare = slab;
      }
    }
  }
}

// Function to update height for selected slabs
function updateSelectedHeight(value) {
  if (selectedSquare) {
    // Reset mesh height values
    for (let x = 0; x < subDiv; x++) {
      for (let y = 0; y < subDiv; y++) {
        selectedSquare.z[x][y] = value;
      }
    }
  }
}

// Function to solve PDE for the selected square patch
function solvePDE(slab) {
  // Define boundary conditions
  let top = slab.boundary.top;
  let bottom = slab.boundary.bottom;
  let left = slab.boundary.left;
  let right = slab.boundary.right;

  let maxIterations = 500; // Maximum iterations for convergence
  let tolerance = 0.0001;  // Convergence tolerance
  let error = 1e10;  // Initial large error

  // Initialize the mesh (solution grid) with boundary conditions
  let mesh = slab.z;

  for (let iter = 0; iter < maxIterations && error > tolerance; iter++) {
    error = 0;

    // Iterate over the interior points and solve the PDE
    for (let x = 1; x < subDiv - 1; x++) {
      for (let y = 1; y < subDiv - 1; y++) {
        let oldVal = mesh[x][y];

        // Compute the new value based on the finite difference method (Jacobi iteration)
        let newVal = 0.25 * (mesh[x + 1][y] + mesh[x - 1][y] + mesh[x][y + 1] + mesh[x][y - 1]);
        mesh[x][y] = newVal;

        // Track the error
        error = max(error, abs(newVal - oldVal));
      }
    }

    // Apply boundary conditions (fixed values on edges)
    for (let i = 0; i < subDiv; i++) {
      mesh[0][i] = top;       // Top boundary
      mesh[subDiv - 1][i] = bottom; // Bottom boundary
      mesh[i][0] = left;      // Left boundary
      mesh[i][subDiv - 1] = right; // Right boundary
    }
  }
}
