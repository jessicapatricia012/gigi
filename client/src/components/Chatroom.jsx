import React, { useState } from "react";
import "./style/Chatroom.css";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Window from "./Window";
import Send from "../images/Send.png";
import File from "../images/File.png";
import pdfToText from 'react-pdftotext'
import ReactMarkdown from "react-markdown";

function Chatroom({ onClose, topic }) {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileText, setFileText] = useState("")

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction:
      "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping.",
  });

  const handleFileChange = (e) => {
    console.log("IM HERE!!!");
    const file = e.target.files[0]
    setSelectedFile(file);
    pdfToText(file)
        .then(text => {
            setFileText(text);
            console.log("fileText: ", fileText);
        })
        .catch(error => console.error("Failed to extract text from pdf"))
  };

  const sendMessage = async () => {
     if (!userMessage.trim()) return;

        let contentToSend = "";

        chatHistory.forEach((msg) => {
            contentToSend += `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}\n`;
        });

        contentToSend += `User: ${userMessage}\n`;

        const newMessages = [...chatHistory, { sender: "user", text: userMessage }];
        console.log(newMessages);
        setChatHistory(newMessages);
        setUserMessage("");

        setIsLoading(true);

    try {
        let fileResponseText = "";
 
        if (selectedFile) {
            contentToSend += `\n\nFile Content: ${fileText}`;
            // setSelectedFile(null);
        }

        console.log("File: ", selectedFile);
        console.log("File text: ", fileText);

        console.log("Content to send: ", contentToSend);
        const result = await model.generateContent(contentToSend);
        const response = await result.response;
        console.log(response.text());
      
      setChatHistory([
        ...newMessages,
        { sender: "bot", text: response.text() },
      ]);
    } catch (error) {
      console.error("Error communicating with Gigi", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Chatroom">
      <Window onClose={onClose} HeaderTitle={topic.name}>
           <input className="upload" type="file" accept=".pdf" onChange={handleFileChange} />

        <div className="ChatroomArea">
          <div className="messages">
            {chatHistory.map((msg, index) => (
             <div key={index} className={msg.sender === "user" ? "user-message" : "ai-message"}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            ))}
          </div>

          <div className="MessageBar">
            <textarea
              className="UserMessage"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type a message..."
            />

            <img
              src={File}
              alt="Upload File"
              //   onClick={sendMessage}
              style={{
                cursor: isLoading ? "Sending..." : "Send",
                height: "50px",
              }}
              disabled={isLoading}
            />
            <img
              src={Send}
              alt="Send"
              onClick={sendMessage}
              style={{
                cursor: isLoading ? "Sending..." : "Send",
                height: "30px",
              }}
              disabled={isLoading}
            />
          </div>
        </div>
      </Window>
    </div>
  );

}

export default Chatroom;