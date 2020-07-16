// src/App.js
import React, { Fragment } from 'react';
import './App.css';
import { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react'

import { Modal } from 'bootstrap-4-react';

// imports from Amplify library
import { Storage, API, graphqlOperation } from 'aws-amplify'

// import uuid to create a unique client ID
import {v1 as uuid} from 'uuid'
import config from './aws-exports'

// import query definition
import { listPosts as ListPosts, getPost as GetPost } from './graphql/queries'
// import the mutation
import { createPost as CreatePost,  deletePost as DeletePost, updatePost as UpdatePost, createComment as CreateComment, deleteComment as DeleteComment} from './graphql/mutations'
// import the subscription
import { onCreatePost, onDeletePost, onUpdatePost} from './graphql/subscriptions'

const CLIENT_ID = uuid()


const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = config


class App extends React.Component {
  // define some state to hold the data returned from the API
  state = {
    title: '', 
    description: '', 
    posts: [], 
    userName: '', 
    createdAt: '',
    editMode: false,
    id: null,
    fileName: '',
    file: '',
    fileInputKey: Date.now(),
    postIdForComment: '',
    comments: [],
    comment: ''
  }

  // execute the query in componentDidMount
  async componentDidMount() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      console.log('user:', user.username)

      const postData = await API.graphql(graphqlOperation(ListPosts))
      console.log('postData:', postData)
      this.setState({
        posts: postData.data.listPosts.items,
        userName: user.username
      })


      this.subscriptionOnCreate = await API.graphql(graphqlOperation(onCreatePost)).subscribe({
        next: (eventData) => {
          const post = eventData.value.data.onCreatePost
          if (post.clientId === CLIENT_ID) return

          this.setState({
            posts: [...this.state.posts, post]
          })
          console.log(post)
        }
      })

      this.subscriptionOnDelete = await API.graphql(graphqlOperation(onDeletePost)).subscribe({
        next: (eventData) => {
          const post = eventData.value.data.onDeletePost
          const filteredPosts = this.state.posts.filter( p => {
            if(p.id != post.id)
              return p;
          })
    
          this.setState({
            posts: filteredPosts
          })
        }
      })

      this.subscriptionOnUpdate = await API.graphql(graphqlOperation(onUpdatePost)).subscribe({
        next: (eventData) => {
          const post = eventData.value.data.onUpdatePost
          if (post.clientId === CLIENT_ID) return

          const filteredPosts = this.state.posts.filter( p => {
            if(p.id != post.id)
              return p;
          })
          const posts = [ ...filteredPosts, post ]
          this.setState({
            posts
          })
        }
      })
    } catch (err) {
      console.log('error fetching talks...', err)
    }
  }

  componentWillUnmount() {
    this.subscriptionOnCreate.unsubscribe();
    this.subscriptionOnDelete.unsubscribe();
    this.subscriptionOnUpdate.unsubscribe();
  }

  /******* Creating Post  ********/
  createPost = async() => {
    const { title, description } = this.state
    if (title === '' || description === '') return

    if (this.state.file != '') {
      const extension = this.state.file.name.split(".")[1]
      const { type: mimeType } = this.state.file
      const key = `images/${uuid()}${this.state.fileName}.${extension}`      
      var url = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`
      //var url = `http://localhost:20005/public/${key}`
      await Storage.put(key, this.state.file, {
        contentType: mimeType
      })
    }else{
      var url = "";
    }
    const post = { title, description, clientId: CLIENT_ID, imageUrl: url  }

    try {
      await API.graphql(graphqlOperation(CreatePost, { input: post }))
            .then(post => {
              console.log(post)
              console.log('Post created!')
              const posts = [...this.state.posts, post.data.createPost]
              this.setState({
                posts, title:'', description: '', file: '', fileName: '', fileInputKey: Date.now(),
              })
            })
    } catch (err) {
      console.log('error creating post...', err)
    }
  }
  /******* Creating Post  ********/


  /******* Update Post  ********/
  updatePost = async() => {
    const { id, title, description } = this.state
    if (title === '' || description === '' || id === null) return

    try {
      await API.graphql(graphqlOperation(UpdatePost, { input: {id: id, description: description, title: title, clientId: CLIENT_ID } }))
            .then(post => {
              console.log(post)
              console.log('Post updated!')
              const filteredPosts = this.state.posts.filter( p => {
                if(p.id != post.data.updatePost.id)
                  return p;
              })
              const posts = [ ...filteredPosts, post.data.updatePost ]
              this.setState({
                posts, title:'', description: '', editMode: false
              })
            })
    } catch (err) {
      console.log('error updating post...', err)
    }
  }
  /******* Update Post  ********/

  createComment = async () =>{
    const { postIdForComment, comment } = this.state;
    if (postIdForComment === '' || comment === '') return

    try {
      await API.graphql(graphqlOperation(CreateComment, { input: {commentPostId: postIdForComment, message: comment} }))
            .then(comment => {
              console.log(comment)
              console.log('Comment created!')
              const comments = [...this.state.comments, comment.data.createComment]
              this.setState({
                comments, comment: ''
              })
              this.componentDidMount();
            })
    } catch (err) {
      console.log('error creating post...', err)
    }
  }
 
  onChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  signOut() {
    Auth.signOut()
  }


  async delete(postId){
    try{
      await API.graphql(graphqlOperation(DeletePost, { input: {id: postId} }))
      const filteredPosts = this.state.posts.filter( p => {
        if(p.id != postId)
          return p;
      })
      this.setState({
        posts: filteredPosts
      })
    }
    catch(err){
      console.log('error deleting post...', err)
    }
  }

  async deleteComment(commentId){
    try{
      await API.graphql(graphqlOperation(DeleteComment, { input: {id: commentId} }))
      const filteredComments = this.state.comments.filter( c => {
        if(c.id != commentId)
          return c;
      })
      this.setState({
        comments: filteredComments
      })
      this.componentDidMount();
    }
    catch(err){
      console.log('error deleting comment...', err)
    }
  }

  edit(post){
    //console.log(post)
    this.setState({
      title: post.title,
      description: post.description,
      editMode: true,
      id: post.id
    })
    window.scrollTo(0,0)
  }

  resetPost(){
    this.setState({
      title: '',
      description: '',
      editMode: false
    })
  }

  handleChange(event){

    const { target: { value, files } } = event
    const fileForUpload = files[0];
    this.setState({
      fileName: fileForUpload.name.split(".")[0],
      file: fileForUpload || value
    })
  }

  async loadComments(postId){
    this.setState({
      postIdForComment: postId
    })
    const postDatawithComments = await API.graphql(graphqlOperation(GetPost, {id: postId}));

    this.setState({
      comments: postDatawithComments.data.getPost.comments.items
    })
  }


  render() {
    return (
      <Fragment>
            <nav className="navbar bg-dark">
      <h1>
        <a href="index.html">Sample App</a>
      </h1>
      <ul> 
        <li>
         Hello  {this.state.userName} !
        </li>
        <li>
          <a href="" title="Logout">
            <i className="fas fa-sign-out-alt" onClick={this.signOut}></i>
            <span className="hide-sm" onClick={this.signOut}>Logout</span></a
          >
        </li>
      </ul>
    </nav>
        <section className="container">
          <h4 className="large text-primary">
            Posts
          </h4>
          <div className="post-form"> 
            <div className="form my-3">
              <input
                type="text"
                name='title'
                onChange={this.onChange}
                value={this.state.title}
                placeholder='Title'
              />
               <input
              type="file"
              key={this.state.fileInputKey}
              onChange={this.handleChange.bind(this)}
              style={{margin: '10px 0px'}}
              /> 
              <textarea
                  type="text"
                  name='description'
                  onChange={this.onChange}
                  value={this.state.description}
                  placeholder='Description'
                  className="textarea"
              ></textarea>

              { this.state.editMode === false ? 
                <button className="btn btn-dark my-1" onClick={this.createPost}>Create Post</button>:
                <button className="btn btn-dark my-1" onClick={this.updatePost}>Update Post</button>
              }
              <button className="btn btn-dark my-1" onClick={() => this.resetPost()}>Clear</button>
            </div>
           
              
          </div>

          <div className="posts">
         
            {
              this.state.posts.map((post, index) => (
                <div key={index} className="post p-1 my-1">
                  <div>
                      <img
                        className="responsive" 
                        width="600" height="400"
                        src={post.imageUrl}
                        alt=""
                      />
                  </div>
                  <div>
                    <span className="my-1">
                      <strong>{post.title}</strong>
                      <p>{post.description}</p>
                    </span>
                    <p className="post-date">
                        Created By :  {post.createdBy}
                    </p>
                    
                      { this.state.userName === post.createdBy ?
                      <>
                        <button type="button" onClick={ () => this.edit(post) }  className="btn btn-primary">
                        <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button type="button" onClick={ () => this.delete(post.id) } className="btn btn-danger">
                          <i className="fas fa-times"></i>
                        </button> 
                      </>
                      : ""
                      }
                      <a  data-toggle="modal" onClick={ () => this.loadComments(post.id) } data-target="#commentsModal" className="btn btn-info">
                        Comments <span className='comment-count'>{post.comments.items.length}</span>
                      </a>
                  </div>
              </div>
              ))
            }
          </div> 
          <Modal id="commentsModal" fade>
              <Modal.Dialog centered>
                <Modal.Content>
                  <Modal.Header>
                    <Modal.Title>Comments</Modal.Title>
                    <Modal.Close>
                      <span aria-hidden="true">X</span>
                    </Modal.Close>
                  </Modal.Header>
                  <Modal.Body>
                  <div className="post-form">
                    <div >
                      <h3>Leave A Comment</h3>
                    </div>
                      <textarea
                        name="comment"
                        cols="50"
                        rows="5"
                        placeholder="Comment on this post"
                        required
                        onChange={this.onChange}
                        value = { this.state.comment }
                      ></textarea><br />
                      <button className="btn btn-dark my-1" onClick={this.createComment}>Submit</button>
                    </div>
                  { this.state.comments.map((comment, index) => (
                    <div key={index} className="post bg-white p-1 my-1">
                      <div className="row">
                        <p className="col-sm-6">
                          {comment.message}
                          <br /><span className="post-date">
                            Created By: {comment.createdBy}
                          </span>
                        </p>
                        { this.state.userName === comment.createdBy ? 
                          <button type="button" size="sm" className="btn btn-secondary" onClick={ () => this.deleteComment(comment.id) }>
                          <i className="fas fa-times"></i>
                          </button>
                          : ""
                        }
                      </div>
                    </div>
                  )) }
                    
                  </Modal.Body>
                </Modal.Content>
              </Modal.Dialog>
            </Modal>
        </section>
      </Fragment>
    )
  }
}

export default withAuthenticator(App, { includeGreetings: false })