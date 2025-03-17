// Make sure to include in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/ccapture.js/1.1.0/CCapture.all.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

let derivationSteps = [];
let currentStep = 0;
let derivationContainer;
let capturer;
let isRecording = false;
let l = 200;  // Element length used for illustration

function setup() {
  createCanvas(800, 600);
  background(240);
  
  // Create heading
  let heading = createElement('h1', 'Quadratic Element Shape Functions Derivation');
  heading.position(20, 10);
  
  // Create introductory paragraph
  let intro = createP("This lesson derives the shape functions for a one-dimensional quadratic element with three nodes (u₁, u₂, u₃). Click 'Derive' to see the step-by-step derivation with animations.");
  intro.position(20, 60);
  
  // Create Derive button
  let deriveButton = createButton('Derive');
  deriveButton.position(20, 140);
  deriveButton.mousePressed(startDerivation);
  
  // Create Start/Stop Recording buttons (for video capture)
  let startRecButton = createButton('Start Recording');
  startRecButton.position(100, 140);
  startRecButton.mousePressed(startRecording);
  
  let stopRecButton = createButton('Stop Recording');
  stopRecButton.position(220, 140);
  stopRecButton.mousePressed(stopRecording);
  
  // Create PDF Save button (for exporting the derivation as a PDF)
  let pdfButton = createButton('Save as PDF');
  pdfButton.position(340, 140);
  pdfButton.mousePressed(savePDF);
  
  // Add CSS for slide animation and formatting
  let style = createElement('style', `
    .slide-in {
      position: relative;
      left: -800px;
      opacity: 0;
      animation: slideIn 1s forwards;
    }
    @keyframes slideIn {
      to {
        left: 0;
        opacity: 1;
      }
    }
    .stepDiv {
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      background-color: #f9f9f9;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      text-align: center;
    }
    .redText { color: red; font-weight: bold; }
    .blueText { color: blue; font-weight: bold; }
    .greenText { color: green; font-weight: bold; }
  `);
  style.parent(document.head);
  
  // Define the derivation steps as an array of HTML strings.
  derivationSteps = [
    `<h2>Step 1: Quadratic Interpolation</h2>
     <p>Assume the displacement field is given by a quadratic polynomial:</p>
     <p style="text-align:center;">u(x) = a₀ + a₁x + a₂x²</p>
     <p>This can be written in matrix form as:</p>
     <p style="text-align:center;">u(x) = [1, x, x²] · [a₀; a₁; a₂]</p>`,
     
    `<h2>Step 2: Apply Nodal Conditions</h2>
     <p>For nodes at x = 0, x = l/2, and x = l:</p>
     <p style="text-align:center;">u(0) = u₁  ⇒  a₀ = u₁</p>
     <p style="text-align:center;">u(l/2) = u₂  ⇒  u₁ + a₁(l/2) + a₂(l/2)² = u₂</p>
     <p style="text-align:center;">u(l) = u₃  ⇒  u₁ + a₁l + a₂l² = u₃</p>`,
     
    `<h2>Step 3: Formulate Equations</h2>
     <p>Subtract u₁ from the equations for u(l/2) and u(l):</p>
     <p style="text-align:center;">a₁(l/2) + a₂(l/2)² = u₂ - u₁</p>
     <p style="text-align:center;">a₁l + a₂l² = u₃ - u₁</p>`,
     
    `<h2>Step 4: Solve for Generalized Coordinates</h2>
     <p>Solve the system for a₁ and a₂ in terms of u₁, u₂, u₃ and l.</p>
     <p style="text-align:center;">(Detailed algebra omitted for brevity)</p>
     <p style="text-align:center;">
       Result: a₀ = u₁,<br>
       a₁ = (4u₃ - 3u₂ - u₁)/l,<br>
       a₂ = (2u₂ - 4u₃ + 2u₁)/l²
     </p>`,
     
    `<h2>Step 5: Derive the Shape Functions</h2>
     <p>Express u(x) in terms of the nodal displacements:</p>
     <p style="text-align:center;">u(x) = N₁(x)·u₁ + N₂(x)·u₂ + N₃(x)·u₃</p>
     <p>By using Lagrange interpolation, the shape functions for nodes at x = 0, l/2, and l are:</p>
     <p style="text-align:center;">
       N₁(x) = 2·(x - l/2)(x - l)/l²<br>
       N₂(x) = -4·x·(x - l)/l²<br>
       N₃(x) = 2·x·(x - l/2)/l²
     </p>`,
     
    `<h2>Step 6: Final Expression</h2>
     <p style="text-align:center;">Thus, the displacement field is given by:</p>
     <p style="text-align:center;">u(x) = [N₁(x), N₂(x), N₃(x)] · [u₁; u₂; u₃]</p>
     <p>This completes the derivation of the quadratic shape functions.</p>`
  ];
  
  // Create a container div to hold the derivation steps
  derivationContainer = createDiv('');
  derivationContainer.position(20, 190);
  derivationContainer.style('width', '760px');
}

function draw() {
  // If recording, capture each frame from the default canvas
  if (isRecording && capturer) {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

// Initiate the slide animation sequence for the derivation steps.
function startDerivation() {
  derivationContainer.html(''); // Clear previous content
  currentStep = 0;
  showNextStep();
}

function showNextStep() {
  if (currentStep < derivationSteps.length) {
    // Create a div for the current step with slide-in animation
    let stepDiv = createDiv(derivationSteps[currentStep]);
    stepDiv.addClass('stepDiv slide-in');
    derivationContainer.child(stepDiv);
    currentStep++;
    // Delay before showing the next step (2 seconds between steps)
    setTimeout(showNextStep, 2000);
  }
}

// Video recording functions using CCapture.js
function startRecording() {
  if (!isRecording) {
    capturer = new CCapture({ format: 'webm', framerate: 30 });
    capturer.start();
    isRecording = true;
  }
}

function stopRecording() {
  if (isRecording) {
    isRecording = false;
    capturer.stop();
    capturer.save();
  }
}

// Save the derivation content as a PDF using jsPDF
function savePDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF('p', 'pt', 'a4');
  // Render the document body into the PDF (you can target derivationContainer if preferred)
  doc.html(document.body, {
    callback: function (doc) {
      doc.save('quadratic_derivation.pdf');
    },
    x: 20,
    y: 20
  });
}
