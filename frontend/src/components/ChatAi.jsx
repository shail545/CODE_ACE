import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! I'm here to help you with your coding problem. How can I assist you today?" }] },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, userMessage],
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-base-100 rounded-lg border border-base-300 overflow-hidden shadow-sm">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`flex items-start max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`flex-shrink-0 mt-1 h-6 w-6 rounded-full flex items-center justify-center ${msg.role === "user" ? "ml-2 bg-primary text-primary-content" : "mr-2 bg-secondary text-secondary-content"}`}>
                                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className={`chat-bubble ${msg.role === "user" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-start max-w-[90%]">
                            <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full flex items-center justify-center mr-2 bg-secondary text-secondary-content">
                                <Bot size={14} />
                            </div>
                            <div className="chat-bubble bg-base-200 text-base-content">
                                <span className="loading loading-dots loading-sm"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t border-base-300"
            >
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Type your message..." 
                        className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                        {...register("message", { required: true, minLength: 2 })}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-square"
                        disabled={errors.message || isLoading}
                    >
                        <Send size={18} />
                    </button>
                </div>
                {errors.message && (
                    <p className="mt-1 text-xs text-error">Message must be at least 2 characters</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;