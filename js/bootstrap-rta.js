// Copyright (c) 2013 Clay Street Online LLC
// http://www.claystreet.com
//
// MIT License
// http://opensource.org/licenses/MIT

// Begin namespace protection
(function($) {

    // A simple Array.map() to patch up IE7
    if (!Array.prototype.map) {
        Array.prototype.map = function(fn, that) {
            var i = 0,
                ilen = this.length,
                resultA = [];
            for (; i < ilen; ++i) resultA.push(fn.call(that, this[i], i, this));
            return resultA;
        };
    }

    var plugin_name = 'rta', // Change this string to change the JQuery plugin name

        defaultButtons = 'bold italic underline strike,' +
                         'ul ol, link image',
        
        allButtons =  'bold italic underline strike,' +
                      'font-name font-size font-color font-bgcolor,' +
                      'font-increase font-decrease,' +
                      'superscript subscript,' +
                      'align-left align-center align-right align-full,' + 
                      'indent-right indent-left,' +
                      'ul ol,' +
                      'link unlink image,' +
                      'heading paragraph div hr,' +
                      'h1 h2 h3 h4 h5 h6,' +
                      'bgcolor,' +
                      'remove-formatting html,',
                      
        rxPlaceholder = /<span class=['"]?rta-placeholder['"]?>.*?<\/span>/i,
        isPlaceholder = function(str) { return rxPlaceholder.test(str); },
        rxAllWhitespace = /^\s*$/,
        allWhitespace = function(str) { return rxAllWhitespace.test(str); },
        
    // --------------------------------
    // Set up the JQuery utility plugin... aka the RTA global object... $.rta
    // --------------------------------
    
        rta = function(buttonStr, opts) {
            $('textarea.rta')[plugin_name](buttonStr, opts);
        };

    // Special (non-execCommand()) button handlers
    function toggleHTML(btnName, event, button) { return rta.toggleHTML(btnName, event, button); }
    
    // 'value' handlers... 
    function getLinkUrl() { return rta.getLinkUrl(); }
    function getImageUrl() { return rta.getImageUrl(); }
    function getFontColor() { return rta.getFontColor(); }
    function getFontBgColor() { return rta.getFontBgColor(); }
    function getHeading() { return rta.getHeading(); }
    function getFontName() { return rta.getFontName(); }
    function getFontSize() { return rta.getFontSize(); }
    function getHTML() { return rta.getHTML(); }
    function getBgColor() { return rta.getBgColor(); }

    // Default prompt uses the built in browser window.prompt()
    rta.winPrompt = function(label, defval) {
        var val;
        if (typeof defval === 'undefined' || defval === null) defval = '';
        val = window.prompt(label, defval);
        if (val !== null) {
            val = $.trim(val);
            if (val !== '') {
                return val;
            }
        }
        return null;
    }
    
    // Default color prompt uses the built in browser window.prompt()
    rta.colorPrompt = function(label, defval) {
        if (!label) label = 'HTML color string:';
        return rta.winPrompt('HTML color string:', defval);
    }
    
    // Developers can override these to change default behavior, do more type checking etc...
    rta.getLinkUrl = function() {
        return rta.winPrompt('url:', 'http://');
    }
    rta.getImageUrl = function() {
        return rta.winPrompt('Image url:', 'http://');
    }
    rta.getFontColor = function() {
        return rta.colorPrompt();
    }
    rta.getFontBgColor = function() {
        return rta.colorPrompt();
    }
    rta.getHeading = function() {
        var val = rta.winPrompt('HTML heading tag (h1, h2... h6):');
        if (val) {
            val = val.toLowerCase();
            if (/h[1-6]/.test(val)) {
                return val;
            }
        }
        return null;
    }
    rta.getFontName = function() {
        return rta.winPrompt('Font name (arial, etc.):');
    }
    rta.getFontSize = function() {
        var valStr = rta.winPrompt('Font size (1 to 7):'),
            valInt;
        if (valStr) {
            valInt = parseInt(valStr);
            if (!isNaN(valInt) && valInt > 0 && valInt < 8) {
                return valInt;
            }
        }
        return null;
    }
    rta.getHTML = function() {
        // WARNING: be careful if you allow random html entry!!!
        return rta.winPrompt('HTML to enter:');
    }
    rta.getBgColor = function(){
        return rta.colorPrompt();
    }
    rta.toggleHTML = function(btnName, event, button) {
        var iconGroup = $(button).closest('.rta-icon-group')[0],
            jta = $(iconGroup.rtaTextArea),
            je = $(iconGroup.rtaEditable);
        if (jta.css('display') === 'none') {
            jta.show().focus();
            jta.width(je.width());
            jta.height(je.height());
            je.hide();
        }
        else {
            je.show();
            je.width(jta.width());
            je.height(jta.height());
            jta.hide();
        }
    }
    
    // The default button click handler
    rta.buttonClick = function(btnName, event, button) {
        var btn = rta.button[btnName],
            val = btn['value'],
            cmd = btn['cmd'];
            
        if ($.isFunction(cmd)) {
            cmd(btnName, event, button);
        }
        else if (typeof btn['cmd'] === 'string') {
            if ($.isFunction(val)) {
                val = val(btnName, event);
                if (val === null) {
                    return; // An invalid value was entered
                }
            }
            if (cmd === 'formatBlock' && val.charAt(0) !== '<') {
                val = '<' + val + '>';
            }
            // IE7 requires this exception handling to avoid JS errors
            try {
                document.execCommand(cmd, false, val);
            }
            catch(e) {
            }
        }
    }
    
    // Helper
    function btn(help, cmd, icon, value) {
        if (!value) value = '';
        if (!icon) icon = 'rtai-' + cmd;
        return {
            'help': help,
            'cmd': cmd,
            'value': value,
            'icon': icon
        };
    }
    
    // Defines button help text and handlers
    //    If 'value' is a function then it is invoked to retrieve the 'value' parameter for document.execCommand()
    //    If 'cmd' is a string then document.execCommand() is invoked
    //    If 'cmd' is a function then it is invoked when the button is clicked
    rta.button = {
        'bold': btn('Bold', 'bold'),
        'italic': btn('Italic', 'italic'),
        'underline': btn('Underline', 'underline'),
        'strike': btn('Strikethrough', 'strikeThrough', 'rtai-strike'),
        'ul': btn('Unordered List', 'insertUnorderedList', 'rtai-ul'),
        'ol': btn('Ordered List', 'insertOrderedList', 'rtai-ol'),
        'link': btn('Hyperlink Selection', 'createLink', 'rtai-link', getLinkUrl),
        'unlink': btn('Undo Hyperlink', 'unlink', 'rtai-unlink'),
        'image': btn('Insert Image', 'insertImage', 'rtai-image', getImageUrl),
        'font-name': btn('Font Name', 'fontName', 'rtai-font-name', getFontName),
        'font-color': btn('Font Color', 'foreColor', 'rtai-font-color', getFontColor),
        // NOTE: For 'font-bgcolor' the 'backColor' command is used instead of 'hiliteColor' since it is more consistently supported and seems to create the same HTML
        'font-bgcolor': btn('Font Background Color', 'backColor', 'rtai-font-bgcolor', getFontBgColor), 
        'font-size': btn('Font Size', 'fontSize', 'rtai-font-size', getFontSize),
        'font-increase': btn('Increase Font Size', 'increaseFontSize', 'rtai-font-increase'),
        'font-decrease': btn('Decrease Font Size', 'decreaseFontSize', 'rtai-font-decrease'),
        'bgcolor': btn('Section Background Color', 'backColor', 'rtai-bgcolor', getBgColor),
        'html': btn('Show/Hide HTML', toggleHTML, 'rtai-html'),
        'heading': btn('HTML Heading', 'formatBlock', 'rtai-heading', getHeading),
        'h1': btn('H1 Heading', 'formatBlock', 'rtai-h1', 'h1'),
        'h2': btn('H2 Heading', 'formatBlock', 'rtai-h2', 'h2'),
        'h3': btn('H3 Heading', 'formatBlock', 'rtai-h3', 'h3'),
        'h4': btn('H4 Heading', 'formatBlock', 'rtai-h4', 'h4'),
        'h5': btn('H5 Heading', 'formatBlock', 'rtai-h5', 'h5'),
        'h6': btn('H6 Heading', 'formatBlock', 'rtai-h6', 'h6'),
        'paragraph': btn('Paragraph', 'formatBlock', 'rtai-paragraph', 'p'),
        'div': btn('HTML div', 'formatBlock', 'rtai-div', 'div'),
        'hr': btn('HTML hr', 'insertHorizontalRule', 'rtai-hr'),
        'align-left': btn('Align Left', 'justifyLeft', 'rtai-align-left'),
        'align-center': btn('Align Center', 'justifyCenter', 'rtai-align-center'),
        'align-right': btn('Align Right', 'justifyRight', 'rtai-align-right'),
        'align-full': btn('Align Full', 'justifyFull', 'rtai-align-full'),
        'indent-right': btn('Indent Right', 'indent', 'rtai-indent-right'),
        'indent-left': btn('Indent Left', 'outdent', 'rtai-indent-left'),
        'superscript': btn('Superscript', 'superscript', 'rtai-superscript'),
        'subscript': btn('Subscript', 'subscript', 'rtai-subscript'),
        'remove-formatting': btn('Remove Formatting', 'removeFormat', 'rtai-remove-formatting')
    };
    
    rta.defaultButtons = defaultButtons;
    rta.allButtons = allButtons;
    rta.options = {
        'twoway': false,
        'btnsize': 'mini'
    };
        
    $[plugin_name] = rta;

    // ---------------------------------
    // The JQuery selector plugin
    // ---------------------------------
    
    $.fn[plugin_name] = function(param1, param2) {
        return this.each(function() {
            var htmlA = [],
                jthis = $(this),
                btnStr = jthis.data('rta'),
                options = $.extend({}, rta.options),
                inputEvents = 'input',
                placeholder=jthis.attr('placeholder'),
                p1Type = typeof param1,
                p2Type = typeof param2,
                buttonA;

            // STEP 1: Initialize the options
            if (param1 !== null && p1Type === 'object') $.extend(options, param1);
            else if (param2 !== null && p2Type === 'object') $.extend(options, param2);
                
            if (jthis.data('rta-twoway') === true) options['twoway'] = true;
            if (jthis.data('rta-btnsize')) options['btnsize'] = jthis.data('rta-btnsize');
            
            // STEP 2: Determine which RTA buttons to show and initialize buttonA
            //    option 1: button set defined by JSON data-rta attribute on the textarea
            //    option 2: button set defined by parameter buttonStr
            //    option 3: default button set
            if (!btnStr) {
                if (p1Type === 'string') btnStr = param1;
                else if (p2Type === 'string') btnStr = param2;
                else btnStr = rta.defaultButtons;
            }
            btnStr = btnStr.replace(/\s+/g, ' ').replace(/\s?,\s?/g, ',').replace(/^\s|\s$/g, ''); // Remove extraneous whitespace
            buttonA = btnStr.split(',').map(function(str) { return str.split(' '); }); // Create an array of button group arrays

            // STEP 3: Create the RTA HTML
            htmlA.push('<div class="rta-group"><div class="rta-icon-group">');
            $.each(buttonA, function(i, btnGroupA) {
                if (btnGroupA.length > 0) {
                    htmlA.push('<div class="btn-group">');
                    $.each(btnGroupA, function(i, btnName) {
                        if (btnName in rta.button) {
                            btn = rta.button[btnName];
                            icon = btn['icon'];
                            htmlA.push('<button class="btn btn-');
                            htmlA.push(options['btnsize']);
                            htmlA.push('" type="button" data-rtabtn="');
                            htmlA.push(btnName);
                            htmlA.push('" title="');
                            htmlA.push(btn['help']);
                            htmlA.push('">');
                            if ($.isFunction(icon)) {
                                htmlA.push(icon(btnName));
                            }
                            else {
                                htmlA.push('<i class="');
                                htmlA.push(icon);
                                htmlA.push('"></i>');
                            }
                            htmlA.push('</button>');
                        }
                    });
                    htmlA.push('</div>');
                }
            });
            htmlA.push('</div><div id="' + this.id + '-mirror" class="rta-editable" contenteditable="true"></div></div>');
            
            // STEP 4: Insert the RTA HTML into the DOM as a previous sibling of the textarea
            jthis.before(htmlA.join(''));
            
            // Get references to some of the newly created DOM elements
            var rtaGroup = jthis.prev(),
                iconGroup = $(' > .rta-icon-group', rtaGroup),
                rtaEditable = $(' > .rta-editable', rtaGroup);
                
            // STEP 5: Set RTA div size to textarea size
            rtaEditable.width(jthis.width());
            rtaEditable.height(jthis.height());
            iconGroup.width(jthis.width());
        
            // STEP 6: Hide the original textarea
            jthis.hide();
            
            // STEP 7: Copy the original textarea content to the rta-editable div
            rtaEditable.html(this.value);
            
            // STEP 8: Bind the rta-editable to textarea copyback handler
            if (!('oninput' in rtaEditable[0])) inputEvents = 'keyup focus';
            rtaEditable.bind(inputEvents, function() {
                this.rtaTextArea.value = this.innerHTML;
            });
            // If two way editing, then bind the textarea to rta-editable copyback handler
            if (options.twoway) {
                jthis.bind(inputEvents, function() {
                    this.rtaEditable.innerHTML = this.value;
                });
            }
            // If not two way, make the textarea read-only
            else {
                jthis.prop('readOnly', true);
            }
            
            // STEP 9: Initialize convenient references used by event handlers
            iconGroup[0].rtaTextArea = this;
            iconGroup[0].rtaEditable = rtaEditable[0];
            rtaEditable[0].rtaIconGroup = iconGroup[0];
            rtaEditable[0].rtaTextArea = this;
            this.rtaIconGroup = iconGroup[0];
            this.rtaEditable = rtaEditable[0];
            
            // STEP 10: Bind the rta-icon-group button click handler
            iconGroup.click(function(event) {
                var btnName = null,
                    target = event.target,
                    tagName = target.tagName.toLowerCase();
                
                while (target && tagName !== 'button' && tagName !== 'div') {
                    target = target.parentNode;
                    tagName = target.tagName.toLowerCase();
                }
                
                // If a button was clicked within the rta-icon-group
                if (target && tagName === 'button') {
                    btnName = $(target).data('rtabtn');
                    if (btnName && btnName in rta.button) {
                        rta.buttonClick(btnName, event, target);
                    }
                    if ($(this.rtaEditable).css('display') !== 'none') {
                        this.rtaEditable.focus(); // Set the focus back on the rta-editable
                    }
                }
            });
            
            // STEP 11: Makeshift resize handlers to keep the textarea, rta-editable, and rta-icon-group in sync
            //          Note: uses 'mouseup' since 'resize' isn't supported on these elements
            rtaEditable.bind('mouseup', function(event) {
                $(this.rtaIconGroup).width($(this).width());
                $(this.rtaTextArea).width($(this).width());
                $(this.rtaTextArea).height($(this).height());
            });
            jthis.bind('mouseup', function(event) {
                $(this.rtaIconGroup).width($(this).width());
                $(this.rtaEditable).width($(this).width());
                $(this.rtaEditable).height($(this).height());
            });
            
            // STEP 12: Allow labels to focus() the rta-editable *if* it is visible
            jthis.closest('.control-group').find('label').prop('rtaEditable', rtaEditable[0]).click(function(event) {
                if ($(this.rtaEditable).css('display') !== 'none') {
                    this.rtaEditable.focus();
                    event.preventDefault(); // prevents the textarea from being focused
                }
            });
            
            // STEP 13: Manage the placeholder text
            
            // Note: showPlaceholder() will only be called if a non-empty placeholder attribute exists on the textarea
            function showPlaceholder(rtaEditable) {
                var ta = rtaEditable.rtaTextArea;
                if (!rtaEditable.rtaPlaceholder && (allWhitespace(ta.value) || isPlaceholder(ta.value))) {
                    rtaEditable.rtaPlaceholder = true;
                    rtaEditable.innerHTML = rtaEditable.rtaPlaceholderHtml + rtaEditable.innerHTML;
                }
            }
            // If the textarea specified a non-empty placeholder string...
            if (placeholder) {
                rtaEditable.prop('rtaPlaceholderHtml', '<span class="rta-placeholder">' + placeholder + '</span>');
                rtaEditable.prop('rtaPlaceholder', false);
                this.value = this.value.replace(rxPlaceholder, ''); // Ensure the placeholder is not in the textarea initially
                showPlaceholder(rtaEditable[0]);
                // Remove upon focus
                rtaEditable.bind('focus', function(event) {
                    if (this.rtaPlaceholder) {
                        this.rtaPlaceholder = false;
                        this.innerHTML = this.innerHTML.replace(rxPlaceholder, '');
                    }
                });
                // Re-insert upon blur if the content is still empty
                rtaEditable.bind('blur', function(event) {
                    showPlaceholder(this);
                });
            }
            
        });
    };
    
}(jQuery)); // End namespace protection
