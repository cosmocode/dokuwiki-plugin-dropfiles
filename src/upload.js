/* es lint-disable */
/* @flow */

jQuery(function () {
    var $editarea = jQuery('#wiki__text');
    $editarea.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // todo: check if user is allowed to upload files here
    });

    $editarea.on('dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // todo: check if user is allowed to upload files here
    });

    $editarea.on('dragleave', function (/*e*/) {
        // e.preventDefault();
        // e.stopPropagation();
    });

    $editarea.on('drop', function (e) {
        // $FlowFixMe
        if (!e.originalEvent.dataTransfer || !e.originalEvent.dataTransfer.files.length) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        // $FlowFixMe
        var files = e.originalEvent.dataTransfer.files;

        // todo Dateigrößen, Filetypes

        var sectok = $editarea.closest('form').find('input[name="sectok"]').val();

        jQuery.makeArray(files).forEach(function (file) {
            var form = new FormData();

            form.append('qqfile', file, file.name);
            form.append('call', 'mediaupload');
            form.append('sectok', sectok);
            form.append('ns', window.JSINFO.namespace);

            var settings = {
                'type':        'POST',
                'data':        form,
                'cache':       false,
                'processData': false,
                'contentType': false
            };

            jQuery.ajax(window.DOKU_BASE + 'lib/exe/ajax.php', settings)
                .done(
                    function (data, textStatus, jqXHR) {
                        console.log('Class: , Function: done-callback, Line 54 {data, textStatus, jqXHR}(): '
                            , { data: data, textStatus: textStatus, jqXHR: jqXHR });
                    }
                )
                .fail(
                    function (jqXHR, textStatus, errorThrown) {
                        console.log('Class: , Function: fail-callback, Line 60 {jqXHR, textStatus, errorThrown}(): '
                            , { jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
                    }
                );
        });
    });
});
