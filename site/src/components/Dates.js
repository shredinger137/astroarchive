import React from "react";
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";
 

/* eslint-disable eqeqeq */
 
export default class Dates extends React.Component {
  state = {
    startDate: ''
  };

  //dateCurrentEpoch
 
componentDidUpdate(){
  if(this.props.dateCurrent == '' && this.state.startDate != ''){
    this.setState({startDate: ''});
  }
} 

componentDidMount(){
  this.setState({startDate: this.props.dateCurrent});
  console.log(this.props.dateCurrent);
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
