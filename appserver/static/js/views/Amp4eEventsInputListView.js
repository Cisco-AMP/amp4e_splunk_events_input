require.config({
    paths: {
        text: "../app/amp4e_events_input/js/lib/text",
        messages: "../app/amp4e_events_input/js/lib/message_service"
    }
});

define([
    "underscore",
    "backbone",
    "models/SplunkDBase",
    "collections/SplunkDsBase",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "text!../app/amp4e_events_input/js/templates/Amp4eEventsInputListView.html",
    "util/splunkd_utils",
    "messages",
    "css!../app/amp4e_events_input/css/Amp4eEventsInputListView.css"
], function(
    _,
    Backbone,
    SplunkDBaseModel,
    SplunkDsBaseCollection,
    mvc,
    $,
    SimpleSplunkView,
    Template,
    splunkd_utils,
    messageService
){

    var Amp4eEventsInputConfiguration = SplunkDBaseModel.extend({
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        url: 'services/configs/conf-inputs/amp4e_events_input'
    });

    var Amp4eEventsInputs = SplunkDsBaseCollection.extend({
        url: "data/inputs/amp4e_events_input?count=-1",
        initialize: function() {
            SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
        }
    });

    // Define the custom view class
    var Amp4eEventsInputListView = SimpleSplunkView.extend({
        className: "Amp4eEventsInputListView",

        defaults: {
            change_dropdown_titles: true
        },

        /**
         * Initialize the class.
         */
        initialize: function() {
            this.options = _.extend({}, this.defaults, this.options);

            // Save the options
            messageService.$el = this.$el;

            this.apiId = null;
            this.apiKey = null;
            this.apiHost = null;
            this.ampInputConfiguration = null;

            this.fetchAppConfiguration();

            this.change_dropdown_titles = this.options.change_dropdown_titles;
            // Get the inputs
            this.getInputs();
        },

        events: {
            // Options for disabling inputs
            "click .disable-input" : "openDisableInputDialog",
            "click #disable-this-input" : "disableInput",

            // Options for deleting inputs
            "click .delete-input" : "openDeleteInputDialog",
            "click #delete-this-input" : "deleteInput",

            // Options for enabling inputs
            "click .enable-input" : "enableInput"
        },

        fetchAppConfiguration: function(){
            this.ampInputConfiguration = new Amp4eEventsInputConfiguration();

            return this.ampInputConfiguration.fetch({
                url: '/splunkd/__raw/services/configs/conf-inputs/amp4e_events_input',
                success: function (model, _response, _options) {
                    console.info("Successfully retrieved the default amp4e_events_input configuration");
                    this.apiHost = model.entry.content.attributes.api_host;
                    this.apiId = model.entry.content.attributes.api_id;
                    this.apiKey = model.entry.content.attributes.api_key;

                    if (![this.apiHost, this.apiId, this.apiKey].every(el => el)) {
                        $('#error-message').show();

                        return false;
                    }
                }.bind(this),
                error: function () {
                    console.warn("Unsuccessfully retrieved the default amp4e_events_input configuration");
                }.bind(this)
            });

            return false;
        },

        /**
         * Get the inputs
         */
        getInputs: function(){
            this.inputs = new Amp4eEventsInputs();
            this.inputs.on('reset', this.gotInputs.bind(this), this);

            this.inputs.fetch({
                success: function(records) {
                    console.info("Successfully retrieved the inputs");
                },
                error: function() {
                    console.error("Unable to fetch the inputs");
                }
            });
        },

        /**
         * Enable the given input.
         */
        enableInput: function(ev){

            // Get the input that is being requested to enable
            var name = $(ev.target).data("name");
            var namespace = $(ev.target).data("namespace");
            var owner = $(ev.target).data("owner");

            // Perform the call
            $.ajax({
                url: splunkd_utils.fullpath(['/servicesNS',  owner , namespace, '/data/inputs/amp4e_events_input',
                    name, 'enable'].join('/')),
                type: 'POST',
                success: function() {
                    console.info('Input enabled');
                }.bind(this),
                complete: function(jqXHR, textStatus){
                    if (jqXHR.status == 403){
                        console.info('Inadequate permissions to enable input');
                    }
                    else{
                        this.getInputs();
                    }

                }.bind(this),
                error: function(jqXHR, textStatus, errorThrown){
                    if (jqXHR.status != 403 ){
                        console.info('Input enablement failed');
                    }
                }.bind(this)
            });

            return false;
        },

        /**
         * Disable the given input.
         */
        disableInput: function(ev){

            // Get the input that is being requested to disable
            var input = $(ev.target).data("name");
            var namespace = $(ev.target).data("namespace");
            var owner = $(ev.target).data("owner");

            // Perform the call
            $.ajax({
                url: splunkd_utils.fullpath(['/servicesNS',  owner , namespace, '/data/inputs/amp4e_events_input',
                    input, 'disable'].join('/')),
                type: 'POST',

                // On success
                success: function() {
                    console.info('Input disabled');
                }.bind(this),

                // Handle cases where the file could not be found or the user did not have permissions
                complete: function(jqXHR, textStatus){
                    if (jqXHR.status == 403){
                        console.info('Inadequate permissions to disable input');
                    }
                    else {
                        $("#disable-input-modal", this.$el).modal('hide');
                        this.getInputs();
                    }

                }.bind(this),

                // Handle errors
                error: function(jqXHR, textStatus, errorThrown){
                    if( jqXHR.status != 403 ){
                        console.info('Input disablement failed');
                    }
                }.bind(this)
            });

        },

        /**
         * Open a dialog to disable the input.
         */
        openDisableInputDialog: function(ev){

            // Get the input that is being requested to disable
            var name = $(ev.target).data("name");
            var namespace = $(ev.target).data("namespace");
            var owner = $(ev.target).data("owner");

            // Record the info about the input to disable
            $("#disable-this-input", this.$el).data("name", name);
            $("#disable-this-input", this.$el).data("namespace", namespace);
            $("#disable-this-input", this.$el).data("owner", owner);

            // Show the info about the input to disable
            $(".disable-input-name", this.$el).text(name);
            $(".disable-input-namespace", this.$el).text(namespace);
            $(".disable-input-owner", this.$el).text(owner);

            // Show the modal
            $("#disable-input-modal", this.$el).modal();

            return false;

        },

        /**
         * Open a dialog to delete the input.
         */
        openDeleteInputDialog: function(ev){

            // Get the input that is being requested to delete
            var name = $(ev.target).data("name");
            var namespace = $(ev.target).data("namespace");
            var owner = $(ev.target).data("owner");

            // Record the info about the input to delete
            $("#delete-this-input", this.$el).data("name", name);
            $("#delete-this-input", this.$el).data("namespace", namespace);
            $("#delete-this-input", this.$el).data("owner", owner);

            // Show the info about the input to delete
            $(".delete-input-name", this.$el).text(name);
            $(".delete-input-namespace", this.$el).text(namespace);
            $(".delete-input-owner", this.$el).text(owner);

            // Show the modal
            $("#delete-input-modal", this.$el).modal();

            return false;

        },

        /**
         * Delete the given input.
         */
        deleteInput: function(ev){
            messageService.hideWarningMessage();
            // Get the input that is being requested to delete
            var inputName = $(ev.target).data("name");
            var namespace = $(ev.target).data("namespace");
            var owner = $(ev.target).data("owner");
            this.deleteWithAPI(inputName).done(function(data){
                if (data.success) {
                    this.doDeleteInput(inputName, namespace, owner);
                } else if (data.error) {
                    var error;
                    if (data.error instanceof Array) {
                        error = data.error.map(function(err){
                            return err.details.join('<br/>');
                        }).join('<br/>');
                    } else {
                        error = "API host could not be reached. Please make sure your API host configuration option is correct and try again later.";
                    }
                    messageService.showWarningMessage(error);
                } else {
                    messageService.showWarningMessage("Input could not be deleted due to server error");
                }
            }.bind(this)).fail(function(xhr){
                messageService.showWarningMessage("Input could not be deleted due to server error");
            }.bind(this));
        },

        deleteWithAPI: function(inputName) {
            return $.ajax({
                url: splunkd_utils.fullpath("/custom/amp4e_events_input/amp_streams_api_controller/delete_stream?" +
                    $.param({
                        name: inputName,
                        api_host: this.ampInputConfiguration.entry.content.attributes.api_host,
                        api_id: this.ampInputConfiguration.entry.content.attributes.api_id,
                        api_key: this.ampInputConfiguration.entry.content.attributes.api_key
                    })
                ),
                type: 'DELETE'
            });
        },

        doDeleteInput: function(inputName, namespace, owner) {
            var uri = splunkd_utils.fullpath(['/servicesNS',  owner , namespace,
                '/data/inputs/amp4e_events_input', encodeURIComponent(inputName)].join('/'));
            $.ajax({
                url: uri,
                type: 'DELETE',
                success: function() {
                    console.info('Input deleted');
                }.bind(this),
                complete: function(jqXHR, textStatus){
                    if( jqXHR.status == 403){
                        console.info('Inadequate permissions to delete input');
                    }
                    else{
                        $("#delete-input-modal", this.$el).modal('hide');
                        this.getInputs();
                    }

                }.bind(this),

                // Handle errors
                error: function(jqXHR, textStatus, errorThrown){
                    if( jqXHR.status != 403 ){
                        console.info('Input deletion failed');
                    }
                }.bind(this)
            });
        },

        /**
         * Got the inputs
         */
        gotInputs: function(){
            this.renderList();
        },

        /**
         * Get a count of the inputs that exist.
         */
        getInputsCount: function(){
            var inputs = this.getInputsJSON();

            if(inputs){
                return inputs.length;
            }
            else{
                return 0;
            }
        },

        /**
         * Get the inputs list in JSON format
         */
        getInputsJSON: function(){

            var inputs_json = [];
            var new_entry = null;

            // Add the inputs
            for(var c = 0; c < this.inputs.models.length; c++){

                new_entry = {
                    'name': this.inputs.models[c].entry.attributes.name,
                    'index': this.inputs.models[c].entry.content.attributes.index,
                    'stream_name': this.inputs.models[c].entry.content.attributes.stream_name,
                    'event_types': this.inputs.models[c].entry.content.attributes.event_types,
                    'groups': this.inputs.models[c].entry.content.attributes.groups,
                    'namespace': this.inputs.models[c].entry.acl.attributes.app,
                    'owner': this.inputs.models[c].entry.acl.attributes.owner,
                    'disabled': this.inputs.models[c].entry.associated.content.attributes.disabled
                };
                new_entry['href'] = 'edit_amp4e_events_input?name=' + encodeURIComponent(new_entry.name) +
                    '&namespace=' + encodeURIComponent(new_entry.namespace) +
                    '&owner=' + encodeURIComponent(new_entry.owner);

                inputs_json.push(new_entry);
            }

            return inputs_json;
        },

        /**
         * Render the list.
         */
        renderList: function(){
            // Get the template
            var input_list_template = $('#list-template', this.$el).text();

            $('#content', this.$el).html(_.template(input_list_template, {
                'inputs' : this.getInputsJSON(),
                'inputs_count' : this.getInputsCount()
            }));
        },

        /**
         * Render the page.
         */
        render: function () {
            this.$el.html(Template);
        },

        hideWarningMessage: function(){
        	this.hide($("#warning-message", this.$el));
        },

        /**
         * Show a warning noting that something bad happened.
         */
        showWarningMessage: function(message){
            this.renderMessageDivs();
        	$("#warning-message .message", this.$el).html(message);
        	this.unhide($("#warning-message", this.$el));
        },

         hide: function(selector){
        	selector.css("display", "none");
        	selector.addClass("hide");
        },

        /**
         * Un-hide the given item.
         *
         * Note: this removes all custom styles applied directly to the element.
         */
        unhide: function(selector){
        	selector.removeClass("hide");
        	selector.removeAttr("style");
        },

        renderMessageDivs: function(){
            var html = '<div style="display:none" id="warning-message">' +
                            '<div class="alert alert-error">' +
                                '<i class="icon-alert"></i>' +
                                '<span class="message"></span>' +
                            '</div>' +
                        '</div>' +
                        '<div style="display:none" id="info-message">' +
                            '<div class="alert alert-info">' +
                                '<i class="icon-alert"></i>' +
                                '<span class="message"></span>' +
                            '</div>' +
                        '</div>';

            // Prepend the content if necessary
            if($('#warning-message', this.$el).length === 0){
                $(this.$el).prepend(html);
            }

        }
    });

    return Amp4eEventsInputListView;
});
