import React from 'react';
import {render} from 'react-dom';
//import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom'
import {HashRouter as Router, Switch, Route, Link} from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css';

// Include your new Components here
import Home from './components/Home/Home.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Course from './components/Course/Course.jsx';

// Include any new stylesheets here
// Note that components' stylesheets should NOT be included here.
// They should be 'require'd in their component class file.
require('./styles/main.scss');

render(
    <Router>
        <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/login" component={Login}/>
            <Route path="/register" component={Register}/>
            <Route path="/dashboard" component={Dashboard}/>
            <Route path="/course" component={Course}/>

        </Switch>
    </Router>,
    document.getElementById('app')
);
