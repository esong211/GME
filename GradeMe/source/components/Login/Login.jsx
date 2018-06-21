import React, { Component } from 'react'
import { Button, Input, Card } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { Redirect} from 'react-router'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'

import styles from './Login.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'

class Login extends Component {

    constructor() {
        super();

        this.state = {
            user: {
                password: '',
                email: ''
            },
            redirect: false,
            message: ''
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
    }

    /*
        Load and update states
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


    /*
        Handler for states
     */
    onSubmit(e) {
        e.preventDefault();
        let component = this;
        const email = encodeURIComponent(this.state.user.email);
        const password = encodeURIComponent(this.state.user.password);
        const formData = `email=${email}&password=${password}`;
        axios.post(_CONFIG.devURL + '/user/authenticate/', formData)
          .then(function (response) {
              if("error_msg" in response.data){

                  console.log("error");
                  component.setState({
                      message: 'Incorrect name or password'
                  })
              }
              // successfully logged in
              else {
                  localStorage.setItem('user', JSON.stringify(response));
                  this.setState(
                      {redirect: true}
                  );
              }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
            component.setState({
                    message: 'Incorrect name or password'
                })
          });

    }

    onChangeEmail(e) {
        const user = this.state.user;
        user.email = e.target.value;
        this.setState({
            user
        })
    }

    onChangePassword(e) {
        const user = this.state.user;
        user.password = e.target.value;
        this.setState({
            user
        })
    }

    render() {
        return(
            <div className="wrapper-login">
                <div className="ui container">
                  <div className="ui large inverted secondary network menu">
                    <Link to="/" className="item" id="logo">GradeMe</Link>
                  </div>
                </div>
                <div className="Login" action="/">
                    <Card className="Login__content" style={{width : 310}}>
                        <div>
                            <h1>Login</h1>
                            <Input
                                className="labeled__input"
                                label="Email"
                                onChange={this.onChangeEmail}
                            />
                            <br/><br/>
                            <Input
                                className="labeled__input"
                                type="password"
                                label="Password"
                                onChange={this.onChangePassword}
                            />
                            <br/><br/>

                            <p>{this.state.message}</p>
                            <Button
                                name= "login"
                                id="button-blue"
                                onClick={this.onSubmit}
                            >
                                Login
                            </Button>
                            <h4>No account yet? <br/> Click <Link to="/register" name="signup">here</Link> to Register!</h4>
                            {this.state.redirect ?
                                <Redirect to="/dashboard/origin"/> :
                                <Button style={{visibility:"hidden"}}>Hello</Button>
                            }
                        </div>
                    </Card>
                </div>
            </div>
        )
    }
}

export default Login
