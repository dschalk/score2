var React = require('react');
module.exports = React.createClass({
  render: function () {
    return (
      <h1>Hello world!</h1>
    );
  }
});

var React = require('react');
var AppComponent = require('./AppComponent.js');
React.render(<AppComponent/>, document.body);