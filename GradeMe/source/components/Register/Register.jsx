import React, { Component } from 'react'
import { Input, Card, Dropdown, Label } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'
import styles from './Register.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first_name:'',
            last_name:'',
            email:'',
            schoolOptions: [],
            school: 0,
            color_pref:'',
            password:'',
            confirm_password: '',
            inputList: [],
            showStudent: false,
            showInstructor: false,
            message: '',
            colorOptions: [
                { key : 'Blue', text: 'Blue', value : 'blue'},
                { key : 'Red', text: 'Red', value : 'red'},
                { key : 'Yellow', text: 'Yellow', value : 'yellow'},
                { key : 'Green', text: 'Green', value : 'green'},
                { key : 'Black', text: 'Black', value : 'black'},
                { key : 'Orange', text: 'Orange', value : 'orange'},
                { key : 'Cyan', text: 'Cyan', value : 'cyan'},
                { key : 'Indigo', text: 'Indigo', value : 'indigo'},
                { key : 'Violet', text: 'Violet', value : 'violet'}
            ],
        };
    };

    onSubmit = event => {
        event.preventDefault();

        const user = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            email: this.state.email,
            password:this.state.password,
            color_pref: this.state.color_pref,
            school: 1,
        };
        if(this.state.confirm_password === this.state.password) {
            axios.post(_CONFIG.devURL + '/user/', user)
                .then((response) => {
                    this.setState({
                        message: "Account Created!"
                    })
                })
                .catch((error) => {
                    let message = null;
                    for (let k in error.response.data) {
                        message = k;
                        break;
                    }
                    this.setState({
                        message: message + ": " + error.response.data[message]
                    })
                })
        }
        else{
            this.setState({
                message: "Passwords do not match"
            })
        }
    };


    handleChange = (e) => {
        let change = {};
        change[e.target.name] = e.target.value;
        this.setState(change)
    };

    handleSchool = (e, data) =>{
        let change = {};
        change["school"] = data.value;
        this.setState(change);
    };
    handleColor = (e, data) =>{
        let change = {};
        change["color_pref"] = data.value;
        this.setState(change);
    };

    render() {
        return(
            <div className="wrapper-register">
                <div className="ui container">
                    <div className="ui large inverted secondary network menu">
                        <Link to="/" className="item" id="logo">GradeMe</Link>
                    </div>
                </div>
                <form className="Register" action="/" onSubmit={this.onSubmit}>
                    <Card className="Register__content" style={{width: 350}}>
                        <div>
                            <h1>Register</h1>
                            <br/>
                            <Input label="First Name" name="first_name" className = "pad" onChange={this.handleChange} />
                            <Input label="Last Name" name="last_name" className = "pad" onChange={this.handleChange} />
                            <Input label="Email" name="email" className = "pad" onChange={this.handleChange} />
                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                className = "pad"
                                onChange={this.handleChange}
                            />
                            <Input
                                type="password"
                                name="confirm_password"
                                label="Confirm Password"
                                className = "pad"
                                onChange={this.handleChange}
                            />
                            <div className="pad">
                                <Label className="dropdown__label">
                                    <Label.Detail className="dropdown__label__detail">
                                        Color Pref.
                                    </Label.Detail>
                                </Label>
                                <Dropdown
                                    className="dropdown__menu"
                                    name="color_pref" placeholder="Select Color"
                                    search selection options={this.state.colorOptions}
                                    value={this.state.color_pref}
                                    onChange={this.handleColor}
                                />
                            </div>
                            <p>{this.state.message}</p>
                            <Input type="submit" id="button-blue"/>
                            <h4>Already registered? Click <Link to="/login" name="login">here</Link> to Log-in!</h4>
                        </div>
                    </Card>
                </form>
            </div>
        )
    }
}
export default Register
