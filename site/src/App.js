import React from "react";
import "./App.css";
import { config } from "./config.js";
import PageNumbers from "./components/PageNumbers.js";
import Dates from "./components/Dates.js";
import moment from "moment";
require('moment-timezone');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.objectFilter = this.objectFilter.bind(this);
    this.setDay = this.setDay.bind(this);
    this.resetDate = this.resetDate.bind(this);
    this.setPage = this.setPage.bind(this);
    this.setDay2 = this.setDay2.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.userFilter = this.userFilter.bind(this);
    this.filterFilter = this.filterFilter.bind(this);
  }
  state = {
    items: [],
    page: 1,
    perpage: 150,
    totalPages: 1,
    currentPage: 1,
    totalItems: 50,
    objectList: [],
    filters: "",
    objectFilter: "",
    day: "",
    dateFrom: "",
    dateTo: "",
    dateTostring: "",
    dateFromstring: "",
    userList: [],
    userFilter: "",
    filterList: [],
    filterFilter: ""
  };

  componentDidMount() {
    this.loadParams();
    this.loadStats();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage ||
      prevState.objectFilter !== this.state.objectFilter ||
      prevState.dateFrom !== this.state.dateFrom ||
      prevState.dateTo !== this.state.dateTo ||
      prevState.userFilter !== this.state.userFilter ||
      prevState.filterFilter !== this.state.filterFilter
    ) {
      // TODO: update history after getting the new state

      this.loadPage();
    }
  }

  dateConvert1(datetime) {
    if (datetime) {
      var date = new Date(+datetime);
      var minutes = date.getMinutes();
      var hours = date.getHours();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (hours < 10) {
        hours = "0" + hours;
      }
      var datestring =
        date.getMonth() +
        1 +
        "-" +
        date.getDate() +
        "-" +
        date.getFullYear() +
        " " +
        hours +
        ":" +
        minutes;
      return datestring;
    }
  }

  loadStats() {
    fetch(config.api + "/stats")
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          objectList: responseJson.result["0"]["objects"],
          userList: responseJson.result[0]["users"],
          filterList: responseJson.result[0]["filters"]
        });
      });
  }

  loadParams() {
    const params = new URLSearchParams(window.location.search);
    var urlValues = {
      object: params.get("object"),
      currentPage: params.get("currentPage"),
      dateFrom: params.get("dateFrom"),
      dateTo: params.get("dateTo"),
      user: params.get("user")
    };

    if (
      params.get("object") &&
      params.get("object") !== this.state.objectFilter
    ) {
      urlValues["object"] = params.get("object");
    } else {
      urlValues["object"] = this.state.objectFilter;
    }

    if (params.get("page") && params.get("page") !== this.state.currentPage) {
      urlValues["currentPage"] = params.get("page");
    } else {
      urlValues["currentPage"] = this.state.currentPage;
    }

    if (params.get("dateTo") && params.get("dateTo") !== this.state.dateTo) {
      urlValues["dateTo"] = params.get("dateTo");
    } else {
      urlValues["dateTo"] = this.state.dateTo;
    }

    if (
      params.get("dateFrom") &&
      params.get("dateFrom") !== this.state.dateFrom
    ) {
      urlValues["dateFrom"] = params.get("dateFrom");
    } else {
      urlValues["dateFrom"] = this.state.dateFrom;
    }

    if (params.get("user") && params.get("user") !== this.state.userFilter) {
      urlValues["user"] = params.get("user");
    } else {
      urlValues["user"] = this.state.userFilter;
    }

    if (
      params.get("filter") &&
      params.get("filter") !== this.state.filterFilter
    ) {
      urlValues["filter"] = params.get("filter");
    } else {
      urlValues["filter"] = this.state.filterFilter;
    }

    this.setState(
      {
        objectFilter: urlValues["object"],
        currentPage: urlValues["currentPage"],
        dateFrom: urlValues["dateFrom"],
        dateTo: urlValues["dateTo"],
        userFilter: urlValues["user"],
        filterFilter: urlValues["filter"]
      },
      () => {
        this.loadPage();
      }
    );
  }

  loadPage() {
    const perpage = 150;
    var fetchUrl =
      config.api +
      "?page=" +
      this.state.currentPage +
      "&perpage=" +
      perpage +
      "&object=" +
      encodeURIComponent(this.state.objectFilter) +
      "&dateFrom=" +
      this.state.dateFrom +
      "&dateTo=" +
      this.state.dateTo +
      "&user=" +
      this.state.userFilter +
      "&filter=" +
      this.state.filterFilter;
    console.log("Fetched: " + fetchUrl);
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

  objectFilter(event) {
    this.setState({
      objectFilter: event.target.value
    });
    if (event.target.value) {
      this.setState({
        currentPage: 1
      });
    }
  }

  userFilter(event) {
    this.setState({
      userFilter: event.target.value
    });
    if (event.target.value) {
      this.setState({
        currentPage: 1
      });
    }
  }

  filterFilter(event) {
    this.setState({
      filterFilter: event.target.value
    });
    if (event.target.value) {
      this.setState({
        currentPage: 1
      });
    }
  }

  setDay(day) {
    var date = new Date(day.target.value);
    var stringName = day.target.name + "string";
    console.log(Date.parse(date));
    console.log(stringName + ": " + date);


    this.setState({
      [day.target.name]: Date.parse(date),
      [stringName]: day.target.value
    });
  }

  setDay2(day, name) {

    //Breaking here, TODO dates
    //newDate now has the proper UTC value. This is what you should use in your call.
    //but local date still has to be the state that the form pulls off of - this bit is only
    //for the fetch/url. So is this yet another state?
    //Also, setDay2 is the only one we use. Delete setDay and rename this.

    console.log(day);
    console.log(name);
    var timeZoneOffset = (new Date).getTimezoneOffset() * 60000;
    var date = new Date(day);
    var newDate = Date.parse(date) - timeZoneOffset;
    console.log("New: " + newDate);
    var d = moment(day).tz('UTC');
    console.log("Moment: " + d);
    var stringName = name + "string";
    this.setState({
      [name]: Date.parse(date),
      [stringName]: day
    });

  }

  setPage(page) {
    this.setState({
      currentPage: page
    });
  }

  resetDate() {
    this.setState({
      dateFrom: "",
      dateTo: "",
      dateFromstring: "",
      dateTostring: ""
    });
  }

  resetAll() {
    this.setState({
      dateFrom: "",
      dateTo: "",
      dateFromstring: "",
      dateTostring: "",
      objectFilter: "",
      userFilter: "",
      filterFilter: ""
    });
  }

  openDownload(linkString) {
    var download = config.files + "/downloadAll?null=null" + linkString;
    window.open(download);
  }

  render() {
    var linkString = "&perPage=" + this.state.perpage;
    if (this.state.objectFilter) {
      linkString = linkString + "&object=" + this.state.objectFilter;
    }
    if (this.state.dateFrom) {
      linkString = linkString + "&dateFrom=" + this.state.dateFrom;
    }
    if (this.state.dateTo) {
      linkString = linkString + "&dateTo=" + this.state.dateTo;
    }
    if (this.state.userFilter) {
      linkString = linkString + "&user=" + this.state.userFilter;
    }
    if (this.state.filterFilter) {
      linkString = linkString + "&filter=" + this.state.filterFilter;
    }

    return (
      <div className="App">
        <h1 className="headertext">GORT Image Archive</h1>
        <p style={{ color: "white" }}>
          Image Count: {this.state.totalItems}
          <br />
        </p>
        <div className="filters">
          <label for="objectFilter">Object Selection: </label>

          <select
            name="objectfilter"
            onChange={this.objectFilter}
            value={this.state.objectFilter}
          >
            <option value="" key="null">
              All Objects
            </option>
            {this.state.objectList.map(targets => (
              <option value={targets} key={targets}>
                {targets}
              </option>
            ))}
          </select>

          <Dates
            name="dateFrom"
            setDay={this.setDay2}
            dateCurrent={this.state.dateFromstring}
          />

          <Dates
            name="dateTo"
            setDay={this.setDay2}
            dateCurrent={this.state.dateTostring}
          />

          <label for="filterFilter">Filter: </label>

          <select
            name="filterFilter"
            onChange={this.filterFilter}
            value={this.state.filterFilter}
          >
            <option value="" key="null">
              Any
            </option>
            {this.state.filterList.map(targets => (
              <option value={targets} key={targets}>
                {targets}
              </option>
            ))}
          </select>
          <br />

          <label>User: </label>

          <select
            name="userfilter"
            onChange={this.userFilter}
            value={this.state.userFilter}
          >
            <option value="" key="null">
              All Users
            </option>
            {this.state.userList.map(targets => (
              <option value={targets} key={targets}>
                {targets}
              </option>
            ))}
          </select>
          <br />

          <button
            value="reset"
            id="resetDate"
            className="pagelink"
            onClick={this.resetDate}
          >
            Reset Dates
          </button>
          <button
            value="resetAll"
            id="resetAll"
            className="pagelink"
            onClick={this.resetAll}
          >
            Reset All
          </button>
        </div>

        <div className="pagelinks">
          <ul>
            <PageNumbers
              totalPages={this.state.totalPages}
              currentPage={this.state.currentPage}
              setPage={this.setPage}
              object={this.state.objectFilter}
              dateFrom={this.state.dateFrom}
              dateTo={this.state.dateTo}
              perPage={this.state.perpage}
              linkString={linkString}
            />
          </ul>
        </div>

        <table>
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
                <td>{this.dateConvert1(items.DATEOBS)}</td>
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

export default App;
