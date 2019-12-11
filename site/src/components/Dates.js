import React from "react";
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";
 
// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';
 
export default class Dates extends React.Component {
  state = {
    startDate: ''
  };
 
componentDidUpdate(){
  if(this.props.dateCurrent == '' && this.state.startDate != ''){
    this.setState({startDate: ''});
  }
}

  handleChange = date => {
    this.props.setDay(date, this.props.name);
    this.setState({startDate: date});
  };
 
  render() {
    return (
    <div>
         <label htmlFor={this.props.name}>{this.props.name === "dateFrom" ? 'From: ' : 'To: '}</label>

      <DatePicker
        maxDate={new Date()}
        onChange={this.handleChange}
        selected={this.state.startDate}
      />

      </div>
    );
  }
}
