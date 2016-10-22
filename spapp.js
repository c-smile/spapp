/**
* @author Andrew Fedoniouk <andrew@terrainformatica.com>
* @name jQuery Single Page Application micro framework
* @license MIT
* @purpose routing and dynamic content on single page web applications
*/


(function($,window){

  var pageHandlers = {};

  var currentPageName = null;
  var $currentPage = null;

  function show(pageName,param) {
    var $page = $("section#" + pageName);
    if( $page.length == 0 ) {
      console.warn("section with id=%s not found!",pageName);
      return;
    }
    var ph = pageHandlers[pageName];
    if( ph ) {
      var that = $page.length > 0 ? $page[0] : null;
      var r = ph.call(that , param);
      if( typeof r == "function" ) { // it returns the function that's used for view rendering
        if(!$page.is("[no-ctl-cache]"))
            pageHandlers[pageName] = r;
        r.call(that, param); // call that rendering function
      }
    }
    if(currentPageName) { // "close" current page view
      $(document.body).removeClass(currentPageName); // remove old page class {
      if($currentPage) {
        $currentPage.trigger("page.hidden",currentPageName);
        if($currentPage.attr('src') && $currentPage.is("[no-ctl-cache]"))
            $currentPage.empty();
      }
    }
    $(document.body).addClass(currentPageName = pageName); // set new page class
    if($currentPage = $page)
      $currentPage.trigger("page.shown",currentPageName);
  }

  function app(pageName,param) {

    var $page = $(document.body).find("section#" + pageName);

    var src = $page.attr("src");
    if( src && $page.find(">:first-child").length == 0) { // it has src and is empty
      $page.trigger("page.loadStarted",src);
      $.get(src, "html")
          .done(function(html,textStatus,jqXHR){
            $page.html(html);
            $page.trigger("page.loadSucceeded",jqXHR);
            show(pageName,param);
          })
          .fail(function(jqXHR,textStatus,errorThrown){
            $page.trigger("page.loadFailed",jqXHR,textStatus,errorThrown);
          })
          .always(function(jqXHR,textStatus,errorThrown){
            $page.trigger("page.loadFinished",jqXHR,textStatus,errorThrown)
          });
    } else
      show(pageName,param);
  }

  app.page = function(pageName, handler) {
    pageHandlers[pageName] = handler;
  };

  function onhashchange()
  {
    var hash = location.hash || "#" + $("section[default]").attr('id');

    var re = /#([-0-9A-Za-z]+)(\:(.+))?/;
    var match = re.exec(hash);
    hash = match[1];
    var param = match[3];
    app(hash,param);
  }

  $(window).on("hashchange", onhashchange );

  window.app = app;

  $(onhashchange); // call it for the initialization

})(jQuery,this);
