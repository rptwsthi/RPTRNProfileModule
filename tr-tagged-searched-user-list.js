import React, { Component } from 'react';
import {UserList} from './tr-user-list';
import {
  View,
  AsyncStorage
} from 'react-native';

export default class TagSearchedUserList extends Component<{}> {
  constructor (props) {
    super(props);
    this.getThisUserAndRequest();
    this.state = {thisUser:{}};
  }

  getThisUserAndRequest () {
    try {
      AsyncStorage.getItem("user", (err, result) => {
        var u = JSON.parse(result);
        AsyncStorage.getItem('token', (err, result) => {
          u['accessToken'] = result;
          console.log("u: ", u);
          this.setState({thisUser:u});
        });
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  callback = (skill) => {
    // alert("hi");
    this.props.navigation.setParams({
        ftag: skill
    });
    // this.props.navigation.goBack();
  }

  static navigationOptions = ({navigation}) => ({
    title : navigation.state.params.ftag
  });

  render () {
    if (this.state.thisUser == undefined || this.state.thisUser.length == 0 || this.state.thisUser == null) {return(<View/>);}
    console.log("RenderingWith", this.state.searchText, "TU: ", this.state.thisUser);
    let ftag = this.props.navigation.state.params.ftag
    return (
      <View style = {{backgroundColor:'white', flex:1}}>
        <UserList topSearched = {false}
                  thisUser = {this.state.thisUser}
                  searchTerm = {""}
                  callback = {this.callback.bind(this)}
                  allowSelection = {false}
                  navigation = {this.props.navigation}
                  from = {"taglist"}
                  ftag = {ftag}/>
      </View>
    );
  }
}
