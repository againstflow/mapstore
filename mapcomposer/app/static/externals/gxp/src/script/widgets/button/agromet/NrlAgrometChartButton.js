/**
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.namespace('gxp.widgets.button');

/** api: constructor
 *  .. class:: NrlAgrometChartButton(config)
 *
 *    Base class to create chart
 *
 */
gxp.widgets.button.NrlAgrometChartButton = Ext.extend(Ext.Button, {

    /** api: xtype = gxp_nrlchart */
	url: null,
    xtype: 'gxp_nrlAgrometChartButton',
    iconCls: "gxp-icon-nrl-chart",
	text: 'Generate Chart',
    form: null,
    chartOpt:{
		series:{
			current:{
					color: '#FF0000',
                    lcolor: 'rgb(207,235,148)',                    
					type: 'line',
					dataIndex: 'current',
					unit:'(000 tons)',
					xField:'s_dec'

				},
			previous:{
					type: 'line',
					color: '#4572A7',
                    lcolor: 'rgb(139,184,237)',
					dataIndex: 'previous',
					unit:'(kg/ha)',
					xField:'s_dec'

				},
			aggregated:{
					color: '#808080',
                    lcolor: 'rgb(240,140,137)', 
                    dashStyle: 'dash',                    
					type: 'line',
					dataIndex: 'aggregated',
					unit:'(000 ha)',
					xField:'s_dec'
			}
		},
        height: 400
	},
    handler: function () {
        
        
        
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;    
        
        var numRegion = [];
        var regStore = this.form.output.aoiFieldSet.AreaSelector.store
        var records = regStore.getRange();
		
        for (var i=0;i<records.length;i++){
			var attrs = records[i].get("attributes");
			var region = attrs.district ? attrs.district + "," + attrs.province : attrs.province;
            numRegion.push(region.toLowerCase());
        }
        
        var data = this.form.output.getForm().getValues();
        var regionList = data.region_list.toLowerCase();
        var season = data.season.toLowerCase();
        var granType = data.areatype;
        var fromYear = data.startYear;
        var toYear = data.endYear;

        var factorStore = this.form.output.factors.getSelectionModel().getSelections();
        var factorValues = [];
        var factorList = "";
        if (factorStore.length === 0){
            Ext.Msg.alert("Grid Factors","Must be selected at least one Factor!");
            return;
        }else{
            for (var i=0;i<factorStore.length;i++){
                var factor = factorStore[i].data;
                var factorValue = factor.factor;
                factorValues.push(factorValue);
                if(i==factorStore.length-1){
                    factorList += "'" + factorValue + "'";
                }else{
                    factorList += "'" + factorValue.concat("'\\,");
                    
                }
            }
        }

        var chartTitle = "";
        var splitRegion;
        
        /*if (listVar.numRegion.length == 1){
            if (listVar.granType == "province"){
                chartTitle = listVar.numRegion[0].slice(0,1).toUpperCase() + listVar.numRegion[0].slice(1);
            }else{
                splitRegion = listVar.numRegion[0].split(',');
                chartTitle = splitRegion[0].slice(0,1).toUpperCase() + splitRegion[0].slice(1) + " (" + splitRegion[1].toUpperCase() + ")";
            }
        }else{*/
            for (var i = 0;i<numRegion.length;i++){
                if (granType == "province"){
                    if(i==numRegion.length-1){
                        chartTitle += numRegion[i].slice(0,1).toUpperCase() + numRegion[i].slice(1);
                    }else{
                        chartTitle += numRegion[i].slice(0,1).toUpperCase() + numRegion[i].slice(1) + ", ";
                    }                
                }else{
                    splitRegion = numRegion[i].split(',');
                    if(i==numRegion.length-1){
                        chartTitle += splitRegion[0].slice(0,1).toUpperCase() + splitRegion[0].slice(1) + " (" + splitRegion[1].toUpperCase() + ")";
                    }else{
                        chartTitle += splitRegion[0].slice(0,1).toUpperCase() + splitRegion[0].slice(1) + " (" + splitRegion[1].toUpperCase() + "), ";
                    }                       
                }            
            }
        //} 
        
        var listVar = {
            today: today,
            chartTitle: chartTitle,
            numRegion: numRegion,
            season: season,
            granType: granType,
            fromYear: fromYear,
            toYear: toYear,
            factorValues: factorValues,
			factorStore: factorStore
        };
        
        //loading mask
        var loadingMsg ="Please wait...";
        /* not needed anymore
        if( (granType == "province" || numRegion.length >20 ) && factorValues.lenth >1){
            loadingMsg += "<br/>This request could take a long time to be served";
        
        }
        */
        var myMask = new Ext.LoadMask(this.findParentByType('form').getEl(),
        {msg:loadingMsg} );
        
        myMask.show();
		var store = new Ext.data.JsonStore({
			url: this.url,
			 sortInfo: {field: "s_dec", direction: "ASC"},
			root: 'features',
			
			fields: [{
				name: 'factor',
				mapping: 'properties.factor'
			},{
				name: 'month',
				mapping: 'properties.month'
			},{
				name: 'dec',
				mapping: 'properties.dec'
			},{
				name: 's_dec',
				mapping: 'properties.s_dec'
			}, {
				name: 'current',
				mapping: 'properties.current'
			},{
				name: 'previous',
				mapping: 'properties.previous'
			},{
				name: 'aggregated',
				mapping: 'properties.aggregated'
			}]
			
		});
		store.load({
			callback:function(){
				this.createResultPanel(store,listVar);
                myMask.hide();
			},

			scope:this,
			params :{
				service: "WFS",
				version: "1.0.0",
				request: "GetFeature",
				typeName: "nrl:agromet_aggregated",
				outputFormat: "json",
				viewparams: season == 'rabi' ? "start_year:"+ fromYear + ";" +
                    "end_year:"+ toYear + ";" +
                    "factor_list:"+ factorList + ";" +
                    "region_list:"+ regionList + ";" +
                    "gran_type:" + granType + ";" +                            
                    "season_flag:NOT" :  
                    "start_year:"+ fromYear + ";" +
                    "end_year:"+ toYear + ";" +
                    "factor_list:"+ factorList + ";" +
                    "region_list:"+ regionList + ";" +
                    "gran_type:" + granType
			}
		}); 
        
    },
	createResultPanel:function(store,listVar){
		 var tabPanel = Ext.getCmp('id_mapTab');

        var tabs = Ext.getCmp('agromet_tab');
		var charts  = this.makeChart(store,listVar);
		var resultpanel = {
			columnWidth: .95,
			style:'padding:10px 10px 10px 10px',
			xtype: 'gxp_controlpanel',
			//panelTitle: "XXX",
			season: listVar.season,
			province: listVar.numRegion,
			fromYear: listVar.fromYear,
			toYear: listVar.toYear,
            today: listVar.today,
            chartTitle: listVar.chartTitle,
			chart: charts,
			chartHeight: this.chartOpt.height
		};
		if(!tabs){
			var cropDataTab = new Ext.Panel({
				title: 'AgroMet',
				id:'agromet_tab',
				itemId:'agromet_tab',
				border: true,
				layout: 'form',
				autoScroll: true,
				tabTip: 'AgroMet',
				closable: true,
				items: resultpanel
			});
			tabPanel.add(cropDataTab);  
		   
		}else{
			tabs.items.each(function(a){a.collapse()});
			tabs.add(resultpanel);
		}
		Ext.getCmp('id_mapTab').doLayout();
		Ext.getCmp('id_mapTab').setActiveTab('agromet_tab');
                    
	
	},
	makeChart: function(store,listVar){
		
		var grafici = [];
		var factorStore = [];
		
		for (var i = 0;i<listVar.factorValues.length;i++){

            factorStore[i] = new Ext.data.JsonStore({
                root: 'features',
                fields: [{
                    name: 'factor',
                    mapping: 'properties.factor'
                },{
                    name: 'month',
                    mapping: 'properties.month'
                },{
                    name: 'dec',
                    mapping: 'properties.dec'
                },{
                    name: 's_dec',
                    mapping: 'properties.s_dec'
                }, {
                    name: 'current',
                    mapping: 'properties.current'
                },{
                    name: 'previous',
                    mapping: 'properties.previous'
                },{
                    name: 'aggregated',
                    mapping: 'properties.aggregated'
                }]
                
            });

            store.queryBy(function(record,id){
                if (record.get('factor') == listVar.factorValues[i]){
                    factorStore[i].insert(id,record);
                }
            });
            factorStore[i].sort("s_dec", "ASC");    
			var chart;
			
			chart = new Ext.ux.HighChart({
				animation:false,
				series: [
					Ext.apply({
							//name:listVar.toYear -1
                            name: listVar.season == 'rabi' ? (listVar.toYear -2) + "-" + (listVar.toYear -1) : listVar.toYear -1
						},this.chartOpt.series.previous),
					Ext.apply({
							//name: ((listVar.season == 'rabi') &&  (new Date().getFullYear() == listVar.toYear)) ? listVar.toYear -1 + " - " + listVar.toYear : listVar.toYear
                            name: listVar.season == 'rabi' ? (listVar.toYear -1) + "-" + listVar.toYear : listVar.toYear
						},this.chartOpt.series.current),
					Ext.apply({
							name:"mean " + listVar.fromYear +"-"+ (listVar.toYear -1)
						},this.chartOpt.series.aggregated)					
				],
				height: this.chartOpt.height,
				//width: 900,
				store: factorStore[i],
				animShift: true,
				
				chartConfig: {
					chart: {
						zoomType: 'x',
                        spacingBottom: 65           
					},
                    exporting: {
                        enabled: true,
                        width: 1200,
                        url: this.target.highChartExportUrl
                    },
					title: {
						text: listVar.factorStore[i].get('label') + " - " + (listVar.numRegion.length == 1 ? listVar.chartTitle : "REGION")
					},
					subtitle: {
                        text: '<span style="font-size:10px;">Source: Pakistan Crop Portal</span><br />'+
                              '<span style="font-size:10px;">Date: '+ listVar.today +'</span><br />'+
                              '<span style="font-size:10px;">AOI: '+listVar.chartTitle+'</span><br />'+
                              '<span style="font-size:10px;">Season: '+listVar.season.toUpperCase()+'</span><br />'+
                              '<span style="font-size:10px;">Years: '+ listVar.fromYear + "-"+ listVar.toYear+'</span><br />',
                        align: 'left',
                        verticalAlign: 'bottom',
                        useHTML: true,
                        x: 30,
                        y: -15
					},					
					xAxis: [{
						type: 'datetime',
						categories: ['s_dec'],
						tickWidth: 0,
						gridLineWidth: 1,
                        style: { 
                            backgroundColor: Ext.isIE ? '#ffffff' : "transparent"
                        },                        
						labels: {
                            style: { 
                                backgroundColor: Ext.isIE ? '#ffffff' : "transparent"
                            },                        
                            rotation: 320,
                            y: +22,
							formatter: function () {
                                var months = ["Nov-1","Nov-2","Nov-3","Dec-1","Dec-2","Dec-3","Jan-1","Jan-2","Jan-3","Feb-1","Feb-2","Feb-3","Mar-1","Mar-2","Mar-3","Apr-1","Apr-2","Apr-3","May-1","May-2","May-3","Jun-1","Jun-2","Jun-3","Jul-1","Jul-2","Jul-3","Aug-1","Aug-2","Aug-3","Sep-1","Sep-2","Sep-3","Oct-1","Oct-2","Oct-3"];
                                if (this.axis.dataMin == 1){
                                    //return months[this.value-1] + "-" + this.value;
                                    return months[this.value-1];
                                }else{
                                    return months[this.value-1];
                                }								
							}							
						}                        
					}],
					yAxis: [{ // YEARS
						title: {
							text: listVar.factorStore[i].get('label')	+ " " + listVar.factorStore[i].get('unit'),
                            style: { 
                                backgroundColor: Ext.isIE ? '#ffffff' : "transparent"
                            }							
						},                    
						labels: {                   
							formatter: function () {
								return this.value;
							}							
						}
					}], 
					tooltip: {
                        formatter: function() {
                            var months = ["Nov-1","Nov-2","Nov-3","Dec-1","Dec-2","Dec-3","Jan-1","Jan-2","Jan-3","Feb-1","Feb-2","Feb-3","Mar-1","Mar-2","Mar-3","Apr-1","Apr-2","Apr-3","May-1","May-2","May-3","Jun-1","Jun-2","Jun-3","Jul-1","Jul-2","Jul-3","Aug-1","Aug-2","Aug-3","Sep-1","Sep-2","Sep-3","Oct-1","Oct-2","Oct-3"];
                            if (this.x>=1 && this.x<=18){
                                var s = '<b>'+ months[this.x-1] +'</b>';
                            }else{
                                var s = '<b>'+ months[this.x-1] +'</b>';
                            }
                            Ext.each(this.points, function(i, point) {
                                s += '<br/><span style="color:'+i.series.color+'">' + ((i.key>=1&&i.key<=18) ? ((i.key>=1&&i.key<=6) && (i.series.index==1 || i.series.index==0) ? i.series.name : ((i.series.index==1 || i.series.index==0) ? i.series.name.split("-")[1].replace(/\s/g, "") : i.series.name)) :  i.series.name) + ': </span>'+
                                    '<span style="font-size:12px;">'+ i.y.toFixed(2)+'</span>';
                            });                            
                            return s;
                        },
                        shared: true,
						crosshairs: true
					},
                    legend: {
                        labelFormatter: function() {
                            if (this.name == 'Area (000 hectares)'){
                                return 'Area (000 ha)';
                            }else{
                                return this.name;
                            }                            
                        }
                    }            
				}
			});
			grafici.push(chart);
		}		
		return grafici; 
	}	
});

Ext.reg(gxp.widgets.button.NrlAgrometChartButton.prototype.xtype, gxp.widgets.button.NrlAgrometChartButton);