import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

import styles from './Home.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'

class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            redirect: false
        }
    }

    /*
        Load states and user information
     */
    componentDidMount(){
        let user_object = JSON.parse(localStorage.getItem('user'));
        if(user_object === null){
            console.log("no cookie found");
        }
        else {
            this.setState({
                redirect: true
            });
        }
    }

    render() {
        return(
            <div className="wrapper-home">
                <div className="ui container">
                  <div className="ui large inverted secondary network menu">
                    <Link to="/" className="item" id="logo">GradeMe</Link>
                  </div>
                </div>
                <div className="Home">
                  <div className="ui text container" id = "Home_content">
                    <h1 className="ui header" id="title-clearity">
                        GradeMe
                    </h1>
                    <Link to={{ pathname: '/login', state: { student: true} }} className="item">
                      <div className="ui huge primary button" id="button-blue" name="login" style={{width:130}}>
                          Login
                      </div>
                    </Link>
                    <Link to={{ pathname: '/register', state: { teacher: true} }} className="item">
                      <div className="ui huge primary button" id="button-blue" name="signu" style={{width:130}}>
                          Sign Up
                      </div>
                    </Link>
                  </div>
                </div>
                { this.state.redirect ? <Redirect to="/dashboard/origin"/>:
                    <div></div>
                }
            </div>
        )
    }
}

export default Home
