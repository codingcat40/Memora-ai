import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


export const ProtectedLayout = () =>  {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}