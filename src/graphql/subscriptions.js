/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost {
    onCreatePost {
      id
      title
      description
      clientId
      imageUrl
      createdBy
      comments {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost {
    onUpdatePost {
      id
      title
      description
      clientId
      imageUrl
      createdBy
      comments {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost {
    onDeletePost {
      id
      title
      description
      clientId
      imageUrl
      createdBy
      comments {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment {
    onCreateComment {
      id
      message
      createdBy
      post {
        id
        title
        description
        clientId
        imageUrl
        createdBy
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment {
    onUpdateComment {
      id
      message
      createdBy
      post {
        id
        title
        description
        clientId
        imageUrl
        createdBy
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment {
    onDeleteComment {
      id
      message
      createdBy
      post {
        id
        title
        description
        clientId
        imageUrl
        createdBy
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
