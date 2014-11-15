<% if ( props.projectType !== 'commonjsModule' ) { %>;(function ( <% if ( props.jquery ) { %>$, <% } %>window, document, undefined ) {

	// Project code <% if ( props.projectType === 'jquery' ) { %>
	<% if ( ns.obj ) { %>
	$<%= ns.obj %> = $<%= ns.obj %> || {};<% } %>
	$<%= ns.obj %>.<%= camelName %> = {};

	$.fn.<%= camelName %> = function () {};<% } else { %>
	<% if ( ns.obj ) { %>
	window<%= ns.obj %> = window<%= ns.obj %> || {};<% } %>
	window<%= ns.obj %>.<%= camelName %> = '';<% } %>

})( <% if ( props.jquery ) { %>jQuery, <% } %>window, document );<% } else { %>module.exports = function () {

};<% } %>
