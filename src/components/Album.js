import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import '../App.css';
import Amplify from 'aws-amplify';
import { AmplifyS3Album, AmplifyS3TextPicker, AmplifyS3ImagePicker, AmplifyS3Image} from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';


class Album extends React.Component {
    render(){
        return(
            <Fragment>
               <AmplifyS3Album /> 
                <AmplifyS3TextPicker />
                <AmplifyS3ImagePicker /> 
                <AmplifyS3Image imgKey="photo4.jpg" />
            </Fragment>
        );
    }
}

export default Album;