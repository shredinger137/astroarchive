import React from 'react';
import './App.css';

class App extends React.Component {
  state = {
    items: []
  }

  componentDidMount() {
    this.getData();
    
}

getData(){
  return fetch('http://localhost:3001')
   .then((response) => response.json())
   .then((responseJson) => {
     this.setState({items: responseJson.items});
     return responseJson.items;
   })
   .catch((error) => {
     console.error(error);
   });
}

  render() {
    
  return (
    <div className="App">
      <table>
  
        <tr>
        <td></td>
        <td>Object</td>
        <td>Date</td>
        <td>Temp</td>
        </tr>

      
      {this.state.items.map((items => ( 
        <tr>
          <td><a href={`http://gtn.sonoma.edu/archive/${items.filename}`} download>Download</a></td>
          <td>{items.OBJECT}</td>  
          <td>{items.DATEOBS}</td>
          <td>{items.TEMPERAT}</td>
        </tr>
        
            )


            ))}
      </table>
    </div>
  )};



}


export default App;
