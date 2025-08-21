define(function(require){
    var API = new require('managerAPI')();

    API.addSettings('skip', true); // Skip the loading screen

    API.addTasksSet({
        sciat: [{
            type: 'time',
            name: 'sciat',
            scriptUrl: 'stiat.js'  // Make sure this matches your filename
        }]
    });

    API.addSequence([
        {inherit: 'sciat'}
    ]);

    return API.script;
});
