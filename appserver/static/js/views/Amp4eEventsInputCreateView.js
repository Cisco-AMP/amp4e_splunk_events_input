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
    "collections/SplunkDsBase",
    "setup_view",
    "api_credentials",
    "util/splunkd_utils",
    "text!../app/amp4e_events_input/js/templates/Amp4eEventsInputCreateView.html",
    "css!../app/amp4e_events_input/css/Amp4eEventsInputCreateView.css"
], function(
    _,
    $,
    SplunkDBaseModel,
    SplunkDsBaseCollection,
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

    var SplunkIndexes = SplunkDsBaseCollection.extend({
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        url: 'data/indexes'
    });

    var Amp4eEventsInput = SplunkDBaseModel.extend({
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        url: 'amp4e_events_input/data/inputs/amp4e_events_input'
    });

    return SetupView.extend({
        className: "Amp4eEventsInputCreateView",

        events: {
            "click #save-changes": "saveChanges"
        },

        formProperties: {
            'inputName': '.input_name input',
            'inputIndex': '.input_index select',
            'streamName': '.stream_name input',
            'streamEventTypes': '.stream_event_types select',
            'streamGroups': '.stream_groups select'
        },

        initialize: function() {
            this.options = _.extend({}, this.defaults, this.options);
            SetupView.prototype.initialize.apply(this, [this.options]);

            this.apiHost = null;
            this.apiId = null;

            this.ampInputConfiguration = null;
            this.ampInput = null;
            this.eventsGroups = {};
            this.searchParams = new URL(location.href).searchParams;
            this.isUpdatePage = this.searchParams.has('name');
        },

        loadIndexes: function() {
            var splunkIndexes = new SplunkIndexes(),
                $indexSelect = $('#splunkIndexes');
            splunkIndexes.fetch({
                data: { search: 'isInternal=false disabled=false', count: -1, output_mode: 'json' },
                type: 'GET',
                success: function(data) {
                    data.models.map(function(model) {
                        var name = model.entry.attributes.name,
                            selected = name === 'main',
                            option = new Option(name, name, selected, selected);
                        $indexSelect.append(option);
                    });
                }
            });
        },

        saveChanges: function(){
            if (this.userHasAdminAllObjects()) {
                this.hideMessages();
                this.showFormInProgress(true);

                if (this.isUpdatePage) {
                    return this.saveWithAPI();
                }

                return this.setInputAndProceed();
            } else {
                alert("You don't have permission to edit this input");
            }
        },

        saveWithAPIIfInputValid: function() {
            var inputName = this.getInputName().trim();

            if (!inputName.length) {
                this.showWarningMessage("<b>Input could not be saved:</b><br/>" +
                    "Input name cannot be empty or contain only whitespaces.");
            } else if (inputName.length >= 1024) {
                this.showWarningMessage("<b>Input could not be saved:</b><br/>" +
                    "Input name must be less than 1024 characters.");
            } else if (this.ampInput) {
                this.showWarningMessage("<b>Input could not be saved:</b><br/>Input with this name already exists.");
            } else {
                return this.saveWithAPI();
            }

            this.showFormInProgress(false);
            return false;
        },

        setInputsData: function(){
            if (this.ampInput) {
                this.setStreamName(this.ampInput.content.stream_name);
                this.initSelectTag($(this.formProperties['streamEventTypes']), 'event_types_list', this.ampInput.content.event_types ? this.ampInput.content.event_types.split(',') : []);
                this.initSelectTag($(this.formProperties['streamGroups']), 'groups_list', this.ampInput.content.groups ? this.ampInput.content.groups.split(',') : []);

                $('.dashboard-title').html('Edit Input "' + this.getInputName() + '"');
            } else {
                this.showWarningMessage('Input not found');
                setTimeout(function(){
                    window.top.location.replace(Splunk.util.make_full_url('app/amp4e_events_input/amp4e_events_input_list'));
                }, 2000);
            }
        },

        setInputAndProceed: function(){
            $.ajax({
                url: splunkd_utils.fullpath('/servicesNS/admin/amp4e_events_input/data/inputs/amp4e_events_input'),
                data: { output_mode: 'json' },
                type: 'GET',
                success: function(resp) {
                    this.ampInput = resp.entry.find(el => el.name == this.getInputName());

                    if (this.isUpdatePage) {
                        this.setInputsData();
                    } else {
                        this.saveWithAPIIfInputValid();
                    }
                }.bind(this)
            });

            return false;
        },

        saveWithAPI: function() {
            $.ajax({
                url: Splunk.util.make_full_url("/custom/amp4e_events_input/amp_streams_api_controller/save_stream"),
                data: this.getStreamOptions(true),
                type: 'POST',
                success: function (data) {
                    if (data.success) {
                        this.saveInput();
                    } else {
                        this.showFormInProgress(false);
                        var error = JSON.stringify(data);
                        if (data.error) {
                            if (data.error instanceof Array) {
                                error = data.error.map(err => err.details.join('<br/>')).join('<br/>');
                            } else {
                                error = JSON.stringify(error);
                            }
                        }

                        this.showWarningMessage("<b>Input could not be saved:</b><br/> " + error);
                    }
                }.bind(this),
                error: function (err) {
                    this.showWarningMessage("Input could not be saved due to server error" + JSON.stringify(err));
                    this.showFormInProgress(false);
                }.bind(this)
            });

            return false;
        },

        // this will only get called if saveWithAPI succeeds
        saveInput: function() {
            $.ajax({
                url: splunkd_utils.fullpath(['/servicesNS/admin/amp4e_events_input/data/inputs/amp4e_events_input', encodeURIComponent(this.getInputName())].join('/')),
                data: this.isUpdatePage ? this.getStreamUpdateOptions(false) : this.getStreamOptions(false),
                type: 'POST',
                success: function(resp) {
                    if (this.isUpdatePage) {
                        this.showInfoMessage("Input successfully saved");
                        this.showFormInProgress(false);
                    } else {
                        window.top.location.replace(Splunk.util.make_full_url('app/amp4e_events_input/amp4e_events_input_list'));
                    }
                }.bind(this),
                error: function (err) {
                    this.showWarningMessage('Input could not be saved. Please see the logs');
                    this.showFormInProgress(false);
                }.bind(this)
            })
        },

        /**
         * Sets the controls as enabled or disabled.
         */
        setControlsEnabled: function(enabled){
            $('input,select,button', this.el).prop('disabled', !enabled);
        },

        getEventsGroupsNames: function(selected_ids) {
            return (selected_ids || []).map(item => this.eventsGroups[item]).join('---');
        },

        getStreamOptions: function(includeAPIKey) {
            return Object.assign({
                name: this.getInputName(),
                index: this.getInputIndex()
            }, this.getStreamUpdateOptions(includeAPIKey));
        },

        getStreamUpdateOptions: function(includeAPIKey) {
            var event_types = this.getStreamEventTypes();
            var groups = this.getStreamGroups();

            return Object.assign({
                stream_name: this.getStreamName(),
                event_types: Array(event_types).join(','),
                groups: Array(groups).join(','),
                event_types_names: this.getEventsGroupsNames(event_types),
                groups_names: this.getEventsGroupsNames(groups)
            }, this.getAPIOptions(includeAPIKey));
        },

        getAPIOptions: function(includeAPIKey) {
        apiId = this.ampInputConfiguration.entry.content.attributes.api_id;
            if (includeAPIKey) {
                console.log('includeAPIKey called');

                return {
                    api_host: this.ampInputConfiguration.entry.content.attributes.api_host,
                    api_id: apiId,
                    api_key: apiCredentialsService.fetchAPIKey(apiId)
                }
            } else {
                console.log('includeAPIKey NOT called');
                return {
                    api_host: this.ampInputConfiguration.entry.content.attributes.api_host,
                    api_id: apiId
                }
            }
        },

        getInputName: function() {
            if (this.isUpdatePage) {
                return this.searchParams.get('name');
            } else {
                return $('.input_name input').val();
            }
        },

        /**
         * Make the form as in progress.
         */
        showFormInProgress: function(inProgress){
            this.setControlsEnabled(!inProgress);

            if (inProgress) {
                $('.btn-primary').html("<i class='icon-clock'></i>Saving");
                $('span.saving').show();
            } else {
                $('.btn-primary').html("Save");
                $('span.saving').hide();
            }
        },

        /**
         * Fetch the app configuration data.
         */
        fetchAppConfiguration: function(){
            this.ampInputConfiguration = new Amp4eEventsInputConfiguration();

            this.setControlsEnabled(false);

            this.ampInputConfiguration.fetch({
                url: '/splunkd/__raw/services/configs/conf-inputs/amp4e_events_input',
                success: function (model, _response, _options) {
                    this.apiHost = model.entry.content.attributes.api_host;
                    this.apiId = model.entry.content.attributes.api_id;

                    if (![this.apiHost, this.apiId, apiCredentialsService.fetchAPIKey(this.apiId)].every(el => el)) {
                        this.showErrorMessage('.empty-conf');
                        return false;
                    }

                    this.initFormInputs();
                }.bind(this)
            });

            return false;
        },

        initFormInputs: function() {
            if (this.isUpdatePage) {
                $('.input_name').remove();
                $('.input_index').remove();
                this.setInputAndProceed();
            } else {
                this.initSelectTag($(this.formProperties['streamEventTypes']), 'event_types_list');
                this.initSelectTag($(this.formProperties['streamGroups']), 'groups_list');
            }
        },

        initSelectTag: function(obj, endpoint, selected_array = []) {
            var $element = obj.select2();
            var $request = $.ajax({
                url: Splunk.util.make_full_url("/custom/amp4e_events_input/amp_streams_api_controller/" + endpoint),
                data: this.getAPIOptions(true)
            });

            var _this = this;

            $request.then(function(data) {
                if (data.error) {
                    _this.showErrorMessage('.wrong-conf');
                } else {
                    data.map(function(item) {
                        var id = item.id || item.guid,
                            selected = selected_array.includes(id.toString()),
                            name = item.name + ' (' + id + ')',
                            option = new Option(name, id, selected, selected);
                        _this.eventsGroups[id] = name;
                        $element.append(option);
                    });

                    $element.trigger('change');

                    _this.setControlsEnabled(true);
                }
            });
        },

        showErrorMessage: function(conf) {
            var error = $('#error-message');
            error.find(conf).show();
            error.show();

            this.setControlsEnabled(false);
        },

        render: function () {
            if (this.userHasAdminAllObjects()) {
                // Render the view
                this.$el.html(_.template(Template, {
                    'has_permission' : this.userHasAdminAllObjects()
                }));

                this.loadIndexes();
                this.fetchAppConfiguration();
            } else {
                this.$el.html("Sorry, you don't have permission to create/edit inputs");
            }
        }
    });
});
