import React, { Component } from 'react';
import {
  StyleSheet, FlatList, AsyncStorage, View, TouchableOpacity, Text, Platform, Image, ActivityIndicator
} from 'react-native';

import {CachedImage} from "react-native-img-cache";
import {UProfileImage, GreenButton, ImagedText} from './tr-user';
const GLOBAL = require('../config/global');
import Toast from 'react-native-simple-toast';
const ApplicationFont = require('../config/application-font');

const kApplicationFontRegular =  Platform.select({
  ios: 'opensans',
  android: 'opensans_regular'
});

const kApplicationFontSemibold =  Platform.select({
  ios: 'opensans-semibold',
  android: 'opensans_semibold'
});

//..
export class UPLSummery extends Component {
  render () {
    let user = this.props.user;
    let totalAppretiations = (user.aggregateAppreciation) ? user.aggregateAppreciation : '0';
    let totalIdeas = (user.aggregateIdea) ? user.aggregateIdea  : '0';
    return (
        <View style = {styles.PULSummeryContainer}>
            <Text style = {{fontFamily:kApplicationFontSemibold, fontSize:12}}> {totalIdeas} </Text>
            <Text style = {{fontFamily:kApplicationFontRegular, fontSize:12, color:"#ccc"}}> Ideas Posted </Text>
            <View style = {{width:1, backgroundColor:'gray', margin : 2}}/  >
            <Text style = {{fontFamily:kApplicationFontSemibold, fontSize:12}}> {totalAppretiations} </Text>
            <Text style = {{fontFamily:kApplicationFontRegular, fontSize:12, color:"#ccc"}}> Appreciation </Text>
        </View>
    );
  }
}

export class UPLInfo extends Component {
  render () {
    let user = this.props.user;
    let fullName = user.name;//.toUpperCase();
    return (
      <View style = {styles.PULInfoContainer}>
        <View>
          <Text style = {styles.PULName}>{fullName}</Text>
          <ImagedText image = {require('../../assets/profession.png')}
                      text = {user.profession}
                      textStyle = {styles.PULProfession}
                      iconStyle = {styles.PULProfessionIcon}/>
        </View>
        <UPLSummery user = {user}/>
      </View>
    );
  }
}

export class UserItemCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token :'',
    }
    AsyncStorage.getItem('token', (err, result) => {
      this.setState({token:result});
    });
  }

  itemTouchedWithUser (user) {

    if(!user.name){
      Toast.show("Invalid user");return;
    }
    user['accessToken'] = this.state.token;
    var from = (this.props.from && this.props.from == "taglist") ? this.props.from : "";
    // alert("itemTouchedWithUser"+from)
    this.props.navigation.navigate('UserDetail', {updateValues : this.updateValues.bind(this), userObj:user, from:from,callback:this.props.callback});
  }

  render () {
    let user = this.props.user;
    return (
      <TouchableOpacity style = {styles.PULUserItem} delayPressIn={100} onPress = {() => this.itemTouchedWithUser(user)}>
        <TouchableOpacity style = {styles.PULProfilePicContainer} delayPressIn={100} onPress={()=> this.itemTouchedWithUser(user)}><UProfileImage user = {user} imageStyle = {styles.PULProfileImage}/></TouchableOpacity>
        <UPLInfo user = {user}/>
      </TouchableOpacity>
    );
  }

  updateValues = (user) =>{
    // alert("in itemcell");
    this.props.updateValues(user);
  }
}

export class SelectionUserItemCell extends Component {
  constructor(props) {
    super(props);
    var u = this.props.user;
    if(u.selected == undefined){
      u["selected"] = false;
    }
    this.state = {user : u}
  }

  itemTouchedWithUser (user) {
    //alert("clicked");
    user.selected = !user.selected;
    this.setState(user:user);
    this.returnData(user);
  }
  itemTouched (user) {
    if(!user.name){
      Toast.show("Invalid user");return;
    }
    this.props.navigation.navigate('UserDetail', {userObj:user});
  }
  returnData(selectedUser) {
    this.props.returnData(selectedUser);
  }
  getUserProfileImage = (user) => {
    let selected = user.selected
    if (selected) {
      return (
        <View style = {styles.PULSelection}  >
            <UProfileImage user = {user} imageStyle = {styles.PULProfileImage}/>
            <Image style = {styles.PULChekMarkImage} source={require('../../assets/arrow_small.png')}/>
        </View>
      );
    }else{
      return (
        <View style = {styles.PULSelection}>
          <UProfileImage user = {user} imageStyle = {styles.PULProfileImage} />
        </View>
      );
    }
  }

  render () {
    let user = (this.state.user) ? this.state.user : this.props.user;
    return (
      <View style = {styles.PULUserItem}>
        <TouchableOpacity style = {styles.PULProfilePicContainer} delayPressIn={100} onPress = {() => this.itemTouchedWithUser(user)}>{this.getUserProfileImage(user)}</TouchableOpacity>
        <TouchableOpacity style={{flex:.7}} delayPressIn={100} onPress = {() => this.itemTouched(user)}>
          <UPLInfo user = {user}/>
        </TouchableOpacity>
      </View>
    );
  }
}

/*
This class is going to be responsible for loading filtering, listing Users.
Along with that if requested (in props) it will also allow:
   - Selecting Users (UI for which will be different from default)
   - Get in touch

   Props:
    1. searchTerm(strign)
    2. topSearched(boolean) :  if ebabled will discared all other filter and
       will only load top searched users
    3. allowSelecting(boolean) : If list needs to be allow selecting cell
    4. maxSelection(Integer) : clubbed with allowSelecting,  if 0 will allow
       unlimited selection else count of number passsed
    5. peformGetInTouch(boolean): If enabled cell will show get in touch button
       which will trigger getInTouch Action

  Note: If none of the props are given it will load top searched user's list
*/
var _offset = 0;
var _refreshing = true;
export class UserList extends Component<{}> {
    constructor(props) {
      super(props);
      let selected = (this.props.selectedUsers)?this.props.selectedUsers :[];

      this.state = {users : selected};
      //this.getThisUserAndRequest();
      //alert("User list refreshed");
      _offset = 0
    }

    componentWillReceiveProps(nextProps) {
      _offset = 0;
      //alert(nextProps.selectedUsers.length);
      if(nextProps.allowSelection == true && nextProps.selectedUsers.length>0 && nextProps.searchTerm.length<1){
        return;
      }
      else if(nextProps.fromShare != undefined && nextProps.fromShare){
        return;
      }
        _refreshing = true;
      this.loadUserWithUpdatedConditions(nextProps);
    }

    componentDidUpdate(prevProps, prevState) {

    }

    handleLoadMore = () => {
      if (this.props.topSearched == false && !this.props.fromShare) {//in case of top search only load 1 page
        _offset = this.state.users.length;
        this.loadUserWithUpdatedConditions(this.props);
      }
    }

    loadUserWithUpdatedConditions(props) {
      _refreshing = true;

      //console.log("props", props);
      let st = props.searchTerm;
      let ts = props.topSearched;
      let tu = props.thisUser;
      let ft = (props.ftag) ? props.ftag : "";
      this.loadUsers(st, ts, tu, ft);
    }

    loadUsers (searchTerm, topSearched, thisUser, ftag) {
    	let path = GLOBAL.WSResourcePath.users
    		         + "?user="+ thisUser._id
    			       + "&offset="+ _offset
                 + "&count="+GLOBAL.KConst.loadCount
    				     + "&sterm="+searchTerm
                 + "&top_searched="+topSearched;
      path += (ftag.length > 0) ? "&ftag="+ftag : "";
    	//console.log("UserList path = ", path);
      try{
    	fetch(path, {
    		method: 'GET',
    		headers: {
    			'Content-Type': 'application/json',
    			'Authorization' : 'JWT '+ thisUser.accessToken
    		}
    	}).then(response => response.json())
    		.then(response => {
          //alert(JSON.stringify(response))
    			//console.log("Loaded Users: ", response);
    			let success = response['success'];
    			let msg = response['msg'];
    			if(success){
    				let list = response['users'];
            _refreshing = false;
            if(_offset == 0) {
              //remove common entries
              this.setState({users:list});
            }else{
              var i=0, j=0;
              var newList=[];
              for(i=0;i<list.length;i++){
                var present=false;
                for(j=0;j<this.state.users.length;j++){
                  if(this.state.users[j]._id == list[i]._id){
                    present=true;break;
                  }
                }
                if(!present){
                  newList.push(list[i]);
                }
              }
              this.setState({users:[...this.state.users, ...newList]});
            }
    			}else{
          }
    	});
    }catch(error){
      //alert(error);
    }
    }
    returnData(selectedUser) {
      this.props.returnData(selectedUser);
    }
    updateValues(selectedUser) {
      var users = this.state.users;
      var i=0;
      for(i=0;i<users.length;i++){
        if(users[i]._id == selectedUser){
          users[i] = selectedUser;
          break;
        }
      }
      this.setState({users:users});
    _offset=0;
      this.loadUserWithUpdatedConditions(this.props);
    }
    getListItem = (user) => {
      if (this.props.allowSelection == true) {
        return (
          <SelectionUserItemCell
          from = {this.props.from}
          callback = {this.props.callback}
          navigation = {this.props.navigation}
          updateValues = {this.updateValues.bind(this)}
          returnData = {this.returnData.bind(this)}
          user = {user}/>
        );
      } else {
        return (
          <UserItemCell user = {user}
          from = {this.props.from}
          callback = {this.props.callback}
          updateValues = {this.updateValues.bind(this)}
          navigation = {this.props.navigation}/>
        );
      }
    }

    render () {
      if (this.state.users && this.state.users.length > 0) {
        return(
          <FlatList
              ref={(ref) => {this.flatListRef = ref;}}
              data = {this.state.users}
              keyExtractor={(item) => item._id}
              onEndReached = {this.handleLoadMore}
              renderItem = {
                ({item}) => <View>{this.getListItem(item)}</View>
              }
          />
        );
      }
      else {
        if (_refreshing) {
          return (<ActivityIndicator size="large" color="#000" style = {{padding : 20}}/>);
        }else{
          return (<View style={{flex:1,justifyContent:'center'}}><Text style={{textAlign:'center'}}> No records! </Text></View>);
        }
      }
    }
}

//Styling
//style related constants
const styles = StyleSheet.create({
  PULUserItem : {
    height : 100,
    flex : 1,
    margin : 5,
    flexDirection : 'row',
    borderWidth : 0.5,
    borderColor : '#aaa',
    borderRadius : 4,
  },
  PULInfoContainer : {
    flex : 0.7,
    alignItems : 'flex-start',
    justifyContent : 'space-around',
    padding : 5
  },

  PULName : {
    fontFamily: kApplicationFontRegular,
    fontSize : 16,
  },
  PULProfessionContainer : {
    flexDirection:'row',
  },
  PULProfessionIcon : {
    width:12,
    height:12,
    resizeMode:'contain',
  },
  PULProfession : {
    color : '#777',
    fontFamily: kApplicationFontSemibold,
    fontSize : 12,
    padding : 3
  },
  PULProfilePicContainer : {
    flex : 0.3,
    backgroundColor:'white',
    margin : 10,
    height:74,
    position:'relative',
    alignItems : 'center'
  },
  PULProfileImage : {
    width : 70,
    height : 70,
    borderRadius : 35,
    borderColor:'#ddd',
    borderWidth:1,
    position:'absolute',
    resizeMode:'cover',
  },
  PULSelection : {
    position:'relative',
    width : 74,
    height : 74,
    borderRadius : 37,
    borderColor : GLOBAL.COLOR.GREEN,
    alignItems : 'center',
    borderWidth : 2,
  },
  PULChekMarkImage : {
    position:'absolute',
    width : 70,
    height : 70,
    borderRadius : 35,
    resizeMode : "center",
  },
  PULSummeryContainer : {
    flexDirection:'row',
    flexWrap:"wrap"
  },
})
