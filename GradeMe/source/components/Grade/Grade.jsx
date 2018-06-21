import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Header, Menu, Container,Card, List, Button, Input, Tab, Label, Dropdown, Form, Segment } from 'semantic-ui-react'
import { Link, Redirect} from 'react-router-dom'
import axios from 'axios'
import * as _CONFIG from '../_config/Config.js'
import styles from './Grade.scss'
import styles2 from '../../assets/font-awesome/css/font-awesome.min.css'


class Grade extends Component {

   constructor(props){
       super(props);
       this.state = {
           graded: [],
           color_pref: ''
       }
   }

    componentDidMount(){
        this.setState({
            graded: this.props.graded,
            color_pref: this.props.props
        });

    }

   render(){
       let grades = this.props.graded.map((item) =>
           <Link to={{pathname: "/dashboard/assignment/" + item.id, query: {origin: "Home"} }}>
           <List.Item size="huge" containerStyle={{marginBottom:30}}>{item.name}</List.Item>
               <List.Item size="huge" containerStyle={{marginBottom:30}}>{this.changeDateFormat((item.end_date))}</List.Item>
           </Link>
       );
       return(
           <Card size='huge'>
               <Header as='h3' block color={this.props.color}>
                   {' '} Upcoming Assignments
               </Header>
               <List size='huge' ordered={true}>
                   {grades}
               </List>
               <br></br>
           </Card>
           )
   }

    changeDateFormat(str) {
        return str.substring(str, 10);
    }

}

export default Grade
