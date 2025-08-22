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
  }));

  // singular items
  const singItems = repeatSample(SINGULAR, N_COMBINED_ATTR/2).map(w => ({
    stimulus: `<div class="big">${w}</div>`,
    category: 'singular',
    key: isLeft('singular') ? 'left' : 'right'
  }));

  return jsPsych.randomization.shuffle([...honorItems, ...collItems, ...singItems]);
}

function labelsHTML(leftLabels, rightLabels) {
  // leftLabels and rightLabels are arrays of strings
  const left  = leftLabels.map(s => `<div>${s}</div>`).join('');
  const right = rightLabels.map(s => `<div>${s}</div>`).join('');
  return `
    <div class="labels">
      <div class="left-labels"><b>${left}</b></div>
      <div class="right-labels"><b>${right}</b></div>
    </div>
  `;
}

// ====== Blocks ======
// Pairings
const pairingA = { // congruent under Honor with Collective
  left:  ['collective','honor'],
  right: ['singular'],
  leftLabel:  ['Collective','Honor'],
  rightLabel: ['Singular'],
  tag: 'A'
};

const pairingB = { // incongruent
  left:  ['singular'],
  right: ['collective','honor'],
  leftLabel:  ['Singular'],
  rightLabel: ['Collective','Honor'],
  tag: 'B'
};

// Instruction text
function instr(text) {
  return {
    type: jsPsychInstructions,
    pages: [ `<div style="max-width:800px;margin:40px auto;text-align:left;">
      ${text}
      <p><br><b>Keys</b>  Press <b>${LEFT_KEY.toUpperCase()}</b> for the left categories and <b>${RIGHT_KEY.toUpperCase()}</b> for the right categories.</p>
      <p>Go fast while staying accurate. If you choose the wrong key, a red X will appear. Press the correct key to continue.</p>
      <p>Press Next to begin.</p>
    </div>` ],
    show_clickable_nav: true,
    allow_backward: false,
  };
}

// Trial template
function iatTrial(blockName, pairing) {
  return {
    timeline: [{
      type: jsPsychIatHtml,
      stimulus: jsPsych.timelineVariable('stimulus'),
      stim_key_association: jsPsych.timelineVariable('key'),
      html_when_wrong: '<span style="color:red; font-size:80px">X</span>',
      bottom_instructions: labelsHTML(pairing.leftLabel, pairing.rightLabel),
      force_correct_key_press: true,
      display_feedback: true,
      left_category_key: LEFT_KEY,
      right_category_key: RIGHT_KEY,
      left_category_label: pairing.leftLabel,
      right_category_label: pairing.rightLabel,
      response_ends_trial: true,
      data: {
        block: blockName,
        pairing: pairing.tag,
        category: jsPsych.timelineVariable('category')
      }
    }],
    timeline_variables: [], // fill per block
    randomize_order: false
  };
}

// Practice blocks (attribute only)
const practiceA_vars = buildTimelineVars_Practice({left:['collective'], right:['singular']});
const practiceB_vars = buildTimelineVars_Practice({left:['singular'], right:['collective']});

const practiceA = iatTrial('practice_attr_A', pairingA);
practiceA.timeline_variables = practiceA_vars;

const practiceB = iatTrial('practice_attr_B', pairingB);
practiceB.timeline_variables = practiceB_vars;

// Combined blocks
const combinedA_vars = buildTimelineVars_Combined(pairingA);
const combinedB_vars = buildTimelineVars_Combined(pairingB);

const combinedA = iatTrial('combined_A', pairingA);
combinedA.timeline_variables = combinedA_vars;

const combinedB = iatTrial('combined_B', pairingB);
combinedB.timeline_variables = combinedB_vars;

// ====== Scoring ======
function compute_sciat_D() {
  // Filter combined blocks only
  const all = jsPsych.data.get().filter(d => d.block === 'combined_A' || d.block === 'combined_B');

  // Copy rows and apply error penalty
  const rows = all.values().map(r => {
    const rt = r.correct ? r.rt : r.rt + ERROR_PENALTY_MS;
    return {block: r.block, rt: rt, correct: r.correct};
  }).filter(r => r.rt >= MIN_RT && r.rt <= MAX_RT);

  function mean(arr) { return arr.reduce((a,b)=>a+b,0) / arr.length; }
  function sd(arr) {
    const m = mean(arr);
    const v = mean(arr.map(x => (x-m)*(x-m)));
    return Math.sqrt(v);
  }

  const rtsA = rows.filter(r => r.block === 'combined_A').map(r=>r.rt);
  const rtsB = rows.filter(r => r.block === 'combined_B').map(r=>r.rt);

  const meanA = mean(rtsA);
  const meanB = mean(rtsB);
  const sdPooled = sd(rows.map(r=>r.rt));

  // Decide which block is congruent based on the mapping you designed
  // Here, pairing A is Honor + Collective, which we call congruent by default
  const meanCongruent   = meanA;
  const meanIncongruent = meanB;

  const D = (meanIncongruent - meanCongruent) / sdPooled;
  return {
    D,
    meanCongruent,
    meanIncongruent,
    nA: rtsA.length,
    nB: rtsB.length
  };
}

// Final screen with score and download
const finishScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    const res = compute_sciat_D();
    const dRounded = Math.round(res.D * 1000) / 1000;
    const text = `
      <div style="max-width:800px;margin:40px auto;text-align:left;">
        <h2>Finished</h2>
        <p><b>D score</b> = <b>${dRounded}</b></p>
        <p>Positive values mean faster responses when Honor and Collective shared a key than when Honor and Singular shared a key.</p>
        <p>Mean RT congruent: ${Math.round(res.meanCongruent)} ms  |  Mean RT incongruent: ${Math.round(res.meanIncongruent)} ms</p>
        <p>Trials kept after trimming: A = ${res.nA}, B = ${res.nB}</p>
        <p>You can download your data as CSV.</p>
      </div>
    `;
    return text;
  },
  choices: ['Download CSV','End'],
  on_finish: function(data){
    if (data.response === 0) {
      jsPsych.data.get().localSave('csv','sciat_data.csv');
    }
  }
};

// ====== Timeline order ======
const timeline = [];

// Welcome
timeline.push(instr(`
  <h2>Welcome</h2>
  <p>This task measures how quickly you sort words that relate to Honor, Collective, and Singular concepts.</p>
`));

// Practice and combined blocks, counterbalanced
if (order === 'A_first') {
  timeline.push(instr(`<h3>Practice</h3><p>Practice sorting Collective vs Singular.</p>`));
  timeline.push(practiceA);

  timeline.push(instr(`
    <h3>Combined Block</h3>
    <p>Honor and Collective share the left key. Singular uses the right key.</p>
  `));
  timeline.push(combinedA);

  timeline.push(instr(`<h3>Practice</h3><p>Now practice the reversed mapping.</p>`));
  timeline.push(practiceB);

  timeline.push(instr(`
    <h3>Combined Block</h3>
    <p>Singular uses the left key. Honor and Collective share the right key.</p>
  `));
  timeline.push(combinedB);

} else {
  timeline.push(instr(`<h3>Practice</h3><p>Practice sorting Singular vs Collective.</p>`));
  timeline.push(practiceB);

  timeline.push(instr(`
    <h3>Combined Block</h3>
    <p>Singular uses the left key. Honor and Collective share the right key.</p>
  `));
  timeline.push(combinedB);

  timeline.push(instr(`<h3>Practice</h3><p>Now practice the reversed mapping.</p>`));
  timeline.push(practiceA);

  timeline.push(instr(`
    <h3>Combined Block</h3>
    <p>Honor and Collective share the left key. Singular uses the right key.</p>
  `));
  timeline.push(combinedA);
}

// Finish
timeline.push(finishScreen);

// Run
jsPsych.run(timeline);

