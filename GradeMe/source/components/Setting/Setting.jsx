import React, { Component } from 'react'
import { Button,  Tab,  Form, Card, Segment, Modal} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'

class Setting extends Component {
    constructor(props){
        super(props);
        this.state = {
            message: '',
            error_message: '',
            success_message: '',
            error: false,
            last_name: '',
            color_pref: '',
            first_name: '',
            email: '',
            school: '',
            password: '',
            new_password: '',
            confirm_password: '',
            isInstructor: true,
            id:'0',
            err_modal: false,
            success_modal: false,
            del: false,
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
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeColorPref = this.onChangeColorPref.bind(this);
        this.onPasswordSubmit = this.onPasswordSubmit.bind(this);
        this.onDeleteAccount = this.onDeleteAccount.bind(this);
        this.displayMessage = this.displayMessage.bind(this);
    }

    /*
        Load and update all states
     */
    componentDidMount(){
        let user_obj = JSON.parse(localStorage.getItem('user'));
        if (user_obj === null){
            this.setState({
                redirect: true
            });
        }
        else{
            let setFirstName = user_obj["data"]["first_name"];
            let setUserID = user_obj["data"]["id"];
            this.setState({
                first_name: setFirstName,
                id: setUserID,
            });
        }

        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.get(_CONFIG.devURL + "/user/" + token_res.data.id + "/")
                    .then(response => {
                        var user = response.data;
                        this.setState({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            color_pref: user.color_pref,
                            password: user.password_hash,
                            school: user.school,
                            email: user.email
                        })
                    });
            })
    };

    /*
        Handlers for states
     */
    handleErrorModalClose = () => this.setState({err_modal : false});

    handleSuccessModalClose = () => this.setState({success_modal : false, message : ''});

    handleChange = (e) => {
        let change = {};
        change[e.target.name] = e.target.value;
        this.setState(change)
    };


    onChangeColorPref(e, data) {
        this.setState({
            color_pref: data.value
        })
    }

    /*
        Send delete account request to backend.
        Display response message.
     */
    onDeleteAccount(e) {
        e.preventDefault();
        let component = this;
        let user_obj = JSON.parse(localStorage.getItem('user'));

        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.delete(_CONFIG.devURL + '/user/' + token_res.data.id + '/')
                    .then(function (response) {
                        localStorage.removeItem('user');
                        component.setState({
                            del: true,
                        });
                        window.alert('Deleted. Thank you for using GradeMe');
                    })
            })
    }

    /*
        Send modify user account request to backend.
        Display response message.
     */
    onSubmit(e) {
        e.preventDefault();
        let component = this;
        const first_name = encodeURIComponent(this.state.first_name);
        const last_name = encodeURIComponent(this.state.last_name);
        const email = encodeURIComponent(this.state.email);
        const color_pref = encodeURIComponent(this.state.color_pref);
        const school = encodeURIComponent(this.state.school);
        const password = encodeURIComponent(this.state.password);

        const user = `first_name=${first_name}&last_name=${last_name}&email=${email}&color_pref=${color_pref}&school=${school}&password_hash=${password}`;

        let user_obj = JSON.parse(localStorage.getItem('user'));
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.put(_CONFIG.devURL + '/user/' + token_res.data.id + "/", user)
                    .then(function (response) {
                        component.setState({
                            message: "change success!"
                        });
                        user_obj["data"]["color"] = component.state.color_pref;
                        user_obj["data"]["first_name"] = component.state.first_name;
                        localStorage.setItem('user', JSON.stringify(user_obj));
                        component.props.action();

                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            })
    }

    /*
        Checks if input values of new password and confirm password are same. If not same, display error message.
        Otherwise, send change password request to backend.
        Display response message.
     */
    onPasswordSubmit(e) {
        e.preventDefault();
        let component = this;
        const email = encodeURIComponent(this.state.email);
        const old_password = encodeURIComponent(this.state.password);
        const new_password = encodeURIComponent(this.state.new_password);
        const confirm = encodeURIComponent(this.state.confirm_password);
        if (new_password !== confirm) {
            component.setState({
                error : true,
                err_modal: true,
                error_message : 'New Password and Confirm Password do not match',
            })
        }
        else {
            const input = `email=${email}&new_password=${new_password}&old_password=${old_password}`;
            axios.put(_CONFIG.devURL + '/user/change_password/', input)
                .then(function (response) {
                    var message =response.data;
                    if (message['error_msg'] === 'Invalid password' || message['error_msg'] === 'No such user') {
                        component.setState({
                            err_modal: true,
                            error_message : message['error_msg'],
                        })
                    }
                    else {
                        component.setState({
                            success_modal: true,
                        })
                    }
                })
        }
    }

    panes = [
        { menuItem: 'General Information', render: () =>
                <form className="tab-content" action="/" onSubmit={this.onSubmit}>
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <Form onSubmit={this.onSubmit}>
                                <h1> Change your general information </h1>
                                <br/>
                                <Form.Field>
                                    <label>First Name</label>
                                    <input name="first_name" placeholder = {this.state.first_name} onChange={this.handleChange}/>
                                </Form.Field>
                                <Form.Field>
                                    <label>Last Name</label>
                                    <input name="last_name" placeholder = {this.state.last_name} onChange={this.handleChange}/>
                                </Form.Field>
                                <Form.Field>
                                    <Form.Select
                                        fluid label='Color Preference'
                                        options={this.state.colorOptions}
                                        placeholder={this.state.color_pref}
                                        value={this.state.color_pref}
                                        onChange={this.onChangeColorPref}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Email</label>
                                    <Segment size='mini' tertiary>
                                        {this.state.email}
                                    </Segment>
                                </Form.Field>
                                <p>{this.state.message}</p>

                                <Button type='submit'>Submit</Button>
                            </Form>
                        </div>
                    </Card>
                </form>
        },
        { menuItem: 'Change Password', render: () =>
                <form className="tab-content">
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <Form onSubmit={this.onPasswordSubmit}>
                                <h1> Change your password </h1>
                                <br/>
                                <Form.Field>
                                    <label>Old Password</label>
                                    <input name="password" type="password" onChange={this.handleChange} ref = {(el) => this.passwordInput = el}/>
                                </Form.Field>
                                <Form.Field>
                                    <label>New Password</label>
                                    <input error = {this.state.error}
                                           name="new_password"
                                           type="password"
                                           onChange={this.handleChange}
                                           ref = {(el) => this.newPasswordInput = el}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Confirm Password</label>
                                    <input error = {this.state.error}
                                           name="confirm_password"
                                           type="password"
                                           onChange={this.handleChange}
                                           ref = {(el) => this.confirmPasswordInput = el}
                                    />
                                </Form.Field>
                                <Button type='submit'>Submit</Button>
                            </Form>
                        </div>
                    </Card>
                </form>},
        { menuItem: 'Deactivate Account', render: () =>
                <form className="tab-content" action="/" onSubmit={this.onSubmit}>
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <Form onSubmit={this.onDeleteAccount}>
                                <h2>Do you really want to delete your account? If you delete account, you will lose all your data.</h2>
                                <Button type='submit'>Confirm</Button>
                            </Form>
                        </div>
                    </Card>
                </form>

        },
    ];

    /*
        Parameter:
            message: message to display
            type: if type is error, error message is displayed. Otherwise, success message is displayed.

        Return: Modal that shows input message.
     */
    displayMessage (message, type) {
        this.passwordInput.value = '';
        this.newPasswordInput.value = '';
        this.confirmPasswordInput.value = '';
        return (
            <Modal
                open={
                    type==='error' ? this.state.err_modal : this.state.success_modal
                }
                size='tiny'
                onClose={
                    type==='error' ? this.handleErrorModalClose: this.handleSuccessModalClose
                }
                header='Notification'
                content= {message}
                actions={[
                    'Close',
                ]}
            />)
    }
    render() {
        return(
            <div>
                <div>
                    <Tab menu={{ fluid: true, vertical: false, tabular: 'left' }} panes={this.panes} grid = {{paneWidth: 12, tabWidth: 2}}/>
                </div>
                {
                    this.state.success_modal ? this.displayMessage("Changing password was successful", "successful")
                        : (
                            this.state.err_modal ? this.displayMessage(this.state.error_message, "error") : null
                        )
                }
                {
                    this.state.del ? <Redirect to="/login"/> : null
                }
            </div>
        )
    }
}

export default Setting
