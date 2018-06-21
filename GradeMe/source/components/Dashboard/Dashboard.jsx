import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Header, Menu, Container, Button, Card} from 'semantic-ui-react'
import {BrowserRouter as Router, Switch, Route, Link, Redirect, browserHistory} from 'react-router-dom'
import axios from 'axios'
import _ from 'lodash'

// import our own components
import * as _CONFIG from '../_config/Config.js'
import styles from './Dashboard.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'
import Grade from '../Grade/Grade.jsx'
import Origin from '../Origin/Origin.jsx'
import Course from '../Course/Course.jsx'
import GradeCenter from '../GradeCenter/GradeCenter.jsx'
import Setting from '../Setting/Setting.jsx'
import Assignment from "../Assignment/Assignment.jsx";


class Dashboard extends Component {

    constructor(props){
        super(props);
        this.state = {
            first_name: '',
            username: '',
            isInstructor: true,
            courses:[],
            redirect: false,
            assignmentSoon: [],
            color: ''
        };
        this.addCourse = this.addCourse.bind(this);
        this.createClass = this.createClass.bind(this);
        this.createCourse = this.createCourse.bind(this);
        this.setInitial = this.setInitial.bind(this);
    }

    componentDidMount(){
        this.setInitial();
    }

    setInitial(){
        // check if user is logged in
        let user_object = JSON.parse(localStorage.getItem('user'));
        if (user_object === null){
            this.setState({
                redirect: true
            });
        }
        let setFirstName = user_object["data"]["first_name"];
        let setColor = user_object["data"]["color"];
        this.setState({
            color: setColor,
            first_name: setFirstName,

        });

    }


    handleOpen = () => this.setState({ modalOpen: true });

    handleClose = () => this.setState({ modalOpen: false, create_class: false });

    addCourse(e){
        this.setState({
            add_class: e.target.value
        });
    }

    createClass(e){
        e.preventDefault();
        this.handleClose();
        let component = this;
        axios.post(_CONFIG.devURL + '/create-class', {
            course: this.state.create_class,
            user: this.state.user
          })
          .then(function (response) {
            component.setState({
              create_class_code: true
            });
            component.setState({
                user: response.data.user,
                classes : response.data.user.classes,
                classIds : response.data.user.course_ids
            })

          })
          .catch(function (error) {
              console.log('error');
          });
    }

    createCourse(e){
        this.setState({
            create_class: e.target.value
        });
    }

    logout(){
        localStorage.removeItem('user');
        localStorage.removeItem('decoded');
        localStorage.removeItem('course');
    }


    render() {
        this.state.isInstructor = true;
        let redirect = this.state.redirect;
        let color_pref = this.state.color;

        return(
            <div>
                <Menu fluid widths={3} vertical borderless stackable>
                        <Menu fluid widths={3} borderless stackable>
                        <Container>
                            <Menu.Item>
                                <Link
                                    to={{pathname:"/dashboard/origin", state: this.state}} className="left">
                                    <Header as='h3' className = "welcome_menu">Welcome, {this.state.first_name} </Header>
                                </Link>
                            </Menu.Item>
                            <Menu.Item>
                                <Link
                                    to={{pathname:"/dashboard/origin", state: this.state}}
                                >
                                <Header as='h1' color={color_pref} className = "origin_button">GradeMe </Header>

                                </Link>
                            </Menu.Item>
                            <Menu.Item>
                                <Link to="/login" className="right">
                                    <Button color={color_pref} className="logout_button" onClick={this.logout}>
                                        {
                                            redirect ?
                                                <Redirect to="/login"/>: 'Log Out'
                                        }
                                    </Button>
                                </Link>
                            </Menu.Item>
                        </Container>
                    </Menu>
                    <Menu fluid widths={3} borderless stackable>
                        <Container>
                            <Menu.Item>
                                <Link
                                    to={{pathname:"/dashboard/origin", state: this.state}}
                                    name="dashboard"
                                    className="left"
                                >
                                    <Header as='h3'>Home</Header>
                                </Link>
                            </Menu.Item>
                            <Menu.Item>
                                <Link
                                    to={{pathname:"/dashboard/gradecenter", state: this.state}}
                                    name="course"
                                    className="left"
                                >
                                    <Header as='h3'>Grades</Header>
                                </Link>
                            </Menu.Item>
                            <Menu.Item>
                                <Link
                                    to={{pathname:"/dashboard/setting", state: this.state}}
                                    name="setting"
                                    className="left"
                                >
                                    <Header as='h3'>Settings</Header>
                                </Link>
                            </Menu.Item>
                        </Container>
                    </Menu>
                </Menu>
                    <Switch>
                        <Route path= "/dashboard/origin" component={Origin}/>
                        <Route path= "/dashboard/course" component={Course}/>
                        <Route path= "/dashboard/setting" render={()=><Setting action={this.setInitial}/>}/>
                        <Route path= "/dashboard/gradecenter" component={GradeCenter}/>
                        <Route path= "/dashboard/assignment" component={Assignment}/>
                    </Switch>
            </div>
        )
    }
}

Dashboard.propTypes = {
    classes: PropTypes.array,
    isInstructor: PropTypes.bool,
}

export default Dashboard
