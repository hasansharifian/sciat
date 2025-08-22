define(['pipAPI', 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/stiat/qualtrics/qstiat6.js'], function(APIConstructor, stiatExtension){

	var API = new APIConstructor();
		  return stiatExtension({
		  category : { 
		    name : 'Asian People', //Will appear in the data.
		    title : {
		      media : {word : 'Asian People'}, //Name of the category presented in the task.
		      css : {color:'#31b404','font-size':'2em'}, //Style of the category title.
		      height : 7 //Used to position the "Or" in the combined block.
		    }, 
		    media : [ //Stimuli content as PIP's media objects
    		   	{image : 'af00004.png'}, 
        		{image : 'af00012.png'}, 
        		{image : 'af00007.png'},
			    {image : 'am00008.png'},
			    {image : 'am00009.png'},
			    {image : 'am00002.png'}
		    ], 
		    //Stimulus css (style)
		    css : {color:'#31b404','font-size':'3em'}
		  },	

  		attribute1 : 
			{
			name : 'Bad', //Attribute label
			title : {
				media : {word : 'Bad'}, //Name of the category presented in the task.
				css : {color:'#31b404','font-size':'2em'}, //Style of the category title.
				height : 7 //Used to position the "Or" in the combined block.
			}, 
			media : [ //Stimuli
				{word: 'Angry'},
				{word: 'Despise'},
				{word: 'Disgust'},
				{word: 'Gross'},
				{word: 'Horrific'},
				{word: 'Negative'},
				{word: 'Sadness'},
        {word: 'Tragic'}
			], 
			//Can change color and size of the targets here.
			css : {color:'#31b404','font-size':'3em'}
			},
		attribute2 : 
			{
			name : 'Good', //Attribute label
			title : {
				media : {word : 'Good'}, //Name of the category presented in the task.
				css : {color:'#31b404','font-size':'2em'}, //Style of the category title.
				height : 7 //Used to position the "Or" in the combined block.
			}, 
			media : [ //Stimuli
				{word: 'Appealing'},
				{word: 'Cheer'},
				{word: 'Delightful'},
				{word: 'Fabulous'},
				{word: 'Glad'},
				{word: 'Joyous'},
				{word: 'Magnificent'},
				{word: 'Spectacular'}
			], 
			//Can change color and size of the targets here.
			css : {color:'#31b404','font-size':'3em'}
			},

  base_url : {//Where are your images at?
    image : 'https://satchmo496.github.io/images/'
  }}
  );
  });
