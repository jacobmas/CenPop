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
 * @version 1.1
 * @author Jacob Alperin-Sheriff, Joeytje50
 */
 
window.CenPop = {}; //The main global object for the script.
 
/***** User verification *****/
	
	
;(function() {
	if (mw.config.get('wgCanonicalNamespace')+':'+mw.config.get('wgTitle') !== 'Project:CenPop/Script' || CenPop.allowed === false || mw.config.get('wgUserName') === null) {
		CenPop.allowed = false;
	//	alert('wgCanonicalNamespace='+wgCanonicalNamespace+', wgTitle='+wgTitle);
		return;
	}
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:DemocraticLuntz/CenPop.css&action=raw&ctype=text/css',"text/css");
	mw.loader.load('mediawiki.action.history.diff');
 
	$.getScript('//en.wikipedia.org/w/index.php?title=User:DemocraticLuntz/i18n.js&action=raw&ctype=text/javascript',
	function() {
		if (CenPop.allowed === true && CenPop.loadedExternal===true && CenPop.loadedParse===true) {
			CenPop.init(); //init if verification has already returned true, loading done
		} else if (CenPop.allowed === false) {
			alert("Fred" + CenPop.msg('not-on-list'));
		}
	});
	
	$.getScript('//en.wikipedia.org/w/index.php?title=User:DemocraticLuntz/CenPopExternal.js&action=raw&ctype=text/javascript', function()
	{
		CenPop.loadedExternal=true;
		if(CenPop.messages.en&&CenPop.allowed === true && CenPop.loadedParse===true)
			CenPop.init();
	});
 
 	$.getScript('//en.wikipedia.org/w/index.php?title=User:DemocraticLuntz/cenparse.js&action=raw&ctype=text/javascript',
	function() {
		CenPop.loadedParse=true;	
		/** Extra code by DemocraticLuntz **/
		if(CenPop.messages.en&&CenPop.allowed === true && CenPop.loadedExternal===true)
			CenPop.init();
	});
	//RegEx Typo Fixing
	$.getScript('//en.wikipedia.org/w/index.php?title=User:Joeytje50/RETF.js&action=raw&ctype=text/javascript',
		function() {
			$('#refreshRETF').click(RETF.load);
	});
	CenPop.mw_Api=new mw.Api();
	(CenPop.mw_Api).get({
		action: 'query',
		titles: 'Project:AutoWikiBrowser/CheckPage',
		prop: 'revisions',
		meta: 'userinfo|siteinfo',
		rvprop: 'content',
		rvlimit: 1,
		uiprop: 'groups',
		siprop: 'namespaces',
		indexpageids: true,
		format: 'json',
	}).done(function(response) {
		if (response.error) {
			alert('API error: ' + response.error.info);
			CenPop = false; //preventing further access. No verification => no access.
			return;
		}
		CenPop.ns = response.query.namespaces; //saving for later
		CenPop.sysop = false; // groups.indexOf('sysop') !== -1;
		CenPop.username= mw.config.get('wgUserName');
		CenPop.bot = true;
		CenPop.allowed = true;
		CenPop.allowed = true;
		CenPop.file_list=[], CenPop.upload_list=[];
		CenPop.modified_pop=CenPop.modified_info=CenPop.added_popest_ref=false;
		CenPop.added_pop=CenPop.loaded_gazetteer=CenPop.loaded_pop=false;
		CenPop.add_count=0;
		CenPop.most_recent_census=	CenPop.most_recent_census_pop=0;
		CenPop.gotNewestContent=false;
		CenPop.mod_count=CenPop.mod_info_count=CenPop.geo_info_count=0;
		CenPop.in_get=false; /* A variable used to prevent infinite loops for failed gets */
		if (CenPop.messages.en&&CenPop.loadedParse===true &&CenPop.loadedExternal === true) 
			CenPop.init(); //init if messages have already loaded
	}).fail(function(xhr, error) {
		alert(CenPop.msg('verify-error') + '\n' + error);
		CenPop = false; //preventing further access. No verification => no access.
	}); 
})();
 
/***** Global object/variables *****/
 
var objs = ['page', 'api', 'convert', 'fn', 'pl', 'messages', 'setup', 'settings', 'ns'];
for (var i=0;i<objs.length;i++) {
	CenPop[objs[i]] = {};
}
CenPop.lang = mw.config.get('wgUserLanguage');
CenPop.isStopped = true;
CenPop.tooltip = window.tooltipAccessKeyPrefix || '';
 
/***** API functions *****/
 
//Main template for API calls
CenPop.api.call = function(data, callback, onerror) {
	data.format = 'json';
	if (data.action !== 'query') data.bot = true;
	$.ajax({
		data: data,
		dataType: 'json',
		url: mw.config.get('wgScriptPath') + '/api.php',
		type: 'POST',
		success: function(response) {
			if (response.error) {
				alert('API error: ' + response.error.info);
				CenPop.stop();
			} else {
				callback(response);
			}
		},
		error: function(xhr, error) {
			alert('AJAX error: ' + error);
			CenPop.stop();
			if (onerror) onerror();
		}
	});
};
 
//Get page diff, and process it for more interactivity
CenPop.api.diff = function(callback) {
	CenPop.status('diff');
	var editBoxInput = $('#editBoxArea').val();
//	var redirects = $('input.redirects:checked').val()==='follow'?'redirects':'inprop';
	var data = {
		'action': 'query',
		'prop': 'info|revisions',
		'indexpageids': true,
		'titles': CenPop.page.name,
		'rvlimit': '1',
		'rvdifftotext': editBoxInput
	};
	data[redirects] = 'redirect';
	CenPop.api.call(data, function(response) {
		var pageExists = response.query.pageids[0] !== '-1';
		var diff;
		if (pageExists) {
			var diffpage = response.query.pages[response.query.pageids[0]];
			diff = diffpage.revisions[0].diff['*'];
			if (diff === '') {
				diff = '<h2>'+CenPop.msg('no-changes-made')+'</h2>';
			} else {
				diff = '<table class="diff">'+
					'<colgroup>'+
						'<col class="diff-marker">'+
						'<col class="diff-content">'+
						'<col class="diff-marker">'+
						'<col class="diff-content">'+
					'</colgroup>'+
					'<tbody>'+diff+'</tbody></table>';
			}
		} else {
			diff = '<span style="font-weight:bold;color:red;">'+CenPop.msg('page-not-exists')+'</span>';
		}
		$('#resultWindow').html(diff);
		$('.diff-lineno').each(function() {
			$(this).parent().attr('data-line',parseInt($(this).html().match(/\d+/)[0])-1).addClass('lineheader');
		});
		$('table.diff tr').each(function() { //add data-line attribute to every line, relative to the previous one. Used for click event.
			if (!$(this).next().is('[data-line]') && !$(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line',parseInt($(this).data('line'))+1);
			} else if ($(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line',$(this).data('line')); //copy over current data-line for deleted lines to prevent them from messing up counting.
			}
		});
		CenPop.status('done', true);
		if (typeof(callback) === 'function') {
			callback();
		}
	});
};
 
/** Retrieve page contents/info, process them, and update population data.
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
 * 	   b) Add to manual list of pages */
CenPop.api.get = function(pagename) {
	CenPop.pageCount();
	if (CenPop.isStopped) {
		return CenPop.stop();
	}
	if (pagename === '#PRE-PARSE-STOP') {
		var curval = $('#articleList').val();
		//$('#articleList').val(curval.substr(curval.indexOf('\n') + 1));
		$('#preparse').prop('checked', false);
		CenPop.stop();
		return;
	}
	var data = {
		'action': 'query',
		'prop': 'info|revisions|templates',
		'intoken': 'edit|protect|move',
		'tltemplates': 'Template:US Census population|Template:Historical populations|Template:Disambiguation|Template:Geodis',
		'titles': pagename,
		'rvprop': 'content|timestamp|ids',
		'rvlimit': '1',
		'indexpageids': true,
		'meta': 'userinfo',
		'uiprop': 'hasmsg'
	};
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
			CenPop.stop();
			return;
		}
		
		CenPop.create_page(response.query,pagename); /* Create details for the page */
		has_us_census_pop=false;
		if(!CenPop.page.exists && CenPop.place_type)
		{
			/* TODO: the page is altogether missing, so we should try a different format */
			CenPop.place_type=false; 
			/* Call it again without the place type */
			var top_list=CenPop.pop_page.list[CenPop.pop_page.curr_pos].replace(/"/g,'').split(',');
			CenPop.page.name = CenPop.format_page_query(top_list,$('#geoAdding').val(),
			CenPop.place_type,false);
			CenPop.api.get(CenPop.page.name);
			return;
		}
		else if(!CenPop.page.exists)
		{
			var curr_art_val = $('#articleList').val();
			$('#articleList').val(curr_art_val+'\n'+pagename);
		 	setTimeout(CenPop.next, Math.max(+$('#throttle').val() || 0, 2) * 1000);
			return;
		}
		if(CenPop.page.templates)
		{
			for(var i=0;i<CenPop.page.templates.length; i++)
			{
				var curr_title=CenPop.page.templates[i].title;
				if(curr_title === 'Template:US Census population')
				{	
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
			}
		}
		var curr_art_val = $('#articleList').val();
		if (response.query.redirects) {
			CenPop.page.name = response.query.redirects[0].to;
		}
		if(CenPop.page.disambig)
		{
			var curr_geo = $('#geoAdding').val();

			if(CenPop.in_get || curr_geo === 'county')
			{
				CenPop.in_get=false;
				$('#articleList').val(curr_art_val+'\n'+pagename);
				setTimeout(CenPop.next, Math.max(+$('#throttle').val() || 0, 2) * 1000);
				/* prevent infinite loops */
				return;
			}
			/* This is a disambiguation page.
			   Try with county, then return */
			var top_list=CenPop.pop_page.list[CenPop.pop_page.curr_pos].replace(/"/g,'').split(',');
			//CenPop.pop_page.curr_place=top_list;
		/*	var place_name = top_list[0].split('\"')[1];
			var county_name = top_list[1].split('\"')[1];
			var state_name = top_list[2].split('\"')[1];
			var full_name = place_name + ", " + county_name +", " + state_name;*/
			CenPop.page.name = CenPop.format_page_query(top_list,curr_geo,
				CenPop.place_type,true);
			CenPop.in_get=true;
			CenPop.api.get(CenPop.page.name);
			return;
		}
		else if(CenPop.in_get)
		{
			CenPop.in_get=false;
		}
		/* Check for template */
		if(CenPop.page.has_template)
		{
			CenPop.page.newContent='';
		}
		else
		{
			//alert(CenPop.page.content);
			var newContent = CenPop.add_pop(CenPop.page.content);
			if(newContent!=='')
				CenPop.page.newContent=newContent;
			else
				CenPop.page.newContent='';
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
				}
				else
				{
					$('#articleList').val(curr_art_val+'\n'+pagename);
		 			setTimeout(CenPop.next, Math.max(+$('#throttle').val() || 0, 2) * 1000);
					return;
				}
			}
			else
			{
				temp_ret=CenPop.add_to_histpop_template(CenPop.page.content);
				if(temp_ret!=='')
				{
					CenPop.temp_ret_there(temp_ret);
	
				}
				else
				{
					$('#articleList').val(curr_art_val+'\n'+CenPop.page.name);
		 			setTimeout(CenPop.next, Math.max(+$('#throttle').val() || 0, 2) * 1000);
					return;
				}
			}
		}
		else
		{
			$('#editBoxArea').val(CenPop.page.newContent);
			$('#diffLen').html(CenPop.page.newContent.length-CenPop.page.content.length);
			if($('#autosave').prop('checked') !== true)
			{
				$('.editbutton').prop('disabled', false);
			}
			CenPop.added_pop=true;
		}
		if ($('#autosave').prop('checked')) {
					//timeout will take #throttle's value * 1000, if it's a number above 0. Currently defaults to 0.
			setTimeout(CenPop.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000);
		}
	});
};

/**
 * Upload the ith file 
 */
CenPop.api.upload_ith = function(i, curr_Api) {
	var curr_promise, new_filename;
	var fips_code;
	var upload_text_begin='== Summary ==\nLocation of ';
	var upload_text_end='Own work, based on concept by Arkyan, using '+
	'Census Bureau Tiger GIS data and a custom fork of Kartography adapted for '+
	'this purpose, available at {{URL|https://github.com/jacobmas/kartograph.py}}\n'+
	'== Licensing ==\n{{self|cc-by-sa-4.0}}\n';
	curr_file=CenPop.file_list[i];
	if(curr_file != null)
	{
		my_match=curr_file.name.toString().match(/^(.+)_(County|Parish)_(.+)_(Incorporated_and_Unincorporated_areas)_(.+)_(Highlighted)_([0-9]+)/);
		place_match=my_match[5].replace(/_/g,' ');
		fips_code=''+my_match[7].slice(0,2)+'-'+my_match[7].substr(2);
		upload_text=upload_text_begin+place_match+' in '+my_match[1].replace('_',' ')+' '+my_match[2];
		upload_text=upload_text+', '+my_match[3].replace('_', ' ')+'.\n\nFIPS code: '+fips_code+'\n\n'+upload_text_end;
		new_filename=my_match[1]+'_'+my_match[2]+'_'+my_match[3]+'_'+my_match[4]+'_'+my_match[5]+'_'+my_match[6]+'.svg';
		CenPop.debug("new_filename="+new_filename+", about to set timeout for upload", 'upload');
		setTimeout(function()
		{
			data={
				ignorewarnings: true,
				text: upload_text,
				filename: new_filename
			};
			curr_Api.upload(curr_file,data)
			.then(function() {
				CenPop.debug("Done uploading "+i,'upload');
				if(++i < CenPop.file_list.length) {
					CenPop.api.upload_ith(i, curr_Api); }
				else
				{
					$('#inputFile').files=CenPop.file_list=[]; /* Shoddy coding but javascript handles garbage */
				}
			}, 
			function() 
			{ CenPop.debug("Failed/warned at uploading "+i,'upload'); 
				if(++i < CenPop.file_list.length) {
					CenPop.api.upload_ith(i, curr_Api); }
				else
					$('#inputFile').files=CenPop.file_list=[]; /* Shoddy coding but javascript handles garbage */
			}, 
			function() 
			{
				CenPop.debug("Made progress with "+i+", at state"+this.state(),'upload');
			});
			
		}, Math.max(+$('#uploadthrottle').val() || 0, 1) * 1000);
	
	}
}

CenPop.api.upload = function() {
	var curr_api=new mw.Api();
	CenPop.status('upload');
	if(CenPop.file_list.length>0)
		CenPop.api.upload_ith(0,curr_api);

	CenPop.status('done');
};

//Some functions with self-explanatory names:
CenPop.api.submit = function(gotNewestContent=false) {
	$('.editbutton').prop('disabled', true);

	var summary = $('#summary').val();
	var printed=false;
	if(CenPop.added_pop)
	{
		summary+='Added historical population';
		printed=true;
	}
	if(CenPop.modified_pop)
	{
		summary+='Modified historical population';
		printed=true;
	}
	if(CenPop.modified_info)
	{
		if(printed)
			summary+=", ";
		summary += 'infobox';
		printed=true;
	}
	if(CenPop.converted_geobox)
	{
		if(printed)
			summary+=", ";
		summary += 'Geobox->Infobox';
		printed=true;
	}
	summary += ' (via CenPop script)';
	var data = {
		'title': CenPop.page.name,
		'summary': summary,
		'action': 'edit',
		'basetimestamp': CenPop.page.revisions ? CenPop.page.revisions[0].timestamp : '',
		'token': CenPop.page.edittoken,
		'text': $('#editBoxArea').val()
	};
	if((!CenPop.gotNewestContent && CenPop.page.content !== CenPop.page.newContent) || 
	CenPop.gotNewestContent && CenPop.page.newestContent != CenPop.page.content)
	{
		CenPop.status('submit');
		CenPop.api.call(data, function(response) {
			if(CenPop.added_pop)
			{
				CenPop.add_count=CenPop.add_count+1;
				$('#newPages').html(CenPop.add_count);
				CenPop.added_pop=false;
			}
			if(CenPop.modified_pop && typeof response.edit.newrevid !== 'undefined')
			{
				CenPop.mod_count=CenPop.mod_count+1;
				$('#modPages').html(CenPop.mod_count);
				CenPop.modified_pop=false;
			}
			if(CenPop.modified_info && typeof response.edit.newrevid !== 'undefined')
			{
				CenPop.mod_info_count=CenPop.mod_info_count+1;
				$('#modInfoPages').html(CenPop.mod_info_count);
				CenPop.modified_info=false;
			}
			if(CenPop.converted_geobox && typeof response.edit.newrevid !== 'undefined')
			{
				CenPop.geo_info_count=CenPop.geo_info_count+1;
				$('#geoInfoPages').html(CenPop.geo_info_count);
				CenPop.converted_geobox=false;
			}
			CenPop.log('edit', response.edit.title, response.edit.newrevid);
			CenPop.status('done', true);
			CenPop.gotNewestContent=false;
			CenPop.next();
		});
	}
	else
	{
		/* Update status and move on */
		CenPop.log('null-edit', CenPop.page.name, '');
		CenPop.status('done', true);
		CenPop.gotNewestContent=false;
		CenPop.next();
	}
};

/**
 * Checks if we modified the population, changes the color of count if file has shrunk
 * (TODO: this part broken thanks to new modifications the script makes later)
 */
CenPop.temp_ret_there = function(temp_ret)
{
	CenPop.page.newContent=temp_ret;
	if(CenPop.page.content !== CenPop.page.newContent)
		CenPop.modified_pop=true;
	$('#editBoxArea').val(CenPop.page.newContent);
	if($('#autosave').prop('checked') !== true)
	{
		$('.editbutton').prop('disabled', false);
	}
	var temp_diff=CenPop.page.newContent.length-CenPop.page.content.length;
	$('#diffLen').html(temp_diff);
	if(temp_diff<0) { $('#diffLen').css("color", "red"); }
	else { $('#diffLen').css("color","black");	}		
};

CenPop.api.preview = function() {
	CenPop.status('preview');
	CenPop.api.call({
		'title': CenPop.page.name,
		'action': 'parse',
		'text': $('#editBoxArea').val()
	}, function(response) {
		$('#resultWindow').html(response.parse.text['*']);
		$('#resultWindow div.previewnote').remove();
		CenPop.status('done', true);
	});
};
CenPop.api.move = function() {
	CenPop.status('move');
	var topage = $('#moveTo').val().replace(/\$x/gi, CenPop.page.pagevar);
	var summary = $('#summary').val();
	summary += ' (via CenPop script)';
	var data = {
		'action':'move',
		'from': CenPop.page.name,
		'to': topage,
		'token': CenPop.page.movetoken,
		'reason': summary,
		'ignorewarnings': 'yes'
	};
	if ($('#moveTalk').prop('checked')) data.movetalk = true;
	if ($('#moveSubpage').prop('checked')) data.movesubpages = true;
	if ($('#suppressRedir').prop('checked')) data.noredirect = true;
	CenPop.api.call(data, function(response) {
		CenPop.log('move', response.move.from, reponse.move.to);
		CenPop.status('done', true);
		if (!$('#moveTo').val().match(/\$x/i)) $('#moveTo').val('')[0].focus(); //clear entered move-to pagename if it's not based on the pagevar
		CenPop.next(topage);
	});
};
 
/***** Main other functions *****/
 
//Show status message
CenPop.status = function(action, done) {
	$('#summary').prop('disabled', !done); //Disable box when not done (so busy loading). re-enable when done loading.
	var status = CenPop.msg('status-'+action);
	if (status === false) return;
	var spinImg = '<img src="//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" width="15" height="15" alt="'+CenPop.msg('status-alt')+'"/>';
	if (status) {
		if (!done) { //spinner if not done
			status += ' ' + spinImg;
		}
	} else {
		status = action;
	}
	$('#status').html(status);
	CenPop.pageCount();
	return action=='done';
};
 
CenPop.pageCount = function() {
	if (CenPop.allowed === false||!$('#articleList').length) return;
	$('#articleList').val(($('#articleList').val()||'').replace(/(^[ \t]*$\n)*/gm, ''));
	CenPop.list = $('#articleList').val().split('\n');
	var count = CenPop.list.length;
	if (count === 1 && CenPop.list[0] === '') count = 0;
//	$('#totPages').html(count);
};
 
//Adds a line to the logs tab.
CenPop.log = function(action, page, info) {
	var d = new Date();
	var pagee = encodeURIComponent(page);
	var extraInfo = '', actionStat = '';
	switch (action) {
		case 'edit':
			if (typeof info === 'undefined') {
				action = 'null-edit';
				actionStat = 'nullEdits';
				extraInfo = '';
			} else {
				extraInfo = ' (<a target="_blank" href="/index.php?title='+pagee+'&diff='+info+'">diff</a>)';
				actionStat = 'pagesSaved';
			}
			break;
		case 'move':
			extraInfo = ' to <a target="_blank" href="/wiki/'+encodeURIComponent(info)+'" title="'+info+'">'+info+'</a>';
			break;
		case 'null-edit':
			action = 'null-edit';
			actionStat = 'nullEdits';
			extraInfo = '';
			break;
	}
	actionStat = '#' + (actionStat);
	$(actionStat).html(+$(actionStat).html() + 1);
	$('#actionlog tbody')
		.append('<tr>'+
			'<td>'+(d.getHours())+':'+(d.getMinutes())+':'+(d.getSeconds())+'</td>'+
			'<th>'+action+'</th>'+
			'<td><a target="_blank" href="/wiki/'+pagee+'" title="'+page+'">'+page+'</a>'+ extraInfo +'</td>'+
		'</tr>')
		.parents('.CenPoptabc').scrollTop($('#actionlog tbody').parents('.CenPoptabc')[0].scrollHeight);
};
// Adds a console message if we've set to debug that area 
CenPop.debug = function(message, tag='global')
{
	if(tag === 'global' || $('#debug-'+tag).prop('checked'))
	{
		console.log(message);
	}
};

/**
 * Create the CenPop.page object to aid in processing
 */
 CenPop.create_page = function(query,pagename) {
 		CenPop.page = query.pages[query.pageids[0]];
		CenPop.page.name = pagename;

	 	var varOffset = CenPop.list[0].indexOf('|') !== -1 ? CenPop.list[0].indexOf('|') + 1 : 0;
	 	CenPop.page.pagevar = CenPop.list[0].substr(varOffset);
		CenPop.page.content = CenPop.page.revisions ? CenPop.page.revisions[0]['*'] : '';
		CenPop.page.exists = !query.pages["-1"];
		CenPop.page.deletedrevs = query.deletedrevs;
		CenPop.page.watched = CenPop.page.hasOwnProperty('watched');
		CenPop.page.has_template=false;

		CenPop.page.disambig=false;	
 };
 


/* New next working with Census Bureau */
CenPop.next = function(nextPage) {
	CenPop.pop_page.curr_pos+=1
	if(CenPop.pop_page.list.length<=CenPop.pop_page.curr_pos)
	{
		CenPop.status('Finished list!');
		CenPop.stop();
		return;
	}
	//curr_geo=$('#geoAdding').val();
	if($('input[name="load_from"]:checked').val()==='file')
	{
		var top_list=CenPop.pop_page.list[CenPop.pop_page.curr_pos].replace(/"/g,'').split(',');
	
		CenPop.place_type=true;
	
		var full_name=CenPop.format_page_query(top_list,curr_geo,
			CenPop.place_type,false);
		var place_name, county_name, state_name, full_name;
		CenPop.pop_page.curr_place=top_list;
		
		CenPop.page.name = full_name;
		CenPop.pageCount();
		CenPop.api.get(CenPop.page.name);
	}
	else if($('input[name="load_from"]:checked').val()==='census')
	{
	//	var top_list=CenPop.pop_page.list[CenPop.pop_page.curr_pos].replace(/"/g,'').split(',');
	
		var curr_entity = CenPop.pop_page.list[CenPop.pop_page.curr_pos];
		CenPop.pop_page.curr_place = curr_entity;
		CenPop.pageCount();
		/* Get via FIPS code */
		console.log("Current FIPS: '"+curr_entity[2]+'-'+curr_entity[3]);
		/* Send geoname too */
		if($('#geoAdding').val() === 'mcd')
		{
			CenPop.api.getExternal(curr_entity[2]+'-'+curr_entity[3]+'-'+curr_entity[4], curr_entity[1],true);
		}
		else
			CenPop.api.getExternal(curr_entity[2]+'-'+curr_entity[3], curr_entity[1],true);
	}
};
 
//Stop everything, reset inputs and editor
CenPop.stop = function() {
	$('#stopbutton,'+
	  '.editbutton,'+
	  '.CenPoptabc[data-tab="1"] .editbutton,'+
	  '.CenPoptabc[data-tab="4"] button').prop('disabled', true);
	 $('#runButton').prop('disabled',true);
	$('#startbutton,#articleList,'+
	  '#replacesPopup button,'+
	  '#replacesPopup input,'+
	  '.CenPoptabc input, select').prop('disabled', false);
	$('input[name="load_from"]').prop('disabled',false);
	$('#load_from_div').prop('disabled',false);
	CenPop.isStopped = true;
};
 
//Start AutoWikiBrowsing; this is where we should load in the population
CenPop.start = function() {
	CenPop.isStopped = false;
	/* Disable the fields to avoid wacky race conditions */
	$('#startbutton').prop('disabled',true);
	$('.CenPoptabc[data-tab="1"] button, #replacesPopup button, #replacesPopup input, select').prop('disabled', true);
	$('.estYearText, #stateAdding, #geoAdding, #min_fips').prop('disabled',true);
	$('input[name="load_from"]').prop('disabled',true);
		$('#load_from_div').prop('disabled',true);

	//console.log('load_from='+$('input[name="load_from"]:checked').val());
	if($('input[name="load_from"]:checked').val()==='census')
	{
		CenPop.api.loadPopExternal($('.estYearText').val(), $('#stateAdding').val(),
		$('#geoAdding').val(), function()
			{
				console.log("Done loading PopExternal");
				CenPop.loaded_pop=true;
				if(CenPop.loaded_pop && CenPop.loaded_gazetteer)
				{
					CenPop.on_load_external();
					CenPop.loaded_pop=CenPop.loaded_gazetteer=false;
				}
			});
				CenPop.api.loadGazetteer($('.estYearText').val(), $('#stateAdding').val(),
		$('#geoAdding').val(), function()
			{
				CenPop.loaded_gazetteer=true;
				if(CenPop.loaded_pop && CenPop.loaded_gazetteer)
				{
					CenPop.on_load_external();
					CenPop.loaded_pop=CenPop.loaded_gazetteer=false;
				}
			});
	}
	else if($('input[name="load_from"]:checked').val()==='file')
	{
		CenPop.api.loadPop($('.loadFileText').val(), $('.hasFirstHeader').prop('checked'),$('.estYearText').val(),
	 function()
			{
				/* 	Enable run, edit, etc. buttons upon completion */
				$('#stopbutton, #runButton, .editbutton, .CenPoptabc[data-tab="4"] button').prop('disabled', false);
			
			//	$('#startbutton').prop('disabled',true);
			
			});
	}
};

CenPop.on_load_external = function()
{
	/* 	Enable run, edit, etc. buttons upon completion */
	$('#stopbutton, #runButton, .editbutton, .CenPoptabc[data-tab="4"] button').prop('disabled', false);
	var fips_start=$('#min_fips').val();
	if(fips_start!=='')
	{
		var fips_num=parseInt(fips_start);
		while(CenPop.pop_page.curr_pos+1<CenPop.pop_page.list.length && 
			fips_num > parseInt(CenPop.pop_page.list[CenPop.pop_page.curr_pos+1][3]) )
		{
			CenPop.pop_page.curr_pos=CenPop.pop_page.curr_pos+1;
		}
	}
};

CenPop.run = function() {
	CenPop.pageCount();
	$('.editbutton').prop('disabled', true);
	$('#overwrite').prop('disabled',true)
	if(CenPop.pop_page.list.length<=CenPop.pop_page.curr_pos)
	{
		alert('Finished list!');
		return;
	}
//	if(!CenPop.pop_page.hasHeader)
//	{
//		CenPop.pop_page.curr_pos -= 1; /* So it will increment to 0 */
//	}
	CenPop.next();
}
 
/***** General functions *****/
 
//Clear all existing timers to prevent them from getting errors
CenPop.fn.clearAllTimeouts = function() {
	var i = setTimeout(function() {
		return void(0);
	}, 1000);
	for (var n=0;n<=i;n++) {
		clearTimeout(n);
		clearInterval(i);
	}
	console.log('Cleared all running intervals up to index',i);
};
 
//Filter an array to only contain unique values.
CenPop.fn.uniques = function(arr) {
	var a = [];
	for (var i=0, l=arr.length; i<l; i++) {
		if (a.indexOf(arr[i]) === -1 && arr[i] !== '') {
			a.push(arr[i]);
		}
	}
	return a;
};
 
//i18n function
CenPop.msg = function(message) {
	var args = arguments;
	var lang = CenPop.lang;
	if (typeof message === 'object') {
		lang = message[1];
		message = message[0];
	}
	if (!CenPop.messages || !CenPop.messages.en) return false;
	var msg;
	if (CenPop.messages.hasOwnProperty(lang) && CenPop.messages[lang].hasOwnProperty(message)) {
		msg = CenPop.messages[lang][message];
	} else {
		msg = (CenPop.messages.en.hasOwnProperty(message)) ? CenPop.messages.en[message] : '';
	}
	msg = msg.replace(/\$(\d+)/g, function(match, num) {
		return args[+num] || match;
	});
	return msg;
};
 
/***** Init *****/
 
CenPop.init = function() {
	console.log(CenPop.messages.en, !!CenPop.messages.en);
	CenPop.fn.clearAllTimeouts();
	if (!CenPop.messages[CenPop.lang]) CenPop.lang = 'en';
 
	var findreplace = '<div class="replaces">'+

		'<label style="display:block;" id="summaryLabel">Summary:<input class="fullwidth" type="text" id="summary" maxlength="170"></label>'+
	
	'</div>';
	/* The Historical Census Input Fields, separating from elsewhere */
	var censusinputfields='<div id="histPopDiv">Historical Census Info</div>'+
	'<div class="replaces" id="censusInputFields">'+
			'<label title="'+CenPop.msg('begin-year-tip')+'" style="display:block;">'+'begin_year='+' <input type="text" class="beginYearText"/></label>'+
		'<label title="'+CenPop.msg('est-year-tip')+'" style="display:block;">'+'estyear='+' <input type="text" class="estYearText"/></label>' +
		'<label style="display:block;">'+'estref='+' <input type="text" class="estRefText"/></label>'+
		'<label style="display:block;">'+'footnote='+' <input type="text" class="footnoteText"/></label>'+
		'</div>';
 
	var NSList = '<select multiple name="namespace" id="namespacelist">';
	for (var i in CenPop.ns) {
		if (parseInt(i) < 0) continue; //No Special: or Media: in the list
		NSList += '<option value="'+CenPop.ns[i].id+'" selected>'+(CenPop.ns[i]['*'] || '('+CenPop.msg('namespace-main')+')')+'</option>';
	}
	NSList += '</select>';
 
 	temp_state_list=["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Washington, DC", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
	temp_fips_list=["01","02","04","05","06","08","09","10","11","12","13","15","16","17","18","19","20","21","22",
	"23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39",
	"40","41","42","44","45","46","47","48","49","50","51","53","54","55","56"];
	stateAddingStr='';
	for(i=0; i < temp_state_list.length;i++)
	{
		stateAddingStr = stateAddingStr + '<option value="'+temp_fips_list[i]+'">'+temp_state_list[i]+'</option>';
	}
 	var census_load_str=	'<div id="select_div">'+
			'<div class="to_add_div" id="state_div">'+
				'<span class="to_add_span">State</span>'+
				'<select id="stateAdding" title="State to add updates from">'+
				stateAddingStr+
			'</select></div>'+
			'<div class="to_add_div" id="geo_div">'+
				'<span class="to_add_span">Geo Level</span>'+
				'<select id="geoAdding" title="Geography level to add updates from">'+
				'<option value="county">'+'County'+'</option>'+
				'<option value="place" selected>'+'Place'+'</option>'+
				'<option value="mcd">'+'County Sub.'+'</option>'+
			'</select></div>'+
			'<div class="to_add_div" id="fips_div">'+
			'<span class="to_add_span">Start FIPS</span>'+
			'<input type="text" id="min_fips" title="Minimum FIPS code for locality to start adding from" maxlength="5">'+
		'</div></div>';
	var file_load_str='<div id="file_load" class="to_add_div">'
	+'<label style="display:block;">'+'File to Load:'+' <input type="text" class="loadFileText"/></label>'
	+'<label style="display:block;">'+'First line is header:'+'<input type="checkbox" id="hasfirstheader" name="firstheader"/></label>'
	+'</div>';
	/***** Interface *****/
 
	document.title = 'CenPop Script'+(document.title.split('-')[1] ? ' -'+document.title.split('-')[1] : '');
	$('body').html(
		'<article id="resultWindow"></article>'+
		'<main id="inputsWindow">'+
			'<div id="inputsBox">'+
				'<aside id="articleBox">'+
					'<b>'+'Pages failed to add:'+'</b>'+
				//	'<div id="articleList"></div>'+
					'<textarea id="articleList"></textarea>'+
				'</aside>'+
				'<section id="tabs">'+
					'<nav class="tabholder">'+
						'<span class="CenPoptab active" data-tab="1">'+CenPop.msg('tab-editing')+'</span> '+
						'<span class="CenPoptab cenfields" data-tab="2">'+CenPop.msg('tab-cen-fields')+'</span> '+
						'<span class="CenPoptab debug" data-tab="3">'+CenPop.msg('tab-debug')+'</span> '+
						'<span class="CenPoptab upload" data-tab="4">'+CenPop.msg('tab-upload')+'</span> '+

						' <span class="CenPoptab log" data-tab="5">'+'Log'+'</span> '+
					'</nav>'+
					'<section class="CenPoptabc active" data-tab="1"></section>'+
					'<section class="CenPoptabc cenfields" data-tab="2"></section>'+
					'<section class="CenPoptabc debug" data-tab="3"></section>'+
					'<section class="CenPoptabc upload" data-tab="4"></section>'+
					'<section class="CenPoptabc log" data-tab="5"></section>'+
					'<footer id="status">done</footer>'+
				'</section>'+
				'<aside id="editBox">'+
					'<b>'+CenPop.msg('editbox-caption')+'</b> (<span id="diffLen">0</span>)&emsp;'+
					'<textarea id="editBoxArea"></textarea>'+
				'</aside>'+
			'</div>'+
		'</main>'+
		'<footer id="stats">'+
			CenPop.msg('stat-new')+ '<span id="newPages">0</span>;&emsp;'+
			CenPop.msg('stat-modhist')+' <span id="modPages">0</span>;&emsp;'+
			CenPop.msg('stat-geoinfo')+' <span id="geoInfoPages">0</span>;&emsp;'+
			CenPop.msg('stat-modinfobox')+' <span id="modInfoPages">0</span>;&emsp;'+
			CenPop.msg('stat-save')+' <span id="pagesSaved">0</span>;&emsp;'+
			CenPop.msg('stat-null')+' <span id="nullEdits">0</span>;&emsp;'+
			'Fail:'+' <span id="noMatch">0</span>;&emsp;'+
		'</footer>'+
		'<div id="overlay" style="display:none;"></div>'
	);
	

 
	$('.CenPoptabc[data-tab="1"]').html(
		'<div id="load_from_div">'+
		'<span class="to_add_span">'+
		'<label id="load_label">Load From: </label>'+
		'<label class="radio_label"><input type="radio" class="my_radio" name="load_from" value="census" checked>Census Bureau</label>'+
		'<label class="radio_label"><input type="radio" class="my_radio" name="load_from" value="file">Internal File</label>'+
		'</span>'+
		'</div>'+
		'<div id="load_details">'+census_load_str+'</div>'+
		'<div class="check_div">'+
		(CenPop.bot?
		'<span class="to_add_span">'+
			'<label><input type="checkbox" id="autosave"> '+CenPop.msg('auto-save')+'</label>'+
			'<label title="'+CenPop.msg('tip-save-interval')+'" class="divisor">'+
				CenPop.msg('save-interval', '<input type="number" min="0" value="0" style="width:50px" id="throttle" disabled>')+
			'</label>'+
			'</span>'
		:'')+
		'<span class="to_add_span">'+
		'<label><input type="checkbox" id="overwrite"> '+'Overwrite'+'</label>'+
		'</span>'+
		'<span class="to_add_span">'+
		'<label title="'+CenPop.msg('tip-only-fips')+'"><input type="checkbox" id="tryfipsonly" /> Try FIPS only</label>'+
		'</span>'+
		'<span class="to_add_span">'+
		'<label title="'+CenPop.msg('tip-add-images')+'"><input type="checkbox" id="addimages" />Add images</label>'+
		'</span>'+
		'<div id="button_div">'+
		'<button class="editbutton" id="nextButton" disabled accesskey="n" title="['+CenPop.tooltip+'n]">'+'Next'+'</button>'+
		'<button class="editbutton" id="submitButton" disabled accesskey="s" title="['+CenPop.tooltip+'s]">'+CenPop.msg('editbutton-save')+'</button>'+
		'<button class="editbutton" id="previewButton" disabled accesskey="p" title="['+CenPop.tooltip+'p]">'+CenPop.msg('editbutton-preview')+'</button>'+
		'<button class="editbutton" id="diffButton" disabled accesskey="d" title="['+CenPop.tooltip+'d]">'+CenPop.msg('editbutton-diff')+'</button>'+
		'</div>'+
		'</div>'+
		'<span id="startstop">'+
			'<button id="startbutton" accesskey="a" title="Start and load data">'+CenPop.msg('editbutton-start')+'</button>'+
			'<br>'+
			'<button id="stopbutton" disabled accesskey="q" title="['+CenPop.tooltip+'q]">'+CenPop.msg('editbutton-stop')+'</button> '+
			'<br>'+
			'<button id="runButton" disabled>'+CenPop.msg('editbutton-run')+'</button>'+
		'</span>'+
		findreplace
	);

	$('.CenPoptabc[data-tab="2"]').html(censusinputfields
		);
	
	$('.CenPoptabc[data-tab="3"]').html(
		'<div class="my_header">'+'Debug To Show'+'</div>'+
		'<div class="check_div">'+
		'<span class="to_add_span">'+
		'<label><input type="checkbox" id="debug-update" />'+CenPop.msg('debug-update')+'</label>'+
		'</span>'+
		'<span class="to_add_span">'+
		'<label><input type="checkbox" id="debug-gazetteer" />'+CenPop.msg('debug-gazetteer')+'</label>'+
		'</span>'+
		'<span class="to_add_span">'+
		'<label><input type="checkbox" id="debug-upload" />'+CenPop.msg('debug-upload')+'</label>'+
		'</span>'+
		'</div>'
	);
	$('.CenPoptabc[data-tab="4"]').html(
		'<div class="check_div">'+
		'<span class="to_add_span">'+
		'<form id="myform" name="myform">'+
		'<input type="file" id="inputFile" multiple />'+
		'</span>'+
		'</form>'+
		'<span class="to_add_span">'+'Upload Throttle:'+
		'<input type="number" min="0" value="0" id="uploadthrottle">'+
		'</span>'+
		'<span class="to_add_span">'+
		'<button class="editButton" id="uploadButton">'+'Upload'+'</button>'+
		'</span>'+
		'</div>'
		);
	
	$('.CenPoptabc[data-tab="5"]').html('<table id="actionlog"><tbody>'
	+'</tbody></table>');

	$('body').addClass('CenPop'); //allow easier custom styling of CenPop.
 	$('#file_load').hide(); /* Initially hide the file load stuff */
	/***** Event handlers *****/
 
	//Alert user when leaving the tab, to prevent accidental closing.
	onbeforeunload = function() {
		return "Closing this tab will cause you to lose all progress.";
	};
	ondragover = function(e) {
		e.preventDefault();
	};
 
	$('.CenPoptab').click(function() {
		$('.active').removeClass('active');
		$(this).addClass('active');
		$('.CenPoptabc[data-tab="'+$(this).attr('data-tab')+'"]').addClass('active');
	});
 
 
	$('#preparse-reset').click(function() {
		$('#articleList').val($('#articleList').val().replace(/#PRE-PARSE-STOP/g,'').replace(/\n\n/g, '\n'));
	});

 
	if (window.RETF) $('#refreshRETF').click(RETF.load);
 

	$('#moreReplaces').click(function() {
		$('#replacesPopup').append(findreplace);
	});
	$('#replacesPopup').on('keydown', '.replaces:last', function(e) {
		if (e.which === 9) $('#moreReplaces')[0].click();
	});
 
	$('#geoAdding').change(function()
	{
		curr_geo=$('#geoAdding').val();
		if(curr_geo==='mcd')
		{
			CenPop.begin_decennial=5;
			$('#min_fips').prop('maxlength',9);
		}
		else {
			CenPop.begin_decennial=4;
			$('#min_fips').prop('maxlength',5);
		}
	}
	);
	
	$('#inputFile').change(function()
		{
		/* Set the file list to the new files */
		CenPop.file_list=this.files;
		});

	$('#autosave').change(function() {
		$('#throttle').prop('disabled', !this.checked);
	});
 	
	$('#articleList').prop('readonly',true);
	/* Get the code to make the external call */

	
	$('#startbutton').click(CenPop.start);
	$('#stopbutton').click(CenPop.stop);
	$('#runButton').click(CenPop.run);
	$('#submitButton').click(CenPop.api.submit);
	$('#previewButton').click(CenPop.api.preview);
	$('#diffButton').click(CenPop.api.diff);
	$('#nextButton').click(function() { CenPop.next(); });
	$('#uploadButton').click(CenPop.api.upload);
	

	/* Hardcoded for now: read in later? Make easier to change? */
	$('.beginYearText').val(CenPop.default_fields.beginYearText);
	$('.estYearText').val(CenPop.default_fields.estYearText);
	$('.estRefText').val(CenPop.default_fields.estRefText);
	$('.footnoteText').val(CenPop.default_fields.footnoteText);
	/* To read in all the census data for places for 2016 */
	$('.loadFileText').val(CenPop.default_fields.loadFileText);

	/* Switch load based on selected radio button */
	$('input[name="load_from"]').change(function() {
		//console.log("Changed load_from");
		if($(this).val()==='census')
		{
			$('#load_details').html(census_load_str);
		}
		else if($(this).val()==='file')
		{
			$('#load_details').html(file_load_str);
		}
	});
};


//Disable CenPop altogether when it's loaded on a page other than Project:AutoWikiBrowser/Script. This script shouldn't be loaded on any other page in the first place.
if (CenPop.allowed === false) CenPop = false;
