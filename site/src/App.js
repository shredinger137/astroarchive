import React from "react";
import "./App.css";
import { config } from "./config.js";
import PageNumbers from "./components/PageNumbers.js";
import Dates from "./components/Dates.js";

/* eslint-disable eqeqeq */

class App extends React.Component {
  constructor(props) {
    super(props);
    this.objectFilter = this.objectFilter.bind(this);
    this.resetDate = this.resetDate.bind(this);
    this.setPage = this.setPage.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.setDay = this.setDay.bind(this);
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
    filterFilter: "",
    testString: ''
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
      prevState.filterFilter !== this.state.filterFilter ||
      prevState.dateFromstring != this.state.dateFromstring ||
      prevState.dateTostring != this.state.dateTostring
    
      ) {
      // TODO: update history after getting the new state

      this.loadPage();
    }
  }

  dateConvert1(datetime) {
    if (datetime) {
      var localDate = new Date();
      var timezone = localDate.getTimezoneOffset() * 60000;
      var newDate = datetime + timezone;
      var date = new Date(+newDate);
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

  setDay(day, name) {
    if(name == 'dateFrom'){
    this.setState({
      dateFromstring: day
    })}
    if(name == 'dateTo'){
      this.setState({
        dateTostring: day
      } ) 
      
    }
      
    var timeZoneOffset = new Date().getTimezoneOffset() * 60000;
    var date = new Date(day);
    var newDate = Date.parse(date) - timeZoneOffset;
    var stringName = name + "string";
    this.setState({
      [name]: newDate,
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
      dateTostring: "",
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
    //window.open(download);
    console.log(download);
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
        <div className="filters">
          <div className="filtersGrid">
            <label htmlFor="objectFilter">Object Selection: </label>

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

            <label htmlFor="filterFilter">Filter: </label>

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

            <label htmlFor="userFilter">User: </label>

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
          </div>

          <Dates
            name="dateFrom"
            setDay={this.setDay}
            dateCurrent={this.state.dateFromstring}
          />

          <Dates
            name="dateTo"
            setDay={this.setDay}
            dateCurrent={this.state.dateTostring}
          />
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
                  <a href={config.files +"/?" + linkString} className="pagelink">Download Selection</a>
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
          <div className="tablelike">
            <span style={{float: 'left'}}>Showing {(this.state.currentPage * this.state.perpage) - (this.state.perpage - 1)}-{this.state.currentPage * this.state.perpage} of {this.state.totalItems}</span>
            <span style={{float: 'right', marginRight: '50px'}}><a className="pagecurrent" href="./stats">[Stats]</a></span>
            
          </div>
            
          </ul>
        </div>

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
                <td>{this.dateConvert1(items.DATEOBS)}</td>
                <td>{items.CCDTEMP ? items.CCDTEMP.substr(0, 5) : ""}</td>
                <td>{items.FILTER}</td>
                <td>{Math.round(items.EXPTIME * 10) / 10}</td>
                <td>{items.USER}</td>
              </tr>
            ))}
          </tbody>
        </table>
      <br />
      <br />

      </div>

    );
  }
}

export default App;
