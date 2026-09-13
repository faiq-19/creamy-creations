import { whatsapp } from "./domain";
export type NotificationEvent =
  | "request_received"
  | "quotation_sent"
  | "advance_received"
  | "payment_verified"
  | "order_confirmed"
  | "cake_ready"
  | "rider_dispatched"
  | "order_delivered"
  | "review_request";
export function messageTemplate(
  event: NotificationEvent,
  number: string,
  link?: string,
) {
  const text: Record<NotificationEvent, string> = {
    request_received: `Thank you for your cake request ${number}! We’ll review your idea and date. This is not yet a confirmed booking.`,
    quotation_sent: `Your Creamy Creations quotation ${number} is ready: ${link || ""}. Please review the details and advance requirement.`,
    advance_received: `We’ve received payment details for ${number}. We’ll verify them and get back to you.`,
    payment_verified: `Your payment for ${number} has been verified. Thank you!`,
    order_confirmed: `Your order ${number} is confirmed. We can’t wait to make your celebration sweeter.`,
    cake_ready: `Your cake for ${number} is ready! Let’s arrange pickup or delivery.`,
    rider_dispatched: `Your order ${number} is on its way. Please keep your phone nearby.`,
    order_delivered: `Your order ${number} has been delivered. We hope it brings a little happiness to your day!`,
    review_request: `Thank you for choosing Creamy Creations for ${number}. We’d love to hear how you enjoyed your treats.`,
  };
  return text[event];
}
// This adapter creates a link only. Future Cloud API / n8n adapters can consume the same events.
export const clickToChat = {
  prepare: (
    phone: string,
    event: NotificationEvent,
    number: string,
    link?: string,
  ) => whatsapp(phone, messageTemplate(event, number, link)),
};
