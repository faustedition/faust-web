;(function($) {
    $.fn.copyToClipboard = function(options) {
        var settings = $.extend({
            target: $(this).data('target') || $(this).attr('href')
        }, options );


        return this.each(function() {

            $(this).on('click', function(event) {
                event.preventDefault();

                var $temp = $("<input>");
                $("body").append($temp);
                
                $temp.val($(settings.target).text().replace(/\s\s+/g, ' ')).select(); // select text ans replace multiple whitespaces
                
                try {
                    document.execCommand("copy");
                } catch (err) {
                    alert('Error: ' + err + '. Please use [CTRL] + [C] to copy text.');
                }

                $temp.remove();
            });
        });
    };
})(jQuery);
