import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const scrollAreaRef = useRef(null);
  const textAreaRef = useRef(null);

  // Scroll to the bottom when a new message is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Dynamic resizing of the textarea
  const handleInputResize = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = `${textArea.scrollHeight}px`;

      if (textArea.scrollHeight > 150) {
        textArea.style.height = "150px";
        textArea.style.overflowY = "auto";
      } else {
        textArea.style.overflowY = "hidden";
      }
    }
  };

  useEffect(() => {
    handleInputResize();
  }, [input]);

  // Send message and generate AI response
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setGeneratingAnswer(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        { contents: [{ parts: [{ text: userMessage.text }] }] }
      );

      const generatedText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No answer generated.";
      const aiMessage = { id: Date.now() + 1, text: generatedText, sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating answer:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: "Failed to generate answer.", sender: "ai" },
      ]);
    }
    setGeneratingAnswer(false);
  };

  return (
    <div className="flex flex-col h-screen bg-black ">
      <header className="bg-black shadow-sm p-4 ">
        <h1 className="text-2xl font-bold text-center text-white">Chat Bot</h1>
        <h1 className="text-2xl font-bold text-center text-blue-400 mt-2">Ask What you want....?</h1>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <ScrollArea
          className="flex-grow mb-4 bg-black rounded-lg shadow-md p-4  "
          ref={scrollAreaRef}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-start ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8 border border-y-white">
                  <AvatarFallback className='text-white'>
                    {message.sender === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`mx-2 p-3 rounded ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600"
                  }`}
                >
                  <ReactMarkdown className="whitespace-pre-wrap text-base leading-relaxed text-white">
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

        
        </ScrollArea>

        <form
          onSubmit={handleSend}
          className="sticky bottom-0 bg-black p-4 shadow-md flex items-center rounded"
        >
          <textarea
            ref={textAreaRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows="1"
            required
            className="flex-grow resize-none bg-gray-600 border text-white border-y-gray-900 p-2 mr-2 rounded"
          />
          <Button type="submit" disabled={generatingAnswer} className="bg-gray-600 text-white rounded">
            <Send className="h-4 w-4 mr-2 text-white" />
            {generatingAnswer ? "Generating..." : "Send"}
          </Button>
        </form>
      </main>
    </div>
  );
}

export default App;
