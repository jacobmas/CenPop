/**
 * (Highly incomplete) Internationalization and Message file for CenPop
 * See https://en.wikipedia.org/wiki/User:Joeytje50/AWB.js for the full original script, as well as licensing.
 * Modifications by DemocraticLuntz
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
 *
 * @version 1.1
 * @author Jacob Alperin-Sheriff, Joeytje50
 */

if (!window.CenPop || CenPop === false) {
	//Make CenPop an object again to prevent errors later on. The onload function will re-delete this again.
	window.CenPop = {
		messages: {},
		allowed: false
	};
}

// Tab indentation is optimalised for the Ace editor. The indentation may look weird outside of it.

/** English
 * @author Joeytje50, DemocraticLuntz
 */
/* fields of the infobox */

CenPop.infobox_fields=[
	'name','official_name','native_name', 'native_name_lang', 'other_name','settlement_type', 

'image_skyline','imagesize','image_alt','image_caption',
'image_flag',//'flag_size','flag_alt','flag_border','flag_link',
'image_seal','seal_size',//,'seal_alt','seal_link','seal_type',
'etymology', 'nickname', 'motto', 'anthem',

'image_map','mapsize','map_alt','map_caption',
'image_map1','mapsize1','map_alt1','map_caption1',
'pushpin_map', 'pushpin_label_position', 'pushpin_label', 'pushpin_map_alt','pushpin_mapsize','pushpin_relief','pushpin_map_caption',
'coordinates', 
'coor_pinpoint', 'coordinates_footnotes', 'grid_name', 'grid_position', 

'subdivision_type', 'subdivision_name', 'subdivision_type1','subdivision_name1',
'subdivision_type2','subdivision_name2', 'subdivision_type3','subdivision_name3', 
'subdivision_type4','subdivision_name4', 

'established_title', 'established_date','established_title1', 'established_date1',
'established_title2', 'established_date2','established_title3','established_date3',
'established_title4','established_date4','established_title5','established_date5',
'established_title6','established_date6','established_title7','established_date7',
'extinct_title','extinct_date','founder','named_for',

'seat_type', 'seat','seat1_type', 'seat1',

'government_footnotes', 'government_type','governing_body',
'leader_party','leader_title','leader_name', 'leader_title1','leader_name1', 
'total_type', 'unit_pref', 
'area_footnotes', 'area_total_km2', 'area_total_sq_mi', 'area_land_km2',
'area_land_sq_mi','area_water_km2','area_water_sq_mi','area_water_percent',
'area_metro_footnotes', 'area_metro_km2','area_metro_sq_mi','area_rank',
'elevation_footnotes', 'elevation_m','elevation_ft','elevation_point', 
'elevation_max_footnotes', 'elevation_max_m','elevation_max_ft','elevation_max_point', 
'elevation_max_rank','elevation_min_footnotes', 'elevation_min_m','elevation_min_ft',
'elevation_min_point', 'elevation_min_rank',
'population_as_of','population_footnotes', 'population_total','pop_est_as_of','pop_est_footnotes',
'population_est','population_rank','population_density_km2', 'population_density_sq_mi',
'population_metro_footnotes','population_metro','population_density_metro_km2','population_density_metro_sq_mi',
'population_density','population_density_rank','population_blank1_title','population_blank1',
'population_density_blank1_km2','population_density_blank1_sq_mi','population_blank2_title','population_blank2',
'population_density_blank2_km2','population_density_blank2_sq_mi','population_demonym', 'population_note',
'demographics_type1','demographics1_footnotes', 'demographics1_title1','demographics1_info1', 
'demographics_type2','demographics2_footnotes', 'demographics2_title1','demographics2_info1', 
'timezone1','utc_offset1','timezone1_DST','utc_offset1_DST','timezone2','utc_offset2','timezone2_DST','utc_offset2_DST',
'postal_code_type', 'postal_code','postal2_code_type', 'postal2_code',
'area_code_type', 'area_code','geocode','iso_code',
'blank_name','blank_info','blank1_name','blank1_info','blank2_name','blank2_info', 
'blank_name_sec2','blank_info_sec2','blank1_name_sec2','blank1_info_sec2','blank2_name_sec2',
'blank2_info_sec2', 'website', 'footnotes'];

/* Map from infobox FIELD NAME to equivalent geobox FIELD NAME */
CenPop.infobox_geobox_fields={
	'name': 'name',
	'official_name': 'official_name',
	'native_name': 'native_name',
	'other_name': 'other_name',
	'settlement_type': 'category',
	'image_skyline': 'image' ,
	'image_caption': 'image_caption',
	'imagesize':	'image_size' ,
	'etymology': 'etymology',
	'motto': 'motto',
	'nickname': 'nickname',
	'flag': 'image_flag',
	'symbol': 'image_seal',
	'subdivision_name': 'country',
	'subdivision_name1': 'state',
	'subdivision_name2': 'region',
	'subdivision_type2': 'region_type',
	'subdivision_name3': 'district',
	'subdivision_type3': 'district_type',
	'elevation_ft': ['elevation_imperial','elevation'],
	'coordinates': 'coordinates',
	'coordinates_footnotes': 'coordinates_note',
	'elevation_footnotes': ['elevation_imperial_note','elevation_note'],
	'elevation_max_ft': ['highest_elevation_imperial'],
	'elevation_max_point': 'highest',
	'elevation_min_ft': ['lowest_elevation_imperial'],
	'elevation_min_point': 'lowest',
	'area_total_sq_mi': 'area_imperial',
	'area_land_sq_mi': 'area_land_imperial',
	'area_water_sq_mi': 'area_water_imperial',
	'population_as_of': 'population_date',
	'population_total': 'population',
	'population_metro': 'population_metro',
	'population_metro_footnotes': 'population_metro_note',
	'population_footnotes': 'population_note',
	'population_density_sq_mi':'population_density_imperial',
	'population_demonym':'demonym',
	'government_type': 'government',
	'established_date':['established','established_date'],
	'established_title':['established_type','established_title'],
	'established_date1':['established1','established_date1'],
	'established_title1':['established1_type','established_title1'],
	'established_date2':['established2','established_date2'],
	'established_title2':['established2_type','established_title2'],
	'image_flag': 'flag',
	'leader_title': 'leader_type',
	'leader_title1': 'leader1_type',
	'leader_name1': 'leader1',
	'timezone1': 'timezone',
	'utc_offset1': 'utc_offset',
	'timezone1_DST': 'timezone_DST',
	'utc_offset1_DST': 'utc_offset_DST',
	'postal_code': 'postal_code',
	'postal_code_type': 'postal_code_type',
	'area_code': 'area_code',
	'area_code_type': 'area_code_type',
	'blank_name_sec2':'free_type',
	'blank_info_sec2':'free',
	'blank1_name_sec2':'free1_type',
	'blank1_info_sec2':'free1',
	'blank2_info_sec2':'commons',
	'website':'website',
	'footnotes':'footnotes',
	'founder':'founder',
	'named_for':'named for',
	'leader_name': ['mayor','leader'],
	'image_seal': 'symbol',
	'seal_size': 'symbol_size'
};

/* Default VALUES for infobox fields, if the field is not in geobox to infobox (or blank), look for default values */
CenPop.infobox_defaults={
	'subdivision_type': 'Country',
	'subdivision_type1': 'State',
	'established_title': 'Founded',
	'postal_code_type': '[[ZIP code|ZIP Code(s)]]',
	'blank2_name_sec2': 'Wikimedia Commons'
	
};
CenPop.geobox_infobox_optionals={
		
};
/* To map if it has those nice svg maps of location within county */
CenPop.infobox_geobox_good_maps={
	'image_map':'map',
	'mapsize':'map_size',
	'map_caption':'map_caption'
};

/* Optional VALUES for infobox fields, only if a geobox field exists for other */
CenPop.infobox_optionals={
	'leader_title': 'Mayor'	
};

// Default settings for various fields
CenPop.default_fields = {
	'beginYearText': '2016',
	'estYearText': '2016',
	'estRefText': '<ref name="USCensusEst2016">{{cite web'+
			'|url=https://www.census.gov/programs-surveys/popest/data/tables.2016.html'+
			'|title=Population and Housing Unit Estimates'+
			'|accessdate=June 9, 2017'+
			'}}</ref>',
	'footnoteText': '<center>U.S. Decennial Census<ref name="DecennialCensus">{{cite web'+
		'|url=http://www.census.gov/prod/www/decennial.html'+
	'|title=Census of Population and Housing|publisher=Census.gov|accessdate=June 4, 2016}}</ref></center>',
	'loadFileText': 'https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=place:*&DATE=9'
};

CenPop.messages.en = {
	//Census Fields 
	'begin-year-tip': 		'The earliest year of Census data available in your load file',
	'est-year-tip': 		'The year of the estimates to be added',
	
	
	// General interface
	'tab-setup':			'Setup',
	'tab-cen-fields':			'Census',
	'tab-debug': 			'Debug',
	'tab-upload':			'Upload',
	'tab-fails':			'Fails',
	'tab-editing':			'Editing',
	'tab-skip':				'Skip',
	'tab-other':			'Other',
	'tab-log':				'Log',
	'pagelist-caption':		'Enter list of pages:',
	'editbox-caption':		'Editing area',
	'no-changes-made':		'No changes made. Press skip to go to the next page in the list.',
	'page-not-exists':		'Page doesn\'t exist, diff can not be made.',
	
	// Stats
	'stat-pages':			'Pages listed:',
	'stat-new':				'New:',
	'stat-modhist':			'Modified Histpop:',
	'stat-geoinfo':			'Geobox->Infobox:',
	'stat-modinfobox':		'Modified Infobox:',
	'stat-nomatchhist':		'No Match',
	'stat-save':			'Saved:',
	'stat-null':			'Null-edits:',
	'stat-skip':			'Pages skipped:',
	'stat-other':			'Other:',
	
	// Tab 1
	'label-pagelist':		'Page list',
	'button-remove-dupes':	'Remove duplicates',
	'button-sort':			'Sort',
	'preparse':				'Use pre-parse mode',
	'tip-preparse':			'Go through listed pages, filtering it down to just the ones that would not be skipped by the current Skip rules.',
	'preparse-reset':		'reset',
	'tip-preparse-reset':	'Clear the #PRE-PARSE-STOP tag in the pagelist, to pre-parse the whole page list again',
	'pagelist-generate':	'Generate',
	'label-settings':		'Settings',
	'store-setup':			'Store setup',
	'tip-store-setup':		'Store the current settings in the dropdown menu, for later access.\n'+
							'To be able to access this in a later session, you need to save it to the wiki, or download it.',
	'load-settings':		'Load:',
	'blank-setup':			'Blank setup',
	'delete-setup':			'Delete',
	'tip-delete-setup':		'Delete the setup that is currently selected.',
	'save-setup':			'Save to wiki',
	'download-setup':		'Download',
	'import-setup':			'Import',
	'tip-import-setup':		'Upload settings files (JSON file format) from your computer.',
	'update-setup':			'Refresh',
	'tip-update-setup':		'Refresh the settings stored on your /CenPop-settings.js page',
	
	// Tab 2
	'edit-summary':			'Summary:',
	'minor-edit':			'Minor edit',
	'tip-via-CenPop':			'Add (via CenPop script) to the end of your summary',
	'watch-add':			'add now',
	'watch-remove':			'remove now',
	'watch-nochange':		'Don\'t modify watchlist',
	'watch-preferences':	'Watch based on preferences',
	'watch-watch':			'Add pages to watchlist',
	'watch-unwatch':		'Remove pages from watchlist',
	'auto-save':			'Autosave',
	'save-interval':		'every $1 sec', //$1 represents the throttle/interval input element
	'tip-save-interval':	'Amount of seconds to pause between each edit',
	'editbutton-stop':		'Stop',
	'editbutton-start':		'Start',
	'editbutton-run': 		'Run',
	'editbutton-save':		'Save',
	'editbutton-preview':	'Prev',
	'editbutton-skip':		'Skip', // This message is also used in tab 4
	'editbutton-diff':		'Diff',
	'button-more-fields':	'Add more fields',
	'label-replace':		'Replace:',
	'label-rwith':			'With:',
	'label-useregex':		'Regular Expression',
	'label-regex-flags':	'flags:',
	'tip-regex-flags':		'Any flags for regular expressions, for example i for ignorecase.\n'+
							'In this CenPop script, the _ flag treats underscores and spaces as the same entity. Use with caution.',
	'label-ignore-comment':	'Ignore unparsed content',
	'tip-ignore-comment':	'Ignore comments and text within nowiki, source, math, or pre tags.',
	'label-enable-RETF':	'Enable $1',
	'label-RETF':			'RegEx Typo Fixing',
	'tip-refresh-RETF':		'Refresh the typos list for new modifications.',
	'tip-only-fips': 		'Only try finding the page via FIPS code search',
	'tip-add-images': 		'Look for image svgs matching this page and add them',
	
	// Tab 3
	'debug-update':		'Update Template',
	'debug-gazetteer':	'Load Gazetteer',
	'debug-upload': 	'Upload Files',
	
	// Tab 4
	'editbutton-move':		'Move',
	'editbutton-delete':	'Delete',
	'editbutton-protect':	'Protect',
	'move-header':			'Move options',
	'move-redir-suppress':	'Suppress redirects',
	'move-also':			'Also move:',
	'move-talk-page':		'talk page',
	'move-subpage':			'subpages',
	'move-new-name':		'New pagename:',
	'protect-header':		'Protect options',
	'protect-edit':			'Edit:',
	'protect-move':			'Move:',
	'protect-none':			'No protection', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-autoconf':		'Autoconfirmed',
	'protect-sysop':		'Sysop only',
	'protect-expiry':		'Expiry:',

	//Dialog boxes
	'confirm-leave':		'Closing this tab will cause you to lose all progress.',
	'alert-no-move':		'Please enter the new pagename before clicking move.',
	'not-on-list':			'Your username was not found on the CenPop checklist. Please request access by contacting an administrator.',
	'verify-error':			'An error occurred while loading the AutoWikiBrowser checkpage:',
	'new-message':			'You have new messages. See the status bar for links to view them.',
	'no-pages-listed':		'Please enter some articles to browse before clicking start.',
	'infinite-skip-notice':	"No replacement rules were specified, with CenPop set to automatically skip when no changes are made.\n"+
							"Please review these settings in the 'Content' and 'Skip' tabs.",
	
	//Statuses
	'status-pausing':		'pausing ...',
	'status-alt':			'loading...',
	'status-done':			'Done',
	'status-newmsg':		'You have $1 ($2)',
	'status-talklink':		'new messages',
	'status-difflink':		'last change',
	'status-load-page':		'Getting page contents',
	'status-submit':		'Submitting edit',
	'status-preview':		'Getting preview',
	'status-diff':			'Getting edit diff',
	'status-move':			'Moving page',
	'status-delete':		'Deleting page',
	'status-undelete':		'Undeleting page',
	'status-protect':		'Protecting page',
	'status-watch':			'Modifying watchlist',
	'status-watch-added':	'$1 has been added to your watchlist',
	'status-watch-removed':	'$1 has been removed from your watchlist',
	'status-regex-err':		'Regex error. Please change the entered <i>replace</i> regular expression',
	'status-setup-load':	'Loading CenPop settings',
	'status-setup-submit':	'Submitting settings to wiki',
	'status-setup-dload':	'Downloading settings',
	'status-old-browser':	'Please use $1 for importing.',
	'status-del-setup':		"'$1' has been deleted. $2.",
	'status-del-default':	'Your default settings have been reset. $1.',
	'status-del-undo':		'Undo',
	'status-upload':		'Uploading files',
	'status-token':			'Retrieving token to modify',

	//Setup
	'setup-prompt':			'Under what name do you want to $1 your current setup?',
	'setup-prompt-store':	'store',
	'setup-prompt-save':	'save',
	'setup-summary':		'Updating CenPop settings /*semi-automatic*/', //this is based on wgContentLanguage, not wgUserLanguage.
	'old-browser':			'Your browser does not support importing files. Please upgrade to a newer browser, or upload the contents of the file to the wiki. See the status bar for links.',
	'not-json':				'Only JSON files can be imported. Please ensure your file uses the extension .json, or modify the file extension if necessary.',
	'json-err':				'An error was found in your CenPop settings:\n$1\nPlease review your settings $2.',
	'json-err-upload':		'file',
	'json-err-page':		"by going to 'Special:MyPage/CenPop-settings.js'",
	'setup-delete-blank':	'You can\'t delete the blank setup.',
	
	//Pagelist generating
	'exceeded-iterations':	'Maximum list length reached. Cancelling further requests to avoid overloading server.',
	'namespace-main':		'main',
	'label-ns-select':		'Namespace:',
	'tip-ns-select':		'Ctrl+click to select multiple namespaces.',
	'legend-cm':			'Category',
	'label-cm':				'Category:',
	'cm-include':			'Include:',
	'cm-include-pages':		'pages',
	'cm-include-subcgs':	'subcategories',
	'cm-include-files':		'files',
	'legend-linksto':		'Links to page',
	'label-linksto':		'Links to:',
	'links-include':		'Include:',
	'links-include-links':	'wikilinks',
	'links-include-templ':	'transclusions',
	'links-include-files':	'file usage',
	'links-redir':			'Redirects:',
	'links-redir-redirs':	'redirects',
	'links-redir-noredirs':	'non-redirects',
	'links-redir-all':		'both',
	'label-link-redir':		'Include links to redirects',
	'tip-link-redir':		'Include links directed towards one of this page\'s redirects',
	'legend-ps':			'Pages with prefix',
	'label-ps':				'Prefix:',
	'legend-wr':			'Watchlist',
	'label-wr':				'Include watchlist contents',
	'legend-pl':			'Links on page',
	'label-pl':				'On page:',
	'tip-pl':				'Fetch a list of links on the page(s).\nSeperate values with | vertical bars.',
};
