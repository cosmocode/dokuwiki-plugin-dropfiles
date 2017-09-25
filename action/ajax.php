<?php
/**
 * DokuWiki Plugin dropfiles (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Michael Große <dokuwiki@cosmocode.de>
 */

// must be run within Dokuwiki
if (!defined('DOKU_INC')) {
    die();
}

class action_plugin_dropfiles_ajax extends DokuWiki_Action_Plugin
{

    /**
     * Registers a callback function for a given event
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     *
     * @return void
     */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handleAjaxCallUnknown');
    }

    /**
     * [Custom event handler which performs action]
     *
     * @param Doku_Event $event event object by reference
     * @param mixed $param [the parameters passed as fifth argument to register_hook() when this
     *                           handler was registered]
     *
     * @return void
     */

    public function handleAjaxCallUnknown(Doku_Event $event, $param)
    {
        if ($event->data !== 'dropfiles_mediaupload') {
            return;
        }
        $event->preventDefault();
        $event->stopPropagation();

        $this->callMediaupload();
    }

    /**
     * this is an adjusted version of @see ajax_mediaupload
     *
     * This version also provides a consistent error key, instead of only giving a localized error message
     */
    protected function callMediaupload()
    {
        global $NS, $MSG, $INPUT;

        $id = '';
        if ($_FILES['qqfile']['tmp_name']) {
            $id = $INPUT->post->str('mediaid', $_FILES['qqfile']['name']);
        } elseif ($INPUT->get->has('qqfile')) {
            $id = $INPUT->get->str('qqfile');
        }

        $id = cleanID($id);

        $NS = $INPUT->str('ns');
        $ns = $NS . ':' . getNS($id);

        $AUTH = auth_quickaclcheck("$ns:*");
        if ($AUTH >= AUTH_UPLOAD) {
            io_createNamespace("$ns:xxx", 'media');
        }

        if ($_FILES['qqfile']['error']) {
            unset($_FILES['qqfile']);
        }

        $res = false;
        if ($_FILES['qqfile']['tmp_name']) {
            $res = media_upload($NS, $AUTH, $_FILES['qqfile']);
        }
        if ($INPUT->get->has('qqfile')) {
            $res = media_upload_xhr($NS, $AUTH);
        }

        if ($res) {
            $result = array(
                'success' => true,
                'link' => media_managerURL(array('ns' => $ns, 'image' => $NS . ':' . $id), '&'),
                'id' => $NS . ':' . $id,
                'ns' => $NS,
            );
        } else {
            $error = '';
            if (count($MSG)) {
                foreach ($MSG as $msg) {
                    $error .= $msg['msg'];
                }
            }
            $result = array(
                'error' => $error,
                'errorType' => $this->determineErrorCause($id, $ns, $AUTH),
                'ns' => $NS,
            );
        }
        header('Content-Type: application/json');
        echo json_encode($result);
    }

    /**
     * Try to determine WHY the upload failed
     *
     * This replicates code from several places in dokuwiki core
     *
     * @param $id
     * @param $ns
     * @param $AUTH
     *
     * @return string
     */
    protected function determineErrorCause($id, $ns, $AUTH)
    {
        global $conf;

        if (!checkSecurityToken()) {
            return 'security token failed';
        }

        if ($AUTH < AUTH_UPLOAD) {
            return 'missing permissions';
        }
        $fullID = $ns . ':' . $id;
        $fn = mediaFN($fullID);

        // get filetype regexp
        $types = array_keys(getMimeTypes());
        $types = array_map(
            function ($q) {
                return preg_quote($q, '/');
            },
            $types
        );
        $regex = implode('|', $types);
        if (!preg_match('/\.(' . $regex . ')$/i', $fn)) {
            return 'bad file type';
        }

        $exists = file_exists($fn);
        if ($exists) {
            if (!$conf['mediarevisions'] && $AUTH < AUTH_DELETE) {
                return 'file exists and no delete permissions';
            }

            return 'file exists';
        }

        list(, $mime) = mimetype($id);
        $ok = media_contentcheck($fn, $mime);
        if ($ok === -1) {
            return 'file does not match extension';
        }
        if ($ok === -2) {
            return 'spam';
        }
        if ($ok === -3) {
            return 'xss';
        }

        return '';
    }
}

// vim:ts=4:sw=4:et:
