import React,{Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import 'tachyons';

const particlesOption = {
  particles: {
    number : {
      value : 150,
      density : {
        enable : true,
        value_area : 800
      }
    }
  }

}
const initialState = {
  input : '',
  imageUrl : '',
  box : {},
  route : 'signin',
  isSignedIn: false,
  user : {
    id : "3",
   usernmae : '',
   name : '',
   email : '',
   entries : 0,
   joined : ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  // componentDidMount() {
  //   fetch('http://localhost:5000/')
  //   .then(response => response.json())
  //   .then(console.log)
    
  // }

loadUser = (data) => {
  this.setState({
    user : {
      id : data.id,
     usernmae : data.usernmae,
     name : data.name,
     email : data.email,
     entries : data.entries,
     joined : data.joined
    }

  })
}

onInputChange = (event) => {
  this.setState({input:event.target.value});
  
}

calculateFaceLocation = (data) => {
  const clarafaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimg');
  const width = Number(image.width);
  const height = Number(image.height);
  console.log(width, height);
  return {
    leftCol : clarafaiFace.left_col * width,
    topRow : clarafaiFace.top_row * height,
    rightCol : width - (clarafaiFace.right_col * width ),
    bottomRow : height - (clarafaiFace.bottom_row * height)


  }
}

displayFaceBox = (box) => {
  this.setState({box: box});
  console.log(box);
  
}


onButtonSubmit = () => {
  this.setState({imageUrl: this.state.input});
  fetch('https://nameless-dawn-32140.herokuapp.com/imageUrl', {
    method: 'post',
    headers: {'Content-Type' : 'application/json'},
    body : JSON.stringify({
        input: this.state.input
    })
  })
  .then(response => response.json())
  
    .then(response => {
        if(response) {
          fetch('https://nameless-dawn-32140.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type' : 'application/json'},
            body : JSON.stringify({
                id: this.state.user.id
            })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        }).catch(console.log)
        }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
} 

onRouteChange = (route) => {
  if(route==='signout') {
    this.setState(initialState)
  } else if(route === 'home') {
    this.setState({isSignedIn:true})
  }
  this.setState({route: route})

}

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
      <Particles className="particles" params={particlesOption} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
       { route === 'home' ?
          <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl}/> 
     </div>
     : (
       route === 'signin' ? 
       <SignIn loadUser={this.loadUser} onRouteChange= {this.onRouteChange}/>
       :
       <Register loadUser={this.loadUser} onRouteChange= {this.onRouteChange}/>
     )

       
       
       
       }
      </div>
    );
  }
  
}

export default App;
