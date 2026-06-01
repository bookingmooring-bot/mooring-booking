import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, X, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFinalizeConciergeRequest } from "@/hooks/useConciergeBooking";

/**
 * Landing page after returning from Stripe Checkout. Finalizes the concierge
 * request (attaches the authorization hold + notifies the marina via n8n) and
 * shows the "Reservation request sent" confirmation.
 */
const ConciergeSent = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const finalize = useFinalizeConciergeRequest();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (!sessionId) {
      setStatus("error");
      setErrorMsg(t("concierge.finalizeMissingSession", "Missing payment session reference."));
      return;
    }

    finalize
      .mutateAsync(sessionId)
      .then(() => setStatus("done"))
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : t("concierge.finalizeFailed", "Failed to finalize the request."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-hover p-6 sm:p-8">
        {status === "loading" && (
          <div className="text-center space-y-4 py-10">
            <Loader2 size={40} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-muted-foreground">{t("concierge.processing", "Processing...")}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-amber-500" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">
              {t("concierge.finalizeErrorTitle", "Could not confirm your request")}
            </h3>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <p className="text-muted-foreground text-xs">
              {t("concierge.finalizeErrorHelp", "If your card was authorized, your request may still be processed — please check your dashboard.")}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/explore"><Button variant="outline">{t("concierge.close", "Close")}</Button></Link>
              <Link to="/dashboard"><Button className="bg-blue-500 hover:bg-blue-600 text-white">{t("concierge.viewInDashboard", "View in Dashboard")}</Button></Link>
            </div>
          </div>
        )}

        {status === "done" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-blue-500" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">
              {t("concierge.requestSentTitle", "Reservation request sent")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("concierge.requestSentBodyGeneric", "Your reservation request has been sent and the marina has been notified.")}
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-foreground">
              {t("concierge.awaitingMarina", "We are awaiting the marina's final confirmation. Average response time is 1–24h. Please be patient.")}
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3 text-left">
              <div className="flex items-start gap-2 text-sm">
                <Clock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>{t("concierge.responseWindow", "The marina has up to 48 hours to respond.")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-success shrink-0 mt-0.5" />
                <span>{t("concierge.outcomeConfirmed", "Confirmed — Concierge fee charged, you receive the marina's contact details.")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <X size={16} className="text-destructive shrink-0 mt-0.5" />
                <span>{t("concierge.outcomeDeclined", "Declined — hold released, no charge.")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Clock size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <span>{t("concierge.outcomeNoResponse", "No response — hold automatically released after 48h.")}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link to="/explore"><Button variant="outline">{t("concierge.close", "Close")}</Button></Link>
              <Link to="/dashboard"><Button className="bg-blue-500 hover:bg-blue-600 text-white">{t("concierge.viewInDashboard", "View in Dashboard")}</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConciergeSent;
