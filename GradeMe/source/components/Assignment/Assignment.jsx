import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Button, Card, Modal, Loader, Map, Tab, Table, Form, Dimmer, Container} from 'semantic-ui-react'
import axios from 'axios'
import { Link} from 'react-router-dom'
import * as _CONFIG from '../_config/Config.js'
import styles from './Assignment.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'

class Assignment extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: '',
            classes:[],
            assignments: [],
            submissions: [],
            id:'',
            username:'',
            assignmentDescription:'',
            start_date: Date(),
            end_date: Date(),
            assignmentName:'',
            attachment: null,
            attachment_exist: false,
            assignment_attachment: null,
            assignment:'',
            graded: ["H", "h"],
            course: null,
            redirect: false,
            loading: true,
            submission_list: [],
            isTa: false,
            isStudent: false,
            isInstructor: false,
            course_name: '',
            course_student:[],
            course_instructor:[],
            course_tas:[],
            submitted: false,
            assignment_id: null
        };
        this.handleCloseSubmitModal = this.handleCloseSubmitModal.bind(this);
    }

    /*
        Handlers for states
     */

    handleSubmissionScore = event =>{
        this.setState({ score: event.target.value });
    };

    handleCloseSubmitModal(e) {
        this.setState({
            submitted: false,
        })
    }

     handleChange = (e) => {
        let change = {};
        change[e.target.name] = e.target.value;
        this.setState(change)
    };


    /*
        Creates submission object and send request to endpoint.
     */
     onCreateSubmission = (e) => {
        e.preventDefault();

        // FormData used to submit files
        let user = new FormData();
        if(this.state.assignment_id !== null) {
            user.append('assignment', this.state.assignment_id);
        }
        if(this.state.id !== '') {
            user.append('submitter', this.state.id);
        }
        if(this.state.attachment !== null) {
            user.append('attachment', document.getElementById('file').files[0]);
        }
         let today = new Date();
         today = today.toISOString();
         user.append('submission_date', today);
         user.append('text', 'Submission');
        // At request level

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };
        axios.post(_CONFIG.devURL +'/submission/', user, config)
            .then((response) => {
                let created_submission = response.data;
                let submission_list = this.state.submission_list;
                submission_list.push(created_submission);
                let message = "";
                if(response.status === 400){
                    message = "Incorrect Format";
                }
                else{
                    message = "Assignment Submitted";
                }
                this.setState({
                    message: message,
                    userDetails: response.data,
                    submission_list: submission_list
                })
            })
            .catch((error) => {
                console.log(error);
                this.setState({
                    message: 'Incorrect Format'
                })
            });


    };


     /*
        Updates required states before loading the page.
      */
    componentDidMount(){
        let location = window.location.href;
        let assignmentToParse = location.split("/", 7);
        let assignmentIdParam = assignmentToParse[6];
        let user_obj = JSON.parse(localStorage.getItem('user'));

        //De-tokenize access code to get user information
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.get(_CONFIG.devURL+ '/assignment/' + assignmentIdParam + '/')
                    .then(response => {
                        axios.get(_CONFIG.devURL+ '/course/' + response.data.course + '/')
                            .then(response_two => {
                                let user = parseInt(token_res.data.id);
                                let course = response_two.data;
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
                                else{
                                    console.log("none of the above")
                                }

                                this.setState({
                                    course_name: course.name,
                                    isTa: isTa,
                                    isStudent: isStudent,
                                    isInstructor: isInstructor,
                                    loading: false,
                                });
                            });
                        let assignment = response.data;
                        this.setState({
                            id: token_res.data.id,
                            assignment_id: assignmentIdParam,
                            name: assignment.name,
                            description: assignment.description,
                            assignment_attachment: assignment.attachment,
                            loading: false,
                        });
                    });
            })
            .catch(function (error) {
                console.log("failed to decode")
            });

        const submission = {
            assignmentid : assignmentIdParam,
        };
        axios.post(_CONFIG.devURL+ '/submission/get_submissions/', submission)
            .then(response => {
                let submission = response.data['submissions'];
                this.setState({
                    submission_list: submission
                });
            });
    }


    /*
        Parameter: List of submissions
        Return: Table of submission
        Description: Generates table
     */
    generateTables(submissions) {
        let generateAssignmentList = ({id, graded_date, text, assignment, course_name, score, submission_date, first_name, last_name, submitter_id, attachment}, index) => {
            let fullName = first_name + ' ' +last_name;
            let message = '';
            let joinButton =
                    <Button name={id} style={{height: 35, marginLeft: 10 }} onClick={(e) => this.handleSubmit(e, id, graded_date, text, course_name, score, submission_date, submitter_id)} content='Submit'/>
            let attach_div = null;
            if (attachment === '' || attachment === null){
                attach_div = "No Files"
            }
            else{
                attach_div = (<a download href={attachment}>
                    View File</a>)
            }
            let score_id = 'update_score' + id;
            let grade_date_id = 'grade_date' + id;
            return (
                <Table.Row>
                    <Table.Cell>
                        {fullName}
                    </Table.Cell>
                    <Table.Cell>
                        {attach_div}
                    </Table.Cell>
                    <Table.Cell>
                        {this.changeDateFormat(submission_date)}
                    </Table.Cell>
                    <Table.Cell id = {grade_date_id}>
                        {
                            graded_date === null ? null : this.changeDateFormat(graded_date)
                        }
                    </Table.Cell>
                    <Table.Cell id = {score_id}>
                        {score}
                    </Table.Cell>
                    <Table.Cell>
                        {
                            <form>
                                <label>
                                    <input type="text" name="name" onChange={this.handleSubmissionScore} />
                                </label>
                                {joinButton}
                            </form>
                        }
                    </Table.Cell>
                    <p style={{color:'red'}}> {message} </p>
                </Table.Row>
            )
        };
        return (
            <Table celled striped className="table_content">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>User Name</Table.HeaderCell>
                        <Table.HeaderCell>View Attachment</Table.HeaderCell>
                        <Table.HeaderCell>Submission Date</Table.HeaderCell>
                        <Table.HeaderCell>Graded Date</Table.HeaderCell>
                        <Table.HeaderCell singleLine>Score</Table.HeaderCell>
                        <Table.HeaderCell singleLine>Enter Grade</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {submissions.map(generateAssignmentList)}
                </Table.Body>
            </Table>
        )
    }

    /*
        Input: message to display
        Return: modal that shows error or success message.
     */
    displayMessage (message) {
        return (
            <Modal
                open={this.state.submitted}
                size='tiny'
                onClose={this.handleCloseSubmitModal}
                header='Notification'
                content= {message}
                actions={[
                    'Close',
                ]}
            />)
    }

    /*
        Send create submission request to backend.
     */
    handleSubmit = (e, id, graded_date, text, course_name, score, submission_date, submitter_id) => {
        e.preventDefault();
        let today = new Date();
        today = today.toISOString();


        if(isNaN(parseInt(this.state.score))){
            window.alert("Input should be a number");
            return;
        }

        if (this.state.score > 100 || this.state.score < 0){
            window.alert("Input Not In The Range.");
            return;
        }

        const sub = {
            submission_date: submission_date,
            score: this.state.score,
            text: text,
            assignment: this.state.assignment_id,
            submitter: submitter_id,
            graded_date: today,
        };
        this.setState({
            submitted: true
        });
        axios.put(_CONFIG.devURL + '/submission/' + id + '/', sub)
            .then((response) => {
                let score_id = 'update_score' + id;
                let grade_date_id = 'grade_date' + id;
                document.getElementById(score_id).innerHTML = this.state.score;
                let date = this.changeDateFormat(today);
                document.getElementById(grade_date_id).innerHTML = date;
            });


    };

    /*
        Change date format to yyyy-mm-dd format.
     */
    changeDateFormat(str) {
        return str.substring(str, 10);
    }


    render() {
        let back_button = this.props.location.query ?
            <Button
                className="back_button"
                onClick={()=>history.back()}>
                Back to {this.props.location.query.origin}
            </Button> :
            <Link to="/dashboard/origin">
            <Button
                className="back_button"
                onClick={()=>history.back()}>
                Back to Home
            </Button>
            </Link>
        let assignment_attach = this.state.assignment_attachment === null ?
            "No Files Attached" : (<a download href={this.state.assignment_attachment}>
                View Attached File</a>);
        let panes = [
            { menuItem: 'Assignment information', render: () =>
                <form className="tab-content" action="/">
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <Form>
                                <h1>{this.state.name}</h1>
                                <br/>
                                <Form.Field>
                                    <label>Course Name</label>
                                    {this.state.course_name}
                                </Form.Field>
                                <Form.Field>
                                    <label>Due date</label>
                                    {this.changeDateFormat(this.state.end_date)}
                                </Form.Field>
                                <Form.Field>
                                    <label>Description</label>
                                    {this.state.description}
                                </Form.Field>
                                <Form.Field>
                                    {assignment_attach}
                                </Form.Field>
                            </Form>
                        </div>
                    </Card>
                </form>},
            this.state.isStudent ?
            { menuItem: 'Submit Assignment', render: () =>
                <form className="tab-content">
                    <Card className="Register__content" style={{width: 650}}>
                        <div>
                            <Form>
                                <h1>Submit Assignment</h1>
                                <br/>
                                <h4>Submit the assignment by clicking the upload button</h4>
                                <Form.Field>
                                    <label>Attachment</label>
                                    <input type="file" name="attachment" id="file" style={{width: 220}} onChange={this.handleChange}/>
                                </Form.Field>
                                <p> {this.state.message} </p>
                                <Button onClick={this.onCreateSubmission} className="ui button" role ="ui">Upload Assignment</Button>
                            </Form>
                        </div>
                    </Card>
                </form> } : null,

            this.state.isStudent ? null :
                { menuItem: 'Grade Submissions', render: () =>
                    <form className="tab-content" action="/">
                        {this.generateTables(this.state.submission_list)}
                    </form>
                },
        ];
        return(
            <div>
                <div>
                    <Loader active={this.state.loading}/>
                    <Dimmer active={this.state.loading}/>
                    {
                        this.state.submitted ? this.displayMessage('Submitted') : null
                    }
                    <Container>
                        {back_button}
                    </Container>
                    <Tab menu={{ fluid: true, vertical: false, tabular: 'right' }} panes={panes} grid = {{paneWidth: 12, tabWidth:2}}/>
                </div>
            </div>
        )
    }
}

Assignment.propTypes = {
    classes: PropTypes.array,
    isInstructor: PropTypes.bool,
};

export default Assignment
