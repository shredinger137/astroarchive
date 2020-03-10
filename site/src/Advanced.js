//TODO: This whole page. We're basically recreating the front page, but with proper queries.
//After that we can edit stuff, and open the API to accept more variety.

import React from "react";
import { config } from "./config.js";
import "./App.css";
import "./stats.css";

/* eslint-disable eqeqeq */

class Advanced extends React.Component {
  state = {
    numberOfFields: 1,
    items: []
  };

  componentDidMount() {
    this.loadParams();
    this.sendReq();
  }

  componentDidUpdate(prevprops, prevstate) {
    if(prevstate.type != this.state.type){
      console.log(prevprops.type);
      this.loadPage();
  }
  }

  loadParams(){
    const params = new URLSearchParams(window.location.search);
    if(params.get("type")){
      console.log(params.get("type"));
      this.setState({type: params.get("type")});
    }
    this.loadPage();

  }

  sendReq(){
    var testObject = {
      OBJECT: 'AP Her',
      FILTER: 'V'
    };
    var queryString = Object.keys(testObject).map(key => key + '=' + testObject[key]).join('&');
    console.log(queryString);
    var fetchUrl = config.api + "/advanced?" + encodeURI(queryString);

    fetch(fetchUrl)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.count != 0) {
          this.setState({
            items: responseJson.items,
            totalPages: Math.round(responseJson.count / this.state.perpage),
            totalItems: responseJson.count
          });
        } else {
          this.setState({ items: [], totalPages: 0, totalItems: 0 });
        }
        if (this.state.totalPages < this.state.currentPage) {
          this.setState({ currentPage: 1 });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }


  loadPage() {

  }

//https://afh.sonoma.edu/archive/?page=2&perPage=150&object=AS%20Per

  render() {
    return (
      <div className="App">
        <h1>GORT Archive: Advanced Search</h1>
    <br />
    <table className="archiveTable">
          <thead>
            <tr>
              <th></th>
              <th>Object</th>
              <th>Date/Time (UTC)</th>
              <th>CCD Temp (C)</th>
              <th>Filter</th>
              <th>Exposure Time (S)</th>
              <th>User</th>
            </tr>
          </thead>

          <tbody>
            {this.state.items.map(items => (
              <tr key={items.filename}>
                <td>
                  <a
                    href={`http://gtn.sonoma.edu/archive/${items.filename}`}
                    download
                  >
                    Download
                  </a>
                </td>
                <td>{items.OBJECT}</td>
                <td>{items.DATEOBS}</td>
                <td>{items.CCDTEMP ? items.CCDTEMP.substr(0, 5) : ""}</td>
                <td>{items.FILTER}</td>
                <td>{Math.round(items.EXPTIME * 10) / 10}</td>
                <td>{items.USER}</td>
              </tr>
            ))}
          </tbody>
        </table>
     </div>
    );
  }
}
export default Advanced;
