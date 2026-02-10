import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import { Button, Flex, Modal,Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { InfoCircleOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";


import { useLLM } from "../context/SharedContext";

const {confirm} = Modal;


const Navbar = () => {
  const navigate = useNavigate();
  const { setUser, user, loading } = useAuth();
  const { setSelectedRole} = useLLM()


  if (loading) return null;


  const RoleItems: MenuProps['items'] = [
      {key: '0', label:  'System', onClick:  () => setSelectedRole('system')},
      {key: '1', label: 'Developer', onClick:  () => setSelectedRole('developer')},
      {key: '2', label: 'Assistant', onClick:  () => setSelectedRole('assistant')},
      {key: '3', label:  'User', onClick:  () => setSelectedRole('user')},
  ]

  const handleLogout = async () =>   {
    confirm({
      title: "Logout",
      icon:  <LogoutOutlined />,
      content: 'Are you sure you want to logout ?',
      okText: 'Yes',
      cancelText:  'No',
      okType:  'danger',
      onOk:  async () => {
        try{
          await axios.post("https://noema-ai.vercel.app/api/auth/logout",{},{withCredentials:true})
          setUser(null);
          navigate("/")
        }
        catch(err:  any){
          console.log("Error logging out", err);
        }
      }
    })
  }

  return (
  
  <nav className="sticky top-0 left-0 w-full bg-black text-white shadow-2xl z-50 h-14 border-b border-gray-800">
  <div className="h-full px-6">
    <Flex 
      justify="space-between" 
      align="center" 
      className="h-full"
      wrap="nowrap"
    >
      {/* Left side: App title */}
      <div className="flex items-center" onClick={() => navigate('/')}>
        <div 
          className="flex flex-row gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#1890ff" strokeWidth="1.2"/>
          <path d="M10,2 C14,10 14,10 10,18 C6,10 6,10 10,2" stroke="#722ed1" strokeWidth="2.5"/>
          </svg>
          <span>
          Memora.AI
          </span>
        </div>

        {/* collapsible feature button here */}
      </div>

      {/* Center: Role selector (only when user exists) */}
      {user && (
        <div className="flex-1 flex justify-end">
          <Dropdown 
            menu={{ items: RoleItems }} 
            trigger={['click']}
            placement="bottom"
          >
            <Button 
              type="link" 
              size="middle"
              className="min-w-1"
            >
              <Space>
                <UserOutlined />
                Toggle Role
              </Space>
            </Button>
          </Dropdown>
        </div>
      )}

      {/* Right side: Actions */}
      <Flex align="center" gap={12}>
        {/* About Developer button */}
        <Button 
          type="primary" 
          className="text-white hover:text-blue-400"
        >
          <Link to="/about" className="flex items-center gap-2">
            <InfoCircleOutlined />
            <span className="hidden sm:inline">About Developer</span>
          </Link>
        </Button>

        {/* Logout button */}
        
        {
          user && <Button 
          onClick={handleLogout} 
          type="primary" 
          danger
          icon={<LogoutOutlined />}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Logout</span>
        </Button>
        }
        
      </Flex>
    </Flex>
  </div>
</nav>
  );
};

export default Navbar;
