;(function ( <% if ( props.jquery ) { %>$, <% } %>window, document, undefined ) {

	// Here goes the project <% if ( props.projectType === 'jquery' ) { %>

	$.<%= props.ns %> = $.<%= props.ns %> || {};
	$.<%= props.ns %>.<%= camelName %> = {};

	$.fn.<%= camelName %> = function () {};<% } else { %>

	window.<%= props.ns %> = window.<%= props.ns %> || {};
	window.<%= props.ns %>.<%= camelName %> = '';<% } %>

})( <% if ( props.jquery ) { %>jQuery, <% } %>window, document );
