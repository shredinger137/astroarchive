import React from "react";
import { config } from "./config.js";
import "./App.css";
import "./stats.css";
import { Line, Bar } from 'react-chartjs-2';

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

  componentDidUpdate(prev) {
    this.getItemCounts("OBJECT", "countTable");
  }

  loadPage() {
    var fetchUrl = config.api;
      var statsUrl = config.api + "/fullstats";
      fetch(statsUrl).then(response => response.json()).then(responseJson => {
        if(responseJson && responseJson.result && responseJson.result[0]){
          this.setState({
            fullStats: responseJson.result[0],
            totalItems: responseJson.result[0]["totals"]["files"]
          });
          console.log(responseJson.result[0]);
          this.getActivity('DATEOBS');
          this.getUsers('USER');
        }
      });
  }

  getActivity(prop) {
    var bydate = {};
    var xaxis = [];
    var yaxis = [];

    var minMonth = 12; 
    var minYear = 9999; 
    var maxMonth = 1; 
    var maxYear = 0; 
    var thisMonth; var thisYear;
    if(this.state.fullStats && this.state.fullStats["minDate"] && this.state.fullStats["maxDate"] && this.state.fullStats["totalActivity"]){
      var minDate = new Date(this.state.fullStats["minDate"]);
      var maxDate = new Date(this.state.fullStats["maxDate"]);
      bydate = this.state.fullStats["totalActivity"];
    }
    
    var minMonth = minDate.getMonth() + 1;
    var minYear = minDate.getFullYear();
    var maxMonth = maxDate.getMonth() + 1;
    var maxYear = maxDate.getFullYear();
    var monthCount = (12 * (maxYear - minYear)) + (maxMonth - minMonth);
    var thisMonth = minMonth;
    var thisYear = minYear;
    
    var keys = Object.keys(bydate);

    for(var j = 0; j <= monthCount; j++){
      var thisDate = thisMonth + "-" + thisYear;
      if(this.state.fullStats && this.state.fullStats["totalActivity"] && this.state.fullStats["totalActivity"][thisDate]){
        var thisCount = this.state.fullStats["totalActivity"][thisDate];
      } else {var thisCount = 0;}
      
      console.log(thisDate + ": " + thisCount);

      if(thisMonth < 12){
        thisMonth++; } else {
          thisMonth = 1;
          thisYear++;
        }

      xaxis.push(thisDate);
      yaxis.push(thisCount);
     }


    const data = {
      labels: xaxis,
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
          data: yaxis
        }
      ]
    };
    this.setState({ useData: data });
  }

  getUsers() {
    var userlist = {};
    var xaxis = [];
    var yaxis = [];
    if(this.state.fullStats && this.state.fullStats["users"]){
      userlist = this.state.fullStats.users;
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
    var objectsList = {};
    var HTMLObjects = "<table><tr><td>Object</td><td>Total</td>";
    var filtersList = [];

    if(this.state.fullStats && this.state.fullStats.objects){
     objectsList = this.state.fullStats.objects;
     var objectKeys = Object.keys(objectsList);
     for(var k = 0; k <= objectKeys.length; k++){
      if(objectsList[objectKeys[k]]){
        var filterKeys = Object.keys(objectsList[objectKeys[k]]);
        for(var p = 0; p <= filterKeys.length; p++){
          if(filtersList.indexOf(filterKeys[p]) < 0 && filterKeys[p] != undefined && filterKeys[p] != "undefined" && filterKeys[p] != "total"){
            filtersList.push(filterKeys[p]);
          }
    }}

     } 
    }

    for(var i=0; i<= (Object.keys(filtersList).length - 1); i++){
      HTMLObjects = HTMLObjects + "<td>" + filtersList[i] + "</td>";
    }
    HTMLObjects = HTMLObjects + "</tr>";
    for(var h = 0; h <= objectKeys.length; h++){
      if(objectsList && objectsList[objectKeys[h]]){
        HTMLObjects = HTMLObjects + "<tr><td>" + objectKeys[h] + "</td>";
        if(objectsList[objectKeys[h]]["total"]){
          HTMLObjects += "<td>" + objectsList[objectKeys[h]]["total"] + "</td>";
        } else {HTMLObjects += "<td></td>";}
        for(var j = 0; j <= (Object.keys(filtersList).length - 1); j++){
          if(filtersList[j] != "total"){
          if(objectsList[objectKeys[h]][filtersList[j]]){
            HTMLObjects += "<td>" + objectsList[objectKeys[h]][filtersList[j]] + "</td>"
          } else {HTMLObjects += "<td></td>"}
        }}

        HTMLObjects += "</tr>"; 
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
          <Bar
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
