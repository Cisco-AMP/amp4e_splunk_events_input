require.config({
    paths: {
        custom_setup: "/static/app/amp4e_events_input/js/views/AppSetupView"
    }
});

require([
         "jquery",
         "custom_setup",
         "splunkjs/mvc/simplexml/ready!"
     ], function(
         $,
         AppSetupView
     )
     {

         var appSetupView = new AppSetupView({
        	 el: $('#setupView')
         });

         appSetupView.render();
     }
);
