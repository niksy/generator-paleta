<% if ( transpile ) { %>const<% } else { %>var<% } %> testsContext = require.context('.', true, /^((?!(\.webpack|fixtures\/)).)*\.js$/);
testsContext.keys().forEach(testsContext);
