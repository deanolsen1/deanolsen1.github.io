$(document).ready(function() {
	var markers;
    var SMFilter = [];
	var PageFilter = [];
	var thisPage = 9;
	var speed = 250;
	var interval; 

    /*L.mapbox.accessToken = 'pk.eyJ1Ijoic3poYW5nMjQ5IiwiYSI6Im9jN0UtRWMifQ.vCDJzEeXrVAIOFVLSD3Afg';
    var map = L.mapbox.map('map', 'szhang249.i6n0bn3j');
    map.setView([48.878, 2.362], 15);*/

    L.mapbox.accessToken = 'pk.eyJ1IjoiZGVhbm9sc2VuMSIsImEiOiJ1dkxBdm9FIn0.kapau_lUukKIE93Y8I0A9g';
    var map = L.mapbox.map('map', 'deanolsen1.kdncn8ec', {zoomControl : false, 
    	//Dean: removed attribution from bottom of map to credits page
    	attributionControl: false});
    //Dean: changed center to accommodate larger sidebar
     map.setView([48.876, 2.357], 8);
      // window.setTimeout (function () {
      //  	map.setView([48.876, 2.357], 11)}, 3000);
      window.setTimeout (function () {
       	map.setView([48.876, 2.357], 11)}, 4000);
      window.setTimeout (function () {
       	map.setView([48.876, 2.357], 13)}, 7000);
      // window.setTimeout (function () {
      //  	map.setView([48.876, 2.357], 14)}, 6000);
      window.setTimeout (function () {
       	map.setView([48.876, 2.357], 15)}, 10000);
       	//map.setView([48.876, 2.357], 15);

    new L.Control.Zoom({ position: 'topright' }).addTo(map);

    
	$.getJSON("data/Locationsv4.geojson")
		.done(function(data) {

			var info = processData(data);
			createPropSymbols(info, data);
			createSliderUI(info.pages, info, data);
            menuSelection(info.SMs, info, data);
            updateMenu(info, data);
            sequenceInteractions(info, data);
		})
		.fail(function() { alert("There has been a problem loading the data.")});
    
	function menuSelection(SMs, info, data) {
        var SMOptions = [];
        for (var index in SMs) {
            SMOptions.push("<input type=\"checkbox\" name=\"SMFilter\" value=\""+ SMs[index] +"\">" + SMs[index] + "<br><i>&nbsp; &nbsp; &nbsp;&#40;cited " + info.SMCount[SMs[index]] + " times&#41;</i>" + "</input>");
        };
        
        $("#SubjectiveMarkers").html(SMOptions.join("<br />"));
        $("#SubjectiveMarkers").on("click", function(event) {
            updateMenu(info, data);
            	$(".pause").hide();
				$(".play").show();
				stopMap(info, data);
        });

		//function to select all markers when button is clicked 
  		$("#checkAllBtn").click(function(event) {   
            $("#SubjectiveMarkers :checkbox").each(function() {
                this.checked = true;                        
            });
            updateMenu(info, data);
            	$(".pause").hide();
				$(".play").show();
				stopMap(info, data);
        });

  		//function to reset selected markers when button is clicked 
        $("#uncheckAllBtn").click(function(event) {   
            $("#SubjectiveMarkers :checkbox").each(function() {
                this.checked = false;                        
            });
            updateMenu(info, data);
        });  
		
		//Dean: changed map view to match initial view above. function to reset map view when button is clicked - center on 10th Arron.
		$("#resetMapBtn").click(function(event) {   
            map.setView([48.876, 2.360], 15);
        	});
         
    }
    
    function updateMenu(info, data){
       	SMFilter = [];
       	$( "input:checkbox[name=SMFilter]:checked").each(function(){
           SMFilter.push($(this).val());
       	});
		$("#checkedNum").html(SMFilter.length + " categories are checked")		
        createPropSymbols(info, data);
    }
    
	function updatePages(info, data) {
		PageFilter = [];
		$( "input:output[name=PageFilter]:input change").each(function(){
			PageFilter.push($(this).val());
		});


		createPropSymbols(info, data);
	}
        
    function processData(data) {
        var pages = [];
        var pageTracker = [];
        var SMs = []
        var SMTracker = [];
        var SMCount = {};
        
        for (var feature in data.features) {

			var properties = data.features[feature].properties;

            if (pageTracker[properties.Page] === undefined) {
                pages.push(properties.Page);
                pageTracker[properties.Page] = 1;
            }
            if (SMTracker[properties.SM] === undefined) {
                SMs.push(properties.SM);
                SMTracker[properties.SM] = 1;
            }
            if (SMCount[properties.SM] === undefined) {
            	SMCount[properties.SM] = 1;
            }
            else {
            	SMCount[properties.SM] += 1;
            }
		}
        return { 
            SMs : SMs,
            pages : pages.sort(function(a,b){return a - b}),
            SMCount : SMCount
        };
    };
    
    function createPropSymbols(info, data, currentPage) {
        if (map.hasLayer(markers)){
            map.removeLayer(markers);
        	};

		markers = L.geoJson(data, {
            filter: function(feature, layer) {
			
			if (currentPage){
			//uncheck all menu boxes

			//if page number matches currentPage, put feature on map
			if (feature.properties.Page == currentPage){
					return true;
			} else {
					return false;
			}
				
				//AND check the feature's correct box in the menu
			} else {

				if ($.inArray(feature.properties.SM,SMFilter) !== -1) {  
                   return true;
                } else {
					return false;
				};
			}
			
			
           },
			pointToLayer: function(feature, latlng) {

				return L.circleMarker(latlng, {

                    fillColor: PropColor(feature.properties.SM),
				    color: PropColor(feature.properties.SM),
                    weight: 3,
                    //Dean: changed opacity to .8 per RR comment
				    fillOpacity: 0.8,
				    transition: 200

                }).on({
					mouseover: function(e) {
						this.openPopup();
						this.setStyle({color: '#000000'});
					},
					mouseout: function(e) {
						this.closePopup();
						this.setStyle({color: PropColor(feature.properties.SM) });
					}
				});
			}
		}).addTo(map);
		updatePropSymbols();
	} // end createPropSymbols()
	
    function PropColor(SM) {
        return "#CC2B0A";
    } // end PropColor()

    function updatePropSymbols() {
		markers.eachLayer(function(layer) {
			var props = layer.feature.properties;
			var	radius = calcPropRadius(props.SM);
			var	popupContent = "<i><b>" + props.SM + "</b></i>" + " <br>"+ props.Address +"<br>page " + props.Page ;
            
			layer.setRadius(radius);
			layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
            layer.options.color = PropColor(props.SM);
            layer.options.fillColor = PropColor(props.SM);
		});
	} // end updatePropSymbols
    
	function calcPropRadius(attributeValue) {
		var scaleFactor = 10,
			area = attributeValue * attributeValue * scaleFactor;
		return 12;
	} // end calcPropRadius
	
	function createSliderUI(Pages, info, data) {
		var sliderControl = L.control(
			//Dean: moved slider to bottom right
			{ position: 'bottomright'} );
		sliderControl.onAdd = function(map) {
			var slider = L.DomUtil.create("input", "range-slider");
			L.DomEvent.addListener(slider, 'mousedown', function(e) {
				L.DomEvent.stopPropagation(e);
			});
			$(slider)
				.attr({'type':'range', 
                       'max': Pages[Pages.length-1], 
                       'min':Pages[0], 
                       'step': 1,
					   'width' : 4,
                       'value': String(Pages[0])})
		        .on('input change', function() {
		        	//updatePropSymbols(Pages[$(this).val().toString()]);
					createPropSymbols(info, data, this.value);

		            $(".temporal-legend").text("On page " + this.value);
		            
		        });
			return slider;
		}

		sliderControl.addTo(map);
		createTemporalLegend(Pages [0]);
		
	} // end createSliderUI()

	function sequenceInteractions(info, data) {

		$(".pause").hide();

		//play behavior
		$(".play").click(function(){
				$(".pause").show();
				$(".play").hide();
				//Dean: changed view to match new view specs
				map.setView([48.876, 2.357], 15);
				speed = 250;
				animateMap(info, data, speed); 
				menuSelection(info.SMs, info, data);
				updateMenu();
				

			});
		//pause behavior
		$(".pause").click(function(){
				$(".pause").hide();
				$(".play").show();
				stopMap(info, data, speed); 
			});
		
		//step behavior
		$(".step").click(function(){
			stopMap();
				$(".pause").hide();
				$(".play").show();
				step(info, data);
			});
		//back behavior
		$(".back").click(function(){
				stopMap();
				$(".pause").hide();
				$(".play").show();
				goBack(info, data);
			});

		//back behavior
		$(".back-full").click(function(){
				stopMap();
				$(".pause").hide();
				$(".play").show();
				backFull(info, data);
			});
		//full forward behavior
		$(".step-full").click(function(){
				
				$(".pause").hide();
				$(".play").show();
				stepFull(info, data);
			});

		

		//decrease speed behavior
		$(".slower").click(function(){
				
				if (speed>250) {
					speed = speed-250;
					animateMap(info, data, speed); 
					console.log(speed);
				}
				else (speed = 250);
			});

		$(".faster").click(function(){
			if (speed<1000) {
			speed = speed+250;
			animateMap(info,data,speed); 
			console.log(speed);
			}
			else (speed = 250);
			});


	}

	// var thisPage = [];
	function animateMap (info, data, speed) {
		
		interval = setInterval(function(){step(info, data)},speed);
	}

	function stopMap(info, data, speed){
		speed = 0;
		clearInterval(interval);
	}

	function goBack(info, data){
		if (thisPage >9) {
			thisPage--; 
		}; 
		createPropSymbols(info, data, thisPage);
		$("input[type=range]").val(thisPage);
		$(".temporal-legend").text( "On Page " + thisPage);
	}

	function goForward(info, data){
		thisPage++; 
		createPropSymbols(info, data, thisPage);
		$("input[type=range]").val(thisPage);
		$(".temporal-legend").text( "On Page " + thisPage);
	}

	function step(info, data){
		if (thisPage <238) {
			thisPage++; 
			};
		createPropSymbols(info, data, thisPage);
		$("input[type=range]").val(thisPage);
		$(".temporal-legend").text( "On Page " + thisPage);
	}

	function stepFull(info, data){
		thisPage=238; 
		createPropSymbols(info, data, thisPage);
		$("input[type=range]").val(thisPage);
		$(".temporal-legend").text( "On Page " + thisPage);
	}

	function backFull(info, data){
		thisPage=9; 
		createPropSymbols(info, data, thisPage);
		$("input[type=range]").val(thisPage);
		$(".temporal-legend").text( "On Page " + thisPage);
	}

	function createTemporalLegend(startTimestamp) {
		var temporalLegend = L.control(
			//Dean: moved position to bottom right
			{ position: 'bottomright' });
		temporalLegend.onAdd = function(map) {
			var output = L.DomUtil.create("output", "temporal-legend");
			return output;
		}
		temporalLegend.addTo(map);
		$(".temporal-legend").text("On page " + startTimestamp);
	}	// end createTemporalLegend()

});
