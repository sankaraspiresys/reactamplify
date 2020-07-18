import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import User from './components/User';
import Home from './components/Home';

import App from './App';

import Amplify from 'aws-amplify'
import config from './aws-exports'
import '@aws-amplify/ui/dist/style.css';
Amplify.configure(config)


/* const SampleApp = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route exact path="/users" component={User} />
    </div>
  </Router>
); */

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
/* ReactDOM.render(<SampleApp />, document.getElementById('root')); */

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
