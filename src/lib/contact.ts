import { WHATSAPP_NUMBER, whatsappLink } from "./whatsapp";

/** Click-to-chat link with a short hello, for "message us" buttons (orders send the full order message instead). */
export const CHAT_LINK = whatsappLink("Hello KROMA, I have a question.");

/** The WhatsApp number as people write it: "+92 307 0766667". */
export const PHONE_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5)}`;
