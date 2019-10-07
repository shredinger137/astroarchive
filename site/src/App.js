import React from 'react';
import './App.css';
import { config } from './config.js';

//Empty comment - remove this


class App extends React.Component {
  state = {
    items: [],
    page: '',
    perpage: 50,
    totalPages: 1,
    currentPage: 1,
    totalItems: 50
  }

  componentDidMount() {
    this.loadPage();
  }   

  componentDidUpdate() {
    this.loadPage();
  }

  dateConvert1(datetime)
  {
    if(datetime){
    var input = datetime.trim() + "Z";
    var date = new Date(input);
    var datestring = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes(); 
    return(datestring)
  }
  }


  loadPage(){
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    const perpage = parseInt(params.get('perpage')) || 50;
    if (page !== this.state.page){

    fetch(config.api + "?page=" + page + "&perpage=" + perpage)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({items: responseJson.items, totalPages: (responseJson.count / this.state.perpage), 
     totalItems: responseJson.count});
    })
      .catch((error) => {
      console.error(error);
    }); 
    
  }
  }

  getParams() {
    var url = new URL(window.location);
    var page = url.searchParams.get('page');
    console.log(page);
    this.setState({
      page: this.page
    })
    this.getData();
  }


setPage(page){
  this.setState({
    page: this.state.page + 1
  })
}



getData(){
  fetch('http://gtn.sonoma.edu/api?page=' + this.state.page + "&perpage=" + this.state.perpage)
   .then((response) => response.json())
   .then((responseJson) => {
     this.setState({items: responseJson.items, totalPages: (responseJson.count / this.state.perpage), 
    totalItems: responseJson.count});
   })
     .catch((error) => {
     console.error(error);
   });
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
        <p style={{color: 'white'}}>Count: {this.state.totalItems}<br /></p>
        <div className="pagelinks">
        <ul>
          {pageNumbers.map(nums => (
            <li key={nums}><a href={"./?page=" + nums + "&perpage=" + this.state.perpage} className="pagelink">{nums}</a></li> 
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
