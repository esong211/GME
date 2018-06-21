import React, { Component } from 'react'
import { Container, Button, Card, Dropdown, Modal, Form} from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'
import Grade from '../Grade/Grade.jsx'

import styles from './Origin.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'
class Origin extends Component {

    constructor(props){
        super(props);
        this.state = {
            modalAddOpen: false,
            modalDropOpen: false,
            modalCreateOpen: false,
            user_type: [{ key : 'students', text: 'Student', value : 'students'}, { key : 'tas', text: 'TA', value : 'tas'}],
            course_user_type: '',
            first_name: '',
            color: '',
            username: '',
            isInstructor: true,
            course_student:[],
            course_instructor:[],
            course_tas:[],
            course: [],
            course_name: [],
            course_description: [],
            id:'0',
            assignmentSoon: [],
            add_course_id: '0',
            drop_course_id: '0',
            error_message: '',
            delete_course_id: '0',
            access_code: '',

        };
        this.addClass = this.addClass.bind(this);
        this.addCourse = this.addCourse.bind(this);
        this.dropClass = this.dropClass.bind(this);
        this.createClass = this.createClass.bind(this);
        this.setAddCourseId = this.setAddCourseId.bind(this);
        this.setAccessCode = this.setAccessCode.bind(this);
        this.setDropCourseId = this.setDropCourseId.bind(this);
        this.changeUserType = this.changeUserType.bind(this);
        this.setName = this.setName.bind(this);
        this.setDescription = this.setDescription.bind(this);
        this.refreshCourse = this.refreshCourse.bind(this);
        this.getCourses = this.getCourses.bind(this);
    }

    componentDidMount(){
        this.getCourses();
    }
    /*
        Load and update states from cache and endpoints
     */
    getCourses(){
        // check if user is logged in
        let user_obj = JSON.parse(localStorage.getItem('user'));
        let setFirstName = user_obj["data"]["first_name"];
        let setColor = user_obj["data"]["color"];
        // checks to see if it has already been decoded
        let decoded_state = JSON.parse(localStorage.getItem('decoded'));
        if (decoded_state !== null) {
            this.setState(decoded_state);
        }
        // grabs list of course that the student is enrolled in
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.get(_CONFIG.devURL + "/user/" + token_res.data.id + "/get_course/")
                    .then(res => {
                        let course_student = res.data.student;
                        let course_tas = res.data.ta;
                        let course_instructor = res.data.instructor;
                        let course_temp = this.arrayUnique(course_tas.concat(course_student));
                        let course = [];
                        this.combimeCourses(course_temp, course);
                        this.setState({
                                course : course,
                                course_student: course_student,
                                course_instructor: course_instructor,
                                course_tas: course_tas,
                            }
                        );
                        localStorage.setItem('decoded', JSON.stringify(this.state));
                    });
                // grabs list of upcoming assignments due
                axios.get(_CONFIG.devURL + "/user/" + token_res.data.id + "/assignments_due_week/")
                    .then(res => {
                        let course_obj = res.data;
                        let assignmentSoon = [];
                        for (let i = 0; i < course_obj.length; i++) {
                            assignmentSoon.push(course_obj[i]);
                        }
                        this.setState({assignmentSoon});
                        localStorage.setItem('decoded', JSON.stringify(this.state));
                    });
            })
            .catch(function (error) {
                console.log("failed to decode")
            });
        this.setState({
            first_name: setFirstName,
            color: setColor
        });
    }


    /*
        Handlers for states
     */
    setAccessCode(e) {
        this.setState({
            error_message: '',
            access_code: e.target.value
        })
    }

    setName(e) {
        this.setState({
            course_name: e.target.value
        })
    }
    setDescription(e) {
        this.setState({
            course_description: e.target.value
        })
    }
    setDropCourseId(e, data) {
        this.setState({
            drop_course_id: data.value
        })
    }
    setAddCourseId(e) {
        this.setState({
            error_message: '',
            add_course_id : e.target.value
        })
    }

    changeUserType(e, data) {
        this.setState({
            course_user_type : data.value
        })
    }

    addCourse(e){
        localStorage.removeItem("decoded");
        this.setState({
            add_class: e.target.value
        });
    }

    handleAddOpen = () => this.setState({ modalAddOpen: true });

    handleAddClose = () => this.setState({ modalAddOpen: false});

    handleDropOpen = () => this.setState({ modalDropOpen: true });

    handleDropClose = () => this.setState({ modalDropOpen: false});

    handleCreateOpen = () => this.setState({ modalCreateOpen: true});

    handleCreateClose = () => this.setState({ modalCreateOpen: false});

    /*
        Input: array of users
        Return: array of users with unique elements
     */
    arrayUnique(array) {
        let arr = array.concat();
        for(let i=0; i<arr.length; ++i) {
            for(let j=i+1; j<arr.length; ++j) {
                if(arr[i]["id"] === arr[j]["id"])
                    arr.splice(j--, 1);
            }
        }
        return arr;
    }

    /*
        Parameter:
            course_source: source course to combine
            course_dest: destination course to combine
     */
    combimeCourses(course_source, course_dest) {
        for (let i = 0; i < course_source.length; i++) {
            course_dest.push({
                key: course_source[i]["id"],
                text: course_source[i]["name"],
                value: course_source[i]["id"]
            })
        }
    }

    /*
        Send drop course request to backend
     */
    dropClass(e){
        e.preventDefault();
        let user_obj = JSON.parse(localStorage.getItem('user'));
        localStorage.removeItem("decoded");
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.get(_CONFIG.devURL + '/course/' + this.state.drop_course_id + '/')
                    .then(response => {
                        let id = response.data.id;
                        let description = response.data.description;
                        let name = response.data.name;
                        let students = response.data.students;
                        let tas = response.data.tas;
                        let instructors = response.data.instructors;
                        this.removeUser(students, token_res, tas, instructors);
                        const course = {
                            name: name,
                            description: description,
                            students: students,
                            tas: tas,
                            instructors: instructors,
                        };
                        axios.put(_CONFIG.devURL + /course/ + id + '/', course)
                            .then(function (response) {
                                window.alert('Request is submitted');
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    });
                this.setState({modalDropOpen: false});
            })
    }

    /*
        Remove current users id from list of students, instructors and tas.
     */
    removeUser(students, token_res, tas, instructors) {
        for (let i = 0; i < students.length; i++) {
            if (students[i] === token_res.data.id) {
                students.splice(i--, 1);
            }
        }
        for (let i = 0; i < tas.length; i++) {
            if (tas[i] === token_res.data.id) {
                tas.splice(i--, 1);
            }
        }
        for (let i = 0; i < instructors.length; i++) {
            if (instructors[i] === token_res.data.id) {
                instructors.splice(i--, 1);
            }
        }
    }

    /*
        Send joining course request to backend.
        After sending the request, it displays response message.
     */
    addClass(e){
        localStorage.removeItem("decoded");
        e.preventDefault();
        let user_obj = JSON.parse(localStorage.getItem('user'));
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                let access_code = this.state.access_code;
                const ac = {
                    'access_code' : access_code,
                };
                axios.post(_CONFIG.devURL + "/user/" + token_res.data.id +'/join_course/', ac)
                    .then (response => {
                        if (response.data.error_msg === undefined) {
                            window.alert(response.data);
                        }
                        else {
                            window.alert(response.data.error_msg);
                        }
                    })
            });
        this.setState({
            modalAddOpen: false,
        });
    }


    /*
        Send creating course request to backend.
        After sending the request, it displays response message.
     */
    createClass(e){
        e.preventDefault();
        let user_obj = JSON.parse(localStorage.getItem('user'));
        this.setState({
            decoded_state: null,
        });
        localStorage.removeItem("decoded");
        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
            axios.post(_CONFIG.devURL + '/course/', {
                name: this.state.course_name,
                description: this.state.course_description,
                instructors: [token_res.data.id],
                })
                  .then(function (response) {
                      window.alert('Created. Click Refresh course button');
                  }).catch(function (error) {
                      console.log(error);
                      this.setState({
                          error_message: error,
                      })
                    window.alert('Failed to create a course');
                });
            });
        this.handleCreateClose();
    }

    /*
        Clean up local storage and update states again.
     */
    refreshCourse(){
        localStorage.removeItem('decoded');
        this.getCourses();
    }

    /*
        Input: list of course
        Return: Generated card component of input course
     */
    generateClassCard(course_list) {


        let generateCard = ({id, name, description}, index) => {
            let activeIcon = <img className="p-10" src="https://png.icons8.com/filled-circle/p1em/10/2ecc71"/>;
            let activeText = "Active";
            let joinButton =
                <Link to={{pathname: "/dashboard/course/" + id}} name="course">
                    <Button color={this.state.color} fluid >Enter</Button>
                </Link>;
            return (
                <Card className="card-element">
                    <Card.Content>
                        <Card.Description textAlign="right">
                            {activeIcon}{activeText}
                        </Card.Description>
                        <Card.Header style={{float:"left", paddingTop: 10}}>{name}</Card.Header>
                        <br/>
                        <br/>
                    </Card.Content>
                    <Card.Content extra>
                        {joinButton}
                    </Card.Content>
                </Card>
            )
        };
        return course_list.map(generateCard);
    }

    render() {
        let additionalCard = null;
        var color_pref = this.state.color;
        return(
            <div className="courses_group">
                <Card id='cards-container'>
                    <Card.Content extra>
                        <div className='ui three buttons'>
                                <Button basic color={color_pref} className='modalButton' onClick={this.refreshCourse}>Refresh Courses</Button>
                            <Modal trigger={<Button basic color={color_pref} className='modalButton' onClick={this.handleAddOpen}>Add a course</Button>} open={this.state.modalAddOpen} onClose={this.handleAddClose}>
                                <Modal.Header> Add a course </Modal.Header>
                                <Modal.Content>
                                    <label> Access Code </label>
                                    <input onChange={this.setAccessCode} />
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={this.handleAddClose}>
                                        Cancel
                                    </Button>
                                    <Button color={color_pref} onClick={this.addClass}>
                                        Add
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                            <Modal className='modalClass'
                                   trigger={
                                       <Button
                                           basic color={color_pref}
                                           className='modalButton'
                                           onClick={this.handleDropOpen}
                                       >Drop a course</Button>}
                                   open={this.state.modalDropOpen}
                                   onClose={this.handleDropClose}>

                                <Modal.Header> Drop a course </Modal.Header>
                                <Modal.Content>
                                    <label> Select a course:  </label>
                                    <Dropdown
                                        className="dropdown__menu"
                                        search selection options={this.state.course}
                                        value={this.state.drop_course_id}
                                        onChange={this.setDropCourseId}
                                    />
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={this.handleDropClose}>
                                        Cancel
                                    </Button>
                                    <Button color={color_pref} onClick={this.dropClass}>
                                        Drop
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                        </div>
                    </Card.Content>
                </Card>

                <Container>


                    {this.state.course_student.length === 0 ? null :<h1> Student</h1>}

                    <Card.Group className="cards-container" >
                        {this.state.course_student.length === 0 ? null : this.generateClassCard(this.state.course_student)}
                        {additionalCard}

                    </Card.Group>


                    {this.state.course_student.length === 0 ? null : <div className="assignment-container" >
                    <Grade color={color_pref} graded={this.state.assignmentSoon}/>
                </div>}



                    {this.state.course_tas.length === 0 ? null :<h1> TA</h1>}

                    <Card.Group className="cards-container" >
                        {this.state.course_tas.length === 0 ? null : this.generateClassCard(this.state.course_tas)}
                        {additionalCard}

                    </Card.Group>


                    <h1> Instructor </h1>
                    <Card.Group className="cards-container" >
                        {this.generateClassCard(this.state.course_instructor)}
                        <Card className="card-element">
                            <Card.Content className="createCard">

                                <Modal className='modalClass'
                                       trigger={
                                           <Button
                                               basic color={color_pref}
                                               size = {"massive"}
                                               className='modalButton'
                                               onClick={this.handleCreateOpen}
                                           >Create a course</Button>}
                                       open={this.state.modalCreateOpen}
                                       onClose={this.handleCreateClose}>
                                    <Modal.Header> Create a course </Modal.Header>
                                    <Modal.Content>
                                        <Form onSubmit={this.createClass}>
                                            <Form.Field>
                                                <label>Name</label>
                                                <input onChange={this.setName}/>
                                            </Form.Field>
                                            <Form.Field>
                                                <label>Description</label>
                                                <input onChange={this.setDescription}/>
                                            </Form.Field>
                                            <p style={{color:'red'}}> {this.state.error_message} </p>
                                            <div style={{float:"right"}}>
                                                <Button onClick={this.handleCreateClose}>Cancel</Button>
                                                <Button type='submit'>Create</Button>
                                            </div>
                                            <br/>
                                            <br/>
                                        </Form>
                                    </Modal.Content>
                                </Modal>
                            </Card.Content>
                        </Card>
                        {additionalCard}
                    </Card.Group>


                </Container>
            </div>
        )
    }
}

export default Origin
