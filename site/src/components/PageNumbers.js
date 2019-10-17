import React from 'react';  
import '../App.css';  



export default class PageNumbers extends React.Component {
    renderPageNumbers(pageNumbers){
      var linkString = "&perPage=" + this.props.perpage 
      + "&object=" + this.props.object
      + "&dateFrom=" + this.props.dateFrom 
      + "&dateTo=" + this.props.dateTo;

    return pageNumbers.map(nums => (
      <li key={nums}><a href={"./?page=" + nums + linkString} className="pagelink">{nums}</a></li> 
    ))
  }
    
    render() {
      var linkString = "&perPage=" + this.props.perpage 
      + "&object=" + this.props.object
      + "&dateFrom=" + this.props.dateFrom 
      + "&dateTo=" + this.props.dateTo;
      
      var pageNumbers = [];
      if (this.props.totalPages !== null) {
        for (let i = 1; i <= this.props.totalPages; i++) {
          pageNumbers.push(i);
          }
        }
      
        return(
            pageNumbers.map(nums => (
                <li key={nums}><a href={"./?page=" + nums + linkString} className=
                {nums === this.props.currentPage ? "pagecurrent" : "pagelink"}  
              >{nums}</a></li>  


        ))
        )  
    }

}
