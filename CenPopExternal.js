/**<nowiki>
 * Note that this script will only run on the 'Project:CenPop/Script' page.
 * This script is based on the AWB script by Joeytje50 which in turn is based on the downloadable AutoWikiBrowser.
 * 
 * @licence
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 * @version 1.0
 * @author Jacob Alperin-Sheriff
 */
 
/*** Load population data coming from pagename (now from the Census Bureau 
 * website API) into array 
 HOW TO DO IT: think while getting gats gorgeous

@pagename is the name of the page to load from
@hasHeader is whether or not the first line is a header
***/

/* KEY to be used for making API queries to Census */
CenPop.api_key='5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108';

/* Beginning of Census URL for queries */
CenPop.begin_census_URL='https://api.census.gov/data/';

/* part of Census URL for queries following estimate year, before 
summary level to get stuff from ('place' or 'county') */
CenPop.mid_census_URL='/pep/population?get=POP,GEONAME&for=';


/* Below for copying purposes */
CenPop.example_URL='https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=county:*&in=state:01&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108';

/**
 * Get all the counties in a certain state
 *
 &
 * Array of arrays of 4 elements each. 1st line (response[0])
 * contains "POP","GEONAME","state","county"
 * 
 * where POP is the population estimate for that year, GEONAME is 
 * 		'[Name] [County | Parish], State'
 * 
 * "state" is the 2 number FIPS code of the state 
 * "county" is the 3 number FIPS code of the county (for the state)
 */
CenPop.api.get_counties = function(year, state_fips, callback)
{
		$.ajax({
		crossDomain: true,
		data: {},
		dataType: 'json',
		url:  'https://api.census.gov/data/'+year+'/pep/population?get=POP,GEONAME&for=county:*&in=state:'+state_fips+'&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108',
		type: 'GET',
		success: function(response) {
			if (response.error) {
				alert('Parse call error: ' + response.error.info);
				CenPop.stop();
			} else {
				callback(response);
			}
		},
		error: function(xhr, error) {
			console.log('AJAX error: ' + JSON.stringify(xhr)+JSON.stringify(error));
			CenPop.stop();
			if (onerror) onerror();
		}
	}); 
};
/**
 * Get all the places in a certain state into a JSON object
 *
 * Array of arrays of 4 elements each. 1st line (response[0])
 * contains "POP","GEONAME","state","place"
 * 
 * where POP is the population estimate for that year, 
 *
 * GEONAME is 
 * 		'[Name] [municipality], State'
 * 
 * where 'municipality' is in lower case and should be one of  
 *  city, town, village, borough if we are doing places. 
 * 
 * If we're allowing non-places (e.g. county subdivisions) then 
 * they could potentially be different, ignore for now?
 * 
 * "state" is the 2 number FIPS code of the state 
 * "place" is the 5 number FIPS code of the county
 *
 * 
 * TO DO subdivisions https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=county+subdivision:*&in=state:09&in=county:*&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108
 */
CenPop.api.get_places = function(year, state_fips, callback)
{
		$.ajax({
		crossDomain: true,
		data: {},
		dataType: 'json',
		url:  'https://api.census.gov/data/'+year+'/pep/population?get=POP,GEONAME&for=place:*&in=state:'+state_fips+'&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108',
		type: 'GET',
		success: function(response) {
			if (response.error) {
				alert('Parse call error: ' + response.error.info);
				CenPop.stop();
			} else {
				callback(response);
			}
		},
		error: function(xhr, error) {
			alert('AJAX error: ' + JSON.stringify(error));
			CenPop.stop();
			if (onerror) onerror();
		}
	}); 
};

/**
 * TO DO subdivisions https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=county+subdivision:*&in=state:09&in=county:*&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108
 */
CenPop.api.get_county_subdivisions = function(year, state_fips, callback)
{
	my_url='https://api.census.gov/data/'+year+'/pep/population?get=POP,GEONAME&for=county+subdivision:*&in=state:'+state_fips+'&in=county:*'+'&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108';
	console.log('url='+my_url);
		$.ajax({
		crossDomain: true,
		data: {},
		dataType: 'json',
		url:  my_url,//'https://api.census.gov/data/'+year+'/pep/population?get=POP,GEONAME&for=county+subdivision:*&in=state:'+state_fips+'&in-county:*'+'&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108',
		type: 'GET',
		success: function(response) {
			if (response.error) {
				alert('Parse call error: ' + response.error.info);
				CenPop.stop();
			} else {
				//console.log('Response done');
				callback(response);
			}
		},
		error: function(xhr, error) {
			alert('AJAX error: ' + JSON.stringify(error));
			CenPop.stop();
			if (onerror) onerror();
		}
	}); 
};

/**
 * Load place data from the Census gazetteer files for the purpose of updating areas of places 
 * year is the year of the gazetteer files
 * state_fips is the fips code for the state to get place data from
 * callback is the callback to execute after GET is complete
 */
CenPop.api.get_place_gazetteer = function(year, state_fips, callback)
{
	var url_begin='https://www2.census.gov/geo/docs/maps-data/data/gazetteer/';
	var get_url=url_begin+year.toString()+'_Gazetteer/'+year.toString()+'_gaz_place_'+state_fips.toString()+'.txt';
	CenPop.debug('get_url='+get_url,'gazetteer');
	$.ajax({
//		crossDomain: true,
		dataType: 'text',
		url:  get_url,	
		type: 'GET',
		success: function(response) {
			if (response.error) {
				CenPop.debug('Parse call error: ' + response.error.info,'global');
				CenPop.stop();
			} else {
				CenPop.debug(JSON.stringify(response),'gazetteer');
				callback(response);
			}
		},
		error: function(xhr, error) {
			CenPop.debug('AJAX error: xhr=' + JSON.stringify(xhr)+',\n error='+JSON.stringify(error),'global');
			CenPop.stop();
			if (onerror) onerror();
		}
	}); 
};


/** 
 * Example query to get the places in each county for 2016, specifically giving back 
 *  "POP" (the population estimate for 2016)
 * "GEONAME" (the place, the county, the state, with (pt.) at the end if it's split between counties) 
 *            (probably leave the split places blank)
 * "state" the two digit FIPS code for the state
 * "county" the three digit FIPS code for the county (within the state)
 * "place" the five digit FIPS code for the place (within the state)
 * 
 * https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=place:*&in=state:01+county:055&key=5ccd0821c15d9f4520e2dcc0f8d92b2ec9336108
 * 
 * 1. Query for every county to get an association between FIPS code and county names
 * 
 * 2. Query for every place in the state
 * 
 * 3. For each county in the state:
 * 	  a) Query for all the places in the county 
 * 
 * 	  [maybe to avoid overdoing Census queries, do each Wiki page update in county first
 * 
 *     or that might be more annoying, so maybe sleep some between queries]
 * 	  b) If place is listed without (pt.), assign it to be in that county
 */ 
 
 /**
  * Load the population data from US Census Bureau website for est_year 
  * in curr_state and geo_adding
  */
 CenPop.api.loadPopExternal = function(est_year,curr_state, geo_adding, callback) {
	CenPop.pageCount();
	console.log('Beginning loadPopExternal');
		CenPop.status('load-page');
	/* Call depending on whether we are adding counties or places */
	if(geo_adding === 'county')
	{
		CenPop.api.get_counties(est_year,curr_state, function(response)
		{
				CenPop.pop_page=response;
				CenPop.pop_page.list=response;
			//	alert("got counties: CenPop.pop_page.list="+CenPop.pop_page.list);
				CenPop.pop_page.curr_pos=0;
				callback(); /* Update buttons and stuff */
		});
	}
	else if(geo_adding==='place')
	{
		CenPop.api.get_places(est_year,curr_state, function(response)
		{
				CenPop.pop_page=response;
				CenPop.pop_page.list=response;
			//	alert("got places: CenPop.pop_page.list="+CenPop.pop_page.list);
				CenPop.pop_page.curr_pos=0;
				callback(); /* Update buttons and stuff */
		});
	}
	else if(geo_adding==='mcd')
	{
		/* get minor civil division population */
		CenPop.api.get_county_subdivisions(est_year,curr_state, function(response)
		{
				CenPop.pop_page=response;
				CenPop.pop_page.list=response;
				//console.log("got county subdivisions: CenPop.pop_page.list="+CenPop.pop_page.list);
				CenPop.pop_page.curr_pos=0;
				callback(); /* Update buttons and stuff */
		});
	}
	else
	{
		console.log("geo_adding="+geo_adding);
	}
}; 

 /**
  * Load the population data from internal page  for est_year 
  * in curr_state and geo_adding 
  */
 CenPop.api.loadGazetteer = function(est_year,curr_state, geo_adding,  callback) {
	var temp_list, header_list, temp_fips, temp_splitline, temp_content, temp_page;
	var i,j, pagename;
	CenPop.debug('Beginning loadGazetteer','gazetteer');
	CenPop.status('load-page');
	/* County lines rarely change, so leave blank for now */
	if(geo_adding === 'place' || geo_adding === 'mcd')
	{
		/* Can just use single file, it'll detect when it doesn't match current page */
		pagename='User:'+CenPop.username+'/Gazetteer';//+curr_state.toString()+'-'+est_year.toString();
		CenPop.debug('pagename='+pagename,'global');
		var data = {
			'action': 'query',
			'prop': 'info|revisions',
			'titles': pagename,
			'rvprop': 'content|timestamp|ids',
			'rvlimit': '1',
			'indexpageids': true,
			'meta': 'userinfo',
			'uiprop': 'hasmsg'
		};
		data.redirects=true;
	
		CenPop.status('load-page');
		
		/* Make the API call to get the data */

	
		CenPop.api.call(data, function(response) {
		//	CenPop.debug('response='+JSON.stringify(response),'gazetteer');
			/* Initialize the gazetteer page */
			CenPop.gazetteer_page={};
			temp_page=response.query.pages[response.query.pageids[0]];
			temp_content=temp_page.revisions ? temp_page.revisions[0]['*'] : '';
			temp_list=temp_content.split('\n');
			if(temp_list.length===0)
			{
				CenPop.debug('Error with response, correct gazetteer page may not exist','global');
				CenPop.stop();
				return;
			}
			header_list=temp_list[0].split('\t'); /* Get name of each column if we want to make it more robust in the future? */
			for(i=1; i < temp_list.length; i++)
			{
				temp_splitline=temp_list[i].split(/\t/);
				var k=0,l=0, temp_splicer;
				/* Splice to deal with bad space tab stuff in files */
				while(k < temp_splitline.length)
				{
					temp_splitline[k]=temp_splitline[k].toString().trim();
					if(temp_splitline[k].charAt(0).search(/[0123456789\.\-]/)!==-1)
					{
						temp_splicer=temp_splitline[k].split(/[^0123456789\.\-]/);
						if(temp_splicer.length>1)
							CenPop.debug('temp_splicer='+temp_splicer,'gazetteer');
						temp_splitline=temp_splitline.slice(0,k).concat(temp_splicer).concat(temp_splitline.slice(k+1));
						k+=temp_splicer.length;
					}
					else
					{
						k++;
					}
				}
				if(geo_adding === 'place')
					temp_fips=curr_state.toString()+'-'+temp_splitline[1].toString().substring(2);
				else if(geo_adding === 'mcd')
					temp_fips=curr_state.toString()+'-'+temp_splitline[1].toString().slice(2,5)+'-'+temp_splitline[1].toString().substring(5);
				CenPop.gazetteer_page[temp_fips]={};
				for(j=0; j < header_list.length; j++)
				{
					if(j < temp_splitline.length)
					{
						/* Add each field to object under header name */
						CenPop.gazetteer_page[temp_fips][header_list[j]]=temp_splitline[j].trim();
					}
					else
					{
						CenPop.debug('Line too long,'+JSON.stringify(temp_splitline),'gazetteer');

					}
				}
				CenPop.debug('CenPop.gazetteer_page['+temp_fips+']='+JSON.stringify(CenPop.gazetteer_page[temp_fips]),'gazetteer');
				/* Create object stuff for every gazetteer place */

			}
			callback(); /* Update buttons and stuff */
		});
	}
}; 

CenPop.api.loadPop = function(pagename,hasHeader,est_year,callback) {
	CenPop.pageCount();
	if (pagename === '#PRE-PARSE-STOP') {
		var curval = $('#articleList').val();
		$('#articleList').val(curval.substr(curval.indexOf('\n') + 1));
		$('#preparse').prop('checked', false);
		CenPop.stop();
		callback();
		return;
	}
	
	/* Get whether we are adding counties or places */
	geoAdding=$('#geoAdding').val();
	
	/* If we're adding counties, query for counties, if places, query for places */
	
	var data = {
		'action': 'query',
		'prop': 'info|revisions',
		'inprop': 'watched',
		'intoken': 'edit|delete|protect|move|watch',
		'titles': pagename,
		'rvprop': 'content|timestamp|ids',
		'rvlimit': '1',
		'indexpageids': true,
		'meta': 'userinfo',
		'uiprop': 'hasmsg'
	};
	data.redirects=true;

	CenPop.status('load-page');
	
	/* Make the API call to get the data */

	
	CenPop.api.call(data, function(response) {

		if (response.query.userinfo.hasOwnProperty('messages')) {
			var view = mw.config.get('wgScriptPath') + '?title=Special:MyTalk';
			var viewNew = view + '&diff=cur';
			CenPop.status(
				'<span style="color:red;font-weight:bold;">'+
					CenPop.msg('status-newmsg', 
						'<a href="'+view+'" target="_blank">'+CenPop.msg('status-talklink')+'</a>',
						'<a href="'+viewNew+'" target="_blank">'+CenPop.msg('status-difflink')+'</a>')+
				'</span>', true);
			alert(CenPop.msg('new-message'));
			CenPop.stop();
			callback();
			return;
		}
		CenPop.pop_page = response.query.pages[response.query.pageids[0]];
		CenPop.pop_page.curr_pos=0;
		CenPop.pop_page.name = pagename;//CenPop.list[0].split('|')[0];
	 	var varOffset = CenPop.list[0].indexOf('|') !== -1 ? CenPop.list[0].indexOf('|') + 1 : 0;
	 	CenPop.pop_page.pagevar = CenPop.list[0].substr(varOffset);
		CenPop.pop_page.content = CenPop.pop_page.revisions ? CenPop.pop_page.revisions[0]['*'] : '';
		
		// Get list by splitting by newlines. Set variable as to whether first 
		//	line is header. If so, remove the first line and set 
		//	CenPop.pop_page.headerList to be the list of headers
		
		CenPop.pop_page.list=CenPop.pop_page.content.split(/\n/);
		CenPop.pop_page.hasHeader=hasHeader;
		if(CenPop.pop_page.hasHeader)
		{
			CenPop.pop_page.headerList=(CenPop.pop_page.list.shift()).split(/,/);
		}
		
		CenPop.pop_page.exists = !response.query.pages["-1"];
		CenPop.pop_page.deletedrevs = response.query.deletedrevs;
		CenPop.pop_page.watched = CenPop.pop_page.hasOwnProperty('watched');
		callback();
		return;
	}); 
}; 
/* Get the name of the query we're using */
CenPop.api.getQueryName = function(fips_code, geoname, use_fips, in_get) {
	var	str_array_end=geoname.toString().split(','); /* Split off the state name */
	var str_array_begin=str_array_end[0].split(' '); /* Split so we can remove lower case */
	var pagename='', place_name;
	if($('#geoAdding').val()==='mcd')
	{
		var temp_pagename;
		if(!use_fips && in_get)
		{
			temp_pagename=geoname.toString().replace(/ [a-z]/, function(match) {
				return match.toUpperCase();
			});
			pagename=''
			str_array_end=temp_pagename.toString().split(','); /* Split off the state name */
			//console.log('str_array_end='+str_array_end);
			str_array_begin=str_array_end[0].split(' '); /* Split so we can remove lower case */
			/* slyly misusing use_fips for special purposes for mcd */
			for(i=0; i < str_array_begin.length-1; i++)
			{
				if(i>0) pagename=pagename+' ';
				pagename = pagename + str_array_begin[i];
			}
		//	pagename = pagename + ' ('+ str_array_begin[i][0].toLowerCase()+str_array_begin[i].substr(1)+')';
			pagename=pagename+','+str_array_end[2];
			if(str_array_begin.length===0)
			{
				str_array_begin[0]='';
			}
			//pagename=temp_pagename;
			place_name=str_array_begin[0];
		}
		else if(use_fips)
		{
			temp_pagename=geoname.toString().replace(/ [a-z]/, function(match) {
				return match.toUpperCase();
			});
			pagename=temp_pagename;
		}
		else
		{
			temp_pagename=geoname.toString();
			pagename=''
			str_array_end=temp_pagename.toString().split(','); /* Split off the state name */
			console.log('str_array_end='+str_array_end);
			str_array_begin=str_array_end[0].split(' '); /* Split so we can remove lower case */
			/* slyly misusing use_fips for special purposes for mcd */
			for(i=0; i < str_array_begin.length-1; i++)
			{
				if(i>0) pagename=pagename+' ';
				pagename = pagename + str_array_begin[i];
			}
			pagename = pagename + ' ('+ str_array_begin[i][0].toLowerCase()+str_array_begin[i].substr(1)+')';
			pagename=pagename+','+str_array_end[1];
			pagename=pagename+','+str_array_end[2];
			if(str_array_begin.length===0)
			{
				str_array_begin[0]='';
			}
			//pagename=temp_pagename;
			place_name=str_array_begin[0];
		}
	}
	else
	{
		for(i=0; i < str_array_begin.length-1; i++)
		{
		//	if(str_array_begin[i][0] !== str_array_begin[i][0].toLowerCase())
		//	{
			if(i>0) pagename=pagename+' ';
			pagename = pagename + str_array_begin[i];
		//}			
		}
		if(str_array_begin[i][0] !== str_array_begin[i][0].toLowerCase())
		{
			if(i>0) pagename=pagename+' ';
			pagename = pagename + str_array_begin[i];
		}

		pagename=pagename+','+str_array_end[1];
		if(str_array_begin.length===0)
		{
			str_array_begin[0]='';
		}
		place_name=str_array_begin[0];
	}
	return pagename;
};

/** Retrieve page contents/info DIRECTLY from Census Bureau, process them, and update population data.
 * 
 * Then we want to process the data.
 * Specifically, we want to 
 * 1) Check to see if the page already contains either of the two templates used for historical population data
 *   If so, we need to potentially update the template with the given data.
 * 
 * 
 * 2) If not:
 *     a) If we find the ==Demographics== or == Demographics == section tags
 * 	        i) Replace in page content 
 * 			ii) Submit update
 * 	   b) Add to manual list of pages 
 *
 * @param fips_code the FIPS (Federal Information Processing Service) code for place
 * @param geoname the geographic name for the place as specified above
 * @param use_fips whether or not to make the query with the fips code or geoname
 */
CenPop.api.getExternal = function(fips_code, geoname, use_fips) {
	CenPop.pageCount();
	//CenPop.debug("Beginning getExternal",'global');
	CenPop.converted_geobox=false;
	CenPop.needs_fips=false; /* Initially assume FIPS is there already */
	if (CenPop.isStopped) {
		return CenPop.stop();
	}
	var has_geobox=false;
	var	str_array_end=geoname.toString().split(','); /* Split off the state name */
	var str_array_begin=str_array_end[0].split(' '); /* Split so we can remove lower case */
	place_name=str_array_begin[0];
	var data;
	var alt_fips_code=fips_code.replace('-','');
	/* Get the page title to query */
	pagename = CenPop.api.getQueryName(fips_code, geoname, use_fips, CenPop.in_get);
	var gsrsearch_str='"FIPS code '+fips_code+'" AND '+pagename;//+ ' OR "'+'INCITS place code '+alt_fips_code+'"';
	if($('#geoAdding').val()==='county')
	{
		use_fips=false; /* Don't use FIPS for counties, no ambiguities */
	}
	if(use_fips && !($('#geoAdding').val()==='mcd')) 
	{
		CenPop.debug("Using FIPS, gsrsearch_str="+gsrsearch_str,'global');
		data = {
			'action': 'query',
			'generator': 'search',
			'gsrsearch':  gsrsearch_str,
			'gsrnamespace': '0',
			'gsrlimit': '1',
			'prop': 'info|revisions|templates',
			'intoken': 'edit|protect|move',
			'tltemplates': 'Template:US Census population|Template:Historical populations|Template:Disambiguation|Template:Geodis|Template:Geobox',
			'rvprop': 'content|timestamp|ids',
			'rvlimit': '1',
			'indexpageids': true,
			'meta': 'userinfo',
			'uiprop': 'hasmsg'
		};
	}
	else
	{
		/* Use geoname */
	//	console.log("geoname.toString()="+geoname.toString())

		console.log('pagename="'+pagename+'"');
		data = {
			'action': 'query',
			'prop': 'info|revisions|templates',
			'intoken': 'edit|protect|move',
			'tltemplates': 'Template:US Census population|Template:Historical populations|Template:Disambiguation|Template:Geodis|Template:Geobox',
			'titles': pagename,
			'rvprop': 'content|timestamp|ids',
			'rvlimit': '1',
			'indexpageids': true,
			'meta': 'userinfo',
			'uiprop': 'hasmsg'
		};
	}
	//.log("data="+JSON.stringify(data));
	data.redirects = true;
	CenPop.status('load-page');
	CenPop.api.call(data, function(response) {
	//	console.log("Response="+JSON.stringify(response));
		var has_uscensuspop=false;
		if (response.query.userinfo.hasOwnProperty('messages')) {
			var view = mw.config.get('wgScriptPath') + '?title=Special:MyTalk';
			var viewNew = view + '&diff=cur';
			CenPop.status(
				'<span style="color:red;font-weight:bold;">'+
					CenPop.msg('status-newmsg', 
						'<a href="'+view+'" target="_blank">'+CenPop.msg('status-talklink')+'</a>',
						'<a href="'+viewNew+'" target="_blank">'+CenPop.msg('status-difflink')+'</a>')+
				'</span>', true);
			alert(CenPop.msg('new-message'));
			/* TODO: add something to automatically put next code in codebox? */
			CenPop.stop();
			return;
		}
		/* Added to get the page's name since we're searching using FIPS codes */
		
		
		pagename='';
		has_uscensuspop=false;
	//	CenPop.debug('response.query.pageids:'+JSON.stringify(response.query.pageids),'global');
		if(!response.query.pages || response.query.pageids[0]==='-1')
		{
			if(use_fips)
			{ 
				/* Check if we're doing fips only */
				var just_fips=$('#tryfipsonly').prop('checked');
				if(!just_fips)
				{
					if($('#geoAdding').val()==='mcd')					CenPop.debug("No page found with full name, Making new non-full call",'global');
					else CenPop.debug("No page found with FIPS, Making new non-FIPS call",'global');
					setTimeout(CenPop.api.getExternal(fips_code,geoname,false), 200);
					return;
				}
				else
				{
					console.log("No page found with FIPS, moving to next");
					
					CenPop.api.move_to_next(fips_code,geoname);
				}
				return;
				/* TODO: Make new function call to get county stuff without use_fips */
			//console.log("Page \'"+pagename+"\' not found, place_type is false");
			}
			else if(!CenPop.in_get)
			{
				CenPop.debug("Can't find a page here either. Trying last time",'global');
				CenPop.in_get=true;
				setTimeout(CenPop.api.getExternal(fips_code,geoname,false), 200);
				return;
			}
			else
			{
				CenPop.in_get=false;
				console.log("\tNo page found, Can't find with FIPS or geoname or anything else");
				CenPop.api.move_to_next(fips_code,geoname);
				return;
			}
		}
		else if(use_fips && response.query.pages[response.query.pageids[0]].title.search(place_name) == -1)
		{
			/* Clearly a bad title */
			console.log("Badly titled page found, trying again");
			if(use_fips)
			{ 
			//	console.log("Can't find with FIPS");
				console.log("Making new non-FIPS call");
				setTimeout(CenPop.api.getExternal(fips_code,geoname,false), 200);
				return;
				/* TODO: Make new function call to get county stuff without use_fips */
			//console.log("Page \'"+pagename+"\' not found, place_type is false");
			}
			else
			{
				console.log("\tCan't find with FIPS or geoname");
				setTimeout(CenPop.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000);
				CenPop.api.move_to_next(fips_code,geoname);
				return;
			}
		}
		else
		{
//			CenPop.debug('response.query.pageids='+response.query.pageids);
			//console.log("response="+JSON.stringify(response));
			CenPop.create_page(response.query,fips_code); /* Create details for the page */
			pagename=response.query.pages[response.query.pageids[0]].title;
			CenPop.page.name=pagename; /* Hope this works */
		}
		if(CenPop.page.templates)
		{
			for(var i=0;i<CenPop.page.templates.length; i++)
			{
				var curr_title=CenPop.page.templates[i].title;
				console.log("curr_title="+curr_title);
				if(curr_title === 'Template:US Census population' && !has_uscensuspop)
				{	
					console.log("Found us_censuspop");
					has_uscensuspop=true; 
					CenPop.page.has_template=true;
				}
				else if(curr_title === 'Template:Historical populations') { CenPop.page.has_template=true; }
				else if(curr_title === 'Template:Disambiguation' || curr_title === 'Template:Geodis')
				{
					/* TODO: In this case we ought to search the disambiguation page for the 
						correct place name */
					CenPop.page.disambig=true;	
				}
				if(curr_title === 'Template:Geobox')
				{
					console.log("received with Template:Geobox");
					CenPop.page.has_geobox=true;
				}
			}
		}
		else
		{
			console.log("No templates assigned ...");
		}
		if (response.query.redirects) {
			CenPop.page.name = response.query.redirects[0].to;
		}
		if(CenPop.page.disambig)
		{
			var curr_geo = $('#geoAdding').val();
			if(CenPop.in_get || curr_geo === 'county')
			{
				CenPop.in_get=false;
				console.log("Failed, hit disambig page");
				CenPop.api.move_to_next(fips_code,geoname);
				/* prevent infinite loops */
				return;
			}
			/* This is a disambiguation page.		 */
			CenPop.in_get = true;
			console.log("Failed, hit disambig page");
			setTimeout(CenPop.api.getExternal(fips_code,geoname,false), 200);
			//CenPop.api.move_to_next(fips_code,geoname);
			return;
		}

		/* Check for template */
		if(CenPop.page.has_template)
		{
		
		//	console.log('Has Template');
			//alert('CenPop.page.templates='+JSON.stringify(CenPop.page.templates));
			CenPop.page.newContent='';
		}
		else
		{
			//alert(CenPop.page.content);
		//	console.log("Adding new historical template");
			var newContent = CenPop.add_pop(CenPop.page.content);
		//	console.log("new template content="+newContent);
			if(newContent!=='')
			{
				CenPop.page.newContent=newContent;
			}
			else
			{
				/* Missing demographics section */
				CenPop.page.newContent='';
			}
		}
		if(CenPop.in_get)
		{
			CenPop.in_get=false;
		}
		var temp_ret='';
		if(CenPop.page.newContent==='')
		{
			if(has_uscensuspop)
			{
				temp_ret=CenPop.add_to_template(CenPop.page.content);
			//	alert('temp_ret='+temp_ret);
				if(temp_ret!=='')
				{
					CenPop.temp_ret_there(temp_ret);
					CenPop.added_popest_ref=true; /* It should have successfully added the population reference */
				}
				else
				{
					CenPop.in_get=false;
					console.log('temp_ret=\'\'');
					CenPop.api.move_to_next(fips_code,geoname);
					return;
				}
			}
			else
			{
				temp_ret=CenPop.add_to_histpop_template(CenPop.page.content);
			//	alert('temp_ret='+temp_ret);
				if(temp_ret!=='')
				{
					CenPop.temp_ret_there(temp_ret);
				}
				else
				{
					console.log("Failure at adding to histpop_template");
					CenPop.api.move_to_next(fips_code,geoname);
					return;
				}
			}
		}
		else
		{
			$('#editBoxArea').val(CenPop.page.newContent);
			$('#diffLen').html(CenPop.page.newContent.length-CenPop.page.content.length);
			if($('#autosave').prop('checked') !== true)
				$('.editbutton').prop('disabled', false);
			CenPop.added_pop=true;
		}
		if(CenPop.page.has_geobox)
		{
			console.log('has geobox');
			CenPop.converted_geobox=CenPop.api.geobox_to_infobox(CenPop.page.newContent, function(gotMyContent)
			{
				if(gotMyContent)
				{
					CenPop.page.newContent=gotMyContent;
				}
			});
		}
		if($('#addimages').prop('checked'))
		{
			imagesrch_data={
				'action': 'query',
				'generator': 'search',
				'gsrnamespace': '6',
				'gsrsearch': gsrsearch_str,
				'gsrlimit': '1',
				'prop': 'info|revisions',
				'rvprop': 'content',
				'indexpageids': true,
			};
			CenPop.api.call(imagesrch_data, function(response)
			{
				console.log('image response='+JSON.stringify(response));
				img_stuff={};
				var img_title='';
				if(response.query && response.query.pages)
				{
					var	curr_page_id=response.query.pageids[0];
					var curr_img_page=response.query.pages[curr_page_id];
					img_stuff['image_map']=curr_img_page.title;
					var img_text_match=curr_img_page.revisions[0]['*'].match(
						/(Location of.*\.)\n\nFIPS/);
					if(img_text_match && img_text_match.length>1 && img_text_match[1])
						img_stuff['map_caption']=img_text_match[1];
						
					console.log('img_stuff='+JSON.stringify(img_stuff));
					
				}
				else
				{
					console.log('ERROR: found no response');
				}
			/* Call infobox */
				CenPop.api.doInfobox(CenPop.page.newContent, fips_code, use_fips, img_stuff, function(gotMyContent) 
				{
					CenPop.gotNewestContent=gotMyContent;
					if(gotMyContent)
					{
						CenPop.modified_info=true;
					}
					if ($('#autosave').prop('checked')) {
						//timeout will take #throttle's value * 1000, if it's a number above 0. Currently defaults to 0.
						setTimeout(CenPop.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000);
					}
					CenPop.added_popest_ref=false;
				});
			});
		}
		else
		{
			/* Go directly to infobox */
			CenPop.api.doInfobox(CenPop.page.newContent, fips_code, use_fips, img_stuff, function(gotMyContent) 
			{
				CenPop.gotNewestContent=gotMyContent;
				if(gotMyContent)
				{
					CenPop.modified_info=true;
				}
				if ($('#autosave').prop('checked')) {
					//timeout will take #throttle's value * 1000, if it's a number above 0. Currently defaults to 0.
					setTimeout(CenPop.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000);
				}
				CenPop.added_popest_ref=false;
			});
		}

	});
};
/**
 * Moving out to separate function to move on to the next one on failure 
 */
CenPop.api.move_to_next = function(fips_code,geoname) {
	curr_art_val=$('#articleList').val();
	$('#articleList').val(curr_art_val+'\n'+geoname +', '+fips_code);
	CenPop.status('pausing');
	setTimeout(CenPop.next, Math.max($('#throttle').val() || 0, 3) * 1000);
};

CenPop.api.doInfobox = function(input, fips_code, use_fips, img_stuff, callback) {
	var temp_regexp=/{{Infobox[ ]+settlement/i;
	var ref_regexp=/^<ref name="([^"]*)"\s*>/;
	var curr_estref=$('.estRefText').val().match(ref_regexp);
	var curr_state=$('#stateAdding').val(), curr_year=$('.estYearText').val();
	var estref_text='';
	var today=new Date();
	var tot_km2=0, tot_sqmi=0;
	var curr_gaz_line;
	var date_options={year:'numeric',day:'numeric',month:'short'};
	var curr_date_str=today.toLocaleString('en-us',date_options);
	var area_footnotes='<ref name="CenPopGazetteer2016">{{cite web|title='+
	curr_year+' U.S. Gazetteer Files|url=https://www2.census.gov/geo/docs/maps-data/data/gazetteer/'+
	curr_year+'_Gazetteer/'+curr_year+'_gaz_place_'+curr_state+'.txt|publisher=United States Census Bureau|accessdate='+
	curr_date_str+'}}</ref>';
	// Check to see if we've added the full estRef 
	var loc_full_estref=input.search($('.estRefText').val());
	if(curr_estref != null && input.loc_full_estref != -1 && CenPop.added_popest_ref) {
		estref_text=curr_estref[0].slice(0,curr_estref[0].length-1)+'/>'; }
	else
	{
		estref_text=$('.estRefText').val()
//		estref_text=curr_estref[0];
	}
	var fields_to_update={
		'pop_est_as_of': $('.estYearText').val(),
		'pop_est_footnotes': estref_text,
		'population_est': CenPop.pop_page.curr_place[CenPop.est_column],
	
		'unit_pref': 'Imperial'
	};
	var fields_no_overwrite=[];
	if(img_stuff.image_map)
	{
		fields_to_update['image_map']=img_stuff.image_map;
		fields_to_update['map_caption']=img_stuff.map_caption;
		/* Add the image map and caption */
	}
	if(!use_fips)
	{
		fields_no_overwrite=['blank_name','blank_info'];
		fields_to_update['blank_name']='[[Federal Information Processing Standards|FIPS code]]';
		fields_to_update['blank_info']=fips_code;
	}
	if(fips_code in CenPop.gazetteer_page)
	{
		curr_gaz_line=CenPop.gazetteer_page[fips_code];
		tot_km2=((parseFloat(curr_gaz_line['ALAND'])+parseFloat(curr_gaz_line['AWATER']))/1000000.);
		tot_sqmi=1.*parseFloat(curr_gaz_line['ALAND_SQMI'])+parseFloat(curr_gaz_line['AWATER_SQMI']);

		fields_to_update['area_footnotes']=area_footnotes;
		fields_to_update['area_total_km2']=tot_km2.toFixed(2);
		fields_to_update['area_total_sq_mi']=parseFloat(tot_sqmi).toFixed(2);
		fields_to_update['area_land_km2']=(parseFloat(curr_gaz_line['ALAND'])/1000000.).toFixed(2);
		fields_to_update['area_water_km2']=(parseFloat(curr_gaz_line['AWATER'])/1000000.).toFixed(2);
		fields_to_update['area_land_sq_mi']=parseFloat(curr_gaz_line['ALAND_SQMI']).toFixed(2);
		fields_to_update['area_water_sq_mi']=parseFloat(curr_gaz_line['AWATER_SQMI']).toFixed(2);
		fields_to_update['population_density_sq_mi']= (fields_to_update['population_est']/parseFloat(curr_gaz_line['ALAND_SQMI'])).toFixed(2);
		fields_to_update['population_density_km2']= (fields_to_update['population_est']/(parseFloat(curr_gaz_line['ALAND'])/1000000.)).toFixed(2);
	} 
	
	/* Add population_as_of fields if most_recent_census is not 0 */ 
	if(CenPop.most_recent_census !== 0 && CenPop.most_recent_census % 10 === 0)
	{
		fields_to_update['population_as_of']='[['+CenPop.most_recent_census+' United States Census|'+CenPop.most_recent_census+']]';
		fields_to_update['population_total']=CenPop.most_recent_census_pop;
	}
	if($('#overwrite').prop('checked'))
	{
		/* With checked overwrite prop here we blank the population total field */
		fields_to_update['population_total']='';
	}
	var old_infobox=CenPop.get_template(input,temp_regexp);
	if(old_infobox!== null && old_infobox.length>0)
	{
		CenPop.page.newestContent=input.replace(old_infobox, function(match,p1,p2,p3)
		{
			var my_ret=CenPop.update_template(match,fields_to_update, fields_no_overwrite);	
			return my_ret;
		});
		CenPop.page.newestContent=CenPop.fix_removed_refs(CenPop.page.newestContent); /* Fix the references we removed */
		$('#editBoxArea').val(CenPop.page.newestContent);
		$('#diffLen').html(CenPop.page.newestContent.length-CenPop.page.content.length);
		if($('#autosave').prop('checked') !== true)
			$('.editbutton').prop('disabled', false);
	//	console.log("MOO");
		/* TODO: add replacement function for prose geography, call the callback there */
		callback(true);
	}
	else
	{
		callback(false);
	}
	
//	console.log(CenPop.page.newest_content);
};
/* Empty out removed_refs and replace */
CenPop.fix_removed_refs = function(to_replace)
{	
	var ref_regexp,ref_regexpstr,field_name;
	for(field_name in CenPop.removed_refs)
	{
		ref_regexpstr='<ref\\s+name\\s*=\\s*"?'+field_name+'"?\\s*/>';
		ref_regexp=new RegExp(ref_regexpstr);
	//	console.log('ref_regexp='+ref_regexp.source);
		to_replace=to_replace.replace(ref_regexp,function(match,p1,p2,p3)
		{
			console.log('Replacing "'+match+'" with '+CenPop.removed_refs[field_name]);
			return CenPop.removed_refs[field_name];
		});
	}
	CenPop.removed_refs={};
	return to_replace;
};

CenPop.api.geobox_to_infobox = function(input,callback)
{
	var temp_regexp=/{{[gG]eobox\s*\|\s*[sS]ettlement/;
	var old_geobox=CenPop.get_template(input,temp_regexp); // Find the geobox
//	console.log("old_geobox="+old_geobox);
	var ret_obj = CenPop.convert.parse_template(old_geobox);
//	console.log("ret_obj="+ret_obj)
	var real_ret='';
	if(ret_obj != null)
	{
		//for(x in ret_obj)
		//{
		//	console.log('ret_obj['+x+']='+ret_obj[x].toString());
		//}
		real_ret=input.replace(old_geobox, function(match,p1,p2,p3)
		{
			console.log("In replace");
			my_ret='{{Infobox settlement\n';
			var i, curr_field_now, equiv_geobox_field;
			var good_map_flag=false;
			var checked_for_item=false;
			curr_state=$('#stateAdding option:selected').text();
			for(i=0; i<CenPop.infobox_fields.length; i++)
			{
				curr_field_now=CenPop.infobox_fields[i];
				my_ret+='| '+curr_field_now + ' = ';
				if(curr_field_now in CenPop.infobox_geobox_fields && 
				CenPop.found_field(CenPop.infobox_geobox_fields[curr_field_now],ret_obj) != null)
				{
					equiv_geobox_field=CenPop.found_field(CenPop.infobox_geobox_fields[curr_field_now],ret_obj);
					my_ret += ret_obj[equiv_geobox_field]
					delete ret_obj[equiv_geobox_field];
				}
				else if(curr_field_now in CenPop.infobox_defaults)
				{
					my_ret += CenPop.infobox_defaults[curr_field_now];
				}
				else if(curr_field_now in CenPop.geobox_infobox_optionals)
				{
					equiv_geobox_field=CenPop.geobox_infobox_optionals[curr_field_now];
					if(equiv_geobox_field in ret_obj && ret_obj[equiv_geobox_field].toString().trim().length > 0)
					{
						my_ret+=ret_obj[equiv_geobox_field];
						delete ret_obj[equiv_geobox_field];
					}
				}
				else if(curr_field_now in CenPop.infobox_optionals)
				{
					my_ret += CenPop.infobox_optionals[curr_field_now];
				}
				else if(curr_field_now === 'image_map')
				{
					/* If it's a good places in county type map */
					/*('map' in ret_obj && 
					   ret_obj['map'].toString().search(/[\w\s]*incorporated and unincorporated areas[\w\s]*highlighted.svg/)!=-1)
					{*/
						good_map_flag=true;
						my_ret += ret_obj['map'];
						delete ret_obj['map'];
					/*}*/   
				}
				else if(good_map_flag && curr_field_now in CenPop.infobox_geobox_good_maps)
				{
					equiv_geobox_field=CenPop.infobox_geobox_good_maps[curr_field_now];
					if(equiv_geobox_field in ret_obj)
					{
						my_ret += ret_obj[equiv_geobox_field]
						delete ret_obj[equiv_geobox_field];
					}
				}
				else if(curr_field_now === 'image_map1')
				{
				//	console.log("In image_map1");
					//	console.log("curr_state="+curr_state);
					if(curr_state!='Hawaii' && curr_state != 'Alaska')
					{
						my_ret+=curr_state+' in United States (US48).svg';
					}
				}
				else if(curr_field_now === 'map_caption1')
				{
					if(curr_state!='Hawaii' && curr_state != 'Alaska')
					{
						my_ret+='Location of '+curr_state+' in the United States';
					}
				}
				my_ret=my_ret+'\n';
			}
			CenPop.debug("Fields not added",'update');
			for(val in ret_obj)
			{
				if(val.search(/round$/)===-1 && ret_obj[val].toString().trim().length > 0)
					CenPop.debug('ret_obj['+val+']='+ret_obj[val]);
			}
			my_ret+='}}\n';
			return my_ret;
		});
		$('#editBoxArea').val(CenPop.page.newContent);
		$('#diffLen').html(CenPop.page.newContent.length-CenPop.page.content.length);
		if($('#autosave').prop('checked') !== true)
			$('.editbutton').prop('disabled', false);
	//
		
		
	}
	callback(real_ret)
	if(real_ret.length > 0)
	{
		
		return true;
	}
	else
	{
		return false;
	}
	/* Now convert it, but how */
};

/* Whether or not one of the possible lists of objects are there */
CenPop.found_field = function(obj_list,list_of_fields)
{
	if(Array.isArray(obj_list))
	{
		for(i=0; i < obj_list.length; i++)
		{
			if(obj_list[i] in list_of_fields && list_of_fields[obj_list[i]].toString().trim().length>0)
			{
				//console.log('obj_list[i]='+obj_list[i]);
				return obj_list[i];
			}
		}
		return null;
	}
	else if(obj_list in list_of_fields)
	{
		//console.log('list_of_fields[obj_list]='+list_of_fields[obj_list]);
		return obj_list;
	}
//	console.log('Returning null for '+obj_list);
	return null;
};

CenPop.replace_geography = function()
{
	var my_str='';
	my_str+='According to the [[U.S. Census Bureau]], the (city|town|village|township|CDP) has a total area of ';
	my_str+='{{convert|33.8|mi2|km2}} of which {{convert|32.9|mi2|km2}}  is land and {{convert|0.9|mi2|km2}}';
	my_str+='(3.09%) is water.<ref name ="Gazetteer files">{{cite web|title=';
	my_str+='US Gazetteer files 2013|url=http://www.census.gov/geo/www/gazetteer/files/Gaz_places_national.txt';
	my_str+='|publisher=[[United States Census Bureau]]|accessdate=2014-02-05}}</ref>';	
};
