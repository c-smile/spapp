/**
* @author Lukasz Marszal <lmarszal@gmail.com>
* @name Automatic styling for jQuery Single Page Application micro framework
* @license MIT
*/


(function($,window){
    function applyStyles(sectionsSelector) {
        if(!sectionsSelector) {
            sectionsSelector = 'body > section';
        }

        var styles = '';
        $(sectionsSelector).each(function(){
            var id;
            if(id = $(this).attr('id')) {
                styles += 'body.' + id + ' section#' + id + ', ';
            }
        });
        if(!styles) {
            console.warn('No sections found for \'%s\'', sectionsSelector);
            return;
        }
        styles = styles.slice(0, -2) + ' { display:block; }';
        styles += sectionsSelector + ' { display: none; }';

        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = styles;
        var head = document.getElementsByTagName('head')[0];
        if(!head){
            head = document.createElement('head');
            document.getElementsByTagName('body')[0].appendChild(head);
        }
        head.appendChild(style);
    }

    window.app.applyStyles = applyStyles;

    applyStyles();
})(jQuery,this);
