import React from 'react';  
import '../App.css';  



export default class PageNumbers extends React.Component {
    
    render() {
      var pageNumbers = [];
      if (this.props.totalPages !== null) {
        for (let i = 1; i <= this.props.totalPages; i++) {
          
          pageNumbers.push(i);
          }
        }
      
        return( 
        <div className="pagination">
          <ul>
           <li>
           {this.props.totalPages > 3 ? 
            this.props.currentPage == 1 ? 
              "\u003C" :<a href={"/?page=" + (this.props.currentPage - 1) + this.props.linkString} className="pagelink">&lt;</a> : ''}
           </li>

          {  pageNumbers.map(nums => (
                <li key={nums}><a href={"./?page=" + nums + this.props.linkString} className=
                {nums == this.props.currentPage ? "pagecurrent" : "pagelink"}  
              >{nums}</a></li>  


        ))} 
           <li>
           {this.props.totalPages > 3 ? 
            this.props.currentPage == this.props.totalPages ? 
              "\u003E" :<a href={"/?page=" + (this.props.currentPage - 1) + this.props.linkString} className="pagelink">&gt;</a> : ''}
           </li>
        
           </ul>
        </div>
        )  
    }

}
