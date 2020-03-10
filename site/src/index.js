import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './App';
import Stats from './Stats';
import Objects from './Objects';
import Advanced from './Advanced';

const routing = (
    <Router basename='/archive'>
      <div>
        <Route exact path="/">
          <App />
        </Route>
        <Route path="/stats">
          <Stats />
        </Route>
        <Route path="/objects">
          <Objects />
        </Route>
        <Route path="/advanced">
          <Advanced />
        </Route>
      </div>
    </Router>
  )
  ReactDOM.render(routing, document.getElementById('root'))