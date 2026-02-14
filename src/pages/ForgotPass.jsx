import React, { useState } from 'react'
import { toast } from 'react-toastify';

const ForgotPass = () => {
    const [state,setState]=useState("show")
    const [email,setEmail]=useState("");
    const [otp,setOtp]=useState("");

    function handleStudentDetails(e){
        e.preventDefault();
        if(!email.includes(".")){
            toast.error('Please ennter a valid email address!!');
            return
        }
        toast.success(`Email entred is ${email} and otp entered is ${otp}`);
        setEmail("");
        setOtp("");
    }

  return (
    <div className='w-full min-h-screen bg-linear-to-r from-blue-400 to-purple-400 flex items-center justify-center'>
        <div className='w-112.5 m-auto bg-slate-800 rounded-lg shadow-lg' >
            <form onSubmit={handleStudentDetails} className='p-5 text-white w-full flex flex-col gap-2.5' action="">
                <div>
                    <label className='text-2xl font-semibold' htmlFor="email">Email:</label>
                    <input onChange={(e)=>{setEmail(e.target.value)}} className='w-full py-1.5 mt-2 px-2 outline-none border border-gray-300 rounded-lg' value={email} type="email" placeholder='EmailId' required id='email' />
                </div>
                <div>
                    <label className='text-2xl font-semibold' htmlFor="code">Otp:</label>
                    <input value={otp} onChange={(e)=>{setOtp(e.target.value)}} className='w-full py-1.5 mt-2 px-2 outline-none border border-gray-300 rounded-lg' type="number" placeholder='Enter otp send to your email' id='code' required min={1} />
                </div>

                <button className='w-full bg-blue-500 text-white font-semibold text-2xl mt-3 rounded-lg cursor-pointer py-1.5 transition-all hover:bg-blue-400' type='submit'>Submit</button>

            </form>
        </div>

    </div>
  )
}

export default ForgotPass