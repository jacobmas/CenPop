/**
 * Formats a Census page query. 
 * top_list is an array of a line in the files, 0th element is place name, 
 * 1st element is place type, 2nd element is county,
 * 3rd element is state
 * 
 * curr_geo is place 
 * 
 * 
 * Now changed to 0th element is est_column, then decennial begins at 4th
 */
CenPop.est_column=0;
CenPop.begin_decennial=4;
CenPop.removed_refs={};




 
CenPop.format_page_query = function(top_list,curr_geo,show_type,show_county)
{
	var place_name, place_type, county_name, state_name, full_name;
	place_name = top_list[0];//.split('\"')[1];
	place_type = top_list[1];//.split('\"')[1];
	county_name = top_list[2];//.split('\"')[1];
	state_name = top_list[3];//.split('\"')[1];
	full_name = place_name;
	if(show_type)
	{
		if (place_type === 'township')
		{
			full_name+=' township';	
		}
		else
		{
			full_name+=' ('+place_type+')';
		}
	}
	if(show_county)
	{
		full_name+=', '+county_name; 
	}
	/* Regardless of flag, we want county at beginning if we're doing counties */
	if(curr_geo==='county') { full_name = county_name; } 
	full_name+=', '+state_name;
	//console.log("Full name="+full_name);
	return full_name;
};
/**
 * Returns a string containing the US Census Population template as it currently
 * exists in the given page prior to any modifications we may make. We use this 
 * so that we can replace it later with our (possibly) different and updated 
 * data. 
 */
CenPop.get_pop_str = function(input) {
	var ret_str='';
	var begin_re = new RegExp('\{\{USCensusPop|\{\{US[ \n\r]*Census[ \n\r]*population');
	var brace_depth=2;
	var begin_pos=input.search(begin_re), curr_pos=0;
	var in_len=input.length;
	if(begin_pos===-1)
	{
		$('#noMatch').html(+$('#noMatch').html() + 1);
	//	alert('Did not find pattern');
		return '';
	}
	curr_pos=begin_pos+2;
	while(brace_depth>0 && curr_pos < in_len)
	{
		if(input.charAt(curr_pos)==='{') brace_depth++;
		else if(input.charAt(curr_pos)==='}') brace_depth--;
		curr_pos+=1;
	}
	if(curr_pos< in_len && brace_depth===0)
	{
		if(input.charAt(curr_pos)==='\n')
		{
			return input.slice(begin_pos,curr_pos+1);
		}
		return input.slice(begin_pos,curr_pos);
	}
	else
	{
		return '';
	}
};



CenPop.add_to_template = function(input) {
	var result=CenPop.get_pop_str(input);
	if(result)
	{
		// If the template already exists, add our data 
		var ret = input.replace(result,function(match,p1,p2,p3)
			{
				var term_map = new Map();
				var begin_year=parseInt($('.beginYearText').val());
				var re1=new RegExp('\|');
				var last_right_braces=match.lastIndexOf('}}');
				var split_bar_list = match.slice(0,last_right_braces).split('\|'); // slice off ending }}
			
				var temp_str='Split data\n';
				var split_equals_list;
			//	var list_len=split_equals_list.length;
				var footnote_str='';
				var in_footnote=false;
				var left_brace, right_brace;
				var left_brace_count=0, right_brace_count=0;
				var left_bracket, right_bracket;
				var left_bracket_count=0, right_bracket_count=0;
				var in_ref=false;
				var last_beginref, last_endref;
				var brace_depth=0, bracket_depth=0;
				for (var elem in split_bar_list)
				{
					//var re2=new RegExp('\s*\=\s*');
					if(!in_ref && brace_depth<=0 && bracket_depth<=0)
					{
						in_footnote=false;
					}
					split_equals_list=split_bar_list[elem].split('\=');
					
					if(in_footnote)
					{
						footnote_str+='|';

						last_beginref=split_bar_list[elem].lastIndexOf('<ref');
						last_endref=split_bar_list[elem].lastIndexOf('</ref>');
						if(last_beginref !== -1 && (last_endref === -1 || last_endref < last_beginref))
						{
							in_ref=true;
						}
						else if(last_endref !== -1)
						{
						//	alert('split_bar_list[elem]='+split_bar_list[elem]);
							in_ref=false;
						}
						left_brace=split_bar_list[elem].match('\{\{');
						right_brace=split_bar_list[elem].match('\}\}');
						left_brace_count=0, right_brace_count=0;
						if(left_brace!==null)  { left_brace_count=left_brace.length; }
						if(right_brace!==null) { right_brace_count=right_brace.length; }
						brace_depth=brace_depth+left_brace_count-right_brace_count;
						
						left_bracket=split_bar_list[elem].match('\\[\\[');
						right_bracket=split_bar_list[elem].match('\\]\\]');
						left_bracket_count=0, right_bracket_count=0;
						if(left_bracket!==null)  { left_bracket_count=left_bracket.length; }

						if(right_bracket!==null) { right_bracket_count=right_bracket.length; }
						bracket_depth=bracket_depth+left_bracket_count-right_bracket_count;
						//if(brace_depth<0) { brace_depth=0; }
						footnote_str+=split_bar_list[elem].trim();
					}
					else if(split_equals_list.length>=2)
					{
						var first_str=split_equals_list[0].trim(), 
							second_str=split_equals_list[1].trim();
						if(first_str.match('footnote')!== null)
						{
							in_footnote=true;
							for(var j=1; j < split_equals_list.length; j++)
							{
								if(j>1)
								{
									footnote_str+='='; // Add the removed '=' if we're not right after footnote
								}
							
								last_beginref=split_equals_list[j].lastIndexOf('<ref');
								last_endref=split_equals_list[j].lastIndexOf('</ref>');
								if(last_beginref !== -1 && (last_endref === -1 || last_endref < last_beginref))
								{
									in_ref=true;
								}
								else if(last_endref !== -1)
								{
									in_ref=false;
								}
								left_brace=split_equals_list[j].match('\{\{');
								right_brace=split_equals_list[j].match('\}\}');
								left_brace_count=0, right_brace_count=0;
								if(left_brace!==null)  { left_brace_count=left_brace.length; }
								if(right_brace!==null) { right_brace_count=right_brace.length; }
								brace_depth=brace_depth+left_brace_count-right_brace_count;
								if(brace_depth<0) { brace_depth=0; }
								
								left_bracket=split_equals_list[j].match('\\[\\[');
								right_bracket=split_equals_list[j].match('\\]\\]');
								left_bracket_count=0, right_bracket_count=0;
								if(left_bracket!==null)  { left_bracket_count=left_bracket.length; }
								if(right_bracket!==null) { right_bracket_count=right_bracket.length; }
								bracket_depth=bracket_depth+left_bracket_count-right_bracket_count;
								if(bracket_depth<0) { bracket_depth=0; }
								
								footnote_str+=split_equals_list[j];
							}
						}
						else if(first_str.match('[0-9]+') !== null)
						{
							second_int=parseInt(second_str);
							if(!isNaN(second_int) && second_int!==0)
							{
								term_map.set(parseInt(first_str),second_int);
							}
							else
							{
								term_map.set(first_str,second_str);
							}
						}
						else if(first_str.match('align') !== null)
						{
							term_map.set(first_str.trim(),second_str.trim());
						}
						else if(first_str.match('[0-9]+n') !== null)
						{
							
							term_map.set(first_str.trim(),second_str.trim());
						}
						else
						{
							//console.log('Matching failed: first_str='+first_str+', second_str='+second_str);
							//alert('first_str'+first_str+', second_str'+second_str);
						}
					}
			
				}
				footnote_str=footnote_str.trim();

				
				var pop_stuff='{{US Census population\n';
			
				if(term_map.has('align'))
				{
					pop_stuff+='|align='+term_map.get('align')+'\n';
				}
				/* Add terms from before our begin year if they exist
				*/
				
				for(my_year=1790; my_year < begin_year; my_year+=10)
					if(term_map.has(my_year) && term_map.get(my_year)!==0)
					{
						/* Update global variable with current maximum official Census year */
						CenPop.most_recent_census=my_year;
						CenPop.most_recent_census_pop=term_map.get(my_year);
						pop_stuff+='|'+my_year+"= "+term_map.get(my_year);
					//	console.log(my_year+": "+term_map.has(my_year+'n'));
						if(term_map.has(my_year+'n') && term_map.get(my_year+'n')!==0)
						{
							
						
							pop_stuff+='|'+my_year+"n= "+term_map.get(my_year+'n');
						}
						pop_stuff+="\n";
					}
				for(i=CenPop.pop_page.curr_place.length-1;i>=CenPop.begin_decennial; i--)
				{
					var year_pop=parseInt(CenPop.pop_page.curr_place[i]);	
					var curr_year=begin_year+(CenPop.pop_page.curr_place.length-1-i)*10;
					if(!($('#overwrite').prop('checked') && year_pop!==0) &&
					 	term_map.has(curr_year) && term_map.get(curr_year)!==0)
					{
						pop_stuff+='|'+curr_year+"= "+term_map.get(curr_year)+"\n";
					}
					else if(year_pop!==0)
					{
			
						pop_stuff+='|'+curr_year+"= "+CenPop.pop_page.curr_place[i]+"\n";
					}
				}
				pop_stuff+='|estyear='+$('.estYearText').val()+'\n'; // Todo: add field to put it in 
				pop_stuff+='|estimate='+CenPop.pop_page.curr_place[CenPop.est_column]+'\n';
				pop_stuff=pop_stuff+'|estref='+$('.estRefText').val()+'\n';
				if(term_map.has('align-fn'))
				{
					pop_stuff+='|align-fn='+term_map.get('align-fn')+'\n';
				}
				if(footnote_str!=='' && !$('#overwrite').prop('checked'))
				{
					pop_stuff=pop_stuff+'|footnote='+footnote_str+'\n';
				}
				else
				{
					/* Overwrite with a new footnote too */
					pop_stuff=pop_stuff+'|footnote='+$('.footnoteText').val()+'\n';
				}
				if(brace_depth>=0)
				{
					pop_stuff+='}}\n';
				}
				return pop_stuff;
			});
	
		return ret;
	}
	else
	{
		return '';
	}
};

CenPop.get_histpop_str = function(input) {
	var ret_str='';
	var begin_re = new RegExp('\{\{HistPop|\{\{Historical[ \n\r]*[pP]opulations');
	var brace_depth=2;
	var begin_pos=input.search(begin_re), curr_pos=0;
	var in_len=input.length;
	if(begin_pos===-1)
	{
		$('#noMatch').html(+$('#noMatch').html() + 1);
		//alert('Did not find pattern');
		return '';
	}
	curr_pos=begin_pos+2;
	while(brace_depth>0 && curr_pos < in_len)
	{
		if(input.charAt(curr_pos)==='{') brace_depth++;
		else if(input.charAt(curr_pos)==='}') brace_depth--;
		curr_pos+=1;
	}
	if(curr_pos< in_len && brace_depth===0)
	{
		if(input.charAt(curr_pos)==='\n')
		{
			return input.slice(begin_pos,curr_pos+1);
		}
		return input.slice(begin_pos,curr_pos);
	}
	else
	{
		return '';
	}
};

CenPop.add_to_histpop_template = function(input) {
//	var temp_re = new RegExp('(\{\{USCensusPop|\{\{US Census population).*\n((\|.*\=.*\n)+)(\|[^\s\}]*)?\}\}\n');
//	var result=input.match(temp_re);
	var result=CenPop.get_histpop_str(input);
	//alert(result);
	if(result)
	{
		// If the demographics section exists, add our data 
		var ret = input.replace(result,function(match,p1,p2,p3)
			{
				var copy_list = ['title','type','align','width','state','shading','pop_name','percentages'];
				var term_map = new Map();
				var begin_year=parseInt($('.beginYearText').val());
				var re1=new RegExp('\|');
				var last_right_braces=match.lastIndexOf('}}');
				var split_bar_list = match.slice(0,last_right_braces).split('\|'); // slice off ending }}
			
				var temp_str='Split data\n';
				var split_equals_list;
			//	var list_len=split_equals_list.length;
				var footnote_str='';
				var source_str='';
				var in_footnote=false, in_source=false;
				var left_brace, right_brace;
				var left_brace_count=0, right_brace_count=0;
				var in_footnote_ref=false, in_source_ref=false;
				var left_bracket, right_bracket;
				var left_bracket_count=0, right_bracket_count=0;
				var brace_depth=0, bracket_depth=0;
				var bar_iter=0;
				for (bar_iter=0; bar_iter< split_bar_list.length; bar_iter++)
				{
					//alert('split_bar_list['+bar_iter+']='+split_bar_list[bar_iter]);
					elem = bar_iter;
					//var re2=new RegExp('\s*\=\s*');
					if(!in_footnote_ref && brace_depth<=0 && bracket_depth <=0)
					{
						in_footnote=false;
					}
					if(!in_source_ref && brace_depth<=0 && bracket_depth <= 0)
					{
						in_source=false;
					}
					split_equals_list=split_bar_list[elem].split('\=');
					
					if(in_footnote)
					{
				//		alert('MOO\n');
						footnote_str+='|';
						if(split_bar_list[elem].match('<ref') !== null 
							&& split_bar_list[elem].match('<ref[^]*</ref>') === null)
						{
							in_footnote_ref=true;
						}
						else if(split_bar_list[elem].match('</ref>') !== null)
						{
							in_footnote_ref=false;
						}
						left_brace=split_bar_list[elem].match('\{\{');
						right_brace=split_bar_list[elem].match('\}\}');
						left_brace_count=0, right_brace_count=0;
						if(left_brace!==null)  { left_brace_count=left_brace.length; }

						if(right_brace!==null) { right_brace_count=right_brace.length; }
						brace_depth=brace_depth+left_brace_count-right_brace_count;
				
						left_bracket=split_bar_list[elem].match('\\[\\[');
						right_bracket=split_bar_list[elem].match('\\]\\]');
						left_bracket_count=0, right_bracket_count=0;
						if(left_bracket!==null)  { left_bracket_count=left_bracket.length; }
						if(right_bracket!==null) { right_bracket_count=right_bracket.length; }
						bracket_depth=bracket_depth+left_bracket_count-right_bracket_count;
					//	console.log("bracket_depth="+bracket_depth+", split_bar_list="+split_bar_list[elem]);
						//if(brace_depth<0) { brace_depth=0; }
						footnote_str+=split_bar_list[elem].trim();
					}
					else if(in_source)
					{
											//	alert('SHROO\n');

						source_str+='|';
						if(split_bar_list[elem].match('<ref') !== null 
							&& split_bar_list[elem].match('<ref[^]*</ref>') === null)
						{
							in_source_ref=true;
						}
						else if(split_bar_list[elem].match('</ref>') !== null)
						{
							in_source_ref=false;
						}
						left_brace=split_bar_list[elem].match('\{\{');
						right_brace=split_bar_list[elem].match('\}\}');
						left_brace_count=0, right_brace_count=0;
						if(left_brace!==null)  { left_brace_count=left_brace.length; }
						if(right_brace!==null) { right_brace_count=right_brace.length; }
						brace_depth=brace_depth+left_brace_count-right_brace_count;
						
						left_bracket=split_bar_list[elem].match('\\[\\[');
						right_bracket=split_bar_list[elem].match('\\]\\]');
						left_bracket_count=0, right_bracket_count=0;
						if(left_bracket!==null)  { left_bracket_count=left_bracket.length; }
						if(right_bracket!==null) { right_bracket_count=right_bracket.length; }
						bracket_depth=bracket_depth+left_bracket_count-right_bracket_count;
						
						//if(brace_depth<0) { brace_depth=0; }
						source_str+=split_bar_list[elem].trim();
					}
					else if(split_equals_list.length>=2)
					{
						var first_str=split_equals_list[0].trim(), 
							second_str=split_equals_list[1].trim();
						if(first_str.match('footnote')!== null)
						{
							in_footnote=true;
							for(var j=1; j < split_equals_list.length; j++)
							{
								if(j>1)
								{
									footnote_str+='='; // Add the removed = if we're not right after footnote
								}
								if(split_equals_list[j].match('<ref') !== null 
									&& split_equals_list[j].match('<ref[^]*</ref>') === null)
								{
									in_footnote_ref=true;
								}
								else if(split_equals_list[j].match('</ref>') !== null)
								{
									in_footnote_ref=false;
								}
								left_brace=split_equals_list[j].match('\{\{');
								right_brace=split_equals_list[j].match('\}\}');
								left_brace_count=0, right_brace_count=0;
								if(left_brace!==null)  { left_brace_count=left_brace.length; }
								if(right_brace!==null) { right_brace_count=right_brace.length; }
								brace_depth=brace_depth+left_brace_count-right_brace_count;
								if(brace_depth<0) { brace_depth=0; }
								
								left_bracket=split_equals_list[j].match('\\[\\[');
								right_bracket=split_equals_list[j].match('\\]\\]');
								left_bracket_count=0, right_bracket_count=0;
								if(left_bracket!==null)  { left_bracket_count=left_bracket.length; }
								if(right_bracket!==null) { right_bracket_count=right_bracket.length; }
								bracket_depth=bracket_depth+left_bracket_count-right_bracket_count;
								if(bracket_depth<0) { bracket_depth=0; }
								
							//	console.log("bracket_depth="+bracket_depth+", split_equals_list="+split_equals_list[j]);

								footnote_str+=split_equals_list[j];
							}
						}
						else if(first_str.match('source')!== null)
						{
							in_source=true;
							for(var j=1; j < split_equals_list.length; j++)
							{
								if(j>1)
								{
									source_str+='='; // Add the removed = if we're not right after footnote
								}
								if(split_equals_list[j].match('<ref') !== null 
									&& split_equals_list[j].match('<ref[^]*</ref>') === null)
								{
									in_source_ref=true;
								}
								else if(split_equals_list[j].match('</ref>') !== null)
								{
									in_source_ref=false;
								}
								left_brace=split_equals_list[j].match('\{\{');
								right_brace=split_equals_list[j].match('\}\}');
								left_brace_count=0, right_brace_count=0;
								if(left_brace!==null)  { left_brace_count=left_brace.length; }
								if(right_brace!==null) { right_brace_count=right_brace.length; }
								brace_depth=brace_depth+left_brace_count-right_brace_count;
								if(brace_depth<0) { brace_depth=0; }
								
								left_bracket=split_equals_list[j].match('\\[\\[');
								right_bracket=split_equals_list[j].match('\\]\\]');
								left_bracket_count=0, right_bracket_count=0;
								if(left_bracket!==null)  { left_bracket_count=left_bracket.length; }
								if(right_bracket!==null) { right_bracket_count=right_bracket.length; }
								bracket_depth=bracket_depth+left_bracket_count-right_bracket_count;
								if(bracket_depth<0) { bracket_depth=0; }
								source_str+=split_equals_list[j];
							}
						}
						else
						{
							/* Deal with copy_list terms */
							term_map.set(first_str.trim(),second_str.trim());
						}
					}
					else if(split_equals_list.length==1)
					{
						//alert('POO\n');
						var first_str1=split_equals_list[0].trim();
						var second_num;
						if(first_str1.match('[0-9]+') !== null && bar_iter+1 < split_bar_list.length)
						{
							bar_iter+=1;
							second_num=parseInt(split_bar_list[bar_iter]);
							if(!isNaN(second_num) && second_num!==0)
							{
								term_map.set(parseInt(first_str1),second_num);
							}
						}
					}
					//temp_str+=split_equals_list+'\n\n';
				}
				footnote_str=footnote_str.trim();
				source_str=source_str.trim();
	
				
				var pop_stuff='{{Historical populations\n';
				var added_est=false;
				for (var my_key of term_map.keys()) {
					key_term=my_key.toString();
					if(key_term.match('[0-9]+') === null)
					{
						//console.log('key_term='+key_term);
						pop_stuff+='|'+key_term+'= '+term_map.get(my_key)+'\n';
					}
					else
					{
						/* Don't re-add recent estimates */
					
						var temp_estyear=parseInt($('.estYearText').val());
						var temp_lastcensus=temp_estyear-(temp_estyear % 10);
						/* Get most recent number for adding to infobox */
						if(term_map.has(temp_lastcensus))
						{
							CenPop.most_recent_census=temp_lastcensus;
							CenPop.most_recent_census_pop=term_map.get(temp_lastcensus);
						}
						else
						{
							CenPop.most_recent_census=0;
							CenPop.most_recent_census_pop=0;
						}
						/* TODO: FIX FOR FUTURE */
//						console.log('NOT NULL: key_term='+key_term," temp_estyear="+temp_estyear+" temp_lastcensus="+temp_lastcensus);
						if(!(parseInt(key_term)>temp_lastcensus && parseInt(key_term) < temp_estyear))
						{
//							console.log("\tif succeeded");
							if(key_term===$('.estYearText').val()) { 
								added_est=true;
							}
							pop_stuff+='|'+key_term+'|'+term_map.get(my_key)+'\n';
						}
					}
				}
		
				for(i=CenPop.pop_page.curr_place.length-1;i>=CenPop.begin_decennial; i--)
				{
					var year_pop=parseInt(CenPop.pop_page.curr_place[i]);	
					var curr_year=begin_year+(CenPop.pop_page.curr_place.length-1-i)*10;
					if(term_map.has(curr_year) && term_map.get(curr_year)!==0)
					{
						pop_stuff+='';
					//	pop_stuff+='|'+curr_year+"= "+term_map.get(curr_year)+"\n";
					}
					else if(year_pop!==0)
					{
			
						pop_stuff+='|'+curr_year+"|"+CenPop.pop_page.curr_place[i]+"\n";
					}
				}
			//	pop_stuff+='|estyear='+$('.estYearText').val()+'\n'; // Todo: add field to put it in 
			//	pop_stuff+='|estimate='+CenPop.pop_page.curr_place[3]+'\n';
				if(!added_est) {
				pop_stuff+='|'+$('.estYearText').val()+'|'+CenPop.pop_page.curr_place[CenPop.est_column]+'\n'; }
			//	pop_stuff=pop_stuff+'|estref='+$('.estRefText').val()+'\n';
				if(source_str!=='')
				{
					pop_stuff=pop_stuff+'|source='+source_str+'\n';
				}
				else
				{
					pop_stuff=pop_stuff+'|source='+$('.footnoteText').val()+'\n';
				}
				if(footnote_str!=='')
				{
					pop_stuff=pop_stuff+'|footnote='+footnote_str+'\n';
				}
				if(brace_depth>=0)
				{
					pop_stuff+='}}\n';
				}
				//alert(pop_stuff);
				return pop_stuff;
				//return 'WEIRDFUCKINGWORKAROUNDHOPETHISISNTONWIKIPEDIAORELSEWEBESCREWEDINTHERECTALCLAUS ANDTHERECTALGAPE';
			});
	//	alert('ret='+ret);
		if(ret.search('WEIRDFUCKINGWORKAROUNDHOPETHISISNTONWIKIPEDIAORELSEWEBESCREWEDINTHERECTALCLAUS ANDTHERECTALGAPE')!=-1)
		{
			ret='';
		}
		return ret;
	}
	else
	{
		return '';
	}
};



CenPop.add_pop = function(input) {
//	console.log("input="+input);
	var demo_re = new RegExp('(\=\=Demographics\=\=|\=\= Demographics \=\=)\n');
	var geo_re = new RegExp('(\=\=Geography\=\=|\=\= Geography \=\=)\n');
	var sec_re = /==[\s\w]+==\n/;
	var pop_stuff='{{US Census population\n', my_iter=0;
	var begin_year=parseInt($('.beginYearText').val());
	var sec_match;
	var geo_pos=0;
	for(i=CenPop.pop_page.curr_place.length-1;i>=CenPop.begin_decennial; i--)
	{
		var year_pop=parseInt(CenPop.pop_page.curr_place[i]);	
		if(year_pop!==0)
		{
			var curr_year=begin_year+(CenPop.pop_page.curr_place.length-1-i)*10;
			pop_stuff+='|'+curr_year+"= "+CenPop.pop_page.curr_place[i]+"\n";
		}
	}
	pop_stuff+='|estyear='+$('.estYearText').val()+'\n'; /* Todo: add field to put it in */
	pop_stuff+='|estimate='+CenPop.pop_page.curr_place[CenPop.est_column]+'\n';
	pop_stuff=pop_stuff+'|estref='+$('.estRefText').val()+'\n';
	pop_stuff=pop_stuff+'|footnote='+$('.footnoteText').val()+'\n';
	pop_stuff+='}}\n';
	//alert('MOO:\n' + input);
	if(input.search(demo_re)!=-1)
	{
		/* If the demographics section exists, add our data */
		var ret = input.replace(demo_re,function(match)
		{
			return match+pop_stuff;
		});
		return ret;
	}
	else if((geo_pos=input.search(geo_re)) !== -1)
	{
		sec_match=input.substr(geo_pos+2).match(sec_re);
		console.log('sec_match='+JSON.stringify(sec_match));
		if(sec_match != null)
		{
			var ret1=input.replace(sec_match[0],function(match)
			{
				return '==Demographics==\n'+pop_stuff+match;	
			});
			return ret1;
		}
		else
		{
			console.log("Could not find "+sec_re);
		//	alert('Could not find demographics!');
			//$('#noDemos').html(+$('#noDemos').html() + 1);
	
			/* Return empty string to let calling function know demographics section is missing */
			return '';
		}
	}
	else
	{
		sec_match=input.match(sec_re);
		console.log('sec_match='+JSON.stringify(sec_match));
		if(sec_match != null)
		{
			var ret1=input.replace(sec_match[0],function(match)
			{
				return '==Demographics==\n'+pop_stuff+match;	
			});
			return ret1;
		}
		else
		{
			console.log("Could not find "+sec_re);
		//	alert('Could not find demographics!');
			//$('#noDemos').html(+$('#noDemos').html() + 1);
	
			/* Return empty string to let calling function know demographics section is missing */
			return '';
		}
		console.log("Could not find geography");
		return '';
	}
};
/**
 * Add FIPS code to place it's missing from, and return new content, empty if fail
 */
CenPop.add_FIPS = function(content,fips_code) 
{
	regexp1='/{{Infobox settlement.*\|blank_name\s*=\s*([[Federal Information Processing Standards|FIPS code]]|\s*)\s*\|blank_info\s*=\s*\|';
	regexp2='/{{Infobox settlement.*\|blank_name\s*=.*\|blank_info\s*=\s*\|';
};

/**
 * Update top-level templates in a wiki document, returning the new document (TODO)
 * 
 * @param content the raw text of the document (unparsed)
 * @param templates_to_update an object containing each template to update  
 * @return the updated content, null if a failure happens
 */


/** 
 * Return the entire template specified by the template regexp to return 
 * @param input the input to search
 * @param temp_regexp the regular expression object for the beginning of the template 
 */
 
CenPop.get_template = function(input, temp_regexp) {
	var ret_str='';
//	var begin_re = temp_regexp;
	var brace_depth=1;
	var begin_pos=input.search(temp_regexp), curr_pos=0;
	var in_len=input.length, in_nowiki=false;
	CenPop.in_comment=false;
	if(begin_pos===-1)
	{
		CenPop.debug('Failed to match template with "'+temp_regexp,'global');
		//$('#noMatch').html(+$('#noMatch').html() + 1);
	//	alert('Did not find pattern');
		return '';
	}
	curr_pos=begin_pos+2;
	while(brace_depth>0 && curr_pos < in_len)
	{
		if(!in_nowiki && !CenPop.in_comment && curr_pos + 2 <= in_len && 
			input.slice(curr_pos,curr_pos+2)==='{{')
		{
			brace_depth++;
			curr_pos+=2; 
		}
		else if(!in_nowiki && !CenPop.in_comment && curr_pos+2 <= in_len && 
			input.slice(curr_pos,curr_pos+2)==='}}')
		{
			brace_depth--;
			curr_pos+=2;
		}
		else if(curr_pos+8<=in_len && input.slice(curr_pos,curr_pos+8)==='<nowiki>')
		{
			in_nowiki=true;
			curr_pos+=8;
		}
		else if(in_nowiki&&curr_pos+9<=in_len && input.slice(curr_pos,curr_pos+9)==='</nowiki>')
		{
			in_nowiki=false;
			curr_pos+=9;
		}
		else if(curr_pos+4<=in_len && input.slice(curr_pos,curr_pos+4) === '<!--')
		{
			CenPop.in_comment=true;
			curr_pos+=4;
		}
		else if(CenPop.in_comment && curr_pos+3<=in_len && input.slice(curr_pos,curr_pos+3)==='-->')
		{
			CenPop.in_comment=false;
			curr_pos+=3;
		}
		else
		{
			curr_pos+=1;
		}
	}
	if(curr_pos< in_len && brace_depth===0)
	{
		if(input.charAt(curr_pos)==='\n')
		{
			return input.slice(begin_pos,curr_pos+1);
		}
		else
		{
			return input.slice(begin_pos,curr_pos);
		}
	}
	else
	{
		CenPop.debug("Unknown brace parsing error in get_template",'global');
		return null;
	}
};

/**
 * Update a template 
 * @param content content of the template 
 * @param fields_to_update a javascript object with the fields to update and the 
 * @param fields_no_overwrite fields to add only if they were previously blank
 * @return      new values
 */
CenPop.update_template=function(input,fields_to_update, fields_no_overwrite)
{
	CenPop.ret_str='';
//	var begin_re = new RegExp(temp_regexp);
	CenPop.brace_depth=0;
	CenPop.curr_pos=0;
	in_len=input.length;
	var in_field=false, in_ref=false, in_nowiki=false,  in_brackets=false;
	CenPop.in_comment=false,
	CenPop.curr_field_name='';
	CenPop.old_field_val='';
	var next_equals;
	CenPop.curr_ref='', CenPop.curr_ref_name='';
	CenPop.curr_comments=''; /* Holds any comments from this field, to insert at end of line */
	var refname_regexp=new RegExp(/^<ref\s+name\s*=\s*"?([^">\/]*)"?\s*(\/)?>/);
	var ref_ret;
	/* We already know it begins with '{{' */
	CenPop.curr_pos=2;
	CenPop.brace_depth=1;
	CenPop.ret_str='{{';
	CenPop.curr_ref='';
	while(CenPop.brace_depth>0 && CenPop.curr_pos < in_len)
	{
		if(!in_nowiki && !CenPop.in_comment && 
			input.slice(CenPop.curr_pos,CenPop.curr_pos+4)==='<ref')
		{
			ref_ret=refname_regexp.exec(input.substr(CenPop.curr_pos));
			
			if(ref_ret!== null)
			{
				CenPop.curr_ref_name=ref_ret[1];
				if(ref_ret.length<=2 || ref_ret[2] !== '/')
				{
					CenPop.debug("***in_ref with name",'update');
					in_ref=true;
				}
				else
				{
					CenPop.debug("***parsed ref with name, no inner part,length="+ref_ret.length,'update');
					in_ref=false;
					CenPop.curr_ref=ref_ret[0];
				}
				/* TODO: this is taking way too much!!! */
				CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+ref_ret[0].length),in_field,in_ref);
			}
			else
			{
				/* Not a named and defined ref, can ignore */
				temp_val=input.substr(CenPop.curr_pos).search('>');
				if(temp_val==-1)
				{
					in_ref=false;
					CenPop.debug("Badly formed ref tag!",'global');
					CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+4),in_field,in_ref);
				}
				else
				{
					CenPop.debug("***in_ref without name,"+input.slice(CenPop.curr_pos,CenPop.curr_pos+temp_val+1),'update');

					in_ref=true;
					CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+temp_val+1),in_field,in_ref);
				}
			}
		}
		else if(!in_nowiki && !CenPop.in_comment && CenPop.curr_pos+6 <= in_len &&
		input.slice(CenPop.curr_pos,CenPop.curr_pos+6)==='</ref>')
		{
		
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+6),in_field,in_ref);
			CenPop.add_removed_reference(fields_to_update);
			/* Update before leaving ref */
			in_ref=false;
			
		}
		else if(!in_nowiki && !CenPop.in_comment && CenPop.curr_pos + 2 <= in_len && 
			input.slice(CenPop.curr_pos,CenPop.curr_pos+2)==='{{')
		{
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+2), in_field, in_ref);
			CenPop.brace_depth++;

		}
		else if(!in_nowiki && !CenPop.in_comment && CenPop.curr_pos+2 <= in_len && 
			input.slice(CenPop.curr_pos,CenPop.curr_pos+2)==='}}')
		{
			CenPop.brace_depth--;
		//	console.log("*Brace depth down to"+CenPop.brace_depth);
			if(CenPop.brace_depth <= 0 && CenPop.curr_field_name !== '')
			{
			//	console.log("brace depth 0, curr_field_name not blank");
				var added_new_field=CenPop.add_last_field(fields_to_update,in_field, fields_no_overwrite);
				if(added_new_field) 
				{
					/* We updated this field */
					delete fields_to_update[CenPop.curr_field_name.trim()];
				}
				in_field=false;
				/* Add any new fields not yet updated */
				CenPop.add_remaining_fields(fields_to_update);
			}
			/* Brace depth decrement needs to be before, so in_field set to false */
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+2), in_field, in_ref);
		
		}
		else if(CenPop.curr_pos+8<=in_len && 
			input.slice(CenPop.curr_pos,CenPop.curr_pos+8)==='<nowiki>')
		{
			in_nowiki=true;
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+8), in_field, in_ref);
		}
		else if(in_nowiki&&CenPop.curr_pos+9<=in_len && 
		input.slice(CenPop.curr_pos,CenPop.curr_pos+9)==='</nowiki>')
		{
			in_nowiki=false;
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+9), in_field, in_ref);

		}
		else if(CenPop.curr_pos+4<=in_len && 
		input.slice(CenPop.curr_pos,CenPop.curr_pos+4) === '<!--')
		{
			CenPop.in_comment=true;
			my_iter=CenPop.curr_pos-1;
			/* Add pre-comment whitespace to curr_comment */
			while(my_iter>=0 && input.charAt(my_iter).toString().search('\n')!==-1)
			{
				my_iter--;
			}
			/* Why did I need my_iter+2 */
			CenPop.debug('begin space"'+input.slice(my_iter+2,CenPop.curr_pos)+'"','update');

			CenPop.curr_comment+=input.slice(my_iter+2,CenPop.curr_pos);
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+4), in_field, in_ref);

		}
		else if(CenPop.in_comment && CenPop.curr_pos+3<=in_len && input.slice(CenPop.curr_pos,CenPop.curr_pos+3)==='-->')
		{

			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+3), in_field, in_ref);
			my_iter=CenPop.curr_pos;
			while(my_iter<input.length && input.charAt(my_iter).toString().search('\n')!==-1)
			{
				my_iter++;
			}
			CenPop.debug('end space"'+input.slice(CenPop.curr_pos,my_iter)+'"','update');
			CenPop.curr_comment+=input.slice(CenPop.curr_pos,my_iter);
			CenPop.in_comment=false;

		}
		else if(!CenPop.in_comment && !in_nowiki && CenPop.curr_pos+2<=in_len &&
			input.slice(CenPop.curr_pos,CenPop.curr_pos+2) === '[[')
		{
			in_brackets=true;
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+2), in_field, in_ref);
		}
		else if(!CenPop.in_comment && !in_nowiki &&  CenPop.curr_pos+2<=in_len &&
			input.slice(CenPop.curr_pos,CenPop.curr_pos+2) === ']]')
		{
			in_brackets=false;
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+2), in_field, in_ref);
		}
			
		else if(!in_nowiki && !CenPop.in_comment && !in_ref && !in_brackets &&
			CenPop.brace_depth === 1 && input.charAt(CenPop.curr_pos) === '|')
		{
			/* Deal with last field */
			var added_new_field=CenPop.add_last_field(fields_to_update,in_field, fields_no_overwrite);
			if(added_new_field) 
			{
				//console.log("curr_field_name="+curr_field_name);
				/* We updated this field */
				if(CenPop.curr_field_name.trim() in fields_to_update)
				{
					CenPop.debug('Add and found "'+CenPop.curr_field_name.trim()+'"','update');
				//	console.log('\ttrim in update'+(CenPop.curr_field_name.trim() in fields_to_update).toString());

					delete fields_to_update[CenPop.curr_field_name.trim()];
				
				//	console.log('\tPostdel: trim in update'+(CenPop.curr_field_name.trim() in fields_to_update).toString());
				}
				else
				{
					CenPop.debug("Failed to find the trimmed field name",'update');
				}
			}
			else
			{
				/* Delete it anyway if it wasn't updated, becaue of no overwrite policy */
				if(CenPop.curr_field_name.trim() in fields_to_update)
				{
					delete fields_to_update[CenPop.curr_field_name.trim()];
					CenPop.debug("No write, but deleting "+CenPop.curr_field_name.trim(),'update');
				}
				else
				{
				//	CenPop.debug("Failed to add "+CenPop.curr_field_name.trim(),'update');
				}
			}

			CenPop.old_field_val='';
			next_equals=input.substr(CenPop.curr_pos).search('=');
			next_bar=input.substr(CenPop.curr_pos+1).search(/\|/);
			if(next_equals == -1 || (next_bar >= 0 && next_equals > next_bar))
			{
				CenPop.debug("Either next bar found before next equals or no next equals",'update');
				in_field=false;
				
				if(next_equals > next_bar)
				{
					CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+1), in_field, in_ref);

				}
				else
				{
						/* Just move onto the next character */
					CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+1), in_field, in_ref);
				}
			}
			else
			{
				/* Get the field name, update to go past the equals */
				in_field=false;
				CenPop.curr_field_name = input.slice(CenPop.curr_pos+1,CenPop.curr_pos+next_equals);
							in_field=true;

				CenPop.curr_pos+=next_equals+1;
				//CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+next_equals+1), in_field,in_ref);
	
			}
		}
		else
		{
			/* Normal character, just move up one */
			CenPop.update_fields(input.slice(CenPop.curr_pos,CenPop.curr_pos+1),in_field,in_ref);
		}
	}
	if(CenPop.curr_pos< in_len && CenPop.brace_depth===0)
	{
		if(input.charAt(CenPop.curr_pos)==='\n')
		{
			return CenPop.ret_str+'\n';
		}
		return CenPop.ret_str;
	}
	else if(CenPop.brace_depth==0)
	{
		/* No newline, weird */
		return CenPop.ret_str+'\n';
	}
	else
	{
		CenPop.debug('CenPop.curr_pos='+CenPop.curr_pos+', in_len='+in_len+', brace_depth='+CenPop.brace_depth+'\nUnknown brace parsing error in update_template','update');
		return '';
	}
 };
 /**
  * Deals with each possible terminal in update 
  */
 CenPop.update_fields = function(terminal, in_field, in_ref)
 {
 	if(!in_field)
	{
		CenPop.ret_str+=terminal;
	}
	else
	{
		CenPop.old_field_val+=terminal;
	}
	if(in_ref)
	{
		CenPop.curr_ref+=terminal;
	}
	if(CenPop.in_comment)
	{
		CenPop.curr_comment+=terminal;
	}
	CenPop.curr_pos+=terminal.length;
 };
 /**
  * Add the previously added field, return true if it was updated */
  
 CenPop.add_last_field = function(fields_to_update, in_field, fields_no_overwrite)
 {
 	/* Fixed to have set of fields not to overwrite, so we only write to them if they are 
 		empty or missing entirely 
 		
 	POTENTIAL BUG: those pages that have something in blank_name nothing in blank_info
 		*/
 		
 	/* Work around in thing bug */
 	var is_no_overwrite=false;
 	for(i=0; i < fields_no_overwrite.length; i++)
	{
		if(fields_no_overwrite[i]===CenPop.curr_field_name.trim()) {
			is_no_overwrite=true;
			break;
		}
	}
 	if(in_field && CenPop.curr_field_name.trim() in fields_to_update
 	&& (!is_no_overwrite || CenPop.old_field_val.toString().trim().length===0))
	{
		CenPop.debug('curr_field_name.trim()='+CenPop.curr_field_name.trim()+',CenPop.old_field_val.toString().trim()='+CenPop.old_field_val.toString().trim()+' is_no_overwrite='+is_no_overwrite,'update');
		CenPop.ret_str+=CenPop.new_field_vals(CenPop.curr_field_name,
							fields_to_update[CenPop.curr_field_name.trim()]);
		if(CenPop.curr_comment.toString().length > 0)
		{
			/* Has comments, add at the end */
			CenPop.ret_str+=CenPop.curr_comment.toString();
		}
		if(CenPop.curr_ref_name !== '')
		{
		
			CenPop.curr_ref_name='';
			CenPop.curr_ref='';
		}
		else
		{
			CenPop.debug("blank, CenPop.curr_ref_name="+CenPop.curr_ref_name,'update');
		}
		//CenPop.curr_field_name='';
		CenPop.old_field_val='';
	//	CenPop.debug('removed_refs='+JSON.stringify(CenPop.removed_refs),'update');
		CenPop.curr_comment='';
		return true;
	}
	else if(in_field)
	{
		CenPop.debug("old val but in field, "+CenPop.curr_field_name+", old_field_val="+CenPop.old_field_val,'update');
		/* add the old_val */
		if(CenPop.curr_ref_name !== '')
		{
		//	CenPop.removed_refs[CenPop.curr_ref_name]=CenPop.curr_ref;
			CenPop.curr_ref_name='';
			CenPop.curr_ref='';
		}
		CenPop.ret_str+=CenPop.new_field_vals(CenPop.curr_field_name, CenPop.old_field_val);
			//CenPop.curr_field_name='';
		CenPop.old_field_val='';
		CenPop.curr_comment='';
		if(is_no_overwrite)	
			return true;
		else
			return false;
	}	
	
 };
 CenPop.add_remaining_fields = function(fields_to_update)
 {
 	var field_name;
 	for(field_name in fields_to_update)
 	{
 		CenPop.debug('adding remaining field '+field_name,'update');
 		CenPop.ret_str+=CenPop.new_field_vals(field_name,fields_to_update[field_name]);
 	}
 };
 /* Add a removed reference */
 CenPop.add_removed_reference = function(fields_to_update)
 {
 	/* Only add it if it's gonna be ditched. Oops we probably have a problem 
 		now where we add one back if it's equivalent to what we're adding in our replacement 
 		
 		
 	Hopefully checking for it in the replacement of the current field prevents putting it in removed_refs
 		*/
 	if(CenPop.curr_field_name.trim() in fields_to_update
 	&& fields_to_update[CenPop.curr_field_name.trim()].toString().search('<ref\\s+name\\s*=\\s*"?'+CenPop.curr_ref_name+'"?\\s*>')===-1)
 	{
 		CenPop.removed_refs[CenPop.curr_ref_name]=CenPop.curr_ref;	
 	}
 	CenPop.curr_ref_name='';
	CenPop.curr_ref='';
 };
 
 /* Deals with new fields val */
 CenPop.new_field_vals = function(curr_field_name,curr_val)
 {
 	var ret_val='|'+curr_field_name;
 	if(curr_field_name.charAt(curr_field_name.length-1)!== ' ')
 	{
 		ret_val+=' ';
 	}
 	ret_val+='=';
 	if(curr_val.toString().charAt(0) !== ' ')
 	{
 		ret_val+=' ';
 	}
	ret_val+= curr_val.toString();
 	if(ret_val.charAt(ret_val.length-1)!=='\n')
 	{
 		ret_val+='\n';
 	}
 	return ret_val;
 };
 
 /**
  * Returns an object with the fields and values
  */
CenPop.convert.parse_template=function(input)
{
	CenPop.convert.ret_obj={}; // the object to return
	CenPop.convert.ret_str='';
//	var begin_re = new RegExp(temp_regexp);
	CenPop.convert.brace_depth=0;
	CenPop.convert.curr_pos=0;
	in_len=input.length;
	var in_field=false, in_ref=false, in_nowiki=false,  in_brackets=false;
	CenPop.convert.in_comment=false,
	CenPop.convert.curr_field_name='';
	CenPop.convert.old_field_val='';
	var next_equals;
	CenPop.convert.curr_ref='', CenPop.convert.curr_ref_name='';
	CenPop.convert.curr_comments=''; // Holds any comments from this field, to insert at end of line 
	var refname_regexp=new RegExp(/^<ref\s+name\s*=\s*"?([^">\/]*)"?\s*(\/)?>/);
	var ref_ret;
	// We already know it begins with '{{' 
	CenPop.convert.curr_pos=2;
	CenPop.convert.brace_depth=1;
	CenPop.convert.ret_str='{{';
	CenPop.convert.curr_ref='';
	while(CenPop.convert.brace_depth>0 && CenPop.convert.curr_pos < in_len)
	{
		if(!in_nowiki && !CenPop.convert.in_comment && 
			input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+4)==='<ref')
		{
			ref_ret=refname_regexp.exec(input.substr(CenPop.convert.curr_pos));
			
			if(ref_ret!== null)
			{
				CenPop.convert.curr_ref_name=ref_ret[1];
				if(ref_ret.length<=2 || ref_ret[2] !== '/')
				{
				//	CenPop.debug("***in_ref with name",'update');
					in_ref=true;
				}
				else
				{
				//	CenPop.debug("***parsed ref with name, no inner part,length="+ref_ret.length,'update');
					in_ref=false;
					CenPop.convert.curr_ref=ref_ret[0];
				}
				// TODO: this is taking way too much!!! 
				CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+ref_ret[0].length),in_field,in_ref);
			}
			else
			{
				// Not a named and defined ref, can ignore 
				temp_val=input.substr(CenPop.convert.curr_pos).search('>');
				if(temp_val==-1)
				{
					in_ref=false;
					CenPop.debug("Badly formed ref tag!",'global');
					CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+4),in_field,in_ref);
				}
				else
				{
					CenPop.debug("***in_ref without name,"+input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+temp_val+1),'update');

					in_ref=true;
					CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+temp_val+1),in_field,in_ref);
				}
			}
		}
		else if(!in_nowiki && !CenPop.convert.in_comment && CenPop.convert.curr_pos+6 <= in_len &&
		input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+6)==='</ref>')
		{
		
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+6),in_field,in_ref);
			// Update before leaving ref 
			in_ref=false;
			
		}
		else if(!in_nowiki && !CenPop.convert.in_comment && CenPop.convert.curr_pos + 2 <= in_len && 
			input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2)==='{{')
		{
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2), in_field, in_ref);
			CenPop.convert.brace_depth++;

		}
		else if(!in_nowiki && !CenPop.convert.in_comment && CenPop.convert.curr_pos+2 <= in_len && 
			input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2)==='}}')
		{
			CenPop.convert.brace_depth--;
		//	console.log("*Brace depth down to"+CenPop.convert.brace_depth);
			if(CenPop.convert.brace_depth <= 0 && CenPop.convert.curr_field_name !== '')
			{
				CenPop.convert.add_last_field(in_field);
			}
			// Brace depth decrement needs to be before, so in_field set to false 
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2), in_field, in_ref);
		
		}
		else if(CenPop.convert.curr_pos+8<=in_len && 
			input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+8)==='<nowiki>')
		{
			in_nowiki=true;
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+8), in_field, in_ref);
		}
		else if(in_nowiki&&CenPop.convert.curr_pos+9<=in_len && 
		input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+9)==='</nowiki>')
		{
			in_nowiki=false;
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+9), in_field, in_ref);

		}
		else if(CenPop.convert.curr_pos+4<=in_len && 
		input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+4) === '<!--')
		{
			CenPop.convert.in_comment=true;
			my_iter=CenPop.convert.curr_pos-1;
			// Add pre-comment whitespace to curr_comment 
			while(my_iter>=0 && input.charAt(my_iter).toString().search('\n')!==-1)
			{
				my_iter--;
			}
			// Why did I need my_iter+2 
			//CenPop.debug('begin space"'+input.slice(my_iter+2,CenPop.convert.curr_pos)+'"','update');

			CenPop.convert.curr_comment+=input.slice(my_iter+2,CenPop.convert.curr_pos);
			CenPop.convert.curr_pos+=4 /* Don't write the comments */
			//CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+4), in_field, in_ref);

		}
		else if(CenPop.convert.in_comment && CenPop.convert.curr_pos+3<=in_len && input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+3)==='-->')
		{

			//CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+3), in_field, in_ref);
			CenPop.convert.curr_pos+=3;
			my_iter=CenPop.convert.curr_pos;
			while(my_iter<input.length && input.charAt(my_iter).toString().search('\n')!==-1)
			{
				my_iter++;
			}
		//	CenPop.debug('end space"'+input.slice(CenPop.convert.curr_pos,my_iter)+'"','update');
			CenPop.convert.curr_comment+=input.slice(CenPop.convert.curr_pos,my_iter);
			CenPop.convert.in_comment=false;

		}
		else if(!CenPop.convert.in_comment && !in_nowiki && CenPop.convert.curr_pos+2<=in_len &&
			input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2) === '[[')
		{
			in_brackets=true;
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2), in_field, in_ref);
		}
		else if(!CenPop.convert.in_comment && !in_nowiki &&  CenPop.convert.curr_pos+2<=in_len &&
			input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2) === ']]')
		{
			in_brackets=false;
			CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+2), in_field, in_ref);
		}
			
		else if(!in_nowiki && !CenPop.convert.in_comment && !in_ref && !in_brackets &&
			CenPop.convert.brace_depth === 1 && input.charAt(CenPop.convert.curr_pos) === '|')
		{
			// Deal with last field 
			CenPop.convert.add_last_field(in_field);

			CenPop.convert.old_field_val='';
			next_equals=input.substr(CenPop.convert.curr_pos).search('=');
			next_bar=input.substr(CenPop.convert.curr_pos+1).search(/\|/);
		//	CenPop.debug('next_equals='+next_equals+'\tnext_bar='+next_bar,'update');
			if(next_equals == -1 || (next_bar >= 0 && next_equals > next_bar))
			{
				//CenPop.debug("Can't find next equals ",'global');
				in_field=false;
				// Just move onto the next field 
				if(next_equals > next_bar)
				{
					// Don't save anything, just go to next_bar 
					CenPop.convert.curr_pos+=next_bar;
					//CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,next_bar), in_field, in_ref);

				}
				else
					CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+1), in_field, in_ref);
			}
			else
			{
				// Get the field name, update to go past the equals 
				in_field=false;
				CenPop.convert.curr_field_name = input.slice(CenPop.convert.curr_pos+1,CenPop.convert.curr_pos+next_equals);
				in_field=true;
							
				CenPop.convert.curr_pos+=next_equals+1;

			}
		}
		else
		{
			// Normal character, just move up one 
			if(!CenPop.convert.in_comment)
				CenPop.convert.update_fields(input.slice(CenPop.convert.curr_pos,CenPop.convert.curr_pos+1),in_field,in_ref);
			else
				CenPop.convert.curr_pos+=1
		}
	}
	if(CenPop.convert.brace_depth==0)
	{
		return CenPop.convert.ret_obj;
	}
	else
	{
		CenPop.debug('CenPop.curr_pos='+CenPop.convert.curr_pos+', in_len='+in_len+', brace_depth='+CenPop.convert.brace_depth+'\nUnknown brace parsing error in update_template','update');
		return CenPop.convert.ret_obj;
	}
 };
 
  // Deals with each possible terminal in update 

CenPop.convert.update_fields = function(terminal, in_field, in_ref)
{
 	if(!in_field)
	{
		CenPop.convert.ret_str+=terminal;
	}
	else
	{
		CenPop.convert.old_field_val+=terminal;
	}
	if(in_ref)
	{
		CenPop.convert.curr_ref+=terminal;
	}
	if(CenPop.convert.in_comment)
	{
		CenPop.convert.curr_comment+=terminal;
	}
	CenPop.convert.curr_pos+=terminal.length;
 };
// Add the previously added field, return true if it was updated 
  
 CenPop.convert.add_last_field = function(in_field)
 {

	CenPop.convert.ret_obj[CenPop.convert.curr_field_name.toString().trim()]=CenPop.convert.old_field_val.toString().trim();
 };
