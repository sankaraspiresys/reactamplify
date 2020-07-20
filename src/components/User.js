import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import '../App.css';
import { Auth } from 'aws-amplify';

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
        editorUsers: [],
        userGroup: []
    }

    async componentDidMount() {
        const user = await Auth.currentAuthenticatedUser()
        const userPayload = user.signInUserSession.accessToken.payload;
        this.setState({
            userGroup: userPayload["cognito:groups"]
          })

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
        //console.log(rest);
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
      console.log(rest.Users);
        return rest;
    }

    async enableUser(userName){
        let apiName = 'AdminQueries';
        let path = '/enableUser';
        let myInit = {
            body: {
                "username" : userName
            }, 
            headers: {
                'Content-Type' : 'application/json',
                Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            } 
        }
        await API.post(apiName, path, myInit);
        return this.componentDidMount();
    }

    async disableUser(userName){
        let apiName = 'AdminQueries';
        let path = '/disableUser';
        let myInit = {
            body: {
                "username" : userName
            }, 
            headers: {
                'Content-Type' : 'application/json',
                Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            } 
        }
        await API.post(apiName, path, myInit);
        return this.componentDidMount();
    }

    async setAsAdmin(userName) { 
        let apiName = 'AdminQueries';
        let path = '/addUserToGroup';
        let myInit = {
            body: {
              "username" : userName,
              "groupname": "admin"
            }, 
            headers: {
              'Content-Type' : 'application/json',
              Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            } 
        }
        await API.post(apiName, path, myInit);
        return this.componentDidMount();
    }

    async removeAdminAccess(userName) { 
        let apiName = 'AdminQueries';
        let path = '/removeUserFromGroup';
        let myInit = {
            body: {
              "username" : userName,
              "groupname": "admin"
            }, 
            headers: {
              'Content-Type' : 'application/json',
              Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            } 
        }
        await API.post(apiName, path, myInit);
        return this.componentDidMount();
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
                    { this.state.userGroup != undefined && this.state.userGroup.indexOf('admin') != -1 && <li><Link to="/users">Users</Link></li>}
                    
                    <li>
                        <p title="Logout">
                        <i className="fas fa-sign-out-alt" onClick={this.signOut}></i>
                        <span className="hide-sm" onClick={this.signOut}>Logout</span></p
                        >
                    </li>
                </ul>
                </nav>
                <Tabs transition={false} style={{ width: "80%", margin: "auto", marginTop: "30px"}} defaultActiveKey="admins" id="uncontrolled-tab-example">
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
                                            { !admin.Enabled && <button className="btn btn-sm btn-success" title="Enable User" onClick={() => this.enableUser(admin.Username)}>
                                                <i className="fas fa-play"></i>
                                                </button>
                                            }
                                            <button className="btn btn-sm btn-danger" title="Disable User" onClick={() => this.disableUser(admin.Username)}>
                                                <i className="fas fa-power-off "></i>
                                            </button>
                                            <button className="btn btn-sm btn-info" title="Add to Admin Group" onClick={() => this.removeAdminAccess(admin.Username)}>
                                                Remove Admin Access
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
                                            { !admin.Enabled && <button className="btn btn-sm btn-success" title="Enable User" onClick={() => this.enableUser(admin.Username)}>
                                                <i className="fas fa-play"></i>
                                                </button>
                                            }
                                            { admin.Enabled && <button className="btn btn-sm btn-danger" title="Disable User" onClick={() => this.disableUser(admin.Username)}>
                                                <i className="fas fa-power-off "></i>
                                            </button> }

                                            <button className="btn btn-sm btn-info" title="Add to Admin Group" onClick={() => this.setAsAdmin(admin.Username)}>
                                                Set as Admin
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

export default User;
