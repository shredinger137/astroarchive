import React from "react";
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";
 
// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';
 
export default class Dates extends React.Component {
  state = {
    startDate: new Date()
  };
 
  handleChange = date => {
    this.props.setDay(date, this.props.name);
  };
 
  render() {
    return (
    <div>
         <label htmlFor={this.props.name}>{this.props.name === "dateFrom" ? 'From: ' : 'To: '}</label>

      <DatePicker
        maxDate={new Date()}
        onChange={this.handleChange}
      />

      </div>
    );
  }
}
