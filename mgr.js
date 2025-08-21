define(function(require){
    var API = new require('managerAPI')();

    API.addSettings('skip', true);

    API.addTasksSet({
        stiat: [{
            type: 'time',
            name: 'stiat',
            scriptUrl: 'stiat.js'
        }]
    });

    API.addSequence([
        {inherit: 'stiat'}
    ]);

    return API.script;
});
