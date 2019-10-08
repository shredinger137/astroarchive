import React from 'react';
import './App.css';
import { config } from './config.js';

class App extends React.Component {
  constructor(props){
    super(props);
    this.objectFilter = this.objectFilter.bind(this);
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
    objectFilter: ''
  }

  componentDidMount() {
    this.loadPage();
    this.loadStats();
  }   

  componentDidUpdate() {
    this.loadPage();
  }

  dateConvert1(datetime)
  {
    if(datetime){
    var input = datetime.trim() + "Z";
    var date = new Date(input);
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

  loadPage(){
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    const perpage = parseInt(params.get('perpage')) || 50;
    if (page !== this.state.page){

    fetch(config.api + "?page=" + page + "&perpage=" + perpage + "&" + this.state.filters)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({items: responseJson.items, totalPages: (responseJson.count / this.state.perpage), 
     totalItems: responseJson.count});
    })
      .catch((error) => {
      console.error(error);
    }); 
    console.log(config.api + "?page=" + page + "&perpage=" + perpage + "&" + this.state.filters);
    console.log(this.state.objectFilter);
  }
  }

  getParams() {
    var url = new URL(window.location);
    var page = url.searchParams.get('page');

    this.setState({
      page: this.page
    })

  }

  objectFilter(event){
    this.setState({
      objectFilter: event.target.value,
      filters: "object=" + event.target.value
    })
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
        <p style={{color: 'white'}}>Image Count: {this.state.totalItems}<br /></p>
        <select name="objectfilter" onChange={this.objectFilter} value={this.state.objectFilter}>
            <option value="" key="null" value="">All Objects</option>
          {this.state.objectList.map(targets => (
            <option value={targets} key={targets}>{targets}</option>
          ))}
          </select> 
        <div className="pagelinks">
        <ul>
          {pageNumbers.map(nums => (
            <li key={nums}><a href={"./?page=" + nums + "&perpage=" + this.state.perpage + "&" + this.state.filters} className="pagelink">{nums}</a></li> 
          ))}  
          </ul>
        </div>

                
        <table>
          <thead>
            <tr>
            <th></th>
            <th>Object</th>
            <th>Date/Time (UTC)</th>
            <th>CCD Temp</th>
            <th>Filter</th>
            <th>Observer</th>
            </tr>
          </thead>

        <tbody>
          {this.state.items.map(items => ( 
            <tr key={items.filename}>
              <td><a href={`http://gtn.sonoma.edu/archive/${items.filename}`} download>Download</a></td>
              <td>{items.OBJECT}</td>  
              <td>{this.dateConvert1(items.DATEOBS)}</td>
                  <td>{items.CCDTEMP ? items.CCDTEMP.substr(0,7) : ''}</td> 
              <td>{items.FILTER}</td>
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
