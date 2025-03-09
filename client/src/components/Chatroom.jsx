import React, { useState } from "react";
import "./style/Chatroom.css";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Keep the Google Generative AI import

function Chatroom({ onClose, topic }) {
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping. Keep your answers short."
    });


    const sendMessage = async () => {
        if (!userMessage.trim()) return;

        const newMessages = [...chatHistory, { sender: "user", text: userMessage }];
        setChatHistory(newMessages);
        setUserMessage("");

        setIsLoading(true);

        try {
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            console.log(response.text());

            setChatHistory([
                ...newMessages,
                { sender: "bot", text: response.text() }
            ]);
        } catch (error) {
            console.error("Error communicating with AI", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="Chatroom">
            <h1>{topic.name}</h1>
            <button type="button" onClick={onClose}>X</button>

            <div className="messages">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={msg.sender === "user" ? "user-message" : "ai-message"}>
                        <strong>{msg.sender === "user" ? "You" : "AI"}:</strong> {msg.text}
                    </div>
                ))}
            </div>

            <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send"}
            </button>
        </div>
    );
}

export default Chatroom;
