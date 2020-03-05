import React from "react";
import { config } from "./config.js";
import "./App.css";
import "./stats.css";

/* eslint-disable eqeqeq */

class Objects extends React.Component {
  state = {
    items: [],
    type: ""
  };

  componentDidMount() {
    this.loadParams();
    this.loadPage();
  }

  componentDidUpdate(prevprops, prevstate) {
    if(prevstate.type != this.state.type){
      console.log(prevprops.type);
    this.loadPage();}
  }

  loadParams(){
    const params = new URLSearchParams(window.location.search);
    if(params.get("type")){
      console.log(params.get("type"));
      this.setState({type: params.get("type")});
    }

  }

  loadPage() {

      var statsUrl = config.api + "/objectsearch?type=" + this.state.type;
      fetch(statsUrl).then(response => response.json()).then(responseJson => {
        if(responseJson  && responseJson["result"]){
           console.log(responseJson["result"]);
          this.setState({items: responseJson["result"]})

        }

      });
  }

//https://afh.sonoma.edu/archive/?page=2&perPage=150&object=AS%20Per

  render() {
    return (
      <div className="App">
        <h1>GORT Archive: Objects</h1>
    <br />
    <p>Objects of type: {this.state.type}</p>
    <div>
    {this.state.items.map(object => (
          <p><a href={"./?page=1&object=" + object.name}>{object.name}</a></p>
              ))}
    </div>
     </div>
    );
  }
}
export default Objects;
