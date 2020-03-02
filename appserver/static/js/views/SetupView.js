/*
 * This view is intended to be used as a base class for simpleXML setup views. This class is
 * intended to make creation of a setup view easier by:
 *
 *   1) Providing a mechanism for setting the app as configured so that users aren't redirected through setup again.
 *   2) Providing a means for permission checking so that you can ensure that the user has admin_all_objects
 *
 * To use this class, you will need to do the following:
 *
 *   1) Make your view class sub-class "SetupView" (the class providing in this file)
 *   2) Call this classes initialize() function in your classes initialize() function.
 *   3) Call setConfigured() when your class completes setup. This will mark the app as configured.
 *
 *
 *
 * Below is a short example of of the use of this class:

require.config({
    paths: {
        setup_view: '../app/my_custom_app/js/views/SetupView'
    }
});

define([
    "underscore",
    "backbone",
    "jquery",
    "setup_view",
], function(
    _,
    Backbone,
    $,
    SetupView
){

    return SetupView.extend({
        className: "MyCustomAppSetupView",

        events: {
            "click #save-config" : "saveConfig"
        },

        defaults: {
        	app_name: "my_custom_app"
        },

        initialize: function() {
        	this.options = _.extend({}, this.defaults, this.options);
            SetupView.prototype.initialize.apply(this, [this.options]);
        },

        saveConfig: function(){
            if(this.userHasAdminAllObjects()){
                this.setConfigured();
            }
            else{
                alert("You don't have permission to edit this app");
            }
        },

        render: function () {
            this.$el.html('<a href="#" class="btn btn-primary" id="save-config">Save Configuration</a>');
        }
    });
});
 */

require.config({
    paths: {
        "ValidationView": "../app/amp4e_events_input/js/views/ValidationView"
    }
});

define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "models/SplunkDBase",
    "collections/SplunkDsBase",
    "ValidationView",
    "util/splunkd_utils",
    "splunkjs/mvc/utils"
], function(
    _,
    Backbone,
    mvc,
    $,
    SplunkDBaseModel,
    SplunkDsBaseCollection,
    ValidationView,
    splunkd_utils,
    mvc_utils
){

	var AppConfig = SplunkDBaseModel.extend({
	    initialize: function() {
	    	SplunkDBaseModel.prototype.initialize.apply(this, arguments);
	    }
	});

    return ValidationView.extend({
        className: "SetupView",

        defaults: {
        	app_name: null
        },

        /**
         * Override this in order to have the class make setters and getters for you.
         *
         * Consider this example:
         *
         *    formProperties: {
         *        'proxyServer' : '.proxy-address input'
         *     }
         *
         * This would cause two functions to be created:
         *
         *     * setProxyServer(newValue)
         *     * getProxyServer()
         *
         * The functions will call $('.proxy-address input', this.$el).val() to set or get the value accordingly.
         */
        formProperties: {
            // 'proxyServer' : '.proxy-address input'
        },

        initialize: function() {
            // Merge the provided options and the defaults
            this.options = _.extend({}, this.defaults, this.options);
            ValidationView.prototype.initialize.apply(this, [this.options]);

            // Get the app name
            this.app_name = this.options.app_name;

            // This indicates if the app was configured
            this.is_app_configured = null;

            this.app_config = null;

            this.capabilities = null;
            this.is_using_free_license = $C.SPLUNKD_FREE_LICENSE;

            // Start the process of the getting the app.conf settings
            this.getAppConfig();

            this.setupProperties();
        },

        /**
         * Get the app configuration.
         */
        getAppConfig: function(){

            // Use the current app if the app name is not defined
            if(this.app_name === null || this.app_name === undefined){
                this.app_name = mvc_utils.getCurrentApp();
            }

	        this.app_config = new AppConfig();

            this.app_config.fetch({
                url: splunkd_utils.fullpath('/servicesNS/nobody/system/apps/local/' + this.app_name),
                success: function (model, response, options) {
                    console.info("Successfully retrieved the app configuration");
                    this.is_app_configured = model.entry.associated.content.attributes.configured;
                }.bind(this),
                error: function () {
                    console.warn("Unable to retrieve the app configuration");
                }.bind(this)
            });
        },

        /**
         * Capitalize the first letter of the string.
         */
        capitalizeFirstLetter: function (string){
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        /**
         * Setup a property that allows the given attribute to be.
         */
        setupProperty: function(propertyName, selector){

            var setterName = 'set' + this.capitalizeFirstLetter(propertyName);
            var getterName = 'get' + this.capitalizeFirstLetter(propertyName);

            if(this[setterName] === undefined){
                this[setterName] = function(value){
                    $(selector, this.$el).val(value);
                };
            }

            if(this[getterName] === undefined){
                this[getterName] = function(){
                    return $(selector, this.$el).val();
                };
            }
        },

        /**
         * Register properties for all of the properties.
         */
        setupProperties: function(){
            for(var name in this.formProperties){
                this.setupProperty(name, this.formProperties[name]);
            }
        },

        /**
         * Get the name of the app to use for saving entries to.
         */
        getAppName: function(){
            if(this.app_name === null){
                return mvc_utils.getCurrentApp();
            }
            else{
                return this.app_name;
            }
        },

        /**
         * Return true if the input is undefined, null or is blank.
         */
        isEmpty: function(value, allowBlanks){

            // Assign a default for allowBlanks
            if(typeof allowBlanks == "undefined"){
                allowBlanks = false;
            }

            // Test the value
            if(typeof value == "undefined"){
                return true;
            }

            else if(value === null){
                return true;
            }

            else if(value === "" && !allowBlanks){
                return true;
            }

            return false;
        },

        /**
         * Redirect users to the given view if the user was redirected to setup. This is useful for
         * cases where the user was directed to perform setup because the app was not yet
         * configured. This reproduces the same behavior as the original setup page does.
         */
        redirectIfNecessary: function(viewToRedirectTo){
            if(Splunk.util.getParameter("redirect_to_custom_setup") === "1"){
                document.location = viewToRedirectTo;
            }
        },

        /**
         * Save the app config to note that it is now configured.
         */
        setConfigured: function(){

            // Not necessary to set the app as configured since it is already configured
            if(this.is_app_configured){
                console.info("App is already set as configured; no need to update it");
                return;
            }

            // Modify the model
            this.app_config.entry.content.set({
                configured: true
            }, {
                silent: true
            });

            // Kick off the request to edit the entry
            var saveResponse = this.app_config.save();

            // Wire up a response to tell the user if this was a success
            if (saveResponse) {

                // If successful, show a success message
                saveResponse.done(function(model, response, options){
                    console.info("App configuration was successfully updated");
                }.bind(this))

                // Otherwise, show a failure message
                .fail(function(response){
                    console.warn("App configuration was not successfully updated");
                }.bind(this));
            }

        },

        /**
         * Determine if the user has the given capability.
         */
        hasCapability: function(capability){

        	var uri = Splunk.util.make_url("/splunkd/__raw/services/authentication/current-context?output_mode=json");

        	if(this.capabilities === null){

	            // Fire off the request
	            jQuery.ajax({
	            	url:     uri,
	                type:    'GET',
	                async:   false,
	                success: function(result) {

	                	if(result !== undefined){
	                		this.capabilities = result.entry[0].content.capabilities;
	                	}

	                }.bind(this)
	            });
        	}

			// Determine if the user should be considered as having access
			if(this.is_using_free_license){
				return true;
			}
			else{
				return $.inArray(capability, this.capabilities) >= 0;
			}

        },

        /**
         * Return true if the user has 'admin_all_objects'.
         */
        userHasAdminAllObjects: function(){
            return this.hasCapability('admin_all_objects');
        }

    });
});
