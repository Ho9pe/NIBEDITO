"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  FaWhatsapp,
  FaPaperPlane,
  FaTimes,
  FaComments,
  FaQuestionCircle,
  FaQrcode,
} from "react-icons/fa";
import { faqService } from "@/services/faqService";
import { usePathname } from "next/navigation";
import { FAQ } from "@/types/faq";

interface Message {
  type: "user" | "bot";
  content: string;
}

type TabType = "chat" | "faq" | "qr";

const WhatsAppBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
  const pathname = usePathname();

  // Check if current route is an admin route
  const isAdminRoute = pathname?.includes("/admin");

  useEffect(() => {
    // Don't fetch data for admin routes
    if (isAdminRoute) return;

    // Fetch FAQs from backend when component mounts
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await faqService.getAllFaqs();
        if (response.success && response.payload) {
          setFaqs(response.payload.faqs);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();

    // Generate QR code
    generateQRCode();
  }, [isAdminRoute]);

  // Generate QR code using qrcode library
  const generateQRCode = async (): Promise<void> => {
    try {
      if (!phoneNumber) return;

      const dataUrl = await QRCode.toDataURL(`https://wa.me/${phoneNumber}`, {
        width: 128,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  useEffect(() => {
    // Scroll to bottom of chat when messages update
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleBot = (): void => {
    if (isOpen) {
      closeBot();
    } else {
      setIsOpen(true);
      setIsClosing(false);
    }
  };

  const closeBot = (): void => {
    if (!isOpen) return;

    setIsClosing(true);

    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250); // Match this with the animation duration
  };

  const changeTab = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const handleFaqClick = (faq: FAQ): void => {
    // Add user question to chat
    const newUserMessage: Message = { type: "user", content: faq.question };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    // Add bot answer after a small delay (feels more natural)
    setTimeout(() => {
      const newBotMessage: Message = { type: "bot", content: faq.answer };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    }, 500);

    // Switch to chat tab to show the conversation
    setActiveTab("chat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!inputMessage.trim() || !phoneNumber) return;

    // Add user message to chat
    const newMessage: Message = { type: "user", content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      inputMessage
    )}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");

    // Nothing answers inside this panel - the message was handed to WhatsApp
    // and the reply arrives there. Saying so stops the transcript looking like
    // a bot that has gone silent.
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "bot",
        content:
          "Opened WhatsApp with your message. We'll reply to you there.",
      },
    ]);

    // Clear input field
    setInputMessage("");
  };

  // Don't render anything for admin routes
  if (isAdminRoute) {
    return null;
  }

  // Every route through this widget ends at wa.me/<number>. Without one the
  // launcher still appeared, the QR silently never rendered and sending did
  // nothing at all, so hide it rather than offer a dead control.
  if (!phoneNumber) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1050]">
      {/* Floating Button */}
      <button
        className={`
          w-14 h-14 bg-whatsapp hover:bg-whatsapp-hover 
          dark:bg-whatsapp dark:hover:bg-whatsapp-hover-dark
          text-white rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300 hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-whatsapp/30 dark:focus:ring-whatsapp/30
          ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}
        `}
        onClick={toggleBot}
        aria-label="WhatsApp Support"
      >
        <FaWhatsapp size={24} />
      </button>

      {/* Chat Overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className={`
            fixed bottom-4 right-4 w-80 sm:w-96 h-[500px]
            card bg-surface-color border border-border-color shadow-xl
            flex flex-col overflow-hidden
            transform transition-all duration-250 ease-out
            ${
              isClosing
                ? "scale-95 opacity-0 translate-y-4"
                : "scale-100 opacity-100 translate-y-0"
            }
          `}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-whatsapp dark:bg-whatsapp text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <FaWhatsapp size={20} />
              <h3 className="text-lg font-semibold">WhatsApp Support</h3>
            </div>
            <button
              className="p-1 hover:bg-white/20 dark:hover:bg-white/20 rounded-full transition-colors duration-200"
              onClick={closeBot}
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border-color bg-surface-elevated flex-shrink-0">
            <button
              className={`
                flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-2
                transition-colors duration-200
                ${
                  activeTab === "chat"
                    ? "text-whatsapp dark:text-whatsapp border-b-2 border-whatsapp dark:border-whatsapp bg-whatsapp-bg/20 dark:bg-whatsapp-bg-dark/30"
                    : "text-text-secondary hover:text-whatsapp dark:hover:text-whatsapp hover:bg-whatsapp-bg/10 dark:hover:bg-whatsapp-bg-dark/20"
                }
              `}
              onClick={() => changeTab("chat")}
            >
              <FaComments size={14} />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              className={`
                flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-2
                transition-colors duration-200
                ${
                  activeTab === "faq"
                    ? "text-whatsapp dark:text-whatsapp border-b-2 border-whatsapp dark:border-whatsapp bg-whatsapp-bg/20 dark:bg-whatsapp-bg-dark/30"
                    : "text-text-secondary hover:text-whatsapp dark:hover:text-whatsapp hover:bg-whatsapp-bg/10 dark:hover:bg-whatsapp-bg-dark/20"
                }
              `}
              onClick={() => changeTab("faq")}
            >
              <FaQuestionCircle size={14} />
              <span className="hidden sm:inline">FAQs</span>
            </button>
            <button
              className={`
                flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-2
                transition-colors duration-200
                ${
                  activeTab === "qr"
                    ? "text-whatsapp dark:text-whatsapp border-b-2 border-whatsapp dark:border-whatsapp bg-whatsapp-bg/20 dark:bg-whatsapp-bg-dark/30"
                    : "text-text-secondary hover:text-whatsapp dark:hover:text-whatsapp hover:bg-whatsapp-bg/10 dark:hover:bg-whatsapp-bg-dark/20"
                }
              `}
              onClick={() => changeTab("qr")}
            >
              <FaQrcode size={14} />
              <span className="hidden sm:inline">QR</span>
            </button>
          </div>

          {/* Content Body - With proper height calculations */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages */}
            {activeTab === "chat" && (
              <>
                <div
                  className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-3 min-h-0"
                  ref={chatRef}
                >
                  {/* Welcome Message */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-whatsapp-bg dark:bg-whatsapp-bg-dark border border-whatsapp/20 dark:border-whatsapp/30 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-800 dark:text-whatsapp">
                        👋 Hi there! Pick a question from the FAQ tab for an
                        instant answer, or send us a message and we&apos;ll
                        reply on WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-lg px-3 py-2
                          ${
                            message.type === "user"
                              ? "bg-whatsapp dark:bg-whatsapp text-white"
                              : "bg-whatsapp-bg dark:bg-whatsapp-bg-dark border border-whatsapp/20 dark:border-whatsapp/30 text-gray-800 dark:text-whatsapp"
                          }
                        `}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form
                  className="p-3 border-t border-border-color bg-surface-elevated flex-shrink-0"
                  onSubmit={handleSubmit}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={handleInputChange}
                      placeholder="Message us on WhatsApp..."
                      className="
                        flex-1 input input-modern text-sm
                        focus:ring-2 focus:ring-whatsapp/20 dark:focus:ring-whatsapp/30
                        focus:border-whatsapp dark:focus:border-whatsapp
                      "
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="
                        btn-icon bg-whatsapp hover:bg-whatsapp-hover 
                        dark:bg-whatsapp dark:hover:bg-whatsapp-hover-dark
                        text-white disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        focus:ring-2 focus:ring-whatsapp/30 dark:focus:ring-whatsapp/30
                      "
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* FAQ Options */}
            {activeTab === "faq" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="p-4 flex-shrink-0">
                  <h4 className="text-base font-semibold text-text-color">
                    Frequently Asked Questions
                  </h4>
                </div>

                <div className="flex-1 px-4 pb-4 overflow-y-auto scrollbar-thin min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp dark:border-whatsapp"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {faqs
                        .filter((faq) => faq.isActive)
                        .map((faq) => (
                          <button
                            key={faq._id}
                            className="
                            w-full text-left p-3 rounded-lg 
                            bg-surface-elevated hover:bg-whatsapp-bg/30 dark:hover:bg-whatsapp-bg-dark/40
                            border border-border-color hover:border-whatsapp/40 dark:hover:border-whatsapp/50
                            transition-all duration-200 hover:shadow-sm
                            group
                          "
                            onClick={() => handleFaqClick(faq)}
                          >
                            <p className="text-sm text-text-color group-hover:text-whatsapp dark:group-hover:text-whatsapp transition-colors duration-200">
                              {faq.question}
                            </p>
                          </button>
                        ))}
                      {faqs.filter((faq) => faq.isActive).length === 0 &&
                        !loading && (
                          <p className="text-text-secondary text-sm text-center py-4">
                            No FAQs available at the moment.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code */}
            {activeTab === "qr" && (
              <div className="flex-1 p-4 flex flex-col items-center justify-center text-center min-h-0 overflow-y-auto scrollbar-thin">
                <h4 className="text-base font-semibold text-text-color mb-4">
                  Scan to chat on WhatsApp
                </h4>
                {qrCodeDataUrl ? (
                  <div className="mb-4 p-3 bg-white dark:bg-gray-100 rounded-lg shadow-sm border border-whatsapp/20">
                    <img
                      src={qrCodeDataUrl}
                      alt="WhatsApp QR Code"
                      width="120"
                      height="120"
                      className="block"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-32 h-32 bg-surface-elevated rounded-lg mb-4 border border-whatsapp/20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp dark:border-whatsapp"></div>
                  </div>
                )}
                <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
                  Scan this code with your phone camera to chat with us directly
                  on WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppBot;
