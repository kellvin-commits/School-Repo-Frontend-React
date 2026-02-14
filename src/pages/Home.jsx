import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify';
import {Mail,LockIcon,EyeIcon} from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [userData,setUserData]=useState({});
    const [loading,setLoading]=useState(false);
    const Navigate=useNavigate();
    const API_BASE_URL='http://localhost:4000/api/auth';
    if(loading) return <div className='w-full min-h-screen absolute top-0 left-0 right-0 bottom-0 bg-white text-2xl z-50 flex items-center justify-center'><h3 className='w-12.5 h-12.5 rounded-full bg-transparent  border-r-amber-400 border-8 animate-spin'></h3></div>


     async function handleForm(e){
        setLoading(true)
        e.preventDefault();
        setTimeout(() => {
            setLoading(false)
            setInterval(() => {
                
                
            }, 1100);
            
        }, 1000);
        
        if(!email.includes(".")){
            toast.error("Please enter a valid email address!!")
            return
        }

        try {
            const res=await fetch(`${API_BASE_URL}/login`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({email,password})

            })  
            const result=await res.json();
            if(res.ok){
                toast.success(result.message);
                alert(result.token)
            }else{
                toast.error(result.message)
                
            }

            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
            
            
        }
     
       
        

    }

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-linear-to-br to-blue-300 bg-purple-400'>
        <div className=' w-112.5 max-md:w-[95%] m-auto'>
            <form onSubmit={handleForm} className='w-full bg-slate-800 text-white px-6 py-6 rounded-lg shadow-lg flex flex-col gap-2.5' action="">
                <h2 className='text-center text-2xl font-semibold'>Login Here</h2>
                <div className='w-full relative'>
                    <label className='text-2xl font-semibold' htmlFor="email">Email:</label>
                    <div className='flex justify-between items-center relative'>
                           <input onChange={(e)=>{setEmail(e.target.value)}} className='w-full px-2 py-1.5 border border-gray-400 outline-none rounded-lg  font-semibold text-sm bg-transparent focus:bg-transparent mt-2' type="email" id='email' value={email} placeholder='EmailId' required />
                           <Mail className='absolute right-2 translate-x-1 translatey-y-1'/>

                    </div>
                 
                </div>
                <div>
                    <label className='text-2xl font-semibold' htmlFor="password">Password:</label>
                 <div className='flex justify-between items-center relative'>
                       <input onChange={(e)=>{setPassword(e.target.value)}} className='w-full px-2 py-1.5 border border-gray-400 outline-none rounded-lg  font-semibold text-sm bg-transparent focus:bg-transparent mt-2' type="password" value={password} id='password' placeholder='Enter your password' required />
                       <LockIcon className='absolute  right-2 translate-x-1 translatey-y-1 z-50'/>
                 </div>
                </div>
                <div>
                    <span onClick={()=>{Navigate('/reset-pass')}}  className='text-sm hover:underline cursor-pointer'>Forgot password?</span>
                </div>
                <button className='w-full py-2 px-3 bg-linear-to-r from-blue-400 to-indigo-600 font-semibold rounded-lg cursor-pointer text-2xl transition-all' type='submit'>Login</button>

            </form>
        </div>
        <div className='absolute bottom-0'>
            <h2 className='text-sm font-semibold'>Kelly&copy;{new Date().getFullYear()}</h2>
        </div>
    </div>
  )
}

export default Home