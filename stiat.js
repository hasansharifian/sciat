// ====== Setup ======
var jsPsych = initJsPsych({
  display_element: 'jspsych-target'
});

// Keys
const LEFT_KEY  = 'e';
const RIGHT_KEY = 'i';

// ====== Stimuli ======
// Target category: HONOR (from your Cross 2014 selection)
const HONOR = ['Helpful','Honest','Respectable','Valued','Proud','Confident'];

// Attributes
// You said Ego and Alone feel odd, and that One and Person are odd.
// Using short clear forms. Adjust freely if you like.
const COLLECTIVE = ['We','Us','Our','Ours','Family','Community'];
const SINGULAR   = ['I','Me','Mine','Myself','Self','Individual'];

// How many trials per block
const N_PRACTICE_ATTR   = 24; // attribute only practice, total
const N_COMBINED_TARGET = 20; // honor items within each combined block
const N_COMBINED_ATTR   = 40; // attribute items within each combined block (20 per side)
const ERROR_PENALTY_MS  = 400; // for D scoring
const MIN_RT            = 350; // ms cutoff
const MAX_RT            = 10000;

// Randomize order of combined blocks
// A = Honor + Collective on the left, Singular on the right (congruent if you expect Honor with Collective)
// B = Honor + Singular on the left, Collective on the right (incongruent under that expectation)
const order = jsPsych.randomization.sampleWithoutReplacement(['A_first','B_first'], 1)[0];

// ====== Helpers ======
function repeatSample(arr, nTotal) {
  // sample with replacement to length nTotal, balanced across items
  const out = [];
  for (let i = 0; i < nTotal; i++) {
    out.push(arr[Math.floor(Math.random() * arr.length)]);
  }
  return out;
}

function buildTimelineVars_Practice(pairing) {
  // pairing.left = ['collective'] or ['singular']
  const leftCat  = pairing.left[0];  // 'collective' or 'singular'
  const rightCat = pairing.right[0]; // the other one

  const leftList  = leftCat === 'collective' ? COLLECTIVE : SINGULAR;
  const rightList = rightCat === 'collective' ? COLLECTIVE : SINGULAR;

  const leftItems  = repeatSample(leftList,  N_PRACTICE_ATTR/2).map(w => ({stimulus:`<div class="big">${w}</div>`, category:leftCat,  key:'left'}));
  const rightItems = repeatSample(rightList, N_PRACTICE_ATTR/2).map(w => ({stimulus:`<div class="big">${w}</div>`, category:rightCat, key:'right'}));

  return jsPsych.randomization.shuffle([...leftItems, ...rightItems]);
}

function buildTimelineVars_Combined(pairing) {
  // pairing.left is an array of categories on the left, pairing.right on the right
  // Left has either ['collective','honor'] or ['singular']
  // Right has the complement
  const isLeft = cat => pairing.left.includes(cat);

  // honor items
  const honorItems = repeatSample(HONOR, N_COMBINED_TARGET).map(w => ({
    stimulus: `<div class="big">${w}</div>`,
    category: 'honor',
    key: isLeft('honor') ? 'left' : 'right'
  }));

  // collective items
  const collItems = repeatSample(COLLECTIVE, N_COMBINED_ATTR/2).map(w => ({
    stimulus: `<div class="big">${w}</div>`,
    category: 'collective',
    key: isLeft('collective') ? 'left' : 'right'

