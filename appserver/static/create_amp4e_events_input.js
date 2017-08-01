require.config({
    paths: {
    	amp4e_events_input_create_view: '../app/amp4e_events_input/js/views/Amp4eEventsInputCreateView'
    }
});

require(['jquery','underscore','splunkjs/mvc', 'amp4e_events_input_create_view', 'splunkjs/mvc/simplexml/ready!'],
	function($, _, mvc, Amp4eEventsInputCreateView){
		var amp4e_events_input_create_view = new Amp4eEventsInputCreateView({'el' : '#create_amp4e_events_input'});
		amp4e_events_input_create_view.render();
	}
);
