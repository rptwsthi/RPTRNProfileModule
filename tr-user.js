import React, { Component } from 'react';
import {
  StyleSheet,   Text,   View,   Image,  ScrollView,  FlatList,RefreshControl,
  AsyncStorage, TouchableOpacity, Linking, ActivityIndicator,Platform,Alert
} from 'react-native';
import Search from 'react-native-search-box';
import Toast from 'react-native-simple-toast';
import NBEditIcon from 'react-native-vector-icons/Ionicons'; //Navigation bar edit Icon
import {CachedImage} from "react-native-img-cache";
const GLOBAL = require('../config/global');
import Swipeout from 'react-native-swipeout';
import ActionSheet from 'react-native-actionsheet';
import call from 'react-native-phone-call';
import Mailer from 'react-native-mail';
const regular =  Platform.select({
  ios: 'opensans',
  android: 'opensans_regular'
});

var imageArr = GLOBAL.KImageTypes;
var videoArr = GLOBAL.KVideoTypes;
var fileArr = GLOBAL.KDocumentTypes;
var lastRequestCompleted=true;
//User Container
export class UProfileImage extends Component <{}> {
  constructor (props) {
    super(props)
  }

  getUserProfileImagePath = (user) => {
    let imageStyle = (this.props.imageStyle) ? this.props.imageStyle : styles.UPImage;
    let media = user.media;
    if (media && media.length > 0) {
       console.log("media", media);
       let mediaName = media[0]["file_name"];
       let mediaPath = (GLOBAL.BASE_URL+'/uploads/'+mediaName)
       //return mediaPath;
       return(
         <View style={{position:'relative',width:70,height:70}}>
         <CachedImage style = {imageStyle} source={require('../../assets/placeholder.jpg')} mutable/>
         <CachedImage style = {imageStyle} source={{uri: mediaPath}} mutable/>
         </View>
       )
     }
     return(
       <View style={{position:'relative',width:70,height:70}}>
       <CachedImage style = {imageStyle} source={require('../../assets/placeholder.jpg')} mutable/>
       </View>
     )
     //return require('../../assets/cam_place.png');
    // let media = user.media;
    // if (media && media.length > 0) {
    //    console.log("media", media);
    //    let mediaName = media[0]["file_name"];
    //    let mediaPath = (GLOBAL.BASE_URL+'/uploads/'+mediaName)
    //    return mediaPath;
    //  }
    //  return require('../../assets/cam_place.png');
  }

  render() {
    //let mediaPath = this.getUserProfileImagePath(this.props.user);
    let containerStyle = (this.props.containerStyle) ? this.props.containerStyle : styles.UPImageContainer;
    //let imageStyle = (this.props.imageStyle) ? this.props.imageStyle : styles.UPImage;
    return (
      <View>
        {this.getUserProfileImagePath(this.props.user)}
      </View>
    );
  }
}

export class UFullName extends Text {
  render() {
    let n = this.props.fullName.toUpperCase();
    return (
      <Text style = {styles.UPName}>{n}</Text>
    )
  }
}
export class UProfession extends Text {
  render() {
    let p = this.props.profession;
    return (
      <View style = {styles.UPProfessionContainer}>
        <CachedImage style = {styles.UPProfessionIcon} source={require('../../assets/profession.png')}/>
        <Text style = {styles.UPProfession}>{p}</Text>
      </View>
    )
  }
}
export class UAddress extends Text {
  render() {
    let address = this.props.location.city;
    return (
        <Text style = {styles.UPAddress}>{address}</Text>
    )
  }
}

export class USkill extends Component {
  skillPressed (skill,from) {
    // alert("Pressed: " + from)
    if(from && from == "taglist" && this.props.callback){
      this.props.callback(skill);
      this.props.navigation.goBack();
    }
    else{
      this.props.navigation.navigate('TagSearchedUserList', {ftag:skill, from:from});
    }
  }

  render() {
    let s = this.props.skill;
    let from = this.props.from;
    return (
      <TouchableOpacity style = {styles.UPSkillWrapper} onPress = {() => this.skillPressed(s,from)}>
        <Text style = {styles.UPSkillTag}>{s}</Text>
      </TouchableOpacity>
    );
  }
}
export class USkillContainer extends Component {
  render() {
    let sNames = this.props.skills;
    var skills = [];
    for (var i = 0; i < sNames.length; i++) {
        let s = sNames[i];
        skills.push(<USkill from = {this.props.from} callback = {this.props.callback} skill = {s} key = {i} navigation = {this.props.navigation}/>);
    }

    return (
      <View style = {styles.UPSkillContainer}>
        {skills}
      </View>
    )
  }
}

export class UDescription extends Component {
  render() {
    let d = this.props.description;
    return (
        <Text style = {styles.UPDescription}>{d}</Text>
    );
  }
}

const CANCEL_INDEX = 0
const DESTRUCTIVE_INDEX = 4
const options = [ 'Cancel', 'Mail', 'Call']
const title = 'Select'
export class GreenButton extends TouchableOpacity {
    constructor(props) {
      super(props)
      this.state = {
        selected: ''
      }
      this.handlePress = this.handlePress.bind(this)
      this.showActionSheet = this.showActionSheet.bind(this)
    }
    showActionSheet = () =>{
        this.ActionSheet.show()
    }
    handleEmail = (user) => {
      // alert(Mailer);return;
   Mailer.mail({
     subject: 'Thoughtrage',
     recipients: [user.email],
     body: "",
     isHTML: true,
     // attachment: {
     //   path: '',  // The absolute path of the file from which to read data.
     //   type: '',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
     //   name: '',   // Optional: Custom filename for attachment
     // }
   }, (error, event) => {
     // Alert.alert(
     //   error,
     //   event,
     //   [
     //     {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
     //     {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
     //   ],
     //   { cancelable: true }
     // )
   });
 }
    handlePress(i) {
      let user = this.props.user;
        this.setState({
          selected: i
        })
        if(i==1){
          //mail
          // alert("Mail");
          this.handleEmail(user);
        }
        else if(i==2){
          // alert("call");
          const args = {
            number: user.mobile, // String value with the number to call
            prompt: true // Optional boolean property. Determines if the user should be prompt prior to the call
          }
          call(args).catch(console.error)
        }
      }
    confirmToGetInTouch = (user,self) =>{
      if(this.props.flag){
        this.showActionSheet();
      }else{
          Alert.alert(
          'Thoughtrage',
          'By doing this your contact details will be shared with this user. Are you sure you want to proceed?',
          [
            {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'Yes', onPress: () => this.getInTouch(user,self)},
          ],
          { cancelable: false }
          )
      }
    }

    getInTouch = (user,self) =>{
      var accessToken = (user.accessToken) ? user.accessToken : self.accessToken;
      // alert(self.accessToken);
      // return
      try {
        let path = GLOBAL.WSResourcePath.users
                   + "/"+ user._id
                   + '/get_in_touch';
        console.log(path);
        console.log('UVC 1: '+path +" ThisUserId" + self._id, "accessToken = ",  user.accessToken);
        fetch(path, {
             method: 'POST',
             headers: {
             'Content-Type': 'application/json',
             'Authorization' : 'JWT '+ accessToken
           },
           body: JSON.stringify({
             user: self._id
           })
         })
         .then(response => response.json())
         .then(response => {
               console.log("UVC Final Response: ", response);
               let success = response['success'];
               let msg = response['msg'];
               if(!success){
                 //alert(msg);
                 Toast.show(msg);
               }else{
                 Toast.show(msg);
                  //alert(msg);
               }
          })
      } catch (e) {
        //alert(e);
        Toast.show(e);
        console.log("Update Visit error: ", e);
      }
    }
    render() {

      let t = (this.props.flag) ? "Contact" :this.props.title;
      let user = this.props.user;
      let self = this.props.self;
      // alert(self.accessToken);
      return (
        <View>
          <TouchableOpacity style = {styles.GreenButtonContainer} onPress={()=>this.confirmToGetInTouch(user,self)}>
            <Text style = {styles.GreenButton}>{t}</Text>
          </TouchableOpacity>
          <ActionSheet
          ref={o => this.ActionSheet = o}
          title={title}
          options={options}
          cancelButtonIndex={CANCEL_INDEX}
          onPress={this.handlePress}
        />
        </View>
      );
    }
}
export class GetInTouchButton extends GreenButton {}

//Social Links
export class SocialLinkButton extends Component {
  socialLinkClicked (link) {
    try {Linking.openURL(link);}
    catch (e) {console.error('An error occurred', err);}
    finally {}
  }

  render () {
    let bgColor = this.props.bgColor;
    let imagePath = this.props.imagePath;
    let link = this.props.link;
    return (
      <TouchableOpacity
        style = {styles.UPSocialLinkButton}
        backgroundColor = {bgColor}
        onPress = {() => this.socialLinkClicked(link)}>
        <CachedImage style = {styles.UPSocialLinkImage} source = {imagePath} mutable/>
      </TouchableOpacity>
    );
  }
}
/*
socials:
 [ { Facebook: { link: 'https://www.facebook.com/sume.ishtiaq.9', status: '0' } },
   { Twitter: { link: '', status: '0' } },
   { Linkedln: { link: '', status: '0' } } ],
*/
export class USocialLinkContainer extends Component {
  render () {
    let socialLinks = this.props.socials;
    var links = [];
    for (var i = 0; i < socialLinks.length; i++) {
        if (socialLinks[i].Facebook) {
          if (socialLinks[i].Facebook.link) {
            let l = socialLinks[i].Facebook.link;
            links.push(<SocialLinkButton imagePath = {require('../../assets/step_fb.png')} link = {l} key = {i}/>);
          }
        }
        if (socialLinks[i].Twitter) {
          if (socialLinks[i].Twitter.link) {
            let l = socialLinks[i].Twitter.link;
            links.push(<SocialLinkButton imagePath = {require('../../assets/step_twitter.png')} link = {l}/>);
          }
        }
        if (socialLinks[i].Linkedln) {
          if (socialLinks[i].Linkedln.link) {
            let l = socialLinks[i].Linkedln.link;
            links.push(<SocialLinkButton imagePath = {require('../../assets/step_linkedin.png')} link = {l}/>);
          }
        }
    }

    return (
      <View style = {styles.UPSocialLinkContainer}>{links}</View>
    );
  }
}

//..
export class UInformationContainer extends Component {
  constructor (props) {
    super(props)
    this.handleProfileTouch = this.handleProfileTouch.bind(this);
  }

  handleProfileTouch(user) {
    console.log("Touched Profile: "+user);
  }

  showGetInTouch =(user) =>{
    try {
      AsyncStorage.getItem('user', (err, result) => {
        var userObj = JSON.parse(result);
        if(userObj["_id"] != user._id){
          return(
            <GreenButton title = {"Get In Touch"} user = {user} />
          )
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    let user = this.props.userObj
    let mediaName = user["media"][0]["file_name"]
    console.log(user);
    return (
        <View style = {styles.UInfoContainer}>
          <UProfileImage user = {user} onPress = {() => this.handleProfileTouch(user)}/>
          <UFullName fullName = {user["name"]}/>
          <UProfession profession = {user.profession}/>
          <UAddress location = {user.location}/>
          <USkillContainer skills = {user.skills} navigation = {this.props.navigation}/>
          <UDescription description = {user.description}/>
          {this.showGetInTouch(user)}
          <USocialLinkContainer socials = {user.socials}/>
        </View>
    );
  }
}

//IDEA CONTAINER
export class LinedHeader extends Component {
  render() {
    let title = this.props.title;
    return (
      <View style = {{flexDirection:'row'}}>
        <View style = {{backgroundColor:'#ccc', height:1, marginTop:10, flex:0.35}}/>
        <Text style = {{fontSize:16, color:'#686669', backgroundColor:'white', marginTop:0, textAlign:'center', flex:0.35}}>{title}</Text>
        <View style = {{backgroundColor:'#ccc', height:1, marginTop:10, flex:0.35}}/>
      </View>
    );
  }
}

export class UDIdeaItem extends Component {
  constructor (props) {
    super(props)
  }

  getMediaUri = (idea) => {
  	if(idea.media.length > 0) {
  		var mediaName = idea.media[0]["file_name"];
  		var extension = mediaName.substring(mediaName.lastIndexOf('.')+1, mediaName.length);
      if(GLOBAL.KVideoTypes.indexOf(extension.toLowerCase()) < 1){
        var i=1;
        for(i=1;i<idea.media.length; i++){
          var name = idea.media[i]["file_name"];
      		var ex = name.substring(name.lastIndexOf('.')+1, name.length);
          if(GLOBAL.KVideoTypes.indexOf(ex.toLowerCase()) > -1){
             mediaName = name;//idea.media[0]["file_name"];
        		 extension = ex;//mediaName.substring(mediaName.lastIndexOf('.')+1, mediaName.length);
             break;
          }
        }
      }
  		if(imageArr.indexOf(extension.toLowerCase()) > -1){
  			return (<CachedImage source = {{uri:GLOBAL.BASE_URL+'/uploads/'+idea.media[0]["file_name"]}}
        style = {styles.UDPIdeaImage} mutable/>)
  		}else if(GLOBAL.KVideoTypes.indexOf(extension.toLowerCase()) > -1){
  			return (
          <View style={styles.UDPIdeaVideo}>
          <CachedImage source={require('../../assets/small_play.png')} style = {{resizeMode:'contain',width:30,height:30}}/>
          </View>
        )
  		}else if(GLOBAL.KDocumentTypes.indexOf(extension.toLowerCase()) > -1){
  			return (
          <View style={styles.UDPIdeaFile}>
          <CachedImage source={require('../../assets/file_attachment.png')} style = {{resizeMode:'contain',width:30,height:30}}/>
          </View>
      );
  		}
  	}
  }

  userIdeaPresssed(idea) {
    //alert("abc");
    //this.props.navigationProp.navigate('FeedDetail', {detail:idea});
    this.props.navigationProp.navigate('FeedDetail', {updateValues: this.updateValues.bind(this), detail:idea});
  }
  updateValues = (item) => {
    //alert("hey");
    this.props.updateValues(item);
    //var arr = this.state.ideas;
    //arr[index] = item;
    // var i=0;
    // for(i=0;i<arr.length;i++){
    //   if(arr[i]._id == item._id){
    //     arr[i] = item;
    //     break;
    //   }
    // }
    // this.setState({ideas:arr});
  }

  render() {
    let idea = this.props.idea;
    return (
        <TouchableOpacity style = {styles.UDPIdeaItem} onPress = {() => this.userIdeaPresssed(idea)}>{this.getMediaUri(idea)}</TouchableOpacity>
    );
  }
}

//SUMMERY
export class ImagedText extends Component {
  render() {
    let i = this.props.image;
    let t = this.props.text;

    let iconStyle = (this.props.iconStyle) ? this.props.iconStyle : styles.PImagedTextIcon;
    let textStyle = (this.props.textStyle) ? this.props.textStyle : styles.PImagedText;
    return (
      <View style = {styles.PImagedTextWrapper}>
        <CachedImage style = {iconStyle} source={i} mutable/>
        <Text style = {textStyle}>{t}</Text>
      </View>
    )
  }
}

export class ImagedTextContainer extends Component {
  render() {
    let itArray = this.props.itArray;
    var itViews = [];
    for (var i = 0; i < itArray.length; i++) {
        let s = itArray[i];
        itViews.push(<ImagedText image = {s.image} text = {s.text} key = {s.key} iconStyle = {styles.PImagedTextIcon} textStyle = {styles.PImagedText}/>);
    }
    return (
        <View style = {styles.PImagedTextContainer}>{itViews}</View>
    )
  }
}
var take;
export class MyIdeaItem extends UDIdeaItem {

  constructor (props) {
    super(props);
  }

  onEdit = () =>{
    // alert("edit");
    let idea = this.props.idea;
    var clone = JSON.parse(JSON.stringify(idea));//Object.assign({}, this.state.detail);
      this.props.navigationProp.navigate('PostStep1', {detail:clone,screen:'MyIdeas',handleRefresh:this.props.handleRefresh});
  }

  // onDelete = () =>{
  //   alert("delete");
  // }

  confirmToDelete = () =>{

    Alert.alert(
    'Thoughtrage',
    'Are you sure you want to delete this idea?',
    [
      {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      {text: 'Yes', onPress: () => this.onDelete()},
    ],
    { cancelable: false }
    )
  }

  onDelete =() => {
    let idea = this.props.idea;
    this.props.performDelete(idea);
    let user = this.props.user;
    user.aggregateIdea = user.aggregateIdea -1;
    AsyncStorage.setItem('user',JSON.stringify(user));
    let token = user.accessToken;
    take.deleteNotificationForIdea(idea);
    var path = GLOBAL.WSResourcePath.ideas + "/idea/"+idea._id;
    try{
    fetch(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : 'JWT '+token
    },
    body: JSON.stringify({
      user: user["_id"],
    })
  }).then(response => response.json())
  .then(response => {
    // this.setState({visible:false});
    let success = response['success'];
    //alert(success);
    let msg = response['msg'];
    if(!success){
      //let message = response['errors']['password']['msg'];
      //alert(msg);
      Toast.show(msg);
    }
    else{
      Toast.show("Idea deleted successfully!");
      // if(this.props.navigation.state.params.updateValuesAfterDel){
      //   this.props.navigation.state.params.updateValuesAfterDel(this.state.detail);
      // }
      // this.props.navigation.goBack();
    }
  })
  } catch (error) {
    //alert(error);
    // Toast.show(error);
    // this.setState({visible:false});
  }
}
deleteNotificationForIdea = (idea) => {
  AsyncStorage.getItem('notifications', (err, result) => {
    if(result != null && result != undefined){
      try{
      var list = JSON.parse(result);
      take.performLocalDeletion(list,idea);
      // console.log("length = "+list.length);
    }catch(err){
      console.log(err);
    }
    }
  });
}
performLocalDeletion = (list,idea) => {
  var i=0;
  var newArr=[];
  for(i=0;i<list.length;i++){
    if(list[i].enity_id != idea._id){
      newArr.push(list[i]);
    }
  }
  AsyncStorage.setItem('notifications',JSON.stringify(newArr));
}
  getMediaItem = (idea) => {
  	if(idea.media.length > 0) {
  		var mediaName = idea.media[0]["file_name"];
  		var extension = mediaName.substring(mediaName.lastIndexOf('.')+1, mediaName.length);
      if(GLOBAL.KVideoTypes.indexOf(extension.toLowerCase()) < 1){
        var i=1;
        for(i=1;i<idea.media.length; i++){
          var name = idea.media[i]["file_name"];
      		var ex = name.substring(name.lastIndexOf('.')+1, name.length);
          if(GLOBAL.KVideoTypes.indexOf(ex.toLowerCase()) > -1){
             mediaName = name;//idea.media[0]["file_name"];
        		 extension = ex;//mediaName.substring(mediaName.lastIndexOf('.')+1, mediaName.length);
             break;
          }
        }
      }
  		if(GLOBAL.KImageTypes.indexOf(extension.toLowerCase()) > -1){
        //console.log(GLOBAL.BASE_URL+'/uploads/'+idea.media[0]["file_name"]);
  			return (
          <CachedImage source = {{uri:GLOBAL.BASE_URL+'/uploads/'+idea.media[0]["file_name"]}}
        style = {styles.PMyIdeaImage} mutable/>
      )
  		}else if(GLOBAL.KVideoTypes.indexOf(extension.toLowerCase()) > -1){
  			return (
          <View style={styles.UDPIdeaVideo}>
          <CachedImage source={require('../../assets/small_play.png')} style = {{resizeMode:'contain',width:30,height:30}}/>
          </View>
      )
  		}else if(GLOBAL.KDocumentTypes.indexOf(extension.toLowerCase()) > -1){
  			return (
          <View style={styles.UDPIdeaFile}>
          <CachedImage source={require('../../assets/file_attachment.png')} style = {{resizeMode:'contain',width:30,height:30}}/>
          </View>
      );
  		}
  	}
  }

  userIdeaPresssed(idea) {
    //this.props.navigationProp.navigate('FeedDetail', {detail:idea});
    this.props.navigationProp.navigate('FeedDetail', {updateValues: this.updateValues.bind(this), detail:idea});

  }
  updateValues = (idea) =>{
    this.props.updateValues(idea);
  }
  render() {
    take=this;
    //alert(this.props.idea.like.length);
    var disabled = (this.props.disabled) ;//? this.props.disabled : true;
    let idea = this.props.idea;
    let itArray = [
      {image:require('../../assets/attachment.png'), text:(idea.media) ? idea.media.length : '0', key:'attachments'},
      {image:require('../../assets/comment.png'), text:(idea.totalComment) ? idea.totalComment : '0', key:'comments'},
      {image:require('../../assets/like_small.png'), text:(idea.like) ? idea.like.length : '0', key:'likes'}
    ];
    var swipeSettings = {
      autoClose : true,
      disabled : this.props.disabled,
      backgroundColor :"#ffffff",
      right : [
        {
          text: 'Edit',
          backgroundColor :'#FA4B5A',
          onPress : take.onEdit.bind(take)
        },
        {
          text: 'Delete',
          backgroundColor :'#f8192c',
          onPress : take.confirmToDelete.bind(take)
        }
      ]
    }
    return (
      <Swipeout {...swipeSettings}>
        <TouchableOpacity style = {styles.PMyIdeaWrapper} onPress = {() => this.userIdeaPresssed(idea)}>
          <View style = {styles.PMyIdeaInfoContainer}>
            <Text style = {styles.PMyIdeaTitle} numberOfLines = {2}>{idea.title}</Text>
            <Text style = {styles.PMyIdeaDescription} numberOfLines = {2}>{idea.description}</Text>
            <ImagedTextContainer itArray = {itArray}/>
          </View>
          <View style = {styles.PMyIdeaMedia}>{this.getMediaItem(idea)}</View>
        </TouchableOpacity>
        </Swipeout>
    );
  }
}

var _listKey = 0;
var _thisUser = {};
var _offset = 0;
var _refreshing = true;
var _allowOptionInList = false;
export class UIdeaList extends Component {
  constructor (props) {
    super(props)
    _allowOptionInList=false;
    this.state = {ideas:[],from:'',refreshing:false};
    _listKey = 0;
    _offset = 0;
    _refreshing = true;

    //_thisUser = this.props.navigation.state.params.userObj;
    this.getThisUserAndLoadIdeas('user');
  }
  componentWillMount(){
    this.setState({ideas:[]});
  }
  getThisUserAndLoadIdeas(key) {
    try {
       AsyncStorage.getItem(key, (err, result) => {
         var u = JSON.parse(result);
        AsyncStorage.getItem('token', (err, result) => {
          u['accessToken'] = result;
          _thisUser = u;
          //_thisUser['accessToken'] = result;
          this.getIdeas();
        })
      });
    } catch (error) {
      console.log(error);
    }
  }

  handleLoadMore = () => {
    if(lastRequestCompleted){
      lastRequestCompleted=false;
      _offset = this.state.ideas.length;
      this.getIdeas();
    }
  }

  handleRefresh = () => {
    _listKey = 0;
    _offset = 0;
    _refreshing = true;
    if(lastRequestCompleted){
      lastRequestCompleted = false;
        this.getIdeas();
    }
  }

  getIdeas = () => {
    this.setState({from:this.props.from})
    if(this.props.user && this.props.user.name) {
      if(this.props.user._id == _thisUser._id){
        _allowOptionInList = true;
      }
    }else{
      _allowOptionInList = true;
    }
    let user = (this.props.user && this.props.user.name) ? this.props.user : _thisUser;
    // alert(_thisUser._id +"==" + user._id);
  	let path = GLOBAL.WSResourcePath.ideas
  		         + "/ideas?user="+ _thisUser._id
  			       + "&offset="+ _offset
  				     + "&count="+GLOBAL.KConst.loadCount
  				     + "&fcreator="+user._id;
  	console.log("User Detail, Idea Path = ", path);
  	fetch(path, {
  		method: 'GET',
  		headers: {
  			'Content-Type': 'application/json',
  			'Authorization' : 'JWT '+ _thisUser.accessToken
  		}
  	}).then(response => response.json())
  		.then(response => {
        lastRequestCompleted = true;
  			console.log("loded ideas: ", response);
  			let success = response['success'];
  			let msg = response['msg'];
  			if(success){
  				let list = response['ideas'];
          _refreshing = false;
          this.setState({refreshing:false})
            if(list.length <1){
              return;
            }
          if(_offset == 0) {
            this.scrollToIndex();
            this.setState({ideas:list});
          }else{
            var allItems = this.state.ideas;
            // var i=0;
            // for()
            this.setState({ideas: [...this.state.ideas, ...list]});
          }
  			}else{
        }
  	});
  }

  scrollToIndex = () => {
     if(this.state.ideas.length > 0){
       this.flatListRef.scrollToIndex({animated: false, index: 0});
     }
  }

  onDetail = (item) => {
    //alert('onDetail callled');
    var i = 0;
    for(i=0;i<item.media.length;i++){
      item.media[i]["key"] =i;
    }
    //this.updateValues(item);
    //this.props.navigation.navigate('FeedDetail', {detail:item});
    this.props.navigation.navigate('FeedDetail', {updateValues: this.updateValues.bind(this),updateValuesAfterDel:this.updateValuesAfterDel.bind(this), detail:item});

  };
  updateValuesAfterDel = (item) => {
    if(_offset > 0){
      _offset = _offset-1;
    }
    var arr = this.state.ideas;
    var newArr =[];
    //arr[index] = item;
    var i=0;
    for(i=0;i<arr.length;i++){
      if(arr[i]._id != item._id){
        newArr.push(arr[i]);
      }
    }
    this.setState({ideas:newArr});
  }
  getViewFor = (requester, item) => {
    //alert(item.like.length)
    if (requester == GLOBAL.KIdeaListRequester.userDetail) {
      return (<UDIdeaItem updateValues= {this.updateValues.bind(this)} idea = {item} onPress={() => this.onDetail(item)}
              navigationProp = {this.props.navigationProp}/>);
    }else if (requester == GLOBAL.KIdeaListRequester.myIdeaWall) {
      return (<MyIdeaItem updateValues= {this.updateValues.bind(this)} user={_thisUser} handleRefresh={this.handleRefresh.bind(this)} performDelete = {this.performDelete.bind(this)} disabled={!_allowOptionInList} idea = {item} onPress={() => this.onDetail(item)}
              navigationProp = {this.props.navigationProp}/>);
    }
  }
  updateValues = (item) => {
    //alert("hey");
    let user = (this.props.user && this.props.user.name) ? this.props.user : _thisUser;
    var aggregateAppreciation = user.aggregateAppreciation;
    var arr = this.state.ideas;
    var i=0;
    for(i=0;i<arr.length;i++){
      if(arr[i]._id == item._id){
        if(arr[i].like.length > item.like.length){
          aggregateAppreciation = aggregateAppreciation -1;
        }else{
          aggregateAppreciation = aggregateAppreciation + 1;
        }
        arr[i] = item;
        break;
      }
    }
    this.setState({ideas:arr});
    _offset = 0;
    this.getIdeas();
    //alert(this.state.ideas[0].like.length);
    this.props.updateValues(aggregateAppreciation);
  }
  performDelete = (idea)=>{
    var newArr = [];
    var i=0;
    for(i=0;i<this.state.ideas.length;i++){
      if(idea._id != this.state.ideas[i]._id){
        newArr.push(this.state.ideas[i]);
      }
    }
    this.setState({ideas:newArr});
  }
  render() {

    let horizontal = (this.props.horizontal) ? this.props.horizontal : false;
    let requester = (this.props.requester)
    ? this.props.requester
    : GLOBAL.KIdeaListRequester.userDetail;//giving respect to this class
    if (this.state.ideas && this.state.ideas.length > 0) {
      //alert("oo");
      return (
          <View style = {{flex:1, backgroundColor:'white'}}>
            <FlatList
                horizontal = {horizontal}
                ref={(ref) => { this.flatListRef = ref; }}
                data = {this.state.ideas}
                onEndReached = {this.handleLoadMore}
                refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.handleRefresh()}
                  />
                }
                keyExtractor={(item) => item._id}
                renderItem = {
                  ({item}) =>
                    <View>{this.getViewFor(requester, item)}</View>
                }
            />
          </View>
      );
    }else {
      if (_refreshing) {
        return (<ActivityIndicator size="large" color="#000" style = {{padding : 20}}/>);
      }else{
        return (<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:regular,color:'#686669',marginTop:15}}> No ideas added! </Text></View>);
      }
    }
  }
}

export class SearchIdeaList extends Component {
  constructor (props) {
    super(props)
    this.state = {ideas:[]};
    _listKey = 0;
    _offset = 0;
    _refreshing = true;
    //_thisUser = this.props.navigation.state.params.userObj;
    this.getThisUserAndLoadIdeas('user');
  }

  getThisUserAndLoadIdeas(key) {
    try {
       AsyncStorage.getItem(key, (err, result) => {
         var u = JSON.parse(result);
        AsyncStorage.getItem('token', (err, result) => {
          u['accessToken'] = result;
          _thisUser = u;
          //_thisUser['accessToken'] = result;
          this.getIdeas();
        })
      });
    } catch (error) {
      console.log(error);
    }
  }

  handleLoadMore = () => {
    if(lastRequestCompleted){
      lastRequestCompleted=false;
      _offset = this.state.ideas.length;
      this.getIdeas();
    }
  }

  handleRefresh = () => {
    _listKey = 0;
    _offset = 0;
    _refreshing = true;
    this.getIdeas();
  }

  getIdeas = () => {
    let user = (this.props.user && this.props.user.name) ? this.props.user : _thisUser;
    let cat = (this.props.cat) ? this.props.cat : "";
    //alert(user.name);
  	let path = GLOBAL.WSResourcePath.ideas
  		         + "/ideas?user="+ _thisUser._id
  			       + "&offset="+ _offset
  				     + "&count="+GLOBAL.KConst.loadCount
               + "&fcategory="+cat
  				     //+ "&fcreator="+user._id;
  	console.log("User Detail, Idea Path = ", path);
  	fetch(path, {
  		method: 'GET',
  		headers: {
  			'Content-Type': 'application/json',
  			'Authorization' : 'JWT '+ _thisUser.accessToken
  		}
  	}).then(response => response.json())
  		.then(response => {
        lastRequestCompleted = true;
  			console.log("loded ideas: ", response);
  			let success = response['success'];
  			let msg = response['msg'];
  			if(success){
  				let list = response['ideas'];
          _refreshing = false;
          if(_offset == 0) {
            this.scrollToIndex();
            this.setState({ideas:list});
          }else{
            this.setState({ideas: [...this.state.ideas, ...list]});
          }
  			}else{
        }
  	});
  }

  scrollToIndex = () => {
     if(this.state.ideas.length > 0){
       this.flatListRef.scrollToIndex({animated: false, index: 0});
     }
  }
  updateValues = (item) => {
    //alert("hey");
    let user = (this.props.user && this.props.user.name) ? this.props.user : _thisUser;
    var aggregateAppreciation = user.aggregateAppreciation;
    var arr = this.state.ideas;
    var i=0;
    for(i=0;i<arr.length;i++){
      if(arr[i]._id == item._id){
        if(arr[i].like.length > item.like.length){
          aggregateAppreciation = aggregateAppreciation -1;
        }else{
          aggregateAppreciation = aggregateAppreciation + 1;
        }
        arr[i] = item;
        break;
      }
    }
    this.setState({ideas:arr});
    this.handleRefresh();
    //alert(this.state.ideas[0].like.length);
    //this.props.updateValues(aggregateAppreciation);
  }
  onDetail = (item) => {
    // alert('onDetail callled');
    var i = 0;
    for(i=0;i<item.media.length;i++){
      item.media[i]["key"] =i;
    }
    //this.props.navigation.navigate('FeedDetail', {detail:item});
    this.props.navigation.navigate('FeedDetail', {updateValues: this.updateValues.bind(this), detail:item});
  }

  getViewFor = (requester, item) => {
    //alert(item.like.length);
    if (requester == GLOBAL.KIdeaListRequester.userDetail) {
      return (<UDIdeaItem updateValues= {this.updateValues.bind(this)} idea = {item} onPress={() => this.onDetail(item)}
              navigationProp = {this.props.navigationProp}/>);
    }else if (requester == GLOBAL.KIdeaListRequester.myIdeaWall) {
      return (<MyIdeaItem updateValues= {this.updateValues.bind(this)} disabled={true} idea = {item} onPress={() => this.onDetail(item)}
              navigationProp = {this.props.navigationProp}/>);
    }
  }

  render() {
    let horizontal = (this.props.horizontal) ? this.props.horizontal : false;
    let requester = (this.props.requester)
    ? this.props.requester
    : GLOBAL.KIdeaListRequester.userDetail;//giving respect to this class
    if (this.state.ideas && this.state.ideas.length > 0) {
      //alert("oo")
      return (
          <View style = {{flex:1, backgroundColor:'white'}}>
            <FlatList
                horizontal = {horizontal}
                ref={(ref) => { this.flatListRef = ref; }}
                data = {this.state.ideas}
                onEndReached = {this.handleLoadMore}
                keyExtractor={(item) => item._id}
                renderItem = {
                  ({item}) =>
                    <View>{this.getViewFor(requester, item)}</View>
                }
            />
          </View>
      );
    }else {
      if (_refreshing) {
        return (<ActivityIndicator size="large" color="#000" style = {{padding : 20}}/>);
      }else{
        return (<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:regular,color:'#686669',marginTop:15}}> No ideas added! </Text></View>);
      }
    }
  }
}

export class UMyProjectContainer extends Component {
  constructor (props) {
    super(props)
  }

  render() {
    let user = this.props.user;
    return (
        <View style = {styles.UIdeaContainer}>
          <LinedHeader title = {"MY PROJECTS"}/>
          <UIdeaList updateValues= {this.updateValues.bind(this)} user = {user} horizontal = {true} requester = {GLOBAL.KIdeaListRequester.userDetail}
          navigationProp = {this.props.navigationProp}/>
        </View>
    );
  }
  updateValues = (appreaciatons) =>{
    //alert(appreaciatons)
    this.props.updateValues(appreaciatons);
  }
}

//SUMMERY
export class SummeryBox extends Component {
  render() {
    let number = this.props.number;
    let title = this.props.title;
    return (
      <View style={styles.SummeryBox}>
        <Text style = {{fontSize : 28, fontFamily: "opensans-semibold",}}>{number}</Text>
        <Text style = {{fontSize : 15, color:'#aaa', fontFamily: "opensans"}}>{title}</Text>
      </View>
    );
  }
}

var self={}
export class USummeryContainer extends Component {
  componentWillMount = () => {
    AsyncStorage.getItem('user', (err, result) => {
      self = JSON.parse(result);
    })
  }
  render() {
    let user = this.props.user;
    let myideaUser = (self._id == user._id) ? self : user
    let totalAppretiations = (user.aggregateAppreciation) ? user.aggregateAppreciation : 0;
    let totalIdeas = (myideaUser.aggregateIdea) ? myideaUser.aggregateIdea : 0;
    return (
      <View style={styles.UPSummeryContainer}>
        <View style={{height:1, backgroundColor:'#bbb'}}/>
        <View style = {styles.UPSummeryWrapper}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('OtherIdeas', {user:myideaUser,from:'profile'})}>
            <SummeryBox number={totalIdeas} title={'Ideas Posted'}/>
          </TouchableOpacity>
          <SummeryBox number={totalAppretiations} title={'Appreciation'}/>

        </View>
      </View>
    );
  }
}

//Main
export class UserDetail2 extends Component<{}> {
    constructor(props) {
      super(props);
    }

    render () {
      let user = this.props.navigation.state.params.userObj;
      return(
        <View style={styles.URootContainer}>
          <ScrollView style = {styles.UScrollableContainer}>
            <UInformationContainer userObj = {user}/>
            <UMyProjectContainer user={user} navigationProp = {this.props.navigation} />
          </ScrollView>
          <USummeryContainer user = {user}/>
        </View>
      );
    }
}

onUserDetail = (user) => {
  this.props.navigation.navigate('UserDetail', {userObj:user});
};

export class EditProfileButton extends Component {
  constructor(props) {
    super(props);
    this.state = {thisUser : {}};
    this.getThisUserShowEdit();
  }

  onEditTouch (user) {
    console.log("editButton Touched", user.name);
    this.props.navigation.navigate("Step1", {userObj:user});
  }

  getThisUserShowEdit() {
    try {
      AsyncStorage.getItem("user", (err, result) => {
        var u = JSON.parse(result);
        console.log("this u ->", u);
        this.setState ({thisUser : u});
      });
    } catch (error) {
      console.log(error);
    }
  }

  render () {
    let user = this.props.user;
    console.log("EditProfileButton:-> ", user, this.state.thisUser);
    if (this.state.thisUser) {
      console.log("EditProfileButton:-> ", user, this.state.thisUser);
      if (user._id == this.state.thisUser._id) {
        return (
          <TouchableOpacity onPress = {() => this.onEditTouch(user)}>
            <Image source={require('../../assets/edit.png')} style = {{resizeMode:'contain', marginRight:5, height:32, width:32}}/>
          </TouchableOpacity>
        );
      }
    }
    return (<View />);
  }
}

var selfUser={}
var flag = ""
export default class UserDetail extends Component<{}> {
    constructor(props) {
      super(props);
      flag = (this.props.navigation.state.params.flag)?this.props.navigation.state.params.flag:"";
      this.state ={userObj:{},self:{},updatedUser:{}};
      //
      // this.getThisUserAndUpdateVisitCount('user')
    }
    componentWillMount(){
      this.getThisUserAndUpdateVisitCount('user');
    }
    getThisUserAndUpdateVisitCount(key) {
      try {
        AsyncStorage.getItem(key, (err, result) => {
          // alert(result);
          var u = JSON.parse(result);
          this.setState({self:u});
          AsyncStorage.getItem('token', (err, result) => {
            u['accessToken'] = result;
            selfUser = u;
            // alert(" in asynv"+ JSON.stringify(u));
            this.setState({self:u});
            this.updateVisitCount(u);
            if(this.props.navigation.state.params.userObj._id == u._id){
              // alert("i")
              this.setState({userObj:selfUser})
              this.updateProfileInBackground(u);
            }
          })
        });
      } catch (error) {
        console.log(error);
      }
    }

    updateProfileInBackground =(thisUser) =>{
      let user = this.props.navigation.state.params.userObj ;
      try {
        let path = GLOBAL.WSResourcePath.users
                   + "/profile/"+ user._id;
                   // + '/user_visite';
        // alert('UVC 1: '+path +" ThisUserId" + thisUser._id, "accessToken = ",  thisUser.accessToken);
        fetch(path, {
             method: 'GET',
             headers: {
             'Content-Type': 'application/json',
             'Authorization' : 'JWT '+ thisUser.accessToken
           }
         })
         .then(response => response.json())
         .then(response => {
              // alert(JSON.stringify(response));
               console.log("UVC Final Response: ", response);
               let success = response['success'];
               let msg = response['msg'];
               if(!success){
                 //alert(msg);
                 Toast.show(msg);
               }else{
                 var u = response['user'];
                 // alert("val");
                 // this.setState({self:u});
                 AsyncStorage.setItem('user',JSON.stringify(u));
               }
          })
      } catch (e) {
        // alert(e)
        console.log("Update Visit error: ", e);
      } finally {}
    }

    updateValuesAfterDel = (item) => {
      // var arr = this.state.ideas;
      // var newArr =[];
      // //arr[index] = item;
      // var i=0;
      // for(i=0;i<arr.length;i++){
      //   if(arr[i]._id != item._id){
      //     newArr.push(arr[i]);
      //   }
      // }
      // this.setState({ideas:newArr});
    }

    updateVisitCount (thisUser) {
      let user = this.props.navigation.state.params.userObj;
      this.setState({userObj:user});
      if (user._id == thisUser._id) {return;}//if this user is same as user don't increment visit count
      try {
        let path = GLOBAL.WSResourcePath.users
                   + "/"+ user._id
                   + '/user_visite';
        console.log('UVC 1: '+path +" ThisUserId" + thisUser._id, "accessToken = ",  thisUser.accessToken);
        fetch(path, {
             method: 'PUT',
             headers: {
             'Content-Type': 'application/json',
             'Authorization' : 'JWT '+ thisUser.accessToken
           },
           body: JSON.stringify({
             user: thisUser._id
           })
         })
         .then(response => response.json())
         .then(response => {
               console.log("UVC Final Response: ", response);
               let success = response['success'];
               let msg = response['msg'];
               if(!success){
                 //alert(msg);
                 Toast.show(msg);
               }else{

               }
          })
      } catch (e) {
        console.log("Update Visit error: ", e);
      } finally {}
    }

    static navigationOptions = ({ navigation}) => ({
      title: "",
      headerRight: <EditProfileButton user = {navigation.state.params.userObj} navigation = {navigation}/>
    });
    showGetInTouch =(user) =>{
      // alert(JSON.stringify(this.state.userObj))
      try {
        if(this.state.self["_id"] != user._id){
          return(
            <GreenButton title = {"Get In Touch"} flag={flag} user = {user} self={this.state.self} />
          )
        }
      } catch (error) {
        console.log(error);
      }
    }
    render () {
      // console.log("Render Called");
      let user = this.props.navigation.state.params.userObj;
      // if(user._id == selfUser._id){
      //     // alert(selfUser.aggregateAppreciation);
      //
      //   user = selfUser;
      // }
      let media = user["media"];
      var mediaName = '../../../assets/placeholder.jpg';
      if (media && media.length > 0) {mediaName =  media[0]['file_name'];}
      let fullName = user.name.toUpperCase();

      return(
        <View style={styles.URootContainer}>
          <ScrollView style = {styles.UScrollableContainer}>
          <View style = {styles.UInfoContainer}>
            {//<TouchableOpacity style = {styles.UPImageContainer}>
          }
            <UProfileImage user = {user} imageStyle={styles.UPImage}/>
              {//<CachedImage style = {styles.UPImage} source = {{uri: (GLOBAL.BASE_URL+'/uploads/'+mediaName)}} mutable/>
            }
            {//</TouchableOpacity>
            }
            <Text style = {styles.UPName}>{fullName}</Text>
            <View style = {styles.UPProfessionContainer}>
              <Image style = {styles.UPProfessionIcon} source={require('../../assets/profession.png')}/>
              <Text style = {styles.UPProfession}>{user.profession}</Text>
            </View>
            <View style = {styles.UPProfessionContainer}>
              <Image style = {styles.UPProfessionIcon} source={require('../../assets/location.png')}/>
              <Text style = {styles.UPProfession}>{user.locationName}</Text>
            </View>
            <Text style = {styles.UPAddress}>{user.location.city}</Text>
            <USkillContainer skills = {user.skills} navigation = {this.props.navigation} from = {this.props.navigation.state.params.from} callback={this.props.navigation.state.params.callback}/>
            <Text style = {styles.UPDescription}>{user.description}</Text>
            {this.showGetInTouch(user)}
            <USocialLinkContainer socials = {user.socials}/>
          </View>
          <UMyProjectContainer updateValues= {this.updateValues.bind(this)} user={user} navigationProp = {this.props.navigation} />
          </ScrollView>
          <USummeryContainer user = {this.state.userObj} navigation = {this.props.navigation}/>
        </View>
      );
    }

    updateValues = (appreciation) => {
      //alert(appreciation);
      var user = this.state.userObj;
      user.aggregateAppreciation =  appreciation;
      this.setState({userObj: user});
      if(this.props.navigation.state.params.updateValues){
        this.props.navigation.state.params.updateValues(user);
      }
    }
}

//Styling
//style related constants
const styles = StyleSheet.create({
  URootContainer : {//Outer layer first object UPSummeryContainer is second
    flex : 1.0,
    backgroundColor : 'white',
  },

  UScrollableContainer : {//Outer layer first object UPSummeryContainer is second
    flex : 0.91,
  },

  //USER INFORMATION SECTION
  UInfoContainer : {
    flex : 0.7,
    marginTop : 10,
    alignItems : 'center'
  },

  //image
  UPImageContainer : {
    flex: .2,
  },
  // UPImage : {
  //   width : GLOBAL.profileImageEdge,
  //   height : GLOBAL.profileImageEdge,
  //   backgroundColor : '#ddd',
  //   borderRadius:GLOBAL.profileImageEdge/2,
  // },
  UPImage : {
    width : 70,
    height : 70,
    //backgroundColor : '#ddd',
    borderRadius:35,
    borderWidth:1,
    position:'absolute',
    borderColor:'#ddd',
    resizeMode:'cover',
  },

  //name
  UPName : {
    color : '#000',
    fontFamily: "opensans-semibold",
    fontSize : 30,
  },

  //profession
  UPProfessionContainer : {
    alignItems:'center',
    flexDirection:'row',
  },
  UPProfessionIcon : {
    width:18,
    height:18,
    resizeMode:'contain',
    padding:2
  },
  UPProfession : {
    color : '#777',
    fontFamily: "opensans-semibold",
    fontSize : 18,
    padding : 4
  },
  UPAddress : {
    color : '#999',
    fontFamily: "opensans",
    fontSize : 16,
    padding : 4
  },

  //skills
  UPSkillContainer : {
    flexWrap:'wrap',
    flexDirection : 'row',
    justifyContent: 'center'
  },
  UPSkillWrapper : {
    padding:6,
    marginLeft:2,
    marginRight:2,
    marginTop:4,
    marginBottom:4,
    backgroundColor : '#eee',
    borderRadius : 2,
  },
  UPSkillTag : {
    color: '#888',
    fontFamily: "opensans",
    fontSize:14
  },

  //description
  UPDescription : {
    padding:10,
    color: '#888',
    fontFamily: "opensans",
    fontSize:14
  },

  //get in touch
  GreenButtonContainer : {
    padding:10,
    backgroundColor: GLOBAL.COLOR.GREEN,
    borderRadius : 4
  },
  GreenButton : {
    fontSize:16,
    fontFamily: "opensans",
    marginLeft:10,
    marginRight:10,
    color: 'white'
  },

  //social link container
  UPSocialLinkContainer : {
    flexDirection : 'row',
  },
  UPSocialLinkButton : {
    marginTop:28,
    padding : 4
  },
  UPSocialLinkImage : {
    width:36,
    height:36,
    resizeMode:'contain'
  },

  //SUMMERY-The outer later's second object
  UPSummeryContainer : {flex:0.09, marginBottom:20},
  UPSummeryWrapper : {
    flexDirection : 'row',
    justifyContent:'space-around',
    marginBottom:20
  },
  SummeryBox : {
    marginTop : 4,
    alignItems : 'center',
  },

  //My Project Section
  //USER IDEA SECTION
  UIdeaContainer : {
    flex : 0.2,
    marginTop : 20,
    alignItems : 'center',
  },
  UDPIdeaItem : {
    flex : 1,
    //flexDirection : 'row',
    // marginLeft : 10,
    // marginTop : 10,
    // marginBottom : 10,
    margin : 5,
    width : 100,
    height : 80,
    backgroundColor :'#ccc',
    borderWidth : 0.5,
    borderColor : '#aaa',
    justifyContent : 'center',
    alignItems : 'center'
  },
  UDPIdeaImage: {
    flex : 1,
    width : 100,
    height : 80,
    margin : 5,
    justifyContent : 'center',
  },
  UDPIdeaFile: {
    flex : 1,
    //width : 32,
    // height : 32,
      width : 100,
    backgroundColor:'#FDA55E',
    resizeMode:'center',
    alignItems:'center',
    justifyContent : 'center',
  },
  UDPIdeaVideo: {
    flex : 1,
    width : 100,
    backgroundColor:'black',
    resizeMode:'center',
    alignItems:'center',
    justifyContent : 'center',
  },

  //my idea stuff
  PMyIdeaWrapper : {
    height : 120,
    flex : 1,
    margin : 5,
    flexDirection : 'row',
    borderWidth : 0.5,
    borderColor : '#aaa',
    borderRadius : 4,
  },
  PMyIdeaInfoContainer : {
    flex : 0.7,
    alignItems : 'flex-start',
    justifyContent : 'space-around',
    padding : 5
  },
  PMyIdeaTitle : {
    fontFamily: "opensans",
    fontSize : 20,
  },
  PMyIdeaDescription : {
    color : '#999',
    fontFamily: "opensans",
    fontSize : 12,
  },
  PMyIdeaMedia : {
    flex : 0.3,
    margin : 10,
    borderWidth : 0.5,
    borderColor : '#aaa',
    justifyContent : 'center',
    alignItems:'center'
  },
  PMyIdeaImage: {
    flex : 1,
    width:100,
    height:100
  },
  PImagedTextContainer : {
    flexWrap:'wrap',
    flexDirection : 'row',
    justifyContent: 'center',
    padding : 2,
    alignItems : 'flex-end'
  },
  PImagedTextWrapper : {
    alignItems:'center',
    flexDirection:'row',
  },
  PImagedTextIcon : {
    width:12,
    height:12,
    resizeMode:'contain',
    marginLeft : 2
  },
  PImagedText : {
    color : '#999',
    fontFamily: "opensans",
    fontSize : 12,
    margin : 3

  },
})

//User object (JSON responses)
/*{ fb_id: null,
	  location: { long: '2.352222', lat: '48.856614', city: 'Paris' },
	  skills: [ 'Mobile Apps', 'Virtual Reality', 'Design', 'Technology' ],
	  media:
	   [ { file_name: '1515049020247.jpg',
	       _id: '5a4dd03c90a7682385042d28',
	       status: 1,
	       modified_date: '2018-01-04T06:57:00.252Z',
	       create_date: '2018-01-04T06:57:00.252Z',
	       primary: 0 } ],
	  socials:
	   [ { Facebook: { link: 'https://www.facebook.com/sume.ishtiaq.9', status: '0' } },
	     { Twitter: { link: '', status: '0' } },
	     { Linkedln: { link: '', status: '0' } } ],
	  create_date: '2017-12-30T09:41:24.898Z',
	  modified_date: '2017-12-30T09:41:24.898Z',
	  status: 1,
	  _id: '5a475f4401986f3d53533f86',
	  email: 'user7@gmail.com',
	  password: '$2a$10$3icSV6wPYZiVnhsMCZnuFusEfYGDblSsAMizUORkbVpsAjHx3o2AO',
	  mobile: '1234567890',
	  __v: 0,
	  description: 'I am very awesome person',
	  profession: 'developer',
	  name: 'user7' }
    */
