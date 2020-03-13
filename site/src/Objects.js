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
  }

  componentDidUpdate(prevprops, prevstate) {
    if(prevstate.type != this.state.type){
      this.loadPage();
  }
  }

  loadParams(){
    const params = new URLSearchParams(window.location.search);
    if(params.get("type")){
      //console.log(params.get("type"));
      this.setState({type: params.get("type")});
    }
    this.loadPage();

  }

  loadPage() {

      var statsUrl = config.api + "/objectsearch?type=" + this.state.type;
      fetch(statsUrl).then(response => response.json()).then(responseJson => {
        if(responseJson  && responseJson["result"] && responseJson["result"].length && responseJson["result"].length > 0){
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
    <table className="archiveTable">
    {this.state.items.map(object => (
            <tr><td><a href={"./?page=1&object=" + object.name}>{object.name}</a></td><td>{object.otype_txt}</td></tr>
              ))}
    </table>
    </div>
     </div>
    );
  }
}
export default Objects;
