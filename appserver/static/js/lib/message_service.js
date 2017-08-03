define([
    "jquery"
], function(
    $
){
    return {
        /**
         * Hide the given item while retaining the display value
         */
        hide: function (selector) {
            selector.css("display", "none");
            selector.addClass("hide");
        },

        /**
         * Un-hide the given item.
         *
         * Note: this removes all custom styles applied directly to the element.
         */
        unhide: function (selector) {
            selector.removeClass("hide");
            selector.removeAttr("style");
        },

        /**
         * Hide the messages.
         */
        hideMessages: function () {
            this.hideWarningMessage();
            this.hideInfoMessage();
        },

        /**
         * Hide the warning message.
         */
        hideWarningMessage: function () {
            this.hide($("#warning-message", this.$el));
        },

        /**
         * Hide the informational message
         */
        hideInfoMessage: function () {
            this.hide($("#info-message", this.$el));
        },

        /**
         * Show a warning noting that something bad happened.
         */
        showWarningMessage: function (message) {
            this.renderMessageDivs();
            $("#warning-message .message", this.$el).html(message);
            this.unhide($("#warning-message", this.$el));
        },

        /**
         * Show a warning noting that something bad happened.
         */
        showInfoMessage: function (message) {
            this.renderMessageDivs();
            $("#info-message .message", this.$el).html(message);
            this.unhide($("#info-message", this.$el));
        },

        /**
         * Render the HTML necessary for the information and warning messages to appear.
         *
         * This will add HTML necessary to render error and information messages to the DOM. You can manually place
         * the HTML anywhere you want by copying the following in your template:
         *
         <div style="display:none" id="warning-message">
         <div class="alert alert-error">
         <i class="icon-alert"></i>
         <span class="message"></span>
         </div>
         </div>
         <div style="display:none" id="info-message">
         <div class="alert alert-info">
         <i class="icon-alert"></i>
         <span class="message"></span>
         </div>
         </div>
         */
        renderMessageDivs: function () {
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
            if ($('#warning-message', this.$el).length === 0) {
                $(this.$el).prepend(html);
            }

        }
    }
});
