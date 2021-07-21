<% if ( transpile ) { %>const<% } else { %>var<% } %> testsContext = require.context('.', true, /^((?!(\.webpack|fixtures\/)).)*\.<%= extension || 'js' %>$/);
testsContext.keys().forEach(testsContext);
