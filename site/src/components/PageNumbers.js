import React from 'react';  
import '../App.css';  



export default class PageNumbers extends React.Component {
    
    render() {
      var linkString = this.props.linkString;
      console.log("Page in pages: " + this.props.currentPage);
      console.log("LinkString in pages:" + linkString);
      var pageNumbers = [];
      if (this.props.totalPages !== null) {
        for (let i = 1; i <= this.props.totalPages; i++) {
          pageNumbers.push(i);
          }
        }
      
        return(
            pageNumbers.map(nums => (
                <li key={nums}><a href={"./?page=" + nums + this.props.linkString} className=
                {nums == this.props.currentPage ? "pagecurrent" : "pagelink"}  
              >{nums}</a></li>  


        ))
        )  
    }

}
