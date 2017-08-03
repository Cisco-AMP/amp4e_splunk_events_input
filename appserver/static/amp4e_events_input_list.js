
require.config({
    paths: {
        amp4e_events_input_list: "../app/amp4e_events_input/js/views/Amp4eEventsInputListView"
    }
});

require([
         "jquery",
         "underscore",
         "backbone",
         "amp4e_events_input_list",
         "splunkjs/mvc/simplexml/ready!"
     ], function(
         $,
         _,
         Backbone,
         Amp4eEventsInputListView
     )
     {
         var ampView = new Amp4eEventsInputListView({
        	 el: $('#amp4e_events_input_list')
         });

         ampView.render();
     }
);
