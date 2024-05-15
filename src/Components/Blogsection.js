
// import React from 'react'
// import FontAwesome from 'react-fontawesome'
// import {Link} from 'react-router-dom'
// import {excerpt} from '../Utility'
// const Blogsection = ({id,blogs,user,handleDelete}) => {
//     const userId=user?.uid;
//   return (
//     <div>
//       <div className="blog-heading text-start py-2 mb-4">
//         Daily blog
//       </div>
//       {blogs?.map((item)=>(
//         <div className="row pv-4" key={item.id}>
//             <div className="col md-5">
//                 <div className="hover-blogs-img">
//                     <div className="blogs-img">
//                         <img src={item.imgurl} alt={item.title} />
//                         <div>

//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="col-md-7">
//                 <div className="text-start">
//                     <h6 className="category catg-color">
//                         {item.category}
//                     </h6>
//                     <span className="title">
//                         {item.title}
//                     </span>
//                     <span className="meta-info">
//                         <p className="author">{item.author}</p>-&nbsp;
//                         {item.timestamp.toDate().toDateString()}
//                     </span>
//                 </div>
//                 <div className="short-description text-start">
//                     {excerpt(item.description,120)}
//                 </div>
//                 <Link to= {`/detail/${id}`} >
//                 <button className="btn btn-read">
//                     Read more
//                 </button>
//                 </Link>
//                  {userId  && item.userId=== userId && (
//             <div style={{ float: "right" }}>
//               <FontAwesome
//                 name="trash"
//                 style={{ margin: "15px", cursor: "pointer" }}
//                 size="2x"
//                 onClick={() => handleDelete(item.id)}
//               />
//               <Link to={`/update/${item.id}`}>
//                 <FontAwesome
//                   name="edit"
//                   style={{ cursor: "pointer" }}
//                   size="2x"
//                 />
//               </Link>

//             </div>
//           )}
               
//          </div>

//         </div>
//       ))}
//     </div>
//   );
// }

// export default Blogsection



// import React, { useEffect } from "react";
import FontAwesome from "react-fontawesome";
import { Link } from "react-router-dom";
import { excerpt } from "../Utility";

const BlogSection = ({
  id,
  title,
  description,
  category,
  imgUrl,
  userId,
  author,
  timestamp,
  user,
  handleDelete,
}) => {
  return (
    <div>
      <div className="row pb-4" key={id}>
        <div className="col-md-5">
          <div className="hover-blogs-img">
            <div className="blogs-img">
              <img src={imgUrl} alt={title} />
              <div></div>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="text-start">
            <h6 className="category catg-color">{category}</h6>
            <span className="title py-2">{title}</span>
            <span className="meta-info">
              <p className="author">{author}</p> -&nbsp;
              {timestamp.toDate().toDateString()}
            </span>
          </div>
          <div className="short-description text-start">
            {excerpt(description, 120)}
          </div>
          <Link to={`/detail/${id}`}>
            <button className="btn btn-read">Read More</button>
          </Link>
          {user && user.uid === userId && (
            <div style={{ float: "right" }}>
              <FontAwesome
                name="trash"
                style={{ margin: "15px", cursor: "pointer" }}
                size="2x"
                onClick={() => handleDelete(id)}
              />
              <Link to={`/update/${id}`}>
                <FontAwesome
                  name="edit"
                  style={{ cursor: "pointer" }}
                  size="2x"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
