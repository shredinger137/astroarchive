import React from "react";
import { config } from "./config.js";
import { isThisHour } from "date-fns";

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

  makeCSV() {
    var images;
    var row = "";
    var doc = "";
    for (var i = 0; i <= Object.keys(this.state.items).length; i++) {
      if (
        this.state.items &&
        this.state.items[i] &&
        this.state.items[i].OBJECT &&
        this.state.items[i].filename
      ) {
        row =
          row +
          this.state.items[i].OBJECT +
          "," +
          this.state.items[i].filename +
          "\n";
      }

      console.log(row);
    }
  }

  getItemCounts(prop, table) {
    var totalList = {};
    var HTMLObjects = "<table>";
    for (var i = 0; i <= this.state.totalItems; i++) {
        
      if (
        this.state.items &&
        this.state.items[i] &&
        this.state.items[i][prop]
      ) { console.log(this.state.items[i][prop]);
        if (totalList[this.state.items[i][prop]]) {
          totalList[this.state.items[i][prop]] =
            totalList[this.state.items[i][prop]] + 1;
        } else {
          totalList[this.state.items[i][prop]] = 1;
        }
      }
    }
    console.log(totalList);
    var keys = Object.keys(totalList);
    console.log(keys);
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
    console.log("Rendering stats");
    return (
      <div className="App">
        <h1>GORT Archive Stats</h1>

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
