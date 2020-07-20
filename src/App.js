// src/App.js
import React, { Fragment } from 'react';
import './App.css';
import { Route, Switch, withRouter } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { BrowserRouter as Router, Redirect } from 'react-router-dom';

import { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react'

import User from './components/User';
import Home from './components/Home';
/* import Album from './components/Album'; */


const ProtectedRoute = ({ component: Component, ...rest }) => {
 
  return (
    <Route {...rest} render={(props) => (
      ( localStorage.getItem("userGroup").includes('admin') == true) ? <Component {...props} />
        : <Redirect to={{
          pathname:"/"
        }} />
    )} />
  )
}

class App extends React.Component {
  
  state = {
    userGroup: []
  }


  async componentDidMount() {
    const user = await Auth.currentAuthenticatedUser();
    const userPayload = user.signInUserSession.accessToken.payload;

    localStorage.setItem("userGroup", userPayload["cognito:groups"]);
  }

 

  render() {
    return (
      <Suspense fallback={<div className="custom-container">Loading...</div>}>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <ProtectedRoute exact path="/users" component={User} />
           {/*  <Route exact path="/albums" component={Album} /> */}
           <Route  path="/" component={Home} />
          </Switch>
        </Router>
      </Suspense>
    )
  }
}

export default withAuthenticator(App, { includeGreetings: false })