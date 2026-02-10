import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


import { Button, notification } from "antd";
import Logo from "../assets/Logo";

type NotificationType =  "error" | "warning";


export const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();



  // Notification
    const [api, contextHolder] = notification.useNotification();
    const openNotificationWithIcon = (type: NotificationType, message:string, title:string) => {
      api[type]({
        title: `${title}`,
        description:
          `${message}`,
          duration:  5
        });
    };

  const sendRequest = async () =>  {
    axios.post("https://noema-ai.vercel.app/api/auth/createuser", {
      username,
      email,
      password,
    }, {withCredentials:   true}).then((res) =>  {
      console.log(res.statusText)
    }).catch((err) =>{
      console.log(err)
      openNotificationWithIcon('error', `${err.response.status==409 ?  'Username or email already taken' :  
        'There was an error signing up :('}`, 'Error')
    })
  }

  const onHandleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    validate();
    if(username &&  email && password){
      sendRequest();
    }
    
  };

  const validate = () => {
    if(username === "" || email === "" || password === ""){
      // alert('All fields are  required');
      openNotificationWithIcon('warning','Please fill all the fields','Error')

    }
  }


  return (
    <div
      className="flex pt-14 items-center justify-center z-10 h-screen overflow-y-hidden bg-cover bg-center"
    >
      <div className="absolute inset-0 z-0" style={{backgroundSize:"cover"}}>
        <Logo />
      </div>
      {contextHolder}
      <div className="w-full max-w-[420px] min-w-[120px] p-8 max-h-[455px] rounded-2xl shadow-lg  backdrop-blur-2xl m-8">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Welcome 
        </h2>

        <form className="flex flex-col space-y-5">

          <div className="flex flex-col text-left">
            <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-200">
              Email
            </label>

            <input type="email" id="email" value={email} onChange={
              (e) => setEmail(e.target.value)
            } className="w-full px-3 py-2 border rounded-lg bg-white/90 focus:outline-none focus:ring-2" required/>
          </div>


          <div className="flex flex-col text-left">
            <label
              htmlFor="username"
              className="mb-1 text-sm font-medium text-gray-200"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col text-left">
            <label
              htmlFor="password"
              className="mb-1 text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
          variant="solid"
          color="blue"
          onClick={onHandleSubmit}
          >
              Register
          </Button>
          <p className="text-white font-serif">
            Are You existing User?! You can Sign In{" "}
            <span className="text-blue-500 cursor-pointer text-lg" onClick={() => navigate('/login')}>Here</span>{" "}
          </p>
        </form>
      </div>
    </div>
  );
};
