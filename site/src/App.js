import React from 'react';
import './App.css';
import { config } from './config.js';


class App extends React.Component {
  constructor(props){
    super(props);
    this.objectFilter = this.objectFilter.bind(this);
    this.setDay = this.setDay.bind(this);
  }
  state = {
    items: [],
    page: '',
    perpage: 150,
    totalPages: 1,
    currentPage: 1,
    totalItems: 50,
    objectList: [],
    filters: '',
    objectFilter: '',
    day: '',
    dateFrom: '',
    dateTo: '',
  }

  componentDidMount() {
    this.loadParams();
    this.loadPage();
    this.loadStats();

  }  

  componentDidUpdate() {
    this.loadPage();
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
      this.setState({objectList: responseJson.result[0]['objects']})    
    })
  }

  loadParams(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('object').length > 1){
      this.setState({
        objectFilter: params.get('object')
      })
    }
    if(params.get('page')){
      this.setState({
        currentPage: params.get('page')
      })
    } else {
      this.setState({
      currentPage: 1
    })
    }
  }

  loadPage(){
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    const perpage = parseInt(params.get('perpage')) || 50;
    
   // if (page !== this.state.page){

    fetch(config.api + "?page=" + this.state.currentPage + "&perpage=" + perpage + "&object=" + encodeURIComponent(this.state.objectFilter) + "&dateFrom=" + this.state.dateFrom + "&dateTo=" + this.state.dateTo)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({items: responseJson.items, totalPages: (Math.round(responseJson.count / this.state.perpage)), 
     totalItems: responseJson.count});
    })
      .catch((error) => {
      console.error(error);
    }); 
    console.log(config.api + "?page=" + page + "&perpage=" + perpage + "&" + this.state.filters + "&dateFrom=" + this.state.dateFrom + "&dateTo=" + this.state.dateTo);
  
    console.log(this.state);
  }


  objectFilter(event){
    this.setState({
      objectFilter: event.target.value,
    })
  }

  setDay(day){
    console.log(day.target.name);
    var date = new Date(day.target.value);
    console.log(Date.parse(date));
    this.setState({
      [day.target.name]: Date.parse(date)
    })
  }

  renderPageNumbers(pageNumbers){
    var linkString = "&perPage=" + this.state.perpage;
    if(this.state.objectFilter.length > 1){
      linkString = linkString + "&object=" + encodeURIComponent(this.state.objectFilter);
    }
    if(this.state.dateFrom.length > 5){
      linkString = linkString + "&dateFrom=" + this.state.dateFrom;
    }
    if(this.state.dateTo.length > 5){
      linkString = linkString + "&dateTo=" + this.state.dateTo;
    }

    return pageNumbers.map(nums => (
      <li key={nums}><a href={"./?page=" + nums + linkString} className="pagelink">{nums}</a></li> 
    ))
  }


  render() {

    var pageNumbers = [];
    if (this.state.totalPages !== null) {
      for (let i = 1; i <= this.state.totalPages; i++) {
        pageNumbers.push(i);
      }
    }

   
  return (
    <div className="App">
      <h1 className="headertext">GORT Image Archive</h1>
        <div className="filters">
        <p style={{color: 'white'}}>Image Count: {this.state.totalItems}<br /></p>
        <p>Object Selection: 
        <select name="objectfilter" onChange={this.objectFilter} value={this.state.objectFilter}>
            <option value="" key="null" value="">All Objects</option>
          {this.state.objectList.map(targets => (
            <option value={targets} key={targets}>{targets}</option>
          ))}
          </select> 
          </p>
          <p>Date Filter:
          <input type="date" name="dateFrom" onChange={this.setDay}></input> to <input name="dateTo" type="date" onChange={this.setDay}></input></p>
          </div>
        <div className="pagelinks">
        <ul>
          {this.renderPageNumbers(pageNumbers)}  
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
            <th>Observer</th>
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
              <td>{items.OBSERVER}</td>
            </tr>
        
            )


            )}
        </tbody>
      </table>
    </div>
  )};



}


export default App;
