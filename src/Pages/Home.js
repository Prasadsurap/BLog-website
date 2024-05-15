import {collection,deleteDoc,doc,getDocs,limit,onSnapshot,query,orderBy,where,startAfter,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import BlogSection from "../Components/Blogsection";
import Spinner from "../Components/Spinner";
import { db } from "../firebase";
import { toast } from "react-toastify";
import Tags from "../Components/Tags";
import FeatureBlogs from "../Components/FeatureBlogs";
import Trending from "../Components/Trending";
import Search from "../Components/Search";
import { isEmpty, isNull } from "lodash";
import { useLocation } from "react-router-dom";
import Category from "../Components/Category";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Home = ({ setActive, user, active }) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [lastVisible, setLastVisible] = useState(null);
  const [trendBlogs, setTrendBlogs] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(null);
  const [hide, setHide] = useState(false);
  const queryString = useQuery();
  const searchQuery = queryString.get("searchQuery");
  const location = useLocation();

  const getTrendingBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const trendQuery = query(blogRef, where("trending", "==", "yes"));
    const querySnapshot = await getDocs(trendQuery);
    let trendBlogs = [];
    querySnapshot.forEach((doc) => {
      trendBlogs.push({ id: doc.id, ...doc.data() });
    });
    setTrendBlogs(trendBlogs);
  };

  useEffect(() => {
    getTrendingBlogs();
    setSearch("");
    const unsub = onSnapshot(
      collection(db, "blogs"),
      (snapshot) => {
        let list = [];
        let tags = [];
        snapshot.docs.forEach((doc) => {
          tags.push(...doc.get("tags"));
          list.push({ id: doc.id, ...doc.data() });
        });
        const uniqueTags = [...new Set(tags)];
        setTags(uniqueTags);
        setTotalBlogs(list);
        // setBlogs(list);
        setLoading(false);
        setActive("home");
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
      getTrendingBlogs();
    };
  }, [setActive, active]);

  useEffect(() => {
    getBlogs();
    setHide(false);
  }, [active]);

  const getBlogs = async () => {
    const blogRef = collection(db, "blogs");
    console.log(blogRef);
    const firstFour = query(blogRef, orderBy("title"), limit(4));
    const docSnapshot = await getDocs(firstFour);
    setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
  };

  console.log("blogs", blogs);

  const updateState = (docSnapshot) => {
    const isCollectionEmpty = docSnapshot.size === 0;
    if (!isCollectionEmpty) {
      const blogsData = docSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs((blogs) => [...blogs, ...blogsData]);
      setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
    } else {
      toast.info("No more blog to display");
      setHide(true);
    }
  };

  const fetchMore = async () => {
    setLoading(true);
    const blogRef = collection(db, "blogs");
    const nextFour = query(
      blogRef,
      orderBy("title"),
      limit(4),
      startAfter(lastVisible)
    );
    const docSnapshot = await getDocs(nextFour);
    updateState(docSnapshot);
    setLoading(false);
  };

  const searchBlogs = async () => {
    const blogRef = collection(db, "blogs");
    const searchTitleQuery = query(blogRef, where("title", "==", searchQuery));
    const searchTagQuery = query(
      blogRef,
      where("tags", "array-contains", searchQuery)
    );
    const titleSnapshot = await getDocs(searchTitleQuery);
    const tagSnapshot = await getDocs(searchTagQuery);

    let searchTitleBlogs = [];
    let searchTagBlogs = [];
    titleSnapshot.forEach((doc) => {
      searchTitleBlogs.push({ id: doc.id, ...doc.data() });
    });
    tagSnapshot.forEach((doc) => {
      searchTagBlogs.push({ id: doc.id, ...doc.data() });
    });
    const combinedSearchBlogs = searchTitleBlogs.concat(searchTagBlogs);
    setBlogs(combinedSearchBlogs);
    setHide(true);
    setActive("");
  };

  useEffect(() => {
    if (!isNull(searchQuery)) {
      searchBlogs();
    }
  }, [searchQuery]);

  if (loading) {
    return <Spinner />;
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure wanted to delete that blog ?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "blogs", id));
        toast.success("Blog deleted successfully");
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    if (isEmpty(value)) {
      console.log("test");
      getBlogs();
      setHide(false);
    }
    setSearch(value);
  };

  // category count
  const counts = totalBlogs.reduce((prevValue, currentValue) => {
    let name = currentValue.category;
    if (!prevValue.hasOwnProperty(name)) {
      prevValue[name] = 0;
    }
    prevValue[name]++;
    // delete prevValue["undefined"];
    return prevValue;
  }, {});

  const categoryCount = Object.keys(counts).map((k) => {
    return {
      category: k,
      count: counts[k],
    };
  });

  console.log("categoryCount", categoryCount);

  return (
    <div className="container-fluid pb-4 pt-4 padding">
      <div className="container padding">
        <div className="row mx-0">
          <Trending blogs={trendBlogs} />
          <div className="col-md-8">
            <div className="blog-heading text-start py-2 mb-4">Daily Blogs</div>
            {blogs.length === 0 && location.pathname !== "/" && (
              <>
                <h4>
                  No Blog found with search keyword:{" "}
                  <strong>{searchQuery}</strong>
                </h4>
              </>
            )}
            {blogs?.map((blog) => (
              <BlogSection
                key={blog.id}
                user={user}
                handleDelete={handleDelete}
                {...blog}
              />
            ))}

            {!hide && (
              <button className="btn btn-primary" onClick={fetchMore}>
                Load More
              </button>
            )}
          </div>
          <div className="col-md-3">
            <Search search={search} handleChange={handleChange} />
            <div className="blog-heading text-start py-2 mb-4">Tags</div>
            <Tags tags={tags} />
            <FeatureBlogs title={"Most Popular"} blogs={blogs} />
            <Category catgBlogsCount={categoryCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;



















// import { useLocation } from "react-router-dom";
// import Search from '../Components/Search'
// import { collection, deleteDoc, getDocs, onSnapshot,query,where } from 'firebase/firestore';
// import React,{useState,useEffect} from 'react'
// import Blogsection from '../Components/Blogsection';
// import Spinner from '../Components/Spinner';
// import { db } from '../firebase';
// import { toast } from "react-toastify";
// import Tags from '../Components/Tags';
// import { doc } from "firebase/firestore";
// import MostPopular from '../Components/Mostpopular'; 
// import Trending from '../Components/Trending';
// import { isEmpty, isNull, orderBy } from 'lodash';


// function useQuery(){
//   return new URLSearchParams(useLocation().search);

// }

// const Home=({setActive,user})=> {
//   const[loading,setLoading]=useState(true);
//   const[blogs,setBlogs]=useState([]);
//   const[tags,setTags]=useState([]);
//   const [search,setSearch]=useState("");
//   const[trendBlogs,setTrendBlogs]=useState([]);
//   const queryString = useQuery();
//   const searchQuery =queryString.get("searchQuery")

  

//   const getTrendingBlogs = async () => {
//   try {
//     const blogRef = collection(db, "blogs");
//     const trendQuery = query(blogRef, where("trending", "==", "yes"));
//     const querySnapshot = await getDocs(trendQuery);
//     let trendBlogs = [];
//     querySnapshot.forEach((doc) => {
//       trendBlogs.push({ id: doc.id, ...doc.data() }); 
//     });
//     setTrendBlogs(trendBlogs);
//   } catch (error) {
//     console.error("Error fetching trending blogs:", error);
//   }
// };





//   useEffect(()=>{
//     getTrendingBlogs();
//     const unsub=onSnapshot(
//       collection(db,"blogs"),
//       (Snapshot)=>{
//         let list=[];
//         let tags=[];
//         Snapshot.docs.forEach((doc)=>{
//           tags.push(...doc.get("tags"))
//           list.push({id:doc.id,...doc.data()})
//         })

//         const uniqueTags=[...new Set(tags)];

//         setTags(uniqueTags)
//         setBlogs(list)
//         setLoading(false)
//         setActive("home");
//       },
//       (error)=>{
//         console.log(error)
//       }
//     )
//     return()=>{
//       unsub();
//       getTrendingBlogs();
//     }
//   },[setActive])

//   useEffect(()=>{
//     if(!isNull(searchQuery)){
//       searchBlogs()
//     }
//   },[searchQuery])

//   const searchBlogs = async()=>{
//      const blogRef =collection(db,"blogs");
//      const searchTitleQuery =query(blogRef,where("title","==",searchQuery));
//      const searchTagQuery =query(blogRef,where("tags","arry-contains",searchQuery));
//      const tagSnapshot=await getDocs(searchTagQuery)
//      const titleSnapshot=await getDocs(searchTitleQuery)
//      let searchTitleBlogs=[];
//      let searchTagBlogs=[];

//      titleSnapshot.forEach((doc)=>{
//         searchTitleBlogs.push({id:doc.id,...doc.data})
//      })
//      tagSnapshot.forEach((doc)=>{
//         searchTagBlogs.push({id:doc.id,...doc.data})
//      })
//      const combinedSearchBlogs =searchTitleBlogs.concat(searchTagBlogs)
//      setBlogs(combinedSearchBlogs)

//   }
 
//   if(loading){
//     return<Spinner/>
//   }
//   const handleDelete =async(id)=>{
//       if(window.confirm("are u sure"))
//       {
//         try{
//           setLoading(true)
//           await deleteDoc(doc(db,"blogs",id))
//           toast.success("blog deleated successfully")
//           setLoading(false)
//         }
//         catch(err){
//             console.log(err)
//         }
//       }
//   }
//   const getBlogs =async()=>{
//     const blogRef =collection(db,"blogs");
//     // const blogsQuery=query(blogRef, orderBy("title"))
//     const docSnapshot=await getDocs(blogRef );
//     setBlogs(docSnapshot.docs.map((doc)=>({id:doc.id,...doc.data()})))
//   }


//   const handleChange=(e)=>{
//     const{value}=e.target;
//     if(isEmpty(value)){
//       getBlogs()
//     }
//     setSearch(value)

//   }
//   console.log("blogs",blogs);
//   return (
//     <div className="container-fluid pb-4 pt-4 padding">
//       <div className="container-padding">
//         <div className="row mx-0">
//           <Trending blogs={trendBlogs}/>

          
//           <div className="col-md-8">
            
//             <Blogsection blogs={blogs} user={user} handlechange={handleDelete}/>
//           </div>
//           <div className="col-md-3">
//             <Search search={search} handleChange={handleChange}/>
//             <Tags tag={tags}/>
//             <MostPopular blogs={blogs}/>

//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default Home

