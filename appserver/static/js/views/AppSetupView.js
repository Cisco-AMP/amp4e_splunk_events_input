require.config({
    paths: {
        text: "../app/amp4e_events_input/js/lib/text",
        setup_view: '../app/amp4e_events_input/js/views/SetupView',
        api_credentials: "../app/amp4e_events_input/js/lib/api_credentials_service"
    }
});

define([
    "underscore",
    "jquery",
    "models/SplunkDBase",
    "setup_view",
    "api_credentials",
    "util/splunkd_utils",
    "text!../app/amp4e_events_input/js/templates/AppSetupView.html"
], function(
    _,
    $,
    SplunkDBaseModel,
    SetupView,
    apiCredentialsService,
    splunkd_utils,
    Template
){

    var Amp4eEventsInputConfiguration = SplunkDBaseModel.extend({
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        url: 'services/configs/conf-inputs/amp4e_events_input'
    });

    return SetupView.extend({
        className: "AppSetupView",

        events: {
            "click #save-config": "saveConfig"
        },

        formProperties: {
            'apiHost': '.api_host input',
            'apiId': '.api_id input',
            'apiKey': '.api_key input'
        },

        initialize: function() {
            this.options = _.extend({}, this.defaults, this.options);
            SetupView.prototype.initialize.apply(this, [this.options]);

            this.setupValidators();

            this.ampInputConfiguration = null;
            // this.secure_storage_stanza = this.makeStorageEndpointStanza(this.options.secure_storage_username,
            //     this.options.secure_storage_realm);
        },

        updateModel: function(){
            this.ampInputConfiguration.entry.content.attributes.api_host = this.getApiHost();
            this.ampInputConfiguration.entry.content.attributes.api_id = this.getApiId();
        },

        saveConfig: function(){
            this.hideMessages();

            if (!this.userHasAdminAllObjects()) {
                alert("You don't have permission to edit this app");
            } else if (this.validate()) {
                // Update the model with the latest info so that we can save it
                this.updateModel();

                this.showFormInProgress(true);

                $.when(
                    this.ampInputConfiguration.save(),
                    apiCredentialsService.saveAPIKey(this.getApiId(), this.getApiKey())
                )
                // If successful, show a success message
                .then(function(){
                    this.showInfoMessage("Configuration successfully saved");

                    this.showFormInProgress(false);
                    // this.redirectIfNecessary("status_overview");
                    // Set the app as configured
                    this.setConfigured();

                }.bind(this))
                // Otherwise, show a failure message
                .fail(function (response) {
                    this.showFormInProgress(false);
                    this.showWarningMessage("Configuration could not be saved");
                }.bind(this));
            } else {
                this.showWarningMessage("Configuration could not be saved. Form is not valid");
            }

            return false;
        },

        /**
         * Sets the controls as enabled or disabled.
         */
        setControlsEnabled: function(enabled){

            if(enabled === undefined){
                enabled = true;
            }

            $('input,select', this.el).prop('disabled', !enabled);

        },

        /**
         * Make the form as in progress.
         */
        showFormInProgress: function(inProgress){
            $('.btn-primary').prop('disabled', inProgress);
            this.setControlsEnabled(!inProgress);

            if(inProgress){
                $('.btn-primary').text("Saving Configuration...");
            }
            else{
                $('.btn-primary').text("Save Configuration");
            }
        },

        /**
         * Fetch the app configuration data.
         */
        fetchAppConfiguration: function(){
            this.ampInputConfiguration = new Amp4eEventsInputConfiguration();

            this.setControlsEnabled(false);

            return this.ampInputConfiguration.fetch({
                url: '/splunkd/__raw/services/configs/conf-inputs/amp4e_events_input',
                success: function (model, _response, _options) {
                    console.info("Successfully retrieved the default amp4e_events_input configuration");

                    // migrate to new secure format for api key if an api key exists in unsecure format
                    apiKey = model.entry.content.attributes.api_key;
                    apiId = model.entry.content.attributes.api_id;
                    if (apiKey && apiKey.length > 0) {
                        // save secured api key
                        apiCredentialsService.saveAPIKey(apiId, apiKey);

                        // remove plain text api key
                        this.ampInputConfiguration.entry.content.attributes.api_key = null;
                        this.ampInputConfiguration.save();
                    }

                    this.setApiHost(model.entry.content.attributes.api_host);
                    this.setApiId(model.entry.content.attributes.api_id);
                    this.setApiKey(apiCredentialsService.fetchAPIKey(this.getApiId()));
                }.bind(this),
                error: function () {
                    console.warn("Unsuccessfully retrieved the default amp4e_events_input configuration");
                }.bind(this)
            });
        },

        render: function () {

            if(this.userHasAdminAllObjects()){

                // Render the view
                this.$el.html(_.template(Template, {
                    'has_permission' : this.userHasAdminAllObjects()
                }));

                // Start the process of loading the app configurtion if necessary
                if(this.ampInputConfiguration === null){
                    this.setControlsEnabled(false);

                    $.when(this.fetchAppConfiguration()).always(function(a, credential){
                        this.setControlsEnabled(true);
                    }.bind(this));
                }
            }
            else{
                this.$el.html("Sorry, you don't have permission to perform setup");
            }

        },

        /**
         * Setup the validators so that we can detect bad input
         */
        setupValidators: function(){
            this.addValidator('.api_host', this.getApiHost.bind(this), function(value) { return !!value; },
                "Is required");
            this.addValidator('.api_id', this.getApiId.bind(this), function(value) { return !!value; },
                "Is required");
            this.addValidator('.api_key', this.getApiKey.bind(this), function(value) { return !!value; },
                "Is required");
        }

    });
});
