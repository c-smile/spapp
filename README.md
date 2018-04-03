SPApp
==========

Single Page Application Micro Framework

Supports views, controllers and routing in 60 lines of code!

# Introduction

If you heard anything about MVC in web applications, in particular words like "views", "controllers", "routing" and don't feel that you need more than jQuery in your project then this small library is for you.

# Structure of your SPApp 

Let's consider structure of simple "contact list" web application:

```html
<script type="text/javascript" src="spapp.js"></script>
<body>

  <nav>
    <a href="#contact-list">Contacts</a>
    <a href="#about">About</a>
  </nav>
  
  <section id="contact-list" src="pages/contact-list.htm" default></section>
  <section id="contact-details" src="pages/contact-details.htm"></section>
  <section id="about" src="pages/about.htm" default></section>

</body>
```
We have `<nav>`igation section here and collection of `<section>`s - views that need to be presented when user clicks
on one of hyperlinks in the nav bar (or anywhere else). 

## Routing 
  
By defining `<section id="some id">` element in your markup you actually define a route. When browser is navigated to
`{url of your app}#id-of-section` the SPApp module catches this event and shows `<section>` with that ID. 

No special mechanism for declaring routes is required - simply declare `<section>`s with proper IDs.

If you want to load some section by default, simply add the `default` attribute to it.

## Views and Controllers

Notice that each `<section>` above has `src={url}` attribute declared. That URL points to partial HTML fragment 
that defines content of the view and its controller function. 

Typical structure of a view looks like this:

```html
  <h2>Contact Details</h2>

  <label>First name</label> <input name="firstName">
  <label>Last name</label> <input name="lastName">
  
  <button class="save">Save</button> 
  ... 

<script>
//|
//| view controller
//|
//| Note the name below shall match id of the section
//|
  window.app.page("contact-details", function() // registering the controller
  {
    // initialize view variables in localscope
    // this is "page ready" code - happens once per app life time.
    
    var $firstName = $(this).find('[name="firstName"]');
    var $lastName = $(this).find('[name="lastName"]');
    
    var contactId; // current id of presented contact 
    
    $(this).on("click","button.save", function(
      // save contact (contactId) using current $firstName $lastName values
    ));
    
    ...
    
    // presenter of the view - load data and show: 
    // this function is "page activated" code - it gets called each time the page gets presented 
    return function(params) {
      contactId = params; // setting current contactId 
      var contact = contacts[contactId];
      // show values 
      $firstName.val(contact.firstName);
      $lastName.val(contact.lastName);
      ...
      
    }
  }); 
</script>
```

As you see markup above contains two sections: 

 1. html markup of the view per se and
 2. script block with `app.page("{name}",scopeInitializerAndController )` function.

The _scopeInitializerAndController_ function above serves two tasks: 

 1. initilizes the view and its scope variables and 
 2. returns function (a.k.a. "controller"). That function will be called each time the view needs to be presented/rendered.

 
## Switching views and passing parameters

The application can be switched to show different views in one of these ways:  

 1. By user navigating browser to `{your app url}#name-of-the-view:optional-parameter`;
 2. By user clicking on `<a href="#name-of-the-view:optional-parameter">` hyperlinks on app page;
 3. By code, calling `window.app("name-of-the-view", parameters)` function.

In all cases the SPApp framework will call controller registered for the view passing given parameter to it.

## View events

While switching the view the SPAapp will trigger two events:

 1. "page.hidden" with `event.target` set on `<section>` to be "closed" and
 2. "page.shown" with `event.target` set on `<section>` to be "shown".
  
 So by subscribing on these events any code inside or outside controllers can receive notification about application state change.

## Styling application and view states.

When the application navigates to particular view defined in `<section id="view-a">` it is said that it is in "view-a" state. SPApp marks this state by assigning "view-a" *class* to the `<body>` element in your document. Having this you can define view visibility rules in your CSS:

```css
/* all sections are off by default */
body > section { display:none; }
/* app state -> view visibility rules: */
body.view-a > section#view-a,
body.view-b > section#view-b,
body.view-c > section#view-c  { display:block; }
```
Note that switching the view into different states may require not only to hide/show some sections but also 
to style some other indicators like nav-bar items highlighting:

```css
/* nav highlightion rules */
body.view-a > nav > a[href="#view-a"],
body.view-b > nav > a[href="#view-b"],
body.view-c > nav > a[href="#view-c"] { background:white; color:black; }
```

## app.get - the page getter function

When SPAapp needs to download page's html it calls `app.get(url, $page, pageName)` function. Default implementation of the `app.get` is as follows:

```javascript
app.get = function(src,$page,pageName) { 
  // src - string, url of the page to load
  // $page - jq wrapper, page element
  // pageName - string, name of the page to load
  return $.get(src, "html"); 
};
```
so it just delegates page downloading to jQuery and returns promise obtained from `$.get()`.  

In your application you can override that default loader to have something like this:

```javascript
app.get = function(src,$page,pageName) { 
  var rq = $.get(src, "html"); 
      // generate load events 
      rq.done( function(html,textStatus,jqXHR) { $page.trigger("page.loadsuccess",jqXHR); } ) 
        .fail( function(jqXHR,textStatus,errorThrown) { $page.trigger("page.loadfailure",jqXHR,textStatus,errorThrown); } );
  // NOTE: your custom page downloader shall return jq promise
  return rq;
};
```

# Wrapping up

It is not strictly required for controller's code to be placed inside the view markup, you can put them in separate script files and include as any other scripts:
```html
<script type="text/javascript" src="controller-a.js"></script>
<script type="text/javascript" src="controller-b.js"></script>
...
```
The only thing that required is that _scopeInitializerAndControoler_ function must be registered by calling
```javascript
window.app.page("view-a", function() // registering the controller
  {
    ... initialization ...
    return function(params) {
      ... presentation ...
    }
  });
```

In the same way markup for views can be provided inline without use of external files:
```html
  <section id="view-a" >
    ... markup of view-a ...
  </section>
  <section id="view-b" >
    ... markup of view-b ...
  </section>
```

# Live Demo

 Check this [SPApp in action demo](https://rawgit.com/c-smile/spapp/master/demo/index.htm). I've created it in explicitly simple and minimalistic fashion in order to highlight just SPAapp. I have projects where it works in Twitter Bootstrap environment for example.

And check [Team ToolBox](https://lduboeuf.github.io/team-tool-box) application where SpApp is used.
