import React, { Component } from 'react';
import Search from 'react-native-search-box';
import {
  View,
  AsyncStorage
} from 'react-native';
import {UserList} from './tr-user-list';

var _searchText = "";
export default class SearchUserContainer extends Component <{}> {
  static navigationOptions = ({navigation}) => ({
    title: "Top Searched"
  });
  render () {
    return (
      <SearchUser allowSelection = {false} navigation={this.props.navigation}/>
    )
  }
}

export class SearchUser extends Component<{}> {
  constructor (props) {
    super(props);
    this.state = {searchedText:"",
                  topSearchedActive:true,
                  thisUser:{}};
    this.getThisUserAndRequest();
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

  //Search bar support
  onSearchTextChange = (searchBar) => {
    _searchText = searchBar.text;
  }

  onSearchCancel = () => {
    _searchText = "";
    this.setState({searchedText:_searchText,
                   topSearchedActive : true});
  }

  onSearchDelete = () => {
    _searchText = "";
  }

  onSearch = () => {
    console.log("_searchText: ", _searchText);
    this.setState({searchedText:_searchText,
                   topSearchedActive : false});
  }

  static navigationOptions = ({navigation}) => ({
    title: "Top Searched"
  });
  returnData(selectedUser) {
    this.props.returnData(selectedUser);
  }
  render () {
    if (this.state.thisUser == undefined || this.state.thisUser.length == 0) {return(<View/>);}

    //this.props.navigationOptions.title = "Hi";
    // <SearchUser screenProps = {{title:"Hello"}}/>

    console.log("RenderingWith", this.state.searchText, "TU: ", this.state.thisUser);
    //let allowSelection = (this.props.navigation.state.params.allowSelection) ? this.props.navigation.state.params.allowSelection : false;
    let allowSelection = (this.props.allowSelection) ? this.props.allowSelection : false;
    //let allowSelection = true;
    let selected = (this.props.selectedUsers)?this.props.selectedUsers :[];
    //alert(selected.length);
    return (
      <View style = {{backgroundColor:'white', flex:1}}>
        <Search style = {{backgroundColor: 'white'}}
          ref={(ref) => { this.search = ref; }}
          onChangeText = {(text) => this.onSearchTextChange({text})}
          onSearch = {this.onSearch}
          onCancel = {this.onSearchCancel}
          onDelete = {this.onSearchDelete}/>
        <UserList topSearched = {this.state.topSearchedActive}
                  thisUser = {this.state.thisUser}
                  searchTerm = {this.state.searchedText}
                  allowSelection = {allowSelection}
                  returnData = {this.returnData.bind(this)}
                  selectedUsers = {selected}
                  navigation = {this.props.navigation}/>
      </View>
    );
  }
}
