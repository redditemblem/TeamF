app.service('DataService', ['$rootScope', function ($rootScope) {
	var sheetId = '19OIsTc_rxylCoqq2JOIFwx3avsl-lQeqd4VD_NzrmBU';
	var progress = 0;
	var characters = null;
	var enemies = null;
	var characterData, enemyData, itemIndex, skillIndex;
	
	this.getCharacters = function(){ return characters; };
	this.getEnemies = function(){ return enemies; };
	this.loadMapData = function(){ fetchCharacterData(); };
	
	//\\//\\//\\//\\//\\//
	// DATA AJAX CALLS  //
	//\\//\\//\\//\\//\\//

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
      	 for(var i = 0; i < characterData.length; i++)
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
      	 //var images = response.result.values[0];
      	 //for(var i = 0; i < enemyData.length; i++)
      		//enemyData[i][2] = processImageURL(images[i]);
      	 //updateProgressBar();
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
					'Con' : c[13],
					'Mov' : c[14],
					'lvl' : c[15],
					'exp' : c[16],
					'skills' : {},
					'inventory' : {},
					'wallet' : {
						'Harts' : c[29],
						'Chips' : c[30],
						'Doles' : c[31],
						'Vults' : c[32],
						'Maars' : c[33],
						'Buckskins' : c[34],
					},
					'statusEffect' : c[36],
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
				for(var j = 17; j < 23; j++){
					var skl = findSkill(c[j]);
					currObj.skills["skl_" + (j-16)] = {
							'name' : skl[0],
							'type' : skl[1],
							'desc' : skl[2]
					};
				}
				
				//Match inventory
				for(var k = 23; k < 28; k++){
					var inv = findItem(c[k]);
					currObj.inventory["itm_" + (k-22)] = {
							'name' : inv[0],
							'type' : inv[1],
							'rank' : inv[2],
							'uses' : inv[3],
							'might' : inv[4],
							'hit' : inv[5],
							'crit' : inv[6],
							'critMltpr' : inv[7],
							'range' : inv[8],
							'value' : inv[9],
							'desc' : inv[10] != undefined ? inv[10] : ""
					};
				}

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
				'affliation' : e[1],
				'spriteUrl' : 'https://fireemblemwiki.org/w/images/c/cc/Ma_3ds02_automaton_enemy.gif', //e[2],
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
				'statusEffect' : e[30],
				'turnsLeft' : e[31],
				'position'  : e[33],
				'weaponRanks' : {
					'w1' : {
						'class' : e[39],
						'rank'  : (e[35] != "-" ? e[35].charAt(0) : ""),
						'exp'   : e[40]
					},
					'w2' : {
						'class' : e[41],
						'rank'  : (e[36] != "-" ? e[36].charAt(0) : ""),
						'exp'   : e[42]
					},
					'w3' : {
						'class' : e[43],
						'rank'  : (e[37] != "-" ? e[37].charAt(0) : ""),
						'exp'   : e[44]
					}
				},
				'baseHp'  : e[62],
				'baseStr' : e[63],
				'baseMag' : e[64],
				'baseSkl' : e[65],
				'baseSpd' : e[66],
				'baseLck' : e[67],
				'baseDef' : e[68],
				'baseRes' : e[69],
				'baseCon' : e[70],
				'baseMov' : e[71]
				};

				//Match skills
				for(var j = 18; j < 24; j++){
					var skl = findSkill(e[j]);
					currObj.skills["skl_" + (j-17)] = {
							'name' : skl[0],
							'type' : skl[1],
							'desc' : skl[2]
					};
				}
				
				//Match inventory
				for(var k = 24; k < 29; k++){
					var inv = findItem(e[k]);
					currObj.inventory["itm_" + (k-23)] = {
							'name' : inv[0],
							'type' : inv[1],
							'rank' : inv[2],
							'uses' : inv[3],
							'might' : inv[4],
							'hit' : inv[5],
							'crit' : inv[6],
							'critMltpr' : inv[7],
							'range' : inv[8],
							'value' : inv[9],
							'desc' : inv[10] != undefined ? inv[10] : ""
					};
				}

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
			progress = progress + 15; //7 calls
    		$rootScope.$broadcast('loading-bar-updated', progress);
		}
    };
    
    function processImageURL(str){
    	return str.substring(8, str.lastIndexOf(",")-1);
    };
    
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
    	
    	for(var i = 0; i < itemIndex.length; i++){
    		if(itemIndex[i][0] == name)
    			return itemIndex[i];
    	}
    	
    	return [name, "Mystery", "E", "0", "0", "0", "0", "0", "0", "0", "This item could not be located. Is its name spelled correctly?"];
    };

}]);