app.service('OverworldService', ['$rootScope', function ($rootScope) {
    var sheetId = '19OIsTc_rxylCoqq2JOIFwx3avsl-lQeqd4VD_NzrmBU';
	var progress = 0;
    const loadPercent = (100 / 2) + 0.1;
    
    var mapItems = null;
	var map;
	
    this.getMap = function(){ return map; };
    this.getMapItems = function(){ return mapItems; };

	this.loadData = function(){ fetchMapUrl(); };
	
	//\\//\\//\\//\\//\\//
	// DATA AJAX CALLS  //
	//\\//\\//\\//\\//\\//

	function fetchMapUrl() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "COLUMNS",
          valueRenderOption: "FORMULA",
          range: 'Management!A3:A3',
        }).then(function(response) {
           map = response.result.values[0][0];
           if(map != "") map = processImageURL(map);
           updateProgressBar();
           fetchMapItems();
        });
      };

    function fetchMapItems() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "COLUMNS",
          range: 'Mapping Management!B2:AZ',
        }).then(function(response) {
           var results = response.result.values;

            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                majorDimension: "COLUMNS",
                valueRenderOption: "FORMULA",
                range: 'Mapping Management!B1:AZ1',
            }).then(function(response) {
                var sprites = response.result.values[0];
                mapItems = {}; 

                for(var i = 0; i < results.length && i < sprites.length; i++){
                    var itm = results[i];
                    if(itm.length == 0 || sprites[i].length == 0) continue;

                    mapItems[i] = {
                        'spriteUrl' : processImageURL(sprites[i]),
                        'x' : itm[0],
                        'y' : itm[1],
                        'title' : itm[2],
                        'desc' : itm[3] != undefined ? itm[3] : ""
                    }
                }

                updateProgressBar();
            });
        });
    };

    //\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//

    function updateProgressBar(){
		if(progress < 100){
			progress = progress + loadPercent;
    		$rootScope.$broadcast('overworld-loading-bar-updated', progress);
		}
    };

    function processImageURL(str){
    	return str.substring(str.indexOf("\"")+1, str.lastIndexOf("\""));
    };
}]);