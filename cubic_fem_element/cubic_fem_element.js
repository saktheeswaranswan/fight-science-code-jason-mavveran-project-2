/*
Include these libraries in your HTML file:
<script src="https://cdnjs.cloudflare.com/ajax/libs/ccapture.js/1.1.0/CCapture.all.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
*/

let derivationSteps = [];
let currentStep = 0;
let derivationContainer;
let capturer;
let isRecording = false;
let l = 300; // Element length for demonstration

function setup() {
  createCanvas(800, 600);
  background(240);
  
  // Create a heading for the cubic element derivation
  let heading = createElement('h1', 'Cubic Element Derivation');
  heading.position(20, 10);
  
  // Introductory paragraph
  let intro = createP("This lesson derives the shape functions, stiffness matrix, and force vector for a one-dimensional cubic element with four nodes (u₁, u₂, u₃, u₄). Click 'Derive' to begin the step-by-step animation.");
  intro.position(20, 60);
  
  // Create control buttons
  let deriveButton = createButton('Derive');
  deriveButton.position(20, 140);
  deriveButton.mousePressed(startDerivation);
  
  let startRecButton = createButton('Start Recording');
  startRecButton.position(100, 140);
  startRecButton.mousePressed(startRecording);
  
  let stopRecButton = createButton('Stop Recording');
  stopRecButton.position(240, 140);
  stopRecButton.mousePressed(stopRecording);
  
  let pdfButton = createButton('Save as PDF');
  pdfButton.position(380, 140);
  pdfButton.mousePressed(savePDF);
  
  // CSS styling for slide animation and formatting
  let style = createElement('style', 
    `.slide-in {
      position: relative;
      left: -800px;
      opacity: 0;
      animation: slideIn 1s forwards;
    }
    @keyframes slideIn {
      to { left: 0; opacity: 1; }
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
    .purpleText { color: purple; font-weight: bold; }`
  );
  style.parent(document.head);
  
  // Define derivation steps for the cubic element as HTML strings
  derivationSteps = [
    `<h2>Step 1: Introduction</h2>
     <p>Consider a cubic bar element with nodes at <em>x = 0</em>, <em>x = l/3</em>, <em>x = 2l/3</em>, and <em>x = l</em>. The nodal displacements are u₁, u₂, u₃, and u₄.</p>`,
     
    `<h2>Step 2: Assumed Displacement Field</h2>
     <p>Assume a cubic interpolation:</p>
     <p style="text-align:center;">u(x) = a₀ + a₁·x + a₂·x² + a₃·x³</p>
     <p>This is written in matrix form as:</p>
     <p style="text-align:center;">u(x) = [1, x, x², x³] · [a₀; a₁; a₂; a₃]</p>`,
     
    `<h2>Step 3: Nodal Conditions</h2>
     <p>Apply the nodal displacements:</p>
     <p style="text-align:center;">u(0) = u₁</p>
     <p style="text-align:center;">u(l/3) = u₂</p>
     <p style="text-align:center;">u(2l/3) = u₃</p>
     <p style="text-align:center;">u(l) = u₄</p>`,
     
    `<h2>Step 4: Formulate Equations</h2>
     <p>Substitute the nodal conditions into u(x) to obtain a system of four equations:</p>
     <p style="text-align:center;">
       a₀ = u₁<br>
       a₀ + a₁(l/3) + a₂(l/3)² + a₃(l/3)³ = u₂<br>
       a₀ + a₁(2l/3) + a₂(2l/3)² + a₃(2l/3)³ = u₃<br>
       a₀ + a₁l + a₂l² + a₃l³ = u₄
     </p>`,
     
    `<h2>Step 5: Solve for Coefficients</h2>
     <p>By inverting the Vandermonde matrix, solve for the coefficients a₀, a₁, a₂, and a₃ in terms of u₁, u₂, u₃, and u₄.</p>`,
     
    `<h2>Step 6: Derive Shape Functions</h2>
     <p>Express u(x) in terms of the nodal displacements:</p>
     <p style="text-align:center;">u(x) = N₁(x)·u₁ + N₂(x)·u₂ + N₃(x)·u₃ + N₄(x)·u₄</p>
     <p>Using Lagrange interpolation, the shape functions are defined as:</p>
     <p style="text-align:center;">
       N₁(x) = ((x - l/3)(x - 2l/3)(x - l)) / ((0 - l/3)(0 - 2l/3)(0 - l))<br>
       N₂(x) = ((x - 0)(x - 2l/3)(x - l)) / (((l/3) - 0)((l/3) - 2l/3)((l/3) - l))<br>
       N₃(x) = ((x - 0)(x - l/3)(x - l)) / (((2l/3) - 0)((2l/3) - l/3)((2l/3) - l))<br>
       N₄(x) = ((x - 0)(x - l/3)(x - 2l/3)) / ((l - 0)(l - l/3)(l - 2l/3))
     </p>`,
     
    `<h2>Step 7: Stiffness Matrix Setup</h2>
     <p>The stiffness matrix is defined by:</p>
     <p style="text-align:center;">[k] = ∫₀ˡ [B]ᵀ · E · A · [B] dx</p>
     <p>where the strain–displacement matrix is:</p>
     <p style="text-align:center;">B = [ dN₁/dx, dN₂/dx, dN₃/dx, dN₄/dx ]</p>`,
     
    `<h2>Step 8: Compute [B] and Integrate</h2>
     <p>Differentiate the shape functions to obtain B. Substitute these derivatives into the stiffness matrix equation and perform the integration over [0, l].</p>`,
     
    `<h2>Step 9: Final Stiffness Matrix</h2>
     <p>After integrating, the stiffness matrix is expressed in terms of E, A, and l. For instance:</p>
     <p style="text-align:center; font-weight:bold; color:green;">
       [k] = (E·A/l³) · [ k₁₁, k₁₂, k₁₃, k₁₄;<br> k₁₂, k₂₂, k₂₃, k₂₄;<br> k₁₃, k₂₃, k₃₃, k₃₄;<br> k₁₄, k₂₄, k₃₄, k₄₄ ]
     </p>
     <p>(The exact coefficients arise from the integration.)</p>`,
     
    `<h2>Step 10: Force Vector & Assembly</h2>
     <p>For a distributed load (for example, self–weight) with intensity w = ρ·A, the nodal force vector is given by:</p>
     <p style="text-align:center;">{F} = ∫₀ˡ [N]ᵀ · w dx</p>
     <p>Where [N] = [N₁, N₂, N₃, N₄]. This concludes the derivation for the cubic element.</p>`
  ];
  
  // Create a container div for the derivation steps
  derivationContainer = createDiv('');
  derivationContainer.position(20, 190);
  derivationContainer.style('width', '760px');
}

function draw() {
  // If recording is active, capture each frame using CCapture.js
  if (isRecording && capturer) {
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

// Starts the slide–in sequence for the derivation steps.
function startDerivation() {
  derivationContainer.html('');  // Clear any previous content
  currentStep = 0;
  showNextStep();
}

function showNextStep() {
  if (currentStep < derivationSteps.length) {
    // Create a new div for the current step with slide-in animation
    let stepDiv = createDiv(derivationSteps[currentStep]);
    stepDiv.addClass('stepDiv slide-in');
    derivationContainer.child(stepDiv);
    currentStep++;
    // Delay between steps (adjust the delay as desired)
    setTimeout(showNextStep, 3000);
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

// Save the derivation as a PDF using jsPDF
function savePDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF('p', 'pt', 'a4');
  // Capture the HTML content of the page (or specifically derivationContainer)
  doc.html(document.body, {
    callback: function (doc) {
      doc.save('cubic_element_derivation.pdf');
    },
    x: 20,
    y: 20
  });
}

/*
Explanation:
1. The sketch creates a canvas and adds HTML elements including headings, paragraphs, and control buttons.
2. An array named derivationSteps holds the HTML content for each derivation step of the cubic element.
3. When the "Derive" button is clicked, the startDerivation() function clears any previous content and starts displaying the steps sequentially with a slide-in effect.
4. Video recording is enabled via CCapture.js (startRecording/stopRecording), and the entire derivation can be saved as a PDF using jsPDF.
5. The derivation covers:
   - The assumed cubic displacement field (u(x) = a₀ + a₁x + a₂x² + a₃x³),
   - Imposing nodal conditions at x = 0, l/3, 2l/3, and l,
   - Solving for the coefficients via the Vandermonde matrix,
   - Deriving the shape functions using Lagrange interpolation,
   - Setting up and computing the stiffness matrix, and
   - Assembling the force vector from the distributed load.
*/
