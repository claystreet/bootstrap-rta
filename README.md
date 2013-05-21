#Bootstrap Rich TextArea (RTA)

**Provided by [Clay Street Online](http://www.claystreet.com) under an MIT-License**

Visit the [live demo site](http://www.claystreet.com/sites/claystreet/dev/bootstrap/rta/demo.html) for an interactive demo.

### Purpose

Provides a rich text edit capability using Bootstrap styling and markup.

### How?

Chosen `<textarea>` fields are replaced with `<div contenteditable="true"></div>` fields.  A configurable set of edit
buttons provides an interface to the JavaScript `document.execCommand()` function to provide the rich text editing
capabilities.

**Note:** Because the code relies on the browser's built-in `contenteditable` functionality, the level of feature
support and the type of markup generated varies from browser to browser.  *However*, most browsers are pretty good
at supporting the basic functionality such as bold and italic text and ordered and unordered lists.  Most functionality
even works in IE7 albeit a little awkwardly sometimes.

### What's needed?

Obviously this code depends on the main Bootstrap CSS file.  The Bootstrap Responsive CSS file is optional.

The RTA code also depends on JQuery.  Testing was performed with JQuery 1.9.1.

In addition to the dependencies, three RTA specific files are required:

1. css/bootstrap-rta.css - Provides the contenteditable and button styling
2. js/bootstrap-rta.js - Provides the supporting JavaScript code
3. img/rta-icons.png - Provides a set of 15x15 images for the edit buttons

### Getting Started

1. Include the css/bootstrap-rta.css file *after* the standard bootstrap css files.
2. Include the js/bootstrap-rta.js file *after* JQuery.
3. Add a `class="rta"` to any `<textarea>' fields you want converted to RTA
4. Initialize the chosen `<textarea>` fields in the JQuery `$(document).ready()` handler.

