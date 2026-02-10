import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Loading from "./Loading";
import axios from "axios";

import { useRef } from "react";

import { useLLM } from "../context/SharedContext";

import {
  Button,
  Flex,
  Layout,
  Modal,
  Menu,
  message,
  notification,
} from "antd";
import {
  DeleteOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ExclamationCircleFilled,
  PlusCircleOutlined,
  SunOutlined,
} from "@ant-design/icons";

const { Footer, Sider, Content, Header } = Layout;
const { confirm } = Modal;

type NotificationType = "warning";

const Home = () => {
  type chatInfo = {
    _id: string;
    prompt: string;
    response: string;
  };

  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatInfo, setChatInfo] = useState<chatInfo[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [model, setModel] = useState<string>("gemini");
  const [collapsed, setCollapsed] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const { selectedRole } = useLLM();

  const [api, warningContext] = notification.useNotification();
  const openNotificationWithIcon = (
    type: NotificationType,
    message: string,
    title: string,
  ) => {
    api[type]({
      title: `${title}`,
      description: `${message}`,
      duration: 10,
    });
  };

  // rendering
  useEffect(() => {
    fetchAllData();
  }, []);

  // send API request
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (prompt.trim().length === 0) {
      openNotificationWithIcon(
        "warning",
        "Please Enter the Prompt",
        "Empty Fields",
      );
      return;
    }
    setLoading(true);

    try {
      const res = await axios.post(
        "https://noema-ai.vercel.app/api/gemini/prompt",
        {
          prompt,
          model,
          selectedRole,
        },
        { withCredentials: true },
      );
      fetchAllData();
      console.log(res.data);
      console.log("Role:  ", selectedRole);
      setPrompt("");
      messageApi.success("prompt sent successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.err?.error?.message;
        messageApi.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const response = await axios.get(
        "https://noema-ai.vercel.app/api/gemini/history",
        { withCredentials: true },
      );
      console.log(response);
      setChatInfo(response.data.data || []);
    } catch (err) {
      console.log(err);
      messageApi.error(`Failed to fetch queries ${err}`);
    }
  };

  const scrollToChat = (id: string) => {
    const el = document.getElementById(`chat-${id}`);
    const container = chatContainerRef.current;

    if (!el || !container) return;

    const containerTop = container.getBoundingClientRect().top;
    const elementTop = el.getBoundingClientRect().top;

    const scrollOffset = elementTop - containerTop + container.scrollTop - 12; 

    container.scrollTo({
      top: scrollOffset,
      behavior: "smooth",
    });

    el.classList.add("chat-highlight");

    setTimeout(() => {
      el.classList.remove("chat-highlight");
    }, 2000);
  };

  // delete prompt
  const handleDeletePrompt = (id: string, promptText: string) => {
    confirm({
      title: "Delete chat",
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to delete: "${promptText.substring(
        0,
        50,
      )} ${prompt.length > 50 ? "..." : ""}"`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await axios.delete(
            `https://noema-ai.vercel.app/api/gemini/history/${id}`,
            { withCredentials: true },
          );
          if (res.status === 200) {
            setChatInfo((prev) => prev.filter((item) => item._id !== id));
            messageApi.success("Query Deleted successfully");
          } else {
            messageApi.error("Failed to delete the chat");
          }
        } catch (err: any) {
          console.log("Error deleting this chat", err);
        }
      },
    });
  };

  return (
    <>
      {contextHolder}
      {warningContext}
      <Flex className="w-full">
        <Layout className="w-full">
          <Layout className=" flex h-screen">
            {/* Sidebar */}
            <Sider
              trigger={null}
              collapsible
              collapsed={collapsed}
              collapsedWidth={0}
              width={250}
              className="hidden md:flex flex-col text-white"
            >
              <div className="px-4 py-12 h-full flex flex-col">
                <h2 className="text-sm font-normal px-8">Chat Queries</h2>
                <hr className="my-2 border-gray-600" />

                <Menu
                  className="flex-1 overflow-y-auto mt-4 dark-scrollbar"
                  theme="dark"
                  mode="inline"
                >
                  {chatInfo && chatInfo.length > 0 ? (
                    chatInfo.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => scrollToChat(item._id)}
                        className="flex items-center justify-between p-2 hover:bg-gray-800 rounded cursor-pointer group mb-1"
                      >
                        <p
                          className="truncate text-xs text-gray-200 group-hover:text-white flex-1 mr-2"
                          title={item.prompt}
                        >
                          {item.prompt}
                        </p>
                        <DeleteOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePrompt(item._id, item.prompt);
                          }}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete chat"
                        />
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Nothing to show here
                    </span>
                  )}
                </Menu>
              </div>
            </Sider>

            {/* Main Content Area */}
            <Layout className="flex-1 flex flex-col h-screen">
              {/* Header */}
              <Header
                style={{
                  padding: 0,
                  margin: 0,
                  border: 0,
                  background: "#090303",
                  position: "sticky",
                  zIndex: 50,
                  top: 0,
                  
                }}
              >
                <Flex>
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: "18px",
                    width: 64,
                    height: 64,
                    color: "white",
                  }}
                />

                <Flex gap={12}>
                <Button
                  type="text"
                  style={{
                    
                    border: 0,
                    width: 64,
                    height: 64,
                    color: "#fff",
                  }}
                >
                  <PlusCircleOutlined />
                </Button>

                <Button
                  type="text"
                  style={{
                    
                    border: 0,
                    width: 64,
                    height: 64,
                    color: "#fff",
                  }}
                >
                  <SunOutlined />
                </Button>
                </Flex></Flex>
              </Header>

              <Content
                ref={chatContainerRef}
                className="dark-scrollbar"
                style={{
                  backgroundColor: "#212121",
                  padding: "12px",
                  overflowY: "auto",
                }}
              >
                <div
                  className="mx-auto my-0 w-full max-w-[80vw] 
                  xl:max-w-[80vw] 
                  lg:max-w-[75vw] 
                  md:max-w-[65vw]
                  sm:max-w-[60vw] 
                  py-14"
                >
                  {chatInfo && chatInfo.length > 0 ? (
                    <div className="space-y-6">
                      {chatInfo.map((item) => (
                        <div
                          key={item._id}
                          id={`chat-${item._id}`}
                          className="space-y-4"
                        >
                          {/* User Message */}
                          <div className="flex justify-end">
                            <div className="max-w-[80%] bg-black text-white px-4 py-2 rounded-2xl text-sm md:text-base">
                              {item.prompt}
                            </div>
                          </div>

                          {/* AI Response */}
                          <div className="flex justify-start">
                            <div className="max-w-[90%] md:max-w-[800px] px-4 py-3 rounded-2xl shadow-sm overflow-hidden">
                              <div className="text-white text-sm md:text-base whitespace-pre-wrap break-words break-all">
                                <ReactMarkdown>{item.response}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center text-base md:text-lg">
                      Welcome to Memora - AI ✨ <br />
                      How can we help you today?
                    </div>
                  )}
                </div>
              </Content>

              {/* Input Area - Fixed Footer */}
              <Footer className="!bg-black text-white border-t border-gray-700 sticky bottom-0 z-40">
                <div
                  className="mx-auto my-0 w-full max-w-[80vw] 
                  xl:max-w-[80vw] 
                  lg:max-w-[75vw] 
                  md:max-w-[65vw]
                  sm:max-w-[60vw] 
                  px-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4 w-full">
                    {/* Textarea */}
                    <textarea
                      className="w-full md:flex-1 p-3 border border-gray-600 bg-black text-white rounded-lg resize-none
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 text-sm md:text-base"
                      rows={2}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask anything..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (prompt.trim()) {
                            handleSubmit(e as any);
                          }
                        }
                      }}
                    />

                    {/* Controls row (mobile) */}
                    <div className="flex items-center justify-between gap-3 md:gap-4">
                      {/* Model select */}
                      <select
                        className="bg-black border border-gray-600 text-white rounded-md px-3 py-2
                   text-sm cursor-pointer focus:outline-none"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        <option value="gemini" className="bg-gray-800">
                          Gemini
                        </option>
                        <option value="gpt-4" className="bg-gray-800">
                          GPT-4
                        </option>
                        <option value="deepseek" className="bg-gray-800">
                          DeepSeek R1T2
                        </option>
                        <option value="Llama" className="bg-gray-800">
                          Llama 3.3
                        </option>
                      </select>

                      {/* Send button */}
                      <Button
                        onClick={handleSubmit}
                        type={!prompt.trim() ? "default" : "primary"}
                        size="middle"
                        className="px-4 py-2 md:h-[60px] md:px-6"
                      >
                        {loading ? <Loading /> : "Send"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Footer>
            </Layout>
          </Layout>
        </Layout>
      </Flex>
    </>
  );
};

export default Home;
