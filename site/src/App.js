import React from 'react';
import './App.css';

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

  loadPage(){
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    const perpage = parseInt(params.get('perpage')) || 50;
    if (page !== this.state.page){

    fetch('http://localhost:3001?page=' + page + "&perpage=" + perpage)
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
        <p style={{color: 'white'}}>Count: {this.state.totalItems}<br />
        <div className="pagelinks">
        <ul>
          {pageNumbers.map(nums => (
            <li><a href={"./?page=" + nums + "&perpage=" + this.state.perpage} className="pagelink">{nums}</a></li> 
          ))}  
          </ul>
        </div>
        </p>        
                
        <table>
        <tr>
        <th></th>
        <th>Object</th>
        <th>Date/Time</th>
        <th>CCD Temp</th>
        <th>Filter</th>
        <th>Observer</th>
        </tr>

      
      {this.state.items.map(items => ( 
        <tr>
          <td><a href={`http://gtn.sonoma.edu/archive/${items.filename}`} download>Download</a></td>
          <td>{items.OBJECT}</td>  
          <td>{items.DATEOBS}</td>
              <td>{items.XPIXSZ ? items.XPIXSZ.substr(0,6) : ''}</td> 
          <td>{items.FILTER}</td>
          <td>{items.OBSERVER}</td>
        </tr>
        
            )


            )}
      </table>
    </div>
  )};



}


export default App;
