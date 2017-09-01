app.service('DataService', ['$rootScope', function ($rootScope) {
	var sheetId = '19OIsTc_rxylCoqq2JOIFwx3avsl-lQeqd4VD_NzrmBU';
	var progress = 0;
	var characters = null;
	var enemies = null;
	var map, characterData, enemyData, itemIndex, skillIndex, statusIndex, traitIndex, supportIndex, supportBonuses;
	
	this.getCharacters = function(){ return characters; };
	this.getMap = function(){ return map; };
	this.getSupportIndex = function(){ return supportIndex; };
	this.getSupportBonuses = function(){ return supportBonuses; };

	this.loadMapData = function(){ fetchMapUrl(); };
	
	//\\//\\//\\//\\//\\//
	// DATA AJAX CALLS  //
	//\\//\\//\\//\\//\\//

	function fetchMapUrl() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "COLUMNS",
		valueRenderOption: "FORMULA",
        range: 'Management!A2:A2',
      }).then(function(response) {
		 map = response.result.values[0][0];
		 if(map != "") map = map.substring(8, map.length-2);
    	 updateProgressBar();
    	 fetchCharacterData();
      });
    };

    function fetchCharacterData() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "COLUMNS",
        range: 'Player Stats!B:ZZ',
      }).then(function(response) {
    	 characterData = response.result.values;
		 characterData.splice(characterData.length-2, 2);
    	 updateProgressBar();
    	 fetchCharacterImages();
      });
    };
    
    function fetchCharacterImages() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "ROWS",
          valueRenderOption: "FORMULA",
          range: 'Player Stats!B3:ZZ3',
        }).then(function(response) {
      	 var images = response.result.values[0];
      	 for(var i = 0; i < images.length; i++)
		   if(characterData[i][0] != "")
      		 characterData[i][2] = processImageURL(images[i]);
      	 updateProgressBar();
      	 fetchEnemyData();
        });
      };
      
    function fetchEnemyData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            range: 'Enemy Stats!B:ZZ',
          }).then(function(response) {
        	 enemyData = response.result.values;
        	 updateProgressBar();
        	 fetchEnemyImages();
          });
    };
    
    function fetchEnemyImages() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "ROWS",
          valueRenderOption: "FORMULA",
          range: 'Enemy Stats!B3:ZZ3',
        }).then(function(response) {
      	 var images = response.result.values[0];
      	 for(var i = 0; i < images.length; i++)
      		enemyData[i][2] = processImageURL(images[i]);
      	 updateProgressBar();
      	 fetchSkillData();
        });
      };
    
    function fetchSkillData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Skills!A:C',
        }).then(function(response) {
        	skillIndex = response.result.values;
        	updateProgressBar();
        	fetchItemData();
        });
    };
    
    function fetchItemData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Weapon Index!A:K',
          }).then(function(response) {
        	 itemIndex = response.result.values;
        	 updateProgressBar();
        	 fetchStatusData();
          });
    };

	function fetchStatusData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Status Effects!A:D',
          }).then(function(response) {
        	 statusIndex = response.result.values;
        	 updateProgressBar();
        	 fetchTraitData();
          });
    };

	function fetchTraitData(){
		gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Traits!A:C',
          }).then(function(response) {
        	 traitIndex = response.result.values;
        	 updateProgressBar();
        	 fetchSupportRanks();
          });
	};

	function fetchSupportRanks(){
		gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Support Data!A:P',
          }).then(function(response) {
        	 var data = response.result.values;
			 var colHeader = data[0];
			 data.splice(0,1);
			 supportIndex = {};

			 //Process support matrix
			 for(var row in data){
				 var temp = {};
				 for(var i = 1; i < data[row].length; i++){
					temp[colHeader[i]] = data[row][i];
				 }
				 supportIndex[data[row][0]] = temp;
			 }

        	 updateProgressBar();
        	 fetchSupportBonuses();
          });
	};
    
	function fetchSupportBonuses(){
		gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Support Bonuses!A:L',
          }).then(function(response) {
        	 var data = response.result.values;
			 var colHeader = data[0];
			 data.splice(0,1);
			 supportBonuses = {};

			 //Process support matrix
			 for(var row in data){
				 var temp = {};
				 for(var i = 1; i < data[row].length; i++){
					temp[colHeader[i]] = data[row][i];
				 }
				 supportBonuses[data[row][0]] = temp;
			 }

        	 updateProgressBar();
        	 processCharacters();
          });
	};

    function processCharacters(){
		characters = {};
    	for(var i = 0; i < characterData.length; i++){
    		var c = characterData[i];
			if(c[0] != ""){ //if character has a name
				var currObj = {
					'name'   : c[0],
					'player' : c[1],
					'spriteUrl' : c[2],
					'class'  : c[3],
					'maxHp'  : c[4],
					'currHp' : c[5],
					'Str' : c[6],
					'Mag' : c[7],
					'Skl' : c[8],
					'Spd' : c[9],
					'Lck' : c[10],
					'Def' : c[11],
					'Res' : c[12],
					'Mov' : c[13],
					'lvl' : c[14],
					'exp' : c[15],
					'skills' : {},
					'inventory' : {},
					'trait' : getTrait(c[27]),
					'wallet' : {
						'Harts' : c[29],
						'Chips' : c[30],
						'Doles' : c[31],
						'Vults' : c[32],
						'Maars' : c[33],
						'Buckskins' : c[34],
					},
					'statusEffect' : getStatusEffect(c[36]),
					'turnsLeft' : c[37],
					'moved'     : c[38],
					'position'  : c[39],
					'weaponRanks' : {
						'w1' : {
						'class' : c[45],
						'rank'  : (c[41] != "-" ? c[41].charAt(0) : ""),
						'exp'   : c[46]
						},
						'w2' : {
						'class' : c[47],
						'rank'  : (c[42] != "-" ? c[42].charAt(0) : ""),
						'exp'   : c[48]
						},
						'w3' : {
						'class' : c[49],
						'rank'  : (c[43] != "-" ? c[43].charAt(0) : ""),
						'exp'   : c[50]
						}
					},
					'baseHp'  : c[68],
					'baseStr' : c[69],
					'baseMag' : c[70],
					'baseSkl' : c[71],
					'baseSpd' : c[72],
					'baseLck' : c[73],
					'baseDef' : c[74],
					'baseRes' : c[75],
					'baseCon' : c[76],
					'baseMov' : c[77]
				};
				
				//Match skills
				for(var j = 16; j < 22; j++)
					currObj.skills["skl_" + (j-15)] = getSkill(c[j]);

				//Match inventory
				for(var k = 22; k < 27; k++)
					currObj.inventory["itm_" + (k-21)] = getItem(c[k]);

				characters["char_" + i] = currObj;
			}
		}
    	updateProgressBar();
		processEnemies();
    };
    
    function processEnemies(){
    	for(var i = 0; i < enemyData.length; i++){
    		var e = enemyData[i];
			if(e[0] != ""){ //if character has a name
				var currObj = {
				'name'   : e[0],
				'affiliation' : e[1],
				'spriteUrl' : e[2],
				'class'  : e[3],
				'maxHp'  : e[4],
				'currHp' : e[5],
				'Str' : e[6],
				'Mag' : e[7],
				'Skl' : e[8],
				'Spd' : e[9],
				'Lck' : e[10],
				'Def' : e[11],
				'Res' : e[12],
				'Con' : e[13],
				'Mov' : e[14],
				'gold' : e[15],
				'lvl' : e[16],
				'exp' : e[17],
				'skills' : {},
				'inventory' : {},
				'trait' : getTrait(e[29]),
				'statusEffect' : getStatusEffect(e[31]),
				'turnsLeft' : e[32],
				'position'  : e[34],
				'weaponRanks' : {
					'w1' : {
						'class' : e[40],
						'rank'  : (e[36] != "-" ? e[36].charAt(0) : ""),
						'exp'   : e[41]
					},
					'w2' : {
						'class' : e[42],
						'rank'  : (e[37] != "-" ? e[37].charAt(0) : ""),
						'exp'   : e[43]
					},
					'w3' : {
						'class' : e[44],
						'rank'  : (e[38] != "-" ? e[38].charAt(0) : ""),
						'exp'   : e[45]
					}
				},
				'baseHp'  : e[63],
				'baseStr' : e[64],
				'baseMag' : e[65],
				'baseSkl' : e[66],
				'baseSpd' : e[67],
				'baseLck' : e[68],
				'baseDef' : e[69],
				'baseRes' : e[70],
				'baseCon' : e[71],
				'baseMov' : e[72]
				};

				//Match skills
				for(var j = 18; j < 24; j++)
					currObj.skills["skl_" + (j-17)] = getSkill(e[j]);
				
				//Match inventory
				for(var k = 24; k < 29; k++)
					currObj.inventory["itm_" + (k-23)] = getItem(e[k]);

				characters["enmy_" + i] = currObj;
			}
    	}

		updateProgressBar();
    };
    
    //\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
    function updateProgressBar(){
		if(progress < 100){
			progress = progress + 7.7; //13 calls
    		$rootScope.$broadcast('loading-bar-updated', progress);
		}
    };
    
    function processImageURL(str){
    	return str.substring(8, str.lastIndexOf(",")-1);
    };

	function getItem(name){
		var inv = findItem(name);
		return {
			'name' : name,
			'class' : inv[1],
			'rank' : inv[2],
			'uses' : inv[3],
			'might' : inv[4],
			'hit' : inv[5],
			'crit' : inv[6],
			'critMltpr' : inv[7],
			'dmgType' : inv[8],
			'range' : inv[9],
			'value' : inv[10],
			'desc' : (inv[11] != undefined ? inv[10] : "")
		};
	};

	function getSkill(name){
		var skl = findSkill(name);
		return {
			'name' : skl[0],
			'type' : skl[1],
			'desc' : skl[2]
		};
	};

	function getStatusEffect(name){
		var s = findStatus(name);
		return {
			'name' : s[0],
			'icon' : '',
			'desc' : s[2],
			'class' : (s[3] != undefined ? s[3] : '')
		}
	};

	function getTrait(name){
		var t = findTrait(name);
		return {
			'name' : t[0],
			'pro' : t[1],
			'con' : t[2]
		}
	};

	//\\//\\//\\//\\//\\//
	// SEARCH FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
    function findSkill(name){
    	if(name == undefined || name.length == 0)
    		return ["None", "N/A", "-"];
    	
    	for(var i = 0; i < skillIndex.length; i++){
    		if(skillIndex[i][0] == name)
    			return skillIndex[i];
    	}
    	
    	return [name, "-", "This skill could not be located. Is its name spelled correctly?"];
    };
    
    function findItem(name){
    	if(name == undefined || name.length == 0)
    		return ["", "None", "-", "0", "0", "0", "0", "0", "0", "0", ""];
    	
		if(name.indexOf("(") != -1){ 
			name = name.substring(0, name.indexOf("(")); 
			name = name.trim(); 
		}

    	for(var i = 0; i < itemIndex.length; i++){
    		if(itemIndex[i][0] == name)
    			return itemIndex[i];
    	}
    	
    	return [name, "Mystery", "E", "0", "0", "0", "0", "0", "0", "0", "This item could not be located. Is its name spelled correctly?"];
    };

	function findStatus(name){
		if(name == undefined || name.length == 0 || name == "None")
			return ["None", "", "No status.", ""];
		
		var status = null;
		for(var i = 0; i < statusIndex.length; i++)
			if(statusIndex[i][0] == name)
				return statusIndex[i];

		return [name, "", "This status could not be found.", ""];
	}

	function findTrait(name){
		if(name == undefined || name.length == 0 || name == "None")
			return ["None", "No positive", "No negative"];

		for(var i = 0; i < traitIndex.length; i++)
			if(traitIndex[i][0] == name)
				return traitIndex[i];

		return [name, "This trait could not be found.", ""]
	};

}]);
