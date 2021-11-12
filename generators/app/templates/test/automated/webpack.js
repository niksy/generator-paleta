<% if ( transpile ) { %>const<% } else { %>var<% } %> testsContext = require.context('.', true, /^((?!(\.webpack<% if ( usesHtmlFixtures ) { %>|fixtures\/<% } %>)).)*\.<%= extension || 'js' %>$/);
testsContext.keys().forEach(testsContext);
