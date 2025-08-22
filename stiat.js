// ====== Setup ======
var jsPsych = initJsPsych({
  display_element: 'jspsych-target'
});

const LEFT_KEY  = 'e';
const RIGHT_KEY = 'i';

// ====== Stimuli ======
const HONOR = ['Helpful','Honest','Respectable','Valued','Proud','Confident'];
const COLLECTIVE = ['We','Us','Our','Ours','Family','Community'];
const SINGULAR   = ['I','Me','Mine','Myself','Self','Individual'];

const N_PRACTICE_ATTR   = 24;
const N_COMBINED_TARGET = 20;
const N_COMBINED_ATTR   = 40;
const ERROR_PENALTY_MS  = 400;
const MIN_RT            = 350;
const MAX_RT            = 10000;

// ====== Helpers ======
function makeBalancedNoRepeat(list, nTotal) {
  const k = list.length;
  if (k === 0 || nTotal <= 0) return [];
  const base = Math.floor(nTotal / k);
  const rem  = nTotal % k;
  const counts = list.map((_, i) => base + (i < rem ? 1 : 0));

  const seq = [];
  let last = null;
  for (let t = 0; t < nTotal; t++) {
    let bestIdx = -1;
    let bestCount = -1;
    for (let i = 0; i < k; i++) {
      if (counts[i] > 0 && list[i] !== last && counts[i] > bestCount) {
        bestCount = counts[i];
        bestIdx = i;
      }
    }
    if (bestIdx === -1) {
      for (let i = 0; i < k; i++) if (counts[i] > 0) { bestIdx = i; break; }
    }
    seq.push(list[bestIdx]);
    counts[bestIdx]--;
    last = list[bestIdx];
  }
  return seq;
}
function fixImmediateRepeats(items, keyFn) {
  for (let i = 1; i < items.length; i++) {
    if (keyFn(items[i]) === keyFn(items[i-1])) {
      for (let j = i + 1; j < items.length; j++) {
        if (keyFn(items[j]) !== keyFn(items[i-1])) {
          const tmp = items[i];
          items[i] = items[j];
          items[j] = tmp;
          break;
        }
      }
    }
  }
  return items;
}
function labelsHTML(leftLabels, rightLabels) {
  const left  = leftLabels.map(s => `<div>${s}</div>`).join('');
  const right = rightLabels.map(s => `<div>${s}</div>`).join('');
  return `
    <div class="labels">
      <div class="left-labels"><b>${left}</b></div>
      <div class="right-labels"><b>${right}</b></div>
    </div>`;
}

// ====== Blocks ======
const pairingA = { left: ['collective','honor'], right: ['singular'],
                   leftLabel: ['Collective','Honor'], rightLabel: ['Singular'], tag: 'A' };
const pairingB = { left: ['singular'], right: ['collective','honor'],
                   leftLabel: ['Singular'], rightLabel: ['Collective','Honor'], tag: 'B' };

function buildPracticeVars(pairing) {
  const leftCat  = pairing.left[0];
  const rightCat = pairing.right[0];
  const leftList  = leftCat === 'collective' ? COLLECTIVE : SINGULAR;
  const rightList = rightCat === 'collective' ? COLLECTIVE : SINGULAR;
  const leftWords  = makeBalancedNoRepeat(leftList,  N_PRACTICE_ATTR/2);
  const rightWords = makeBalancedNoRepeat(rightList, N_PRACTICE_ATTR/2);
  const leftItems  = leftWords.map(w => ({stimulus:`<div class="big">${w}</div>`, category:leftCat, key:'left'}));
  const rightItems = rightWords.map(w => ({stimulus:`<div class="big">${w}</div>`, category:rightCat, key:'right'}));
  return fixImmediateRepeats(jsPsych.randomization.shuffle([...leftItems, ...rightItems]), it => it.stimulus);
}
function buildCombinedVars(pairing) {
  const isLeft = cat => pairing.left.includes(cat);
  const honorSeq = makeBalancedNoRepeat(HONOR, N_COMBINED_TARGET).map(w => ({
    stimulus:`<div class="big">${w}</div>`, category:'honor', key: isLeft('honor')?'left':'right'
  }));
  const collSeq = makeBalancedNoRepeat(COLLECTIVE, N_COMBINED_ATTR/2).map(w => ({
    stimulus:`<div class="big">${w}</div>`, category:'collective', key: isLeft('collective')?'left':'right'
  }));
  const singSeq = makeBalancedNoRepeat(SINGULAR, N_COMBINED_ATTR/2).map(w => ({
    stimulus:`<div class="big">${w}</div>`, category:'singular', key: isLeft('singular')?'left':'right'
  }));
  return fixImmediateRepeats(jsPsych.randomization.shuffle([...honorSeq, ...collSeq, ...singSeq]), it => it.stimulus);
}

function iatTrial(blockName, pairing, vars) {
  return {
    timeline: [{
      type: jsPsychIatHtml,
      stimulus: jsPsych.timelineVariable('stimulus'),
      stim_key_association: jsPsych.timelineVariable('key'), // 'left' or 'right'
      html_when_wrong: '<div style="color:red; font-size:100px;">✖</div>',
      display_feedback: true,
      force_correct_key_press: true,
      left_category_key: LEFT_KEY,
      right_category_key: RIGHT_KEY,
      left_category_label: pairing.leftLabel,
      right_category_label: pairing.rightLabel,
      response_ends_trial: true,
      bottom_instructions: labelsHTML(pairing.leftLabel, pairing.rightLabel),
      data: { block: blockName, pairing: pairing.tag, category: jsPsych.timelineVariable('category') }
    }],
    timeline_variables: vars
  };
}

// ====== Instructions helper ======
function instr(text) {
  return {
    type: jsPsychInstructions,
    pages: [ `<div style="max-width:800px;margin:40px auto;text-align:left;">${text}</div>` ],
    show_clickable_nav: true,
    allow_backward: false
  };
}

// ====== Scoring ======
function compute_sciat_D() {
  const all = jsPsych.data.get().filter(d => d.block==='combined_A'||d.block==='combined_B');
  const rows = all.values().map(r => {
    const rt = r.correct ? r.rt : r.rt + ERROR_PENALTY_MS;
    return {block:r.block, rt:rt, correct:r.correct};
  }).filter(r => r.rt>=MIN_RT && r.rt<=MAX_RT);
  function mean(a){return a.reduce((x,y)=>x+y,0)/a.length;}
  function sd(a){const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)*(x-m))));}
  const rtsA = rows.filter(r=>r.block==='combined_A').map(r=>r.rt);
  const rtsB = rows.filter(r=>r.block==='combined_B').map(r=>r.rt);
  const meanA = mean(rtsA); const meanB = mean(rtsB);
  const sdPooled = sd(rows.map(r=>r.rt));
  return {D:(meanB-meanA)/sdPooled, meanA, meanB, nA:rtsA.length, nB:rtsB.length};
}

// ====== Finish screen ======
const finishScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    const res = compute_sciat_D();
    return `
      <div style="max-width:800px;margin:40px auto;text-align:left;">
        <h2>Finished</h2>
        <p><b>D score</b> = ${res.D.toFixed(3)}</p>
        <p>Mean RT congruent: ${Math.round(res.meanA)} ms | Mean RT incongruent: ${Math.round(res.meanB)} ms</p>
        <p>Trials kept: A=${res.nA}, B=${res.nB}</p>
      </div>`;
  },
  choices: ['Download CSV','End'],
  on_finish: function(data){
    if (data.response === 0) jsPsych.data.get().localSave('csv','sciat_data.csv');
  }
};

// ====== Timeline ======
const order = jsPsych.randomization.sampleWithoutReplacement(['A_first','B_first'],1)[0];
const timeline = [];
timeline.push(instr('<h2>Welcome</h2><p>This task measures associations of Honor with Collective vs Singular.</p>'));

if(order==='A_first'){
  timeline.push(instr('Practice sorting Collective vs Singular.'));
  timeline.push(iatTrial('practice_A', pairingA, buildPracticeVars(pairingA)));
  timeline.push(instr('Now Honor+Collective on the left, Singular on the right.'));
  timeline.push(iatTrial('combined_A', pairingA, buildCombinedVars(pairingA)));
  timeline.push(instr('Practice with the reversed mapping.'));
  timeline.push(iatTrial('practice_B', pairingB, buildPracticeVars(pairingB)));
  timeline.push(instr('Now Singular on the left, Honor+Collective on the right.'));
  timeline.push(iatTrial('combined_B', pairingB, buildCombinedVars(pairingB)));
}else{
  timeline.push(instr('Practice sorting Singular vs Collective.'));
  timeline.push(iatTrial('practice_B', pairingB, buildPracticeVars(pairingB)));
  timeline.push(instr('Now Singular on the left, Honor+Collective on the right.'));
  timeline.push(iatTrial('combined_B', pairingB, buildCombinedVars(pairingB)));
  timeline.push(instr('Practice with the reversed mapping.'));
  timeline.push(iatTrial('practice_A', pairingA, buildPracticeVars(pairingA)));
  timeline.push(instr('Now Honor+Collective on the left, Singular on the right.'));
  timeline.push(iatTrial('combined_A', pairingA, buildCombinedVars(pairingA)));
}

timeline.push(finishScreen);
jsPsych.run(timeline);
