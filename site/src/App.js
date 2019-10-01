import React from 'react';
import './App.css';

class App extends React.Component {
  state = {
    items: [],
    page: 1,
    count: 50,
    totalPages: 1,
    currentPage: 1,
    totalItems: 50
  }

  componentDidMount() {
    this.getData();
    this.makeArray();
  }   

getData(){
  return fetch('http://localhost:3001?page=' + this.state.page)
   .then((response) => response.json())
   .then((responseJson) => {
     this.setState({items: responseJson.items, totalPages: (responseJson.items.length / this.state.count), 
    totalItems: responseJson.items.length});
   })
     .catch((error) => {
     console.error(error);
   });
}

makeArray(){
  
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
          {pageNumbers.map(pages => (
            <li>{pages}</li>           
          ))}  
          
        </p>        
                
        <table>
        <tr>
        <th></th>
        <th>Object</th>
        <th>Date/Time</th>
        <th>Temp</th>
        <th>Filter</th>
        <th>Observer</th>
        </tr>

      
      {this.state.items.map(items => ( 
        <tr>
          <td><a href={`http://gtn.sonoma.edu/archive/${items.filename}`} download>Download</a></td>
          <td>{items.OBJECT}</td>  
          <td>{items.DATEOBS}</td>
          <td>{items.TEMPERAT}</td> 
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
