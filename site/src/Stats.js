import React from "react";
import { config } from "./config.js";

class Stats extends React.Component {
  state = {
    items: [],
    totalItems: 0,
    itemCounts: {},
    itemCountsHTML: ""
  };

  componentDidMount() {
    this.loadPage();
  }

  componentDidUpdate() {
    this.getItemCounts("OBJECT", "countTable");
    this.getItemCounts("USER", "userTable");
  }

  loadPage() {
    var fetchUrl = config.api;
    fetch(fetchUrl)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.count != 0) {
          this.setState({
            items: responseJson.items,
            totalItems: responseJson.count
          });
        } else {
          this.setState({ items: [], totalItems: 0 });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  getItemCounts(prop, table) {
    var totalList = {};
    var HTMLObjects = "<table>";
    for (var i = 0; i <= this.state.totalItems; i++) {
        
      if (
        this.state.items &&
        this.state.items[i] &&
        this.state.items[i][prop]
      ) { 
        if (totalList[this.state.items[i][prop]]) {
          totalList[this.state.items[i][prop]] =
            totalList[this.state.items[i][prop]] + 1;
        } else {
          totalList[this.state.items[i][prop]] = 1;
        }
      }
    }
    var keys = Object.keys(totalList);
    for (var j = 0; j <= this.state.totalItems; j++) {
      if (keys[j] && totalList[keys[j]]) {
        HTMLObjects =
          HTMLObjects + "<tr><td>" + keys[j] + "</td><td>" + totalList[keys[j]] + "</tr></td>";
      }
    }
    HTMLObjects += "</table>";
    document.getElementById(table).innerHTML = HTMLObjects;
  }

  render() {
    return (
      <div className="App">
        <h1>GORT Archive Stats</h1>
        <p><a href="./archive" className="currentpage">[Archive Home]</a></p>

        <p>Total Archived Images: {this.state.totalItems}</p>
        <br />
        <div id="countTable" className="statsTable"></div>
        <br />
        <br />
        <div id="userTable" className="statsTable"></div>
      </div>
    );
  }
}
export default Stats;
