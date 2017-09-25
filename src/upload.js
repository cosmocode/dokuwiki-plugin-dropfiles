/* es lint-disable */
/* @flow */

jQuery(function () {
    var $editarea = jQuery('#wiki__text');
    if (!$editarea.length) {
        return;
    }

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


    var $widget = jQuery('<div id="plugin_dropfiles_uploadwidget"></div>').hide();
    jQuery('body').append($widget);

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

        var filelist = jQuery.makeArray(files);
        if (!filelist.length) {
            return;
        }
        $widget.show();
        filelist.forEach(function (file) {

            var $statusbar = jQuery('<div class="dropfiles_file_upload_bar"></div>');
            $statusbar.append(jQuery('<span class="filename">').text(file.name));
            var $progressBar = jQuery('<progress>');
            $statusbar.append($progressBar);
            $widget.append($statusbar);

            var form = new FormData();

            form.append('qqfile', file, file.name);
            form.append('call', 'dropfiles_mediaupload');
            form.append('sectok', sectok);
            form.append('ns', window.JSINFO.namespace);

            var settings = {
                'type': 'POST',
                'data': form,
                'cache': false,
                'processData': false,
                'contentType': false,
                'xhr': function () {
                    var xhr = jQuery.ajaxSettings.xhr();
                    xhr.upload.onprogress = function(ev) {
                        if (ev.lengthComputable) {
                            var percentComplete = ev.loaded / ev.total;
                            console.log(percentComplete);
                            $progressBar.val(percentComplete);
                            if (percentComplete === 1) {
                                $progressBar.hide().val(0);
                            }
                        }
                    };
                    return xhr;
                }
            };

            jQuery.ajax(window.DOKU_BASE + 'lib/exe/ajax.php', settings)
                .done(
                    function (data, textStatus, jqXHR) {
                        if (data.success) {
                            // upload successful, use data.link and data.id
                            return;
                        }
                        console.log('Class: , Function: done-callback, Line 54 {data, textStatus, jqXHR}(): '
                            , {data: data, textStatus: textStatus, jqXHR: jqXHR});
                    }
                )
                .fail(
                    function (jqXHR, textStatus, errorThrown) {
                        console.log('Class: , Function: fail-callback, Line 60 {jqXHR, textStatus, errorThrown}(): '
                            , {jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
                    }
                );
        });
    });
});
