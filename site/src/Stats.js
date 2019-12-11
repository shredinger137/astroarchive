import React from "react";
import { config } from "./config.js";
import "./App.css";
import "./stats.css";
import { Line } from 'react-chartjs-2';

class Stats extends React.Component {
  state = {
    items: [],
    totalItems: 0,
    itemCounts: {},
    itemCountsHTML: "",
    useData: {}
  };

  componentDidMount() {
    this.loadPage();
  }

  componentDidUpdate() {
    this.getItemCounts("OBJECT", "countTable");
    //this.getItemCounts("USER", "userTable");
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
          this.getActivity('DATEOBS');
          this.getUsers('USER');
        } else {
          this.setState({ items: [], totalItems: 0 });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  getActivity(prop) {
    var bydate = {};
    var xaxis = [];
    var yaxis = [];
    for (var i = 0; i <= this.state.totalItems; i++) {
      if (
        this.state.items &&
        this.state.items[i] &&
        this.state.items[i][prop] &&
        this.state.items[i][prop]
      ) {
        var date = new Date(this.state.items[i][prop]);
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var dateindex = month + "-" + year;
        if (bydate[dateindex]) {
          bydate[dateindex]++;
        } else {
          bydate[dateindex] = 1;
        }
      }
    }
    var keys = Object.keys(bydate);
    for (var j = 0; j <= keys.length; j++) {
      if (keys[j] && keys[j] != "undefined") {
        xaxis.push(keys[j]);
        yaxis.push(bydate[keys[j]]);
      }
    }

    const data = {
      labels: xaxis.reverse(),
      datasets: [
        {
          label: "GORT Activity",
          fill: true,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: yaxis.reverse()
        }
      ]
    };
    this.setState({ useData: data });
  }

  getUsers(prop) {
    var userlist = {};
    var xaxis = [];
    var yaxis = [];
    for (var i = 0; i <= this.state.totalItems; i++) {
      if (
        this.state.items &&
        this.state.items[i] &&
        this.state.items[i][prop] &&
        this.state.items[i][prop]
      ) {
        var user = this.state.items[i]['USER'];
        if (userlist[user]) {
          userlist[user]++;
        } else {
          userlist[user] = 1;
        }
      }
    }
    var keys = Object.keys(userlist);
    for (var j = 0; j <= keys.length; j++) {
      if (keys[j] && keys[j] != "undefined") {
        xaxis.push(keys[j]);
        yaxis.push(userlist[keys[j]]);
      }
    }

    const data = {
      labels: xaxis.reverse(),
      datasets: [
        {
          label: "User Activity",
          fill: true,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: yaxis.reverse()
        }
      ]
    };
    this.setState({ userData: data });
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
          HTMLObjects +
          "<tr><td>" +
          keys[j] +
          "</td><td>" +
          totalList[keys[j]] +
          "</tr></td>";
      }
    }
    HTMLObjects += "</table>";
    document.getElementById(table).innerHTML = HTMLObjects;
  }

  render() {
    return (
      <div className="App">
        <h1>GORT Archive Stats</h1>
        <p>
          <a href="/archive" className="pagecurrent">
            [Archive Home]
          </a>
        </p>
        <p>Total Archived Images: {this.state.totalItems}</p>
        <div className="gridwrapper w-75">
          <div id="countTable" className="statsTable"></div>
          <div id="usage" style={{padding: '10px'}}>
            <Line
              data={this.state.useData}
              width={250}
              height={350}
              options={{ maintainAspectRatio: false }}
            />
          </div>
          <div id="users" style={{padding: '10px'}}>
          <Line
              data={this.state.userData}
              width={250}
              height={350}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Stats;
