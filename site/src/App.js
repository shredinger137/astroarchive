import React from 'react';
import './App.css';
import { config } from './config.js';
import PageNumbers from './components/PageNumbers.js'
import Example from './components/DateExample.js';

class App extends React.Component {
  constructor(props){
    super(props);
    this.objectFilter = this.objectFilter.bind(this);
    this.setDay = this.setDay.bind(this);
    this.resetDate = this.resetDate.bind(this);
    this.setPage = this.setPage.bind(this);
    this.setDay2 = this.setDay2.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.userFilter = this.userFilter.bind(this);
  }
  state = {
    items: [],
    page: 1,
    perpage: 150,
    totalPages: 1,
    currentPage: 1,
    totalItems: 50,
    objectList: [],
    filters: '',
    objectFilter: "",
    day: '',
    dateFrom: '',
    dateTo: '',
    dateTostring: '',
    dateFromstring: '',
    userList: [],
    userFilter: ""
  }

  componentDidMount() {
    
    this.loadParams();
    //this.loadPage();
    this.loadStats();
    
  }  

  componentDidUpdate(prevProps, prevState) {
    if(prevState.currentPage !== this.state.currentPage 
      || prevState.objectFilter !== this.state.objectFilter
      || prevState.dateFrom !== this.state.dateFrom
      || prevState.dateTo !== this.state.dateTo
      || prevState.userFilter !== this.state.userFilter) {
        
        // TODO: update history after getting the new state

        this.loadPage();
    }
  }

  dateConvert1(datetime)
  {
    if(datetime){
    var date = new Date(+datetime);
    var minutes = date.getMinutes(); 
    var hours = date.getHours();
    if(minutes < 10){
      minutes = "0" + minutes;  
    }
    if(hours < 10){
      hours = "0" + hours;
    }
    var datestring = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear() + " " + hours + ":" + minutes; 
    return(datestring)
  }
  }

  loadStats(){
    fetch(config.api + "/stats").then((response) => response.json()).then((responseJson) => {
      this.setState({objectList: responseJson.result[0]['objects'], userList: responseJson.result[0]['users']})    
    })
  }

  loadParams(){
    
    const params = new URLSearchParams(window.location.search);
    var urlValues = {
                      object: params.get('object'),
                      currentPage: params.get('currentPage'),
                      dateFrom: params.get('dateFrom'),
                      dateTo: params.get('dateTo')
    };

    if(params.get('object') && params.get('object') !== this.state.objectFilter){
      urlValues['object'] = params.get('object');
    } else {urlValues['object'] = this.state.objectFilter;}

    if(params.get('page') && params.get('page') !== this.state.currentPage){
      urlValues['currentPage'] = params.get('page');
    } else {urlValues['currentPage'] = this.state.currentPage;}

    if(params.get('dateTo') && params.get('dateTo') !== this.state.dateTo){
      urlValues['dateTo'] = params.get('dateTo');
    } else {urlValues['dateTo'] = this.state.dateTo;}

    if(params.get('dateFrom') && params.get('dateFrom') !== this.state.dateFrom){
      urlValues['dateFrom'] = params.get('dateFrom');
    } else {urlValues['dateFrom'] = this.state.dateFrom;}

    if(params.get('user') && params.get('user') !== this.state.userFilter){
      urlValues['user'] = params.get('user');
    } else {urlValues['user'] = this.state.userFilter;}


    this.setState({
      objectFilter: urlValues['object'],
      currentPage: urlValues['currentPage'],
      dateFrom: urlValues['dateFrom'],
      dateTo: urlValues['dateTo']
    }, () => { this.loadPage(); })
    //this.loadPage();

  }

  loadPage(){
    const perpage = 150;
    var fetchUrl = config.api + "?page=" + this.state.currentPage + "&perpage=" + perpage + 
          "&object=" + encodeURIComponent(this.state.objectFilter) + "&dateFrom=" + this.state.dateFrom + "&dateTo=" + this.state.dateTo + "&user=" + this.state.userFilter;
     fetch(fetchUrl)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({items: responseJson.items, totalPages: (Math.round(responseJson.count / this.state.perpage)), 
     totalItems: responseJson.count});
     console.log("Fetched: " + fetchUrl);
     if(this.state.totalPages < this.state.currentPage){
       this.setState({currentPage: 1});
     }
    })
      .catch((error) => {
      console.error(error);
    }); 

    //set max date selection to today for filters
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10){
          dd='0'+dd
      } 
    if(mm<10){
        mm='0'+mm
    } 
    today = yyyy+'-'+mm+'-'+dd;
//    document.getElementById("datefield1").setAttribute("max", today);
 //   document.getElementById("datefield2").setAttribute("max", today);
  }


  objectFilter(event){
    this.setState({
      objectFilter: event.target.value,
    })
    if(event.target.value){
      this.setState({
        currentPage: 1
      })
    }
  }

  userFilter(event){
    this.setState({
      userFilter: event.target.value,
    })
    if(event.target.value){
      this.setState({
        currentPage: 1
      })
    }
  }


  setDay(day){
    var date = new Date(day.target.value);
    var stringName = day.target.name + "string";
    console.log(Date.parse(date));
    console.log(stringName + ": " + date);
    
    this.setState({
      [day.target.name]: Date.parse(date),
      [stringName]: day.target.value
    })  
  }

  setDay2(day, name){
    console.log(day);
    console.log(name);
    var date = new Date(day);
    var stringName = name + "string";
    this.setState({
      [name]: Date.parse(date),
      [stringName]: day
      
    })
  }


  setPage(page){
    this.setState({
      currentPage: page
    })
  }

  resetDate(){
    this.setState({
      dateFrom: "",
      dateTo: "",
      dateFromstring: "",
      dateTostring: ''
    })
  }

  resetAll(){
    this.setState({
      dateFrom: "",
      dateTo: "",
      dateFromstring: "",
      dateTostring: '',
      objectFilter: "",
      userFilter: ""

    })
  }

  openDownload(linkString){
    var download = config.files + "/downloadAll?null=null" + linkString;
    window.open(download);
  }

  render() {

    var linkString = "&perPage=" + this.state.perpage;
      if(this.state.objectFilter){linkString = linkString + "&object=" + this.state.objectFilter;} 
      if(this.state.dateFrom){linkString = linkString + "&dateFrom=" + this.state.dateFrom;} 
      if(this.state.dateTo){linkString = linkString + "&dateTo=" + this.state.dateTo;}
      if(this.state.userFilter){linkString = linkString + "&user=" + this.state.userFilter;}

   
  return (
    <div className="App">
      <h1 className="headertext">GORT Image Archive</h1>
      <p style={{color: 'white'}}>Image Count: {this.state.totalItems}<br /></p>
        <div className="filters">
        
        <label>Object Selection: </label>
        
        <select name="objectfilter" onChange={this.objectFilter} value={this.state.objectFilter}>
            <option value="" key="null">All Objects</option>
          {this.state.objectList.map(targets => (
            <option value={targets} key={targets}>{targets}</option>
          ))}
          </select> 
          

          <Example name="dateFrom"
                    setDay = {this.setDay2}
                    dateCurrent = {this.state.dateFromstring}/>

             <Example name="dateTo"
                    setDay = {this.setDay2}
                    dateCurrent = {this.state.dateTostring}/>


            
          <label>User: </label>
        
        <select name="userfilter" onChange={this.userFilter} value={this.state.userFilter}>
            <option value="" key="null">All Users</option>
          {this.state.userList.map(targets => (
            <option value={targets} key={targets}>{targets}</option>
          ))}
          </select> 
            <br />

          <button value="reset" id="resetDate" className="pagelink" onClick={this.resetDate}>Reset Dates</button>
          <button value="resetAll" id="resetAll" className="pagelink" onClick={this.resetAll}>Reset All</button>
          <button value="dl" id="dl" className="pagelink" onClick={() => this.openDownload(linkString)}>Download Results</button>
          
          </div>
         
        <div className="pagelinks">
        <ul>
          <PageNumbers 
              totalPages = {this.state.totalPages}
              currentPage = {this.state.currentPage}
              setPage = {this.setPage}  
              object = {this.state.objectFilter}
              dateFrom = {this.state.dateFrom}
              dateTo = {this.state.dateTo}
              perPage = {this.state.perpage}
              linkString = {linkString}
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
              <td><a href={`http://gtn.sonoma.edu/archive/${items.filename}`} download>Download</a></td>
              <td>{items.OBJECT}</td>  
              <td>{this.dateConvert1(items.DATEOBS)}</td>
                  <td>{items.CCDTEMP ? items.CCDTEMP.substr(0,5) : ''}</td> 
              <td>{items.FILTER}</td>
              <td>{Math.round(items.EXPTIME * 10) / 10}</td>
              <td>{items.USER}</td>
            </tr>
        
            )


            )}
        </tbody>
      </table>
    </div>
  )};



}


export default App;
