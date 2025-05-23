
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
  timestamp: Date;
}

export const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to BabyCare Chat! How can we help you today?",
      sender: "system",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const isMobile = useIsMobile();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    // Simulate a response after a short delay
    setTimeout(() => {
      const systemResponse = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. Our team will respond shortly.",
        sender: "system" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <MessageCircle className="mr-2 text-baby-primary" />
          BabyCare Support Chat
        </h2>
      </div>

      <Card className="flex-1 overflow-y-auto p-4 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                } items-start max-w-[80%]`}
              >
                {message.sender === "system" && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src="/lovable-uploads/b7205a62-6702-4855-9178-d6cbe95eac27.png"
                      alt="BabyCare"
                    />
                    <AvatarFallback>BC</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-baby-primary text-white mr-2"
                      : "bg-muted ml-1"
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 ml-2">
                    <AvatarFallback className="bg-baby-secondary text-white">
                      ME
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} className="bg-baby-primary">
          <Send className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
          {!isMobile && <span className="ml-2">Send</span>}
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
