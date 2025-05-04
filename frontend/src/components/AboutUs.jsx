import React from 'react'
import { Link } from 'react-router-dom'
import './AboutUs.css'
const AboutUs = () => {
  return (
    <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
  />
  <title>About Us Page</title>
  <link rel="stylesheet" href="about.css" />
  <section>
    <div className="about-us">
                <div className="mb-4 mt-4">
                                    <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-700 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                                        &larr; Back to Dashboard
                                    </Link>
                </div> 
      <h1>About Us</h1>
      <div className="wrapper">
        <div className="content">
          <h3>
            Welcome to VizXcel — your smart solution for transforming Excel data
            into meaningful, interactive visualizations.
          </h3>
          <p>
            At VizXcel, we believe that data should speak clearly.Whether you're
            a student analyzing project data, a professional preparing reports,
            or simply someone curious about trends in numbers, VizXcel is here
            to make your journey smoother. Our tool bridges the gap between raw
            data and visual understanding, making analysis quicker, easier, and
            more impactful. We are passionate about making data visualization
            accessible to everyone — no coding or advanced tools required. With
            VizXcel, your spreadsheets become stories. Thank you for choosing
            VizXcel — where your data comes to life.
          </p>
          <div className="button">
            <a href="">Read more</a>
          </div>
          <div className="social">
            <a href="">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="">
              <i className="fab fa-twitter" />
            </a>
            <a href="">
              <i className="fab fa-instagram" />
            </a>
          </div>
        </div>
        <div className="image-section">
          <img src="https://th.bing.com/th/id/OIP.O3FHKELzA0Di7Y8BC3De4AHaFg?cb=iwc1&rs=1&pid=ImgDetMain" width="500px" height="300px" alt='COMPANY IMAGE'/>
        </div>
      </div>
    </div>
  </section>
</>

  )
}

export default AboutUs