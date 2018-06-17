<% if ( transpile ) { %>const<% } else { %>var<% } %> testsContext = require.context('.', true, /^((?!(\.webpack)).)*\.js$/);
testsContext.keys().forEach(testsContext);
