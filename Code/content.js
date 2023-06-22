// Create a new div element
var div = document.createElement('div');

// Set some attributes for the div
div.id = 'my-extension-div';
div.innerHTML = 'This is a div added by my extension.';

var body = document.body;

// Append the div to the body of the page
body.insertBefore(div, body.firstChild);
