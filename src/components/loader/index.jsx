import React from 'react'
import { Bars } from 'react-loader-spinner'

const Loader = () => {
  return (
    <div className='loader_wrapper'>
        <Bars
height="4.167vw"
width="4.167vw"
color="#fff"
ariaLabel="bars-loading"
wrapperStyle={{}}
wrapperClass=""
visible={true}
/>
    </div>
  )
}

export default Loader