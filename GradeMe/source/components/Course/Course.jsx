import React, { Component } from 'react'
import { Button, Tab, Checkbox, Form, Card, Loader, Dimmer, Table, TextArea, Modal, Container} from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { Link, Redirect} from 'react-router-dom'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'
import 'react-datepicker/dist/react-datepicker.css';
import styles from './Course.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'

class Course extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: '',
            name: '',
            description: '',
            assignment_name: '',
            assignment_description: '',
            tas: '',
            students: '',
            id:'0',
            isTa: false,
            isStudent: false,
            isInstructor: false,
            course_id: '',
            classes:[],
            courses:[],
            username:'',
            start_date: moment(),
            end_date: moment(),
            attachment: null,
            graded: ["H", "h"],
            loading: true,
            delete_redirect: false,
            delete_err_message: "",
            assignment_list: [],
            assignment_id_list: [],
            instructor_list: [],
            student_list: [],
            ta_list: [],
            student_ac : '',
            ta_ac: '',
            manage_students: '',
            manage_tas: '',
            submitModal: false,
            regenerate_ac: false,
        };
        this.deleteClass = this.deleteClass.bind(this);
        this.setManageStudents = this.setManageStudents.bind(this);
        this.onManageSubmit = this.onManageSubmit.bind(this);
        this.setManageTAs = this.setManageTAs.bind(this);
        this.handleCloseSubmitModal = this.handleCloseSubmitModal.bind(this);
        this.setCourseName = this.setCourseName.bind(this);
        this.setCourseDescription = this.setCourseDescription.bind(this);
        this.setRegenerateAc = this.setRegenerateAc.bind(this);
        this.saveCourse = this.saveCourse.bind(this);
    }
    /*
        Loads and update states before loading the page.
     */
    componentDidMount(){
        let location = window.location.href;
        let courseToParse = location.split("/", 7);
        let courseIdParam = courseToParse[6];
        let user_obj = JSON.parse(localStorage.getItem('user'));
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.get(_CONFIG.devURL+ '/course/' + courseIdParam + '/')
                    .then(response => {
                        let user = parseInt(token_res.data.id);
                        let course = response.data;
                        let isTa = false;
                        let isStudent = false;
                        let isInstructor = false;
                        // checks the permission of the user
                        if(course.students.includes(user)) {
                            isStudent = true;
                        }
                        else if(course.tas.includes(user)){
                            isTa = true;
                        }
                        else if(course.instructors.includes(user)){
                            isInstructor = true;
                        }

                        this.setState({
                            course_id: courseIdParam,
                            name: course.name,
                            description: course.description,
                            isTa: isTa,
                            isStudent: isStudent,
                            isInstructor: isInstructor,
                            loading: false,
                            student_ac: course.student_ac,
                            ta_ac :course.ta_ac,
                        });
                        localStorage.setItem('course', JSON.stringify(this.state));
                    });
                // Get Request for Grabbing the Assignments
                axios.get(_CONFIG.devURL+ '/course/' + courseIdParam + '/get_assignments/')
                    .then(response => {
                        let assignment_list = response.data['assignments'];

                        this.setState({
                            assignment_list: assignment_list
                        });
                    });
                // Get request for grabbing the user information
                axios.get(_CONFIG.devURL+ '/course/' + courseIdParam + '/get_users/')
                    .then(response => {
                        let tas_list = response.data['tas'];
                        let instructor_list = response.data['instructors'];
                        let student_list = response.data['students'];
                        this.setState({
                            instructor_list: instructor_list,
                            ta_list: tas_list,
                            student_list: student_list,
                        });
                        this.setState({
                            manage_students: this.getStudentsEmails(),
                            manage_tas: this.getTaEmails(),
                        })
                    });
            })
            .catch(function (error) {
                console.log("failed to decode")
            });
    }


    /*
        Handlers for states
     */
    setRegenerateAc (e) {
        let regen = !this.state.regenerate_ac;
        this.setState({
            regenerate_ac : regen,
        })
    }

    setCourseDescription (e) {
        this.setState({
            description : e.target.value,
        })
    }
    setCourseName (e) {
        this.setState({
            name : e.target.value,
        })
    }
    handleCloseSubmitModal(e) {
        this.setState({
            submitModal : false,
        })
    }

    setManageStudents (e) {
        this.setState({
            manage_students : e.target.value,
        })
    }

    setManageTAs (e) {
        this.setState({
            manage_tas : e.target.value,
        })
    }

    handleChange = (e) => {
        let change = {};
        change[e.target.name] = e.target.value;
        this.setState(change)
    };

    handleAssignmentStartDate = date =>{
        this.setState({ start_date: date });

    };

    handleAssignmentEndDate = date =>{
        this.setState({ end_date: date });

    };

    /*
        Send save course request to backend.
        Display response message.
     */
    saveCourse (e) {
        e.preventDefault();
        let course_id = this.state.course_id;
        let regenerate = false;
        if (this.state.regenerate_ac) {
            regenerate = "True";
        }
        const course = {
            'course_name' : this.state.name,
            'course_description' : this.state.description,
            'regenerate_access' : regenerate,
        };
        axios.post(_CONFIG.devURL + '/course/' + course_id + '/save_course/', course)
            .then (response => {
                window.alert(response.data);
            })
    }

    /*
        Send manage request to backend.
        Display modal to show message.
     */
    onManageSubmit (e) {
        e.preventDefault();
        let course_id = this.state.course_id;
        const course = {
            course_name: this.state.name,
            course_description: this.state.description,
            students: this.state.manage_students,
            tas: this.state.manage_tas,
            regenerate_access: false,
        };
        axios.post(_CONFIG.devURL +'/course/' + course_id + '/save_course/', course)
            .then((response) => {
                this.setState({
                    message: response.data,
                    submitModal: true,
                })
            })
            .catch((error) => {
                this.setState({
                    message: error
                })
            });
    }

    /*
        Send delete course request to backend
     */
    deleteClass(e){
        e.preventDefault();
        if(!this.state.isInstructor) {
            this.setState({
                delete_err_message: "Only instructor can delete a course",
                delete_redirect: false,
            })
        }
        else {
            let id = this.state.course_id;
            localStorage.removeItem("decoded");
            axios.delete(_CONFIG.devURL + '/course/' + id + "/")
                .then( (response) => {
                    this.setState({
                        delete_redirect: true,
                    })
                });
        }

    }

    /*
        Create assignment json object and send creating assignment request to backend.
     */
    onCreateAssignment = (e) => {
        e.preventDefault();

        // FormData used to submit files
        let user = new FormData();
        if(this.state.assignment_name !== '') {
            user.append('name', this.state.assignment_name);
        }
        if(this.state.assignment_description !== '') {
            user.append('description', this.state.assignment_description);
        }
        user.append('course', this.state.course_id);
        user.append('start_date', this.state.start_date.toDate().toISOString());
        user.append('end_date', this.state.end_date.toDate().toISOString());
        if(this.state.attachment !== null) {
            user.append('attachment', document.getElementById('file').files[0]);
        }
        // At request level

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };
        axios.post(_CONFIG.devURL +'/assignment/', user, config)
            .then((response) => {
                let created_assignment = response.data;
                let assignment_list = this.state.assignment_list;
                assignment_list.push(created_assignment);
                let message = "";
                if(response.status === 400){
                    message = "Incorrect Format";
                }
                else{
                    message = "Assignment Created";
                }
                this.setState({
                    message: message,
                    userDetails: response.data,
                    assignment_list: assignment_list
                })
            })
            .catch((error) => {
                this.setState({
                    message: 'Incorrect Format'
                })
            });


    };

    /*
        Change date format to yyyy-mm-dd
     */
    changeDateFormat(str) {
        return str.substr(str, 10);
    }

    /*
        Generate and return assignment tables
     */
    generateTables(assignments) {
        let generateAssignmentList = ({name, description, start_date, end_date, id}, index) => {
            return (

                <Table.Row>
                    <Table.Cell>
                        <Link to={{pathname: "/dashboard/assignment/" + id, query: {origin: this.state.name} }}>
                            {name}
                        </Link>
                    </Table.Cell>

                    <Table.Cell>
                        {description}
                    </Table.Cell>

                    <Table.Cell>
                        {this.changeDateFormat(start_date)}
                    </Table.Cell>

                    <Table.Cell>
                        {this.changeDateFormat(end_date)}
                    </Table.Cell>
                </Table.Row>
            )
        };
        return (
            <Table celled striped className="table_content">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell singleLine>Name</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Start Date</Table.HeaderCell>
                        <Table.HeaderCell>End Date</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {assignments.map(generateAssignmentList)}
                </Table.Body>
            </Table>
        )
    }

    /*
        Generate list of users to display it in course information page
     */
    generateUserList(user_list, user_type) {
        let generateList = ({account_created, color_pref, email, first_name, id, last_name, password_hash, school}) => {
            let user_info = first_name + ' ' + last_name + ' (' + email + ')';
            return (
                <div>
                    {user_info}
                    <br/>
                </div>
            )
        };
        return (
            <Form.Field>
                <label> {user_type} </label>
                {
                    user_list.length === 0 ? 'None' : user_list.map(generateList)
                }
            </Form.Field>
        )
    }

    /*
        Parameter:
            message: message to display
            type: if type is error, error message is displayed. Otherwise, success message is displayed.

        Return: Modal that shows input message.
    */
    displayMessage (message) {
        return (
            <Modal
                open={this.state.submitModal}
                size='tiny'
                onClose={this.handleCloseSubmitModal}
                header='Notification'
                content= {message}
                actions={[
                    'Close',
                ]}
            />)
    }

    getStudentsEmails () {
        if (this.state.student_list.length === 0) {
            return ''
        }

        let student_emails = '';
        for (let i = 0; i < this.state.student_list.length - 1; i++) {
            student_emails += this.state.student_list[i].email + ', ';
        }
        student_emails += this.state.student_list[this.state.student_list.length -1].email;

        return student_emails
    }

    getTaEmails () {
        if (this.state.ta_list.length === 0) {
            return ''
        }

        let ta_emails = '';
        for (let i = 0; i < this.state.ta_list.length - 1; i++) {
            ta_emails += this.state.ta_list[i].email + ', ';
        }
        ta_emails += this.state.ta_list[this.state.ta_list.length -1].email;

        return ta_emails
    }

    render() {
        if (this.state.delete_redirect) {
            return <Redirect to="/dashboard/origin"/>
        }
        let panes = [
            { menuItem: 'General Information', render: () =>
                    <form className="tab-content" action="/">
                        <Card className="Register__content" style={{width: 650}}>
                            <div>
                                <Form>
                                    <h1>Course Information</h1>
                                    <br/>
                                    <Form.Field>
                                        <label>Course Name</label>
                                        {this.state.name}
                                    </Form.Field>
                                    <br/>
                                    <Form.Field>
                                        <label>Course Description</label>
                                        {this.state.description}
                                    </Form.Field>
                                    <br/>
                                    {
                                        this.state.isInstructor || this.state.isTa ?
                                            (
                                                <Form.Field>
                                                    <label>Student Access Code</label>
                                                    {this.state.student_ac}
                                                    <br/>
                                                    <br/>
                                                    <label>TA Access Code</label>
                                                    {this.state.ta_ac}
                                                </Form.Field>
                                            ) :
                                            null
                                    }
                                    <br/>
                                    {this.generateUserList(this.state.instructor_list, 'Instructors')}
                                    <br/>
                                    {this.generateUserList(this.state.ta_list, 'TA')}
                                    <br/>
                                    {
                                        this.state.isInstructor || this.state.isTa ?
                                            this.generateUserList(this.state.student_list, 'Students') :
                                            null
                                    }

                                </Form>
                            </div>
                        </Card>
                    </form>
            },
            this.state.isInstructor ? { menuItem: 'Manage Users', render: () =>
                <form className="tab-content"
                      action="/"
                      style={{margin: 10}}
                >
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <h1>Manage Users</h1>
                            <br/>
                            <Form>
                                <label style={{fontSize : 18}}> Students' email </label>
                                <br/>
                                <p style={{float: 'left', fontSize : 11}}> * Seperate emails with commas </p>
                                <TextArea
                                    name = 'manage_students'
                                    autoHeight
                                    style={{ minHeight: 100 }}
                                    onChange={this.handleChange}
                                    value = {this.state.manage_students}
                                />
                                <br/>
                                <br/>
                                <br/>
                                <label style={{fontSize : 18}}> TAs' email </label>
                                <br/>
                                <p style={{float: 'left', fontSize : 11}}> * Seperate emails with commas </p>
                                <TextArea
                                    name = 'manage_tas'
                                    autoHeight
                                    style={{ minHeight: 100 }}
                                    onChange={this.handleChange}
                                    value = {this.state.manage_tas}
                                />

                                <br/>
                                <br/>
                                <Button style = {{float : 'right'}} onClick={this.onManageSubmit}>
                                    Submit
                                </Button>

                                {this.displayMessage(this.state.message)}

                            </Form>
                        </div>
                    </Card>
                </form>
            } : null,

            this.state.isStudent ? null : { menuItem: 'Create Assignments', render: () =>
                    <form className="tab-content"
                          action="/"
                          onSubmit={this.onSubmit}
                          style={{margin: 10}}>
                        <Card className="Register__content" style={{width: 650}}>
                            <div>
                                <Form>
                                    <h1>Create Assignment</h1>
                                    <br/>
                                    <Form.Field>
                                        <label>Assignment Name</label>
                                        <input
                                            type="text"
                                            name="assignment_name"
                                            onChange={this.handleChange}
                                            value={this.state.assignment_name}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Description</label>
                                        <input
                                            type="text"
                                            name="assignment_description"
                                            onChange={this.handleChange}
                                            value={this.state.assignment_description}
                                        />
                                    </Form.Field>
                                    <label>Start Date</label>
                                    <DatePicker
                                        name="start_date"
                                        selected={this.state.start_date}
                                        onChange={this.handleAssignmentStartDate}
                                        showTimeSelect
                                        timeFormat="hh:mm"
                                        timeIntervals={15}
                                        dateFormat="LLL"
                                        timeCaption="time"
                                    />
                                    <label>End Date</label>
                                    <DatePicker
                                        name="end_date"
                                        selected={this.state.end_date}
                                        onChange={this.handleAssignmentEndDate}
                                        showTimeSelect
                                        timeFormat="hh:mm"
                                        timeIntervals={15}
                                        dateFormat="LLL"
                                        timeCaption="time"
                                    />
                                    <Form.Field>
                                        <label>Attachment</label>
                                        <input type="file" name="attachment" id="file" style={{width: 220}} onChange={this.handleChange}/>
                                    </Form.Field>
                                    <p>{this.state.message}</p>

                                    <Button type="submit" onClick={this.onCreateAssignment}>Create Assignment</Button>
                                </Form>
                            </div>
                        </Card>
                    </form>
            },

            { menuItem: 'View All Assignments', render: () =>
                <form className="tab-content" action="/">
                    {this.generateTables(this.state.assignment_list)}
                </form>},

            this.state.isInstructor ?
                { menuItem: 'Change Course Information', render: () =>
                        <form className="tab-content" action="/">
                            <Card className="Register__content" style={{width: 650}}>
                                <div>
                                    <Form onSubmit = {this.saveCourse}>
                                        <h1>Change Course Information</h1>
                                        <br/>
                                        <Form.Field>
                                            <label>Course Name</label>
                                            <input placeholder={this.state.name} onChange={this.setCourseName}/>
                                            <br/>
                                            <br/>
                                            <label>Course Description</label>
                                            <input placeholder={this.state.description} onChange={this.setCourseDescription}/>
                                            <br/>
                                            <br/>
                                            <Checkbox label={<label>Regenerate Access Code</label>} onChange={this.setRegenerateAc}/>
                                            <br/>
                                            <br/>
                                            <Button style={{float: 'right'}} type='submit'> Submit </Button>
                                        </Form.Field>
                                    </Form>
                                </div>
                            </Card>
                        </form>
                } : null,

            this.state.isInstructor ? { menuItem: 'Delete a course', render: () =>
                <form className="tab-content" action="/" onSubmit={this.deleteClass}>
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <h2>Do you really want to delete the course? If you delete account, you will lose all your data.</h2>
                            <Button type='submit'>Confirm</Button>
                        </div>
                        <br/>
                        <p style={{color:'red'}}> {this.state.delete_err_message} </p>
                    </Card>
                </form>
            } : null,


        ];

        return(
            <div>
                <div>
                    <Loader active={this.state.loading}/>
                    <Dimmer active={this.state.loading}/>
                    <Container>
                        <Button>
                        <Link className="breadcrumb" to="/dashboard/origin"> {'<'} back to Home </Link>
                        </Button>
                    </Container>
                    <Tab menu={{ fluid: true, vertical: false, tabular: 'center' }}
                         panes={panes}
                         grid = {{paneWidth: 12, tabWidth:2}}
                    />
                </div>
            </div>
        )
    }
}

export default Course
