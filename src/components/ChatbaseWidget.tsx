import { useEffect } from "react";

export function ChatbaseWidget() {
  useEffect(() => {
    if (document.getElementById("1ifm9yY-KVOI8QcKpIm4x")) return;
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "1ifm9yY-KVOI8QcKpIm4x";
    script.setAttribute("domain", "www.chatbase.co");
    document.body.appendChild(script);
  }, []);
  return null;
}
