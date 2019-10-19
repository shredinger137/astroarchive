import React from "react";
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";
 
// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';
 
export default class Example extends React.Component {
  state = {
    startDate: new Date()
  };
 
  handleChange = date => {
    this.props.setDay(date, this.props.name);
  };
 
  render() {
    return (
    <div>
         <span className="text">{this.props.name === "dateFrom" ? 'From: ' : 'To: '}</span>
    
      <DatePicker
        selected={this.props.dateCurrent}
        onChange={this.handleChange}
      />
      
      </div>
    );
  }
}
