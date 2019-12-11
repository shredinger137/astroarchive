import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './App';
import Stats from './Stats';

const routing = (
    <Router basename='/archive'>
      <div>
        <Route exact path="/">
          <App />
        </Route>
        <Route path="/stats">
          <Stats />
        </Route>
      </div>
    </Router>
  )
  ReactDOM.render(routing, document.getElementById('root'))