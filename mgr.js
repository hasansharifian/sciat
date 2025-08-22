define(['pipAPI', 'stiat.js'], function(APIConstructor, stiatExtension){

    var API = new APIConstructor();
    var global = API.getGlobal();

    return stiatExtension({

        // Example config — replace with your real categories/attributes
        category: {
            name: 'Black people',
            title: {
                media: {word: 'Black people'},
                css: {color:'#31940F','font-size':'2em'},
                height: 7
            },
            stimulusMedia: [
                {word: 'Jamal'},
                {word: 'Lakisha'},
                {word: 'Tyrone'},
                {word: 'Shanice'}
            ],
            stimulusCss: {color:'#31940F','font-size':'2em'}
        },

        attribute1: {
            name: 'Positive',
            title: {
                media: {word: 'Positive'},
                css: {color:'#0000FF','font-size':'2em'},
                height: 7
            },
            stimulusMedia: [
                {word: 'Joy'},
                {word: 'Love'},
                {word: 'Peace'},
                {word: 'Wonderful'}
            ],
            stimulusCss: {color:'#0000FF','font-size':'2em'}
        },

        attribute2: {
            name: 'Negative',
            title: {
                media: {word: 'Negative'},
                css: {color:'#FF0000','font-size':'2em'},
                height: 7
            },
            stimulusMedia: [
                {word: 'Horrible'},
                {word: 'Evil'},
                {word: 'Failure'},
                {word: 'Terrible'}
            ],
            stimulusCss: {color:'#FF0000','font-size':'2em'}
        }
    });
});

