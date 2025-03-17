let cols = 5;           // Number of squares in a row
let rows = 5;           // Number of squares in a column
let subDiv = 10;        // Number of discrete elements per side of a square
let squareSize = 100;   // Size of each square
let grid = [];

let inputTop, inputBottom, inputLeft, inputRight;  // Input boxes for boundary functions
let solveButton;      // Button to trigger PDE solve

// Track selected square indices and object
let selectedRow = 0;
let selectedCol = 0;
let selectedSquare = null;  

function setup() {
  createCanvas(800, 800, WEBGL);

  // Initialize grid with mesh data for each square
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = {
        x: j * squareSize - (cols * squareSize) / 2,
        y: i * squareSize - (rows * squareSize) / 2,
        // Create a subDiv x subDiv 2D array for z-values (initially zero)
        z: Array(subDiv).fill().map(() => Array(subDiv).fill(0)),
        // Store boundary functions as strings (default "0")
        boundaryFuncs: {
          top: "0",
          bottom: "0",
          left: "0",
          right: "0"
        },
        selected: false
      };
    }
  }
  
  // Set the initial selected square (0,0)
  selectedSquare = grid[selectedRow][selectedCol];
  selectedSquare.selected = true;

  // Create input boxes for the four boundary functions
  inputTop = createInput(selectedSquare.boundaryFuncs.top);
  inputTop.position(10, height + 10);
  inputTop.size(100);
  inputTop.input(updateBoundaryFuncs);

  inputBottom = createInput(selectedSquare.boundaryFuncs.bottom);
  inputBottom.position(120, height + 10);
  inputBottom.size(100);
  inputBottom.input(updateBoundaryFuncs);

  inputLeft = createInput(selectedSquare.boundaryFuncs.left);
  inputLeft.position(230, height + 10);
  inputLeft.size(100);
  inputLeft.input(updateBoundaryFuncs);

  inputRight = createInput(selectedSquare.boundaryFuncs.right);
  inputRight.position(340, height + 10);
  inputRight.size(100);
  inputRight.input(updateBoundaryFuncs);

  // Create a "Solve" button that will run the PDE solver on the selected square
  solveButton = createButton("Solve");
  solveButton.position(450, height + 10);
  solveButton.mousePressed(() => {
    if (selectedSquare) {
      solvePDE(selectedSquare);
    }
  });
}

function draw() {
  background(10);
  orbitControl();  // Mouse only rotates the view
  rotateX(PI / 6);
  rotateZ(PI / 12);

  // Render every square's mesh
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let slab = grid[i][j];
      let sx = slab.x;
      let sy = slab.y;
      
      // Draw the mesh as a grid of triangles
      for (let x = 0; x < subDiv - 1; x++) {
        beginShape(TRIANGLE_STRIP);
        for (let y = 0; y < subDiv; y++) {
          // Map the sub-division index to a position within the square
          let px1 = sx + (x / (subDiv - 1)) * squareSize;
          let py1 = sy + (y / (subDiv - 1)) * squareSize;
          let pz1 = slab.z[x][y];
          
          let px2 = sx + ((x + 1) / (subDiv - 1)) * squareSize;
          let py2 = sy + (y / (subDiv - 1)) * squareSize;
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

// Disable square selection on mouse press (mouse is only used for rotating)
function mousePressed() {
  // Do nothing
}

// Update the boundary function strings for the selected square from the input boxes
function updateBoundaryFuncs() {
  if (selectedSquare) {
    selectedSquare.boundaryFuncs.top = inputTop.value();
    selectedSquare.boundaryFuncs.bottom = inputBottom.value();
    selectedSquare.boundaryFuncs.left = inputLeft.value();
    selectedSquare.boundaryFuncs.right = inputRight.value();
  }
}

// Listen for arrow key presses to change the selected square
function keyPressed() {
  let newRow = selectedRow;
  let newCol = selectedCol;
  if (keyCode === LEFT_ARROW) {
    newCol = max(0, selectedCol - 1);
  } else if (keyCode === RIGHT_ARROW) {
    newCol = min(cols - 1, selectedCol + 1);
  } else if (keyCode === UP_ARROW) {
    newRow = max(0, selectedRow - 1);
  } else if (keyCode === DOWN_ARROW) {
    newRow = min(rows - 1, selectedRow + 1);
  }
  
  if (newRow !== selectedRow || newCol !== selectedCol) {
    // Deselect the previously selected square
    grid[selectedRow][selectedCol].selected = false;
    
    // Update indices and set new selection
    selectedRow = newRow;
    selectedCol = newCol;
    selectedSquare = grid[selectedRow][selectedCol];
    selectedSquare.selected = true;
    
    // Update the input boxes to reflect the new square's boundary functions
    inputTop.value(selectedSquare.boundaryFuncs.top);
    inputBottom.value(selectedSquare.boundaryFuncs.bottom);
    inputLeft.value(selectedSquare.boundaryFuncs.left);
    inputRight.value(selectedSquare.boundaryFuncs.right);
  }
}

// Solve the PDE (using Jacobi iteration) for the given square using its boundary functions
function solvePDE(slab) {
  // Parse the string expressions into functions that can use math functions (via the Math object)
  let f_top, f_bottom, f_left, f_right;
  try {
    f_top = new Function('x', 'with(Math){ return ' + slab.boundaryFuncs.top + '; }');
    f_bottom = new Function('x', 'with(Math){ return ' + slab.boundaryFuncs.bottom + '; }');
    f_left = new Function('x', 'with(Math){ return ' + slab.boundaryFuncs.left + '; }');
    f_right = new Function('x', 'with(Math){ return ' + slab.boundaryFuncs.right + '; }');
  } catch (e) {
    console.error("Error parsing boundary functions:", e);
    return;
  }
  
  // Compute the discrete boundary values (10 points along each side)
  for (let i = 0; i < subDiv; i++) {
    let t = (i / (subDiv - 1)) * squareSize;  // Parameter along the side
    slab.z[0][i] = f_top(t);                   // Top edge (first row)
    slab.z[subDiv - 1][i] = f_bottom(t);         // Bottom edge (last row)
    slab.z[i][0] = f_left(t);                  // Left edge (first column)
    slab.z[i][subDiv - 1] = f_right(t);            // Right edge (last column)
  }

  // Solve the interior using Jacobi iteration
  let maxIterations = 500;
  let tolerance = 0.0001;
  let error = 1e10;
  let mesh = slab.z;
  
  for (let iter = 0; iter < maxIterations && error > tolerance; iter++) {
    error = 0;
    for (let x = 1; x < subDiv - 1; x++) {
      for (let y = 1; y < subDiv - 1; y++) {
        let oldVal = mesh[x][y];
        // Average of four neighbors
        let newVal = 0.25 * (mesh[x + 1][y] + mesh[x - 1][y] + mesh[x][y + 1] + mesh[x][y - 1]);
        mesh[x][y] = newVal;
        error = max(error, abs(newVal - oldVal));
      }
    }
    // Reapply the boundary conditions at each iteration to keep them fixed
    for (let i = 0; i < subDiv; i++) {
      let t = (i / (subDiv - 1)) * squareSize;
      mesh[0][i] = f_top(t);
      mesh[subDiv - 1][i] = f_bottom(t);
      mesh[i][0] = f_left(t);
      mesh[i][subDiv - 1] = f_right(t);
    }
  }
}
