import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api";

import { Button, notification } from "antd";
import Logo from "../assets/Logo";

type NotificationType =  "error" | "warning";

export const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setUser } = useAuth();

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

  const sendRequest = async () => {
    try {
      const res = await axios.post(
        apiUrl("/api/auth/login"),
        { username, password },
        { withCredentials: true }
      );

      setUser(res.data.user);

      console.log("Login page data", res.data.user);
      navigate("/home", {replace:   true});
    } catch (err) {
      openNotificationWithIcon('error', `Incorrect Username or Password`,'Error')
      console.log('Login Error: ' +  err);
    }
  };

  const validate = () => {
    if (username === "" || password === "") {
      openNotificationWithIcon('warning', 'Username and Password can not be empty','Error')
    }
  };

  const onHandleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    validate();
    if(username &&  password){
      sendRequest()
    }
  };

  return (
    <div
      className="flex pt-14 items-center justify-center min-h-screen z-10 overflow-hidden bg-cover bg-center"    >
      <div className="absolute inset-0 z-0" style={{backgroundSize:"cover"}}>
        <Logo />
      </div>
      {contextHolder}
      <div className="w-full max-w-[420px] min-w-[120px] p-8 max-h-[455px] rounded-2xl shadow-lg  backdrop-blur-2xl m-8">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Welcome back
        </h2>

        <form className="flex flex-col space-y-5">
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

          <Button color="blue" variant="solid" onClick={onHandleSubmit}>
            Sign In
          </Button>

          <p className="text-white font-serif">
            Are You a New User, You can Sign Up{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-500 cursor-pointer text-lg"
            >
              Here
            </span>{" "}
          </p>
        </form>
      </div>
    </div>
  );
};
