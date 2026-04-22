# Razorpay Subscription Setup Guide

To enable the ₹1 trial and ₹99/month renewal, follow these steps.

## Option 1: Manual Dashboard Setup (Recommended)

1.  **Login** to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  Go to **Subscriptions** > **Plans** from the left sidebar.
3.  Click **+ Create Plan**.
4.  Enter the following details:
    *   **Plan Name**: `SpeakAI Monthly Pro`
    *   **Billing Frequency**: `Monthly`
    *   **Billing Cycle**: `1`
    *   **Amount**: `99.00` INR
5.  Click **Create Plan**.
6.  Copy the **Plan ID** (starts with `plan_...`) and add it to your `.env.local`:
    ```env
    RAZORPAY_MONTHLY_PLAN_ID=plan_XXXXXXXXXXXXXX
    ```

---

## Option 2: Create Plan via API

If you prefer using code, run this script locally (requires `razorpay` npm package):

```javascript
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET',
});

instance.plans.create({
  period: 'monthly',
  interval: 1,
  item: {
    name: 'SpeakAI Monthly Pro',
    amount: 9900, // Amount in paise
    currency: 'INR',
    description: '₹99/month unlimited access'
  }
}).then(console.log).catch(console.error);
```

---

## Logic for ₹1 Trial (7 Days)

The system is configured to create a subscription with:
*   **Initial Payment**: ₹1
*   **Trial Period**: 7 Days
*   **Recurring Charge**: ₹99/month

---

## Webhook Setup (CRITICAL)

For the system to unlock premium automatically, you MUST set up a Webhook:

1.  Go to **Settings** > **Webhooks**.
2.  **Add New Webhook**.
3.  **Webhook URL**: `https://your-domain.com/api/subscription/webhook`
4.  **Secret**: Create a strong secret and add to `.env.local`:
    ```env
    RAZORPAY_WEBHOOK_SECRET=your_secret_here
    ```
5.  **Events to Select**:
    *   `subscription.authenticated`
    *   `subscription.charged`
    *   `subscription.cancelled`
    *   `subscription.halted`
6.  Click **Save**.
