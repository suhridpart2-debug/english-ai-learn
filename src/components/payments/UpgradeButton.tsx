"use client";

import { useState } from "react";
import Script from "next/script";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function UpgradeButton({ className, size = "default", onSuccess }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);

      // 1. Create Order on backend
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
      });
      
      const orderData = await res.json();
      
      if (orderData.error) {
        throw new Error(orderData.error);
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SpeakAI Premium",
        description: "30 Days Premium Access",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment on backend
          await verifyPayment(response);
        },
        prefill: {
          name: "", // Will be filled by user in checkout if needed
          email: "",
        },
        theme: {
          color: "#4F46E5", // Indigo-600
        },
        modal: {
            ondismiss: function() {
                setIsLoading(false);
            }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const verifyPayment = async (razorpayResponse: any) => {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          if (onSuccess) onSuccess();
          router.refresh(); // Refresh page to update UI
        }, 2000);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Payment verification failed. Please contact support if amount was deducted.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={`${className} border-2 border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400`}
        disabled
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Upgraded!
      </Button>
    );
  }

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <Button
        onClick={handleUpgrade}
        disabled={isLoading}
        size={size}
        className={`${className} bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </>
        )}
      </Button>
    </>
  );
}
