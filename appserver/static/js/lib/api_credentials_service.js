define([], function() {
    return {

        /**
         * Encrypt and save the api key
         */
        saveAPIKey: function(apiId, apiKey) {
            $.ajax({
                url: Splunk.util.make_full_url("/custom/amp4e_events_input/amp_streams_api_controller/save_api_key"),
                data: { api_id: apiId, api_key: apiKey },
                type: 'POST',
                success: function (data) {
                    return true;
                }.bind(this)
            });
            return false;
        },

        /**
         * Decrypt and fetch the api key. API Id is the key used to fetch the api key.
         */
        fetchAPIKey: function(apiId) {
            var result="";
            $.ajax({
                url: Splunk.util.make_full_url("/custom/amp4e_events_input/amp_streams_api_controller/fetch_api_key"),
                data: { api_id: apiId },
                type: 'GET',
                async: false,
                success: function (data) {
                    if (data.success) {
                        result = data.api_key;
                    }
                }.bind(this)

            });
            return result;
        }

    }
});
