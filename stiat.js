var jsPsych = initJsPsych({
  display_element: 'jspsych-target',
  on_finish: function() {
    jsPsych.data.displayData();
  }
});

var timeline = [];

// Example SC-IAT trial
var iat_trial = {
  type: jsPsychIatHtml, 
  stimulus: '<p style="font-size:2em;">HONOR</p>',
  stim_key_association: 'left',
  left_category_label: ['Collective'],
  right_category_label: ['Singular'],
  html_when_wrong: '<span style="color:red; font-size:2em;">X</span>',
  response_ends_trial: true
};

timeline.push(iat_trial);

jsPsych.run(timeline);

