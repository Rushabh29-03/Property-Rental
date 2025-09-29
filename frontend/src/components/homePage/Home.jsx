import React from 'react'
import mainImage from '../../assets/homePage_3x2.png'

function Home() {
  return (
    <div className="relative min-h-screen bg-cover bg-center items-center justify-center" style={{ backgroundImage: `url(${mainImage})` }}>
      {/* Overlay to darken image slightly and make text pop */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      <div className="relative z-10 flex flex-col p-6 md:p-10 lg:p-12">
        {/* Logo */}
        <div className="flex items-center text-white text-3xl font-bold">
          
          <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M9.243 3.031a1 1 0 011.514 0l6.233 6.046a.5.5 0 01.129.215v6.5A1.5 1.5 0 0116 18H4a1.5 1.5 0 01-1.5-1.5V9.292a.5.5 0 01.129-.215l6.233-6.046zM10 5.467L4.793 10.707 5 11h2v5h6v-5h2l.207-.293L10 5.467z" clipRule="evenodd"></path>
          </svg>
          CONNECT HOMES
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-white">
        {/* Search Bar */}
          <div className="flex items-center bg-white rounded-full shadow-md w-3xl p-2">
            {/* Search Icon */}
            <svg className="w-5 h-5 text-gray-500 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by location, property type..."
              className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-gray-800"
            />
            {/* House Icon */}
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            {/* Down Arrow Icon */}
            <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          </div>
      </div>
  )
}

export default Home