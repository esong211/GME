import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Header, Menu, Container, Button, Input, Tab, Label, Dropdown, Form, List, Table} from 'semantic-ui-react'
import { Link, Redirect} from 'react-router-dom'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'
import styles from './GradeCenter.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'


class GradeCenter extends Component {

    constructor(props){
        super(props);
        this.state = {
            courses: [ {key: '0', text: 'All', value: '0'}],
            submissions: [],
            selected_course: 0,
            isInstructor: true,
            redirect: false,
        };
        this.changeSelectedCourse = this.changeSelectedCourse.bind(this);
        this.changeDateFormat = this.changeDateFormat.bind(this);
    }

    componentDidMount(){
        let user_obj = JSON.parse(localStorage.getItem('user'));
        let setFirstName = user_obj["data"]["first_name"];
        this.setState({
            first_name: setFirstName
        });

        axios.post(_CONFIG.devURL + "/user/decode_token/", user_obj["data"])
            .then(token_res => {
                axios.get(_CONFIG.devURL + "/course/")
                    .then(res => {
                        let courses = res.data;
                        let user_in_courses = [{key: '0', text: 'All', value: 0}];
                        for (let i = 0; i < courses.length; i++) {
                            let students = courses[i].students;
                            if (students.includes(token_res.data.id)) {
                                user_in_courses.push({
                                    key: courses[i].id,
                                    text: courses[i].name,
                                    value: courses[i].name
                                })
                            }
                        }
                        this.setState({courses: user_in_courses});
                    });
                const userid = {
                    "userid": token_res.data.id
                };
                axios.post(_CONFIG.devURL + "/submission/get_submissions/", userid)
                    .then(res => {
                        this.setState({submissions: res.data.submissions});
                    });
            })
    }


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

    changeSelectedCourse(e, data) {
        this.setState({
            selected_course: data.value
        })
    }

    changeDateFormat(str) {
        return str.substr(str, 10);
    }

    generateClassList(submission_list, selected_course_name) {
        let display_courses = [];
        if (selected_course_name ===0) {
        }
        for (let i = 0 ; i < submission_list.length; i ++) {
            if ((selected_course_name === 0) || (submission_list[i].course_name === selected_course_name)) {
                display_courses.push(submission_list[i]);
            }
        }
        let generateRows = ({id, graded_date, text, assignment, course_name, score}, index) => {
            return (
                <Table.Row>
                    <Table.Cell>
                        {course_name}
                    </Table.Cell>

                    <Table.Cell >
                        {assignment}
                    </Table.Cell>

                    <Table.Cell>
                        {text}
                    </Table.Cell>

                    <Table.Cell>
                        {score}
                    </Table.Cell>

                    <Table.Cell>
                        {
                            (graded_date === null) ? null : this.changeDateFormat(graded_date)
                        }
                    </Table.Cell>
                </Table.Row>
            )
        };
        return (
            <Table celled striped className="table_content">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell singleLine>Course</Table.HeaderCell>
                        <Table.HeaderCell>Assignment</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Score</Table.HeaderCell>
                        <Table.HeaderCell>Graded Date</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {display_courses.map(generateRows)}
                </Table.Body>
            </Table>
        )
    }

    render() {
        return(
            <div>
                <div className="course_dropdown">
                    <label style={{marginRight:10}}>
                        Select a course:
                    </label>
                    <Dropdown
                        search selection options={this.state.courses}
                        value={this.state.selected_course}
                        onChange={this.changeSelectedCourse}
                    />
                </div>
                {this.generateClassList(this.state.submissions, this.state.selected_course)}
            </div>
        )
    }
}

export default GradeCenter
