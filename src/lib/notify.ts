/**
 * Client-side helper for triggering appointment notifications.
 * These call server functions that handle DB updates AND email sends.
 *
 * Until an email domain is configured (Cloud → Emails), the server functions
 * log the notification intent and return success — once configured, the same
 * code paths send real emails via Lovable Emails.
 */
import { toast } from "sonner";

export function notifySuccess(title: string, description?: string) {
  toast.success(title, { description });
}
export function notifyError(title: string, description?: string) {
  toast.error(title, { description });
}
export function notifyInfo(title: string, description?: string) {
  toast(title, { description });
}
