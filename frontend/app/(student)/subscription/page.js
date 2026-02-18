"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { paymentAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { HiOutlineCheck, HiOutlineSparkles } from "react-icons/hi2";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    features: ["Access 5 free courses", "Basic progress tracking", "Community forums", "Email support"],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    period: "/month",
    features: ["Unlimited courses", "Advanced progress analytics", "Priority doubt clearing", "Certificates", "Direct mentor access", "Offline downloads"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    period: "/month",
    features: ["Everything in Pro", "Team management", "Custom learning paths", "API access", "Dedicated account manager", "SLA guarantee", "White-label option"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const handleSubscribe = async (plan) => {
    if (!user) { router.push("/login"); return; }
    if (plan.price === 0) return;

    setLoading(plan.id);
    try {
      const { data } = await paymentAPI.createOrder({
        amount: plan.price,
        type: "subscription",
      });

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "LearnHub",
        description: `${plan.name} Plan Subscription`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
            });
            toast.success("Subscription activated! 🎉");
            router.push("/");
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#000000" },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Razorpay SDK not loaded. Add the script to your HTML.");
      }
    } catch (e) {
      toast.error("Failed to create order");
    } finally {
      setLoading("");
    }
  };

  return (
    <div style={{ padding: "60px 24px 80px" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <span style={{
          display: "inline-block", padding: "6px 14px", fontSize: 12, fontWeight: 500,
          color: "var(--foreground-secondary)", background: "var(--accent)",
          border: "1px solid var(--border)", borderRadius: "var(--radius-full)",
          marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          Pricing
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>
          Choose Your Plan
        </h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: 16, maxWidth: 500, margin: "12px auto 0" }}>
          Invest in your future with full access to premium courses and mentorship.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20, marginTop: 48, textAlign: "left",
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card"
              style={{
                border: plan.popular ? "1px solid var(--foreground-muted)" : undefined,
                position: "relative", overflow: "hidden",
              }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute", top: 16, right: -28,
                  transform: "rotate(45deg)", padding: "4px 40px",
                  background: "var(--foreground)", color: "var(--background)",
                  fontSize: 11, fontWeight: 600,
                }}>
                  Popular
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  {plan.popular && <HiOutlineSparkles size={18} />}
                  {plan.name}
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 12 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em" }}>
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ color: "var(--foreground-muted)", fontSize: 14 }}>{plan.period}</span>
                  )}
                </div>
              </div>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--foreground-secondary)" }}>
                    <HiOutlineCheck size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.popular ? "btn-primary" : "btn-secondary"} btn-lg`}
                style={{ width: "100%" }}
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id || (plan.price === 0 && user?.subscription?.plan === "free")}
              >
                {loading === plan.id ? "Processing..." : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
