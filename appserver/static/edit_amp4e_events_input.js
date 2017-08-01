require.config({
    paths: {
    	amp4e_events_input_edit_view: '../app/amp4e_events_input/js/views/Amp4eEventsInputCreateView'
    }
});

require(['jquery','underscore','splunkjs/mvc', 'amp4e_events_input_edit_view', 'splunkjs/mvc/simplexml/ready!'],
	function($, _, mvc, Amp4eEventsInputCreateView){
		var amp4e_events_input_edit_view = new Amp4eEventsInputCreateView({'el' : '#edit_amp4e_events_input'});
		amp4e_events_input_edit_view.render();
	}
);
