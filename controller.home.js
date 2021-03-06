app.controller('HomeCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
	var onLoad = checkData();
	$scope.rows = ["1"];
    $scope.columns = ["1"];
	$scope.statsList = [
	                ["Str", "Strength. Affects damage the unit deals with physical attacks.",    "215px", "200px"],
	                ["Mag", "Magic. Affects damage the unit deals with magical attacks.",        "240px", "200px"],
	                ["Skl", "Skill. Affects hit rate and the frequency of critical hits.",       "265px", "200px"],
	                ["Spd", "Speed. Affects Avo. Unit strikes twice if 4 higher than opponent.", "290px", "200px"],
	                ["Lck", "Luck. Has various effects. Lowers risk of enemy criticals.",        "215px", "315px"],
	                ["Def", "Defense. Reduces damage from physical attacks.",                    "240px", "315px"],
	                ["Res", "Resistance. Reduces damage from physical attacks.",                 "265px", "315px"],
					["Mov", "Movement. Affects how many blocks a unit can move in a turn.",      "290px", "315px"]
	               ];
	
	//Interval timers
    var rowTimer = $interval(calcNumRows, 250, 20); //attempt to get rows 20 times at 250 ms intervals (total run: 5 sec)
    var colTimer = $interval(calcNumColumns, 250, 20);
    var dragNDrop = $interval(initializeListeners, 250, 20);
    
    //Positioning constants
    const statVerticalPos = ["10px", "39px", "68px", "97px", "126px", "155px", "184px"];
    const weaponVerticalPos = ["10px", "45px", "80px", "115px", "150px"];
    const weaponRankHorzPos = ["15px", "85px", "155px"];
    const weaponDescVerticalPos = ["10px", "35px", "60px", "85px", "105px"];
    const skillVerticalPos = ["10px", "45px", "80px", "115px", "150px", "185px", "220px"];
    const skillDescVerticalPos = ["5px", "15px", "22px", "29px", "36px", "43px", "50px", "57px", "63px"];
    
    const eSkillHorzPos = ["3px", "24px", "45px", "66px", "87px", "108px", "129px", "150px", "171px"];
    const eStatVerticalPos = ["5px", "29px", "53px", "77px", "101px", "125px", "149px"];
    const eWeaponVerticalPos = ["5px", "34px", "63px", "92px", "121px"];
    const eWpnRankHorzPos = ["297px", "364px", "431px"];
    const eSklDescHorzPos = ["5px", "26px", "47px", "68px", "89px", "110px", "131px", "150px", "169px"];
    const eWpnDescVerticalPos = ["5px", "20px", "40px", "55px", "65px"];
    
    //Constants
	const DEFAULT_NAMETAG_COLOR = "#4a5d23";
    const STAT_DEFAULT_COLOR = "#E5C68D";
    const STAT_BUFF_COLOR = "#42adf4";
    const STAT_DEBUFF_COLOR = "#960000";
    
    //Reroutes the user if they haven't logged into the app
    //Loads data from the DataService if they have
    function checkData(){
    	if(DataService.getCharacters() == null)
    		$location.path('/');
    	else{
    		$scope.charaData = DataService.getCharacters();
			$scope.mapUrl = DataService.getMap();
    	}
    };
    
    //*************************\\
    // FUNCTIONS FOR MAP TILE  \\
    // GLOW BOXES              \\
    //*************************\\
    
	const boxWidth = 30;
	const gridWidth = 1;

    /* Using the height of the map image, calculates the number of tiles tall
     * the map is and returns a subsection of the rowNames array of that size.
     * Called every 250 ms for the first 5 seconds the app is open.
     */
    function calcNumRows(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var height = map.naturalHeight; //calculate the height of the map
        	
        	height -= boxWidth;
        	height = height / (boxWidth + gridWidth);
        	var temp = [];
			for(var i = 0; i < height; i++)
				temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(rowTimer); //cancel $interval timer
        		$scope.rows = temp;
        	}
    	}
    };
    
   /* Using the width of the map image, calculates the number of tiles wide
    * the map is and returns an array of that size.
    * Called every 250 ms for the first 5 seconds the app is open.
    */
   function calcNumColumns(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var width = map.naturalWidth; //calculate the height of the map
        	
        	width -= boxWidth;
        	width = width / (boxWidth + gridWidth);
        	var temp = [];
        	
        	for(var i = 0; i < width; i++)
        		temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(colTimer); //cancel $interval timer
        		$scope.columns = temp;
        	}
    	}
    };
    
    //Returns the vertical position of a glowBox element
    $scope.determineGlowY = function(index){
    	return (index * (boxWidth + (gridWidth * 2)) + 1) + "px";
    };
    
    //Returns the horizontal position of a glowBox element
    $scope.determineGlowX = function(index){
    	return (index * (boxWidth + (gridWidth * 2)) + 1) + "px";
    };
    
    //*************************\\
    // FUNCTIONS FOR MAP       \\
    // CHARACTERS/SPRITES      \\
    //*************************\\
    
    //Toggles character/enemy information box
    $scope.displayData = function(char){
    	var bool = $scope[char + "_displayBox"];
    	if(bool == undefined || bool == false){
    		positionCharBox(char);
    		$scope[char + "_displayBox"] = true;
    	}else{
    		$scope[char + "_displayBox"] = false;
    	}
    };
    
    $scope.removeData = function(index){
    	$scope[index + "_displayBox"] = false;
    };
    
    $scope.checkCharToggle = function(index){
    	return $scope[index + "_displayBox"] == true;
    };
    
    $scope.isPaired = function(pos){
    	return pos != undefined && pos.indexOf("(") > -1;
    };

    $scope.textTooLong = function(textA, textB){
	return (textA.length + textB.length) > 150;
    };
	// This was added in from Team E's doc.
    
    //Returns the image URL for the unit in the back of a pairup
    //0 = charaData, 1 = enemyData
    $scope.getPairUnitIcon = function(pair){
		var pairName = pair.substring(pair.indexOf("(")+1, pair.indexOf(")"));
    	var pairedUnit = locatePairedUnit(pairName).unit;
    	return pairedUnit.spriteUrl;
    };
    
    //Switches char info box to show the stats of the paired unit
    //Triggered when char info box "Switch to Paired Unit" button is clicked
    $scope.findPairUpChar = function(char){
    	var clickedChar = $scope.charaData[char];
		var pairedUnitName = clickedChar.position.substring(clickedChar.position.indexOf("(")+1, clickedChar.position.indexOf(")"));
    	var pairedUnit = locatePairedUnit(pairedUnitName);
		pairedUnit.paired = true;
    	
    	//Toggle visibility
    	$scope[char + "_displayBox"] = false;
    	$scope[pairedUnit.unitLoc + "_displayBox"] = true;
    	
		//var currEnemy = document.getElementById(char);
    	var currBox = document.getElementById(char + '_box');
    	var pairBox = document.getElementById(pairedUnit.unitLoc + '_box');
    
		pairBox.style.top = currBox.offsetTop + 'px';
    	pairBox.style.left = currBox.offsetLeft + 'px';
    };
    
    function locatePairedUnit(unitName){
		var pairedUnit = {};
    	var charPos = "";

    	//Find paired unit
    	for(var char in $scope.charaData){
    		if($scope.charaData[char].name == unitName){
				pairedUnit = $scope.charaData[char];
				charPos = char;
				break;
			}		
    	}
    	
    	return { 'unit': pairedUnit, 'unitLoc' : charPos };
    };
    
    //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns that number
   //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns that number
    $scope.getEnemyNum = function(name){
    	if(name.lastIndexOf(" ") == -1 || name == undefined)
    		return "";
    	name = name.substring(name.lastIndexOf(" "), name.length);
		name = name.trim();
		
    	if(name.match(/^[0-9]+$/) != null) return "IMG/NUM/num_" + name + ".png";
    	else return "";
    };
    
    $scope.validPosition = function(pos){
    	return pos.indexOf(",") != -1;
    };
    
    //Using a character's coordinates, calculates their horizontal
    //position on the map
    $scope.determineCharX = function(pos){
		if(pos == "Not Deployed")
			return "0px";
    	pos = pos.substring(0,pos.indexOf(",")); //grab first number
    	pos = parseInt(pos);
    	return ((pos - 1) * (boxWidth + (gridWidth * 2)) + 1) + "px";
    };
    
    //Using a character's coordinates, calculates their vertical
    //position on the map
    $scope.determineCharY = function(pos){
		if(pos == "Not Deployed")
			return "0px";
		pos = pos.substring(pos.indexOf(",")+1, pos.indexOf("(") != -1 ? pos.indexOf("(") : pos.length); //grab first char
		pos = pos.trim();
    	pos = parseInt(pos);
    	return ((pos - 1) * (boxWidth + (gridWidth * 2)) + 1) + "px";
    };

    //***********************\\
    // POSITION CALCULATIONS \\
    //***********************\\
    
    //Relocate the information box relative to the clicked char
    function positionCharBox(char){
		var sprite = document.getElementById(char);
        var box = document.getElementById(char + '_box');

        var x = sprite.style.left;
        var y = sprite.style.top;
        x = parseInt(x.substring(0, x.length - 2));
        y = parseInt(y.substring(0, y.length - 2));

        x = Math.min(x + ((gridWidth + boxWidth) * 2), (gridWidth + boxWidth) * ($scope.columns.length + 3));
        if (y <= 20) y = 20;

        box.style.left = x + 'px';
        box.style.top = y + 'px';
    };
    
    $scope.fetchStatVerticalPos = function(index){ return statVerticalPos[index] };
    $scope.fetchWeaponVerticalPos = function(index){ return weaponVerticalPos[index]; };
    $scope.fetchWpnRankHorzPos = function(index){ return weaponRankHorzPos[index]; };
    $scope.fetchWpnDescVerticalPos = function(index){ return weaponDescVerticalPos[index]; };
    $scope.fetchSklVerticalPos = function(index){ return skillVerticalPos[index]; };
    $scope.fetchSklDescVerticalPos = function(index){ return skillDescVerticalPos[index]; };
    
    $scope.fetchESklHorzPos = function(index){ return eSkillHorzPos[index]; };
    $scope.fetchEStatVerticalPos = function(index){ return eStatVerticalPos[index]; };
    $scope.fetchEWeaponVerticalPos = function(index){ return eWeaponVerticalPos[index]; };
    $scope.fetchEWpnRankHorzPos = function(index){ return eWpnRankHorzPos[index]; };
    $scope.fetchESklDescHorzPos = function(index){ return eSklDescHorzPos[index]; };
	$scope.fetchEWpnDescVerticalPos = function(index){ return eWpnDescVerticalPos[index]; };
	
	$scope.getHPPercent = function(currHp, maxHp){
		currHp = parseInt(currHp) || 0;
		maxHp = parseInt(maxHp) || 1;

		return Math.min((currHp/maxHp)*(boxWidth-2), (boxWidth-2)) + "px";
	};

	$scope.determineHPBackgroundColor = function(currHp, maxHp){
		currHp = parseInt(currHp) || 0;
		maxHp = parseInt(maxHp) || 1;

		if(currHp > maxHp) return "#c430ff";
		else if((currHp/maxHp) > 0.5) return "#00e003";
		else if((currHp/maxHp) > 0.25) return "#ffe100";
		else return "red";
	};
    
    //***********************\\
    // FUNCTIONS FOR STAT    \\
    // PROCESSING/FORMATTING \\
    //***********************\\
    
    //Returns true if the value in the passed attribute is >= 0
    $scope.checkRate = function(stat){ return parseInt(stat) >= 0; };
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     * 
     * toggle = 0 for char, 1 for enemy
     */
    $scope.determineStatColor = function(character, index, stat, toggle){
    	var char;
    	
    	if(toggle == "0") char = $scope.charaData[character];
    	else char = $scope.enemyData[character];
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	var debuff = char[stat + "Buff"];
    	var weaponBuff = char["w" + stat + "Buff"];
    	var pairUp = char["p" + stat + "Buff"];
    	
    	if(debuff == "") debuff = 0;
    	else debuff = parseInt(debuff);
    	
    	weaponBuff = parseInt(weaponBuff);
    	
    	if(pairUp == "") pairUp = 0;
    	else pairUp = parseInt(pairUp);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		return STAT_BUFF_COLOR; //blue buff
    	else if(totalBuffs < 0)
    		return STAT_DEBUFF_COLOR //red debuff
    	return STAT_DEFAULT_COLOR;
    };
    
    $scope.calcEnemyBaseStat = function(enemy, stat){
    	var char = $scope.enemyData[enemy];
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	var total = char[stat];
    	var debuff = char[stat + "Buff"];
    	var weaponBuff = char["w" + stat + "Buff"];
    	var pairUp = char["p" + stat + "Buff"];
    
    	total = parseInt(total);
    	debuff = parseInt(debuff);
    	weaponBuff = parseInt(weaponBuff);
    	if(pairUp == "") pairUp = 0;
    	else pairUp = parseInt(pairUp);
    	
    	return total - (debuff + weaponBuff + pairUp);
    };
    
    $scope.validSkill = function(skill){
    	return skill != "" && skill != "None";
    };

    //Returns the image for a character's skill, if they're at the minimum
    //level to obtain it. Otherwise, returns the blank skill image.
    $scope.fetchSkillImage = function(skillName, charLvl, index){
    	var minLvl = (index - 1) * 5;
    	if(minLvl == 0) minLvl = 1;
    	
    	if(skillName == "-" || minLvl > parseInt(charLvl))
    		return "IMG/SKL/skl_blank.png";
    	
    	if(index == "0")
    		return "IMG/SKL/skl_personal.png";
    	
    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/SKL/skl_" + skillName + ".png";
    };
    
    $scope.checkShields = function(num, shields){
    	num = parseInt(num);
    	shields = parseInt(shields);
    	
    	if(shields == 10) return "IMG/blueshield.png";
    	else if(shields >= num) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };

	$scope.getPairName = function(pos){
		if(pos.indexOf("(") == -1) return "None";
		else return pos.substring(pos.indexOf("(")+1, pos.indexOf(")"));
	};

	$scope.getPairSupportRank = function(name, pos){
		var supportRanks = DataService.getSupportIndex();
		var partner = pos.substring(pos.indexOf("(")+1, pos.indexOf(")"));

		var ranks = supportRanks[name];
		if(ranks == undefined) return "Could not locate unit";

		var rank = ranks[partner];
		if(rank == undefined) return "Could not locate partner";
		else if(rank != "-") return rank;
		else return "None";
	};

	$scope.buildPairSupportBonuses = function(pos){
		var data = DataService.getSupportBonuses();
		var partner = pos.substring(pos.indexOf("(")+1, pos.indexOf(")"));
		var bonuses = data[partner];
		var returnStr = "";

		for(var stat in bonuses){
			var value = parseInt(bonuses[stat]);
			if(value > 0){
				returnStr += stat + ": +" + bonuses[stat] + ", ";
			}else if(value < 0){
				returnStr += stat + ": " + bonuses[stat] + ", ";
			}	
		}	
		
		if(returnStr.length > 2)
			returnStr = returnStr.substring(0, returnStr.length-2);
		return returnStr;
	};
    
    //*************************\\
    // FUNCTIONS FOR INVENTORY \\
    // & WEAPONS PROFICIENCY   \\
    //*************************\\
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for characters
    $scope.validWeapon = function(weaponName){
    	if(weaponName != "-" && weaponName != "- (-)" && weaponName != "") return true;
    	else return false;
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for characters
    $scope.getWeaponClassIcon = function(type){
    	type = type.toLowerCase();
    	return "IMG/type_" + type + ".png";
    };
    
    //Checks if the passed "type" is listed in the effectiveness column of a character's weapon
    //(Ex. Flier, Monster, Beast, Dragon, Armor)
    $scope.weaponEffective = function(types, goal){
    	types = types.toLowerCase();
    	return types.indexOf(goal) != -1;
    };
    
    $scope.existsWeapon = function(weaponName){
    	return weaponName != "" && weaponName != "None";
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.weaponIcon = function(weaponName){ 	
    	var c = weaponName.toLowerCase();
    	return "IMG/rank_" + c + ".png";
    };
    
    //Calculates the percentage of weapon proficicency for a specific weapon,
    //then returns the width of the progress bar in pixels
    $scope.calcWeaponExp = function(exp){
		exp = parseInt(exp) || 0;
		
		var toNextLvl;
		if(exp < 10) toNextLvl = 10;
		else if(exp < 30){ toNextLvl = 20; exp -= 10; } 
		else if(exp < 70){ toNextLvl = 40; exp -= 30; }
		else if(exp < 150){ toNextLvl = 80; exp -= 70; }
		else if(exp < 300){ toNextLvl = 150; exp -= 150; }
		else{ toNextLvl = 1; exp = 1; } //max at S rank

		return (exp/toNextLvl) * 32;
    };
    
    //Checks if there is a value in the index
    $scope.validDebuff = function(value){
    	return value != "" && value != "0" && value != "-";
    };
    
    $scope.formatWeaponName = function(name){
    	if(name.indexOf("(") == -1) return name;
    	else return name.substring(0, name.indexOf("(")-1);
    };
    
    $scope.hasWeaponRank = function(rank){
    	return rank != "-";
    };
    
    //Returns true if the weapon at the index is not an item
    $scope.notItem = function(type){
    	return type != "Consumable" && type != "Mystery";
    };
    
    $scope.setDescriptionLoc = function(type){
    	if(type != "Consumable" && type != "Mystery") return "60px";
    	else return "25px";
    };
	
	$scope.setItemDescHeight = function(type){
		if(type != "Consumable" && type != "Mystery") return "90px";
    	else return "120px";
	};

	$scope.determineNametagColor = function(char){
		if(char.indexOf("char_") != -1) return DEFAULT_NAMETAG_COLOR;
		
		if($scope.charaData[char].affiliation == "") return DEFAULT_NAMETAG_COLOR;
		else return $scope.charaData[char].affiliation;
	};
    
    //***************************\\
    // MOUSEOVER/MOUSEOUT EVENTS \\
    //***************************\\
    
    $scope.weaponHoverIn = function(char, index){ $scope[char + "wpn_" + index] = true; };
    $scope.weaponHoverOut = function(char, index){ $scope[char + "wpn_" + index] = false; };
    $scope.weaponHoverOn = function(char, index){ return $scope[char + "wpn_" + index] == true; };
    
    $scope.skillHoverIn = function(char, index){ $scope[char + "skl_" + index] = true; };
    $scope.skillHoverOut = function(char, index){ $scope[char + "skl_" + index] = false; };
    $scope.skillHoverOn = function(char, index){ return $scope[char + "skl_" + index] == true; };
    
    $scope.statHoverIn = function(char, stat){ $scope[char + "hov_" + stat] = true; };
    $scope.statHoverOut = function(char, stat){ $scope[char + "hov_" + stat] = false; };
    $scope.statHoverOn = function(char, stat){ return $scope[char + "hov_" + stat] == true; };
    
    $scope.pairUpHoverIn = function(char){ $scope[char + "pair"] = true; };
    $scope.pairUpHoverOut = function(char){ $scope[char + "pair"] = false; };
    $scope.pairUpHoverOn = function(char){ return $scope[char + "pair"] == true; };

	$scope.statusHoverIn = function(char){ $scope[char + "status"] = true; };
	$scope.statusHoverOut = function(char){ $scope[char + "status"] = false; };
	$scope.statusHoverOn = function(char){ return $scope[char + "status"] == true; };

	$scope.traitHoverIn = function(char){ $scope[char + "trait"] = true; };
	$scope.traitHoverOut = function(char){ $scope[char + "trait"] = false; };
	$scope.traitHoverOn = function(char){ return $scope[char + "trait"] == true; };
    
    //*************************\\
    // SUPPORT FOR DRAGABILITY \\
    // OF CHAR INFO BOX        \\
    //*************************\\
    var currDrag = "";
    
    function dragStart(event){
    	var style = window.getComputedStyle(event.target, null);
    	currDrag = event.target.id;
        event.dataTransfer.setData("text",(parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
    };
    
    function dragOver(event){
    	event.preventDefault();
    	return false;
    };
    
    function dragEnter(event){
    	event.preventDefault();
    };
    
    function dropDiv(event){
    	event.preventDefault();
    	var data = event.dataTransfer.getData("text").split(',');

    	var drag = document.getElementById(currDrag);
    	drag.style.left = (event.clientX + parseInt(data[0],10)) + 'px';
    	drag.style.top = (event.clientY + parseInt(data[1],10)) + 'px';
    	currDrag = "";
    };
    
    function initializeListeners(){;
    	var test = document.getElementById('char_0_box');
    	if($scope.charaData != undefined && test != null){

    		var i = 0;
    		//Set event listeners to be activated when the div is dragged
    	    for(var char in $scope.charaData){
    	    	var box = document.getElementById(char + '_box');
    	    	box.addEventListener('dragstart',dragStart,false);
    	    	i++;
    	    }
    	    
    	    //Set event listeners
    	    var drop = document.getElementById('dropArea');
    	    drop.addEventListener('dragenter',dragEnter,false);
    	    drop.addEventListener('dragover',dragOver,false);
    	    drop.addEventListener('drop',dropDiv,false);
    	    
    	    $interval.cancel(dragNDrop); //cancel $interval timer
    	}
    };
}]);
