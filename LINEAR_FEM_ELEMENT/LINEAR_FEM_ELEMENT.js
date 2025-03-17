// Make sure to include in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/ccapture.js/1.1.0/CCapture.all.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

let derivationSteps = [];
let currentStep = 0;
let derivationContainer;
let capturer;
let isRecording = false;

function setup() {
  createCanvas(800, 600);
  background(240);

  // Create a heading
  let heading = createElement('h1', 'Bar Element Derivation from Stationary Functional');
  heading.position(20, 10);

  // Create an introductory paragraph
  let intro = createP("In this lesson, we derive the equation for a bar element using the stationary potential energy principle. " +
    "The element has nodal displacements u₁ and u₂. When you click the 'Derive' button below, " +
    "each step of the derivation will slide into view.");
  intro.position(20, 60);

  // Create the Derive button
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

  // Create PDF Save button (requires jsPDF)
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
  `);
  style.parent(document.head);

  // Set up derivation steps as an array of HTML strings (each step is self-contained)
  derivationSteps = [
    `<h2>Step 1: Displacement Interpolation</h2>
     <p>For a bar element with nodal displacements <em>u<sub>1</sub></em> and <em>u<sub>2</sub></em>, the displacement field is approximated as:</p>
     <p style="text-align:center;">u(x) = N<sub>1</sub>(x) u<sub>1</sub> + N<sub>2</sub>(x) u<sub>2</sub></p>
     <p style="text-align:center;">N<sub>1</sub>(x) = 1 - x/l, &nbsp;&nbsp; N<sub>2</sub>(x) = x/l</p>`,

    `<h2>Step 2: Strain and Strain Energy</h2>
     <p style="text-align:center;">ε(x) = du/dx = (u<sub>2</sub> - u<sub>1</sub>)/l</p>
     <p style="text-align:center;">U = (1/2)(AE/l)(u<sub>2</sub> - u<sub>1</sub>)²</p>`,

    `<h2>Step 3: Potential Energy of External Forces</h2>
     <p style="text-align:center;">H = - [ ∫₀ˡ q₀ u(x) dx + F₁ u(0) + F₂ u(l) ]</p>
     <p style="text-align:center;">∫₀ˡ u(x) dx = (l/2)(u<sub>1</sub> + u<sub>2</sub>)</p>
     <p style="text-align:center;">H = - [ (q₀l/2)(u<sub>1</sub> + u<sub>2</sub>) + F₁ u<sub>1</sub> + F₂ u<sub>2</sub> ]</p>`,

    `<h2>Step 4: Total Potential Energy Functional</h2>
     <p style="text-align:center;">π(u<sub>1</sub>, u<sub>2</sub>) = U - H</p>
     <p style="text-align:center;">π = (1/2)(AE/l)(u<sub>2</sub> - u<sub>1</sub>)² + (q₀l/2)(u<sub>1</sub> + u<sub>2</sub>) + F₁ u<sub>1</sub> + F₂ u<sub>2</sub></p>`,

    `<h2>Step 5: Stationarity Condition</h2>
     <p style="text-align:center;">∂π/∂u<sub>1</sub> = - (AE/l)(u<sub>2</sub> - u<sub>1</sub>) + (q₀l/2) + F₁ = 0</p>
     <p style="text-align:center;">∂π/∂u<sub>2</sub> = (AE/l)(u<sub>2</sub> - u<sub>1</sub>) + (q₀l/2) + F₂ = 0</p>
     <p style="text-align:center;">Thus, F₁ + F₂ = -q₀l</p>`,

    `<h2>Step 6: Final Element Equation</h2>
     <p style="text-align:center;">Stiffness matrix: <span class="redText">(AE/l)[1  -1; -1  1]</span></p>
     <p style="text-align:center;">Nodal load vector: <span class="blueText">[q₀l/2 + F₁; q₀l/2 + F₂]</span></p>`
  ];

  // Create a container div to hold the derivation steps
  derivationContainer = createDiv('');
  derivationContainer.position(20, 190);
  derivationContainer.style('width', '760px');
}

function draw() {
  // Capture canvas frames if recording is active (requires CCapture.js)
  if (isRecording && capturer) {
    // The default canvas gets the id "defaultCanvas0"
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
}

// Starts the slide animation sequence for the derivation steps.
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
    // Show next step after a delay (1.5 seconds between steps)
    setTimeout(showNextStep, 1500);
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

// Save the derivation content as a PDF using jsPDF (assumes jsPDF is loaded)
function savePDF() {
  // Create a new jsPDF instance (using the UMD module)
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF('p', 'pt', 'a4');
  // Use the html() method to render the entire body (or you can target the derivationContainer)
  doc.html(document.body, {
    callback: function (doc) {
      doc.save('derivation.pdf');
    },
    x: 20,
    y: 20
  });
}
