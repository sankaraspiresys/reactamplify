import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import '../App.css';
import { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react'

import { Modal, Table} from 'bootstrap-4-react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

// imports from Amplify library
import { Storage, API, graphqlOperation } from 'aws-amplify'

// import uuid to create a unique client ID
import {v1 as uuid} from 'uuid'
import config from '../aws-exports'

// import query definition
import { listPosts as ListPosts, getPost as GetPost } from '../graphql/queries'
// import the mutation
import { createPost as CreatePost,  deletePost as DeletePost, updatePost as UpdatePost, createComment as CreateComment, deleteComment as DeleteComment} from '../graphql/mutations'
// import the subscription
import { onCreatePost, onDeletePost, onUpdatePost} from '../graphql/subscriptions'

class User extends React.Component {
    state = {
        adminUsers: [],
        editorUsers: []
    }

    async componentDidMount() {
        this.listAdmins();
        this.listEditors();
    }

    signOut() {
        Auth.signOut()
    }

    async listAdmins(){
        let nextToken;
        let apiName = 'AdminQueries';
        let path = '/listUsersInGroup';
        let myInit = { 
            queryStringParameters: {
              "groupname": "admin"
            },
            headers: {
              'Content-Type' : 'application/json',
              Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            }
        }
        const { NextToken, ...rest } =  await API.get(apiName, path, myInit);
        nextToken = NextToken;

        this.setState({
            adminUsers: rest.Users
        })
        console.log(rest);
        return rest;
    }

    async listEditors(){
        let nextToken;
        let apiName = 'AdminQueries';
        let path = '/listUsersInGroup';
        let myInit = { 
            queryStringParameters: {
              "groupname": "editors"
            },
            headers: {
              'Content-Type' : 'application/json',
              Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            }
        }
        const { NextToken, ...rest } =  await API.get(apiName, path, myInit);
        nextToken = NextToken;

        this.setState({
            editorUsers: rest.Users
        })
        console.log(rest);
        return rest;
    }



    render(){
        return (
            <Fragment>
                <nav className="navbar bg-dark">
                <h5>
                    <Link to="/">Logo</Link>
                </h5>
                <ul> 
                    <li>
                    <Link to="/">Home</Link>
                    </li>
                    <li><Link to="/users">Users</Link></li>
                    
                    <li>
                        <a href="" title="Logout">
                        <i className="fas fa-sign-out-alt" onClick={this.signOut}></i>
                        <span className="hide-sm" onClick={this.signOut}>Logout</span></a
                        >
                    </li>
                </ul>
                </nav>
                <Tabs style={{ width: "80%", margin: "auto", marginTop: "30px"}} defaultActiveKey="admins" id="uncontrolled-tab-example">
                    <Tab eventKey="admins" title="Admins">
                        <Table style={{ width: "80%", margin: "auto", marginTop: "30px", fontSize: "13px"}} striped bordered hover size="sm">
                            <thead>
                                <tr>
                                <th>#</th>
                                <th>User Name</th>
                                <th>Status</th>
                                <th>Enabled / Disabled</th>
                                <th>Created Date</th>
                                <th>Action</th>
                                </tr>
                                </thead>
                            <tbody>
                                {
                                    this.state.adminUsers.map((admin, index) => (
                                        <tr key={index} >
                                        <td>{index + 1}</td>
                                        <td>{admin.Username}</td>
                                        <td>{admin.UserStatus}</td>
                                        <td>{admin.Enabled === true ? "Enabled": "Disabled"}</td>
                                        <td>{admin.UserCreateDate}</td>
                                        <td>
                                            { admin.Enabled && <button className="btn btn-success" title="Enable User" onClick={this.createPost}>
                                                <i className="fas fa-play"></i>
                                                </button>
                                            }
                                            <button className="btn btn-danger" title="Disable User" onClick={this.updatePost}>
                                                <i className="fas fa-power-off "></i>
                                            </button>
                                        </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="editors" title="Editors">
                    <Table style={{ width: "80%", margin: "auto", marginTop: "30px", fontSize: "13px"}}  striped bordered hover size="sm">
                            <thead>
                                <tr>
                                <th>#</th>
                                <th>User Name</th>
                                <th>Status</th>
                                <th>Enabled / Disabled</th>
                                <th>Created Date</th>
                                <th>Action</th>
                                </tr>
                                </thead>
                            <tbody>
                                {
                                    this.state.editorUsers.map((admin, index) => (
                                        <tr key={index} >
                                        <td>{index + 1}</td>
                                        <td>{admin.Username}</td>
                                        <td>{admin.UserStatus}</td>
                                        <td>{admin.Enabled === true ? "Enabled": "Disabled"}</td>
                                        <td>{admin.UserCreateDate}</td>
                                        <td>
                                            { admin.Enabled && <button className="btn btn-success" title="Enable User" onClick={this.createPost}>
                                                <i className="fas fa-play"></i>
                                                </button>
                                            }
                                            <button className="btn btn-danger" title="Disable User" onClick={this.updatePost}>
                                                <i className="fas fa-power-off "></i>
                                            </button>
                                        </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
                
            </Fragment>
        )
    }
}

export default withAuthenticator(User, { includeGreetings: false })
