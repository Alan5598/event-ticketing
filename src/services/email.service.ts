interface EmailParams {
  to_email: string;
  email: string;
  user_email: string;
  reply_to: string;
  recipient_email: string;
  to_name: string;
  name: string;
  passcode?: string;
  otp?: string;
  code?: string;
  reset_link?: string;
  message?: string;
  [key: string]: any;
}

export const sendOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<boolean> => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId =
    process.env.EMAILJS_TEMPLATE_ID_OTP || process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  const templateParams: EmailParams = {
    to_email: email,
    email: email,
    user_email: email,
    reply_to: email,
    recipient_email: email,
    to_name: name,
    name: name,
    passcode: otp,
    otp: otp,
    code: otp,
    message: `Your EventQ verification code is: ${otp}. It will expire in 10 minutes.`,
  };

  // If credentials are not configured, log OTP to console for seamless local development
  if (!serviceId || !templateId || !publicKey) {
    console.log(
      `\n=========================================\n` +
        `[EmailJS Dev Fallback] OTP Email for ${email}:\n` +
        `Code: ${otp}\n` +
        `(To send real emails, set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_OTP, and EMAILJS_PUBLIC_KEY in .env)\n` +
        `=========================================\n`
    );
    return true;
  }

  try {
    const payload: Record<string, any> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    };

    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[EmailJS Error] Failed to send OTP email:", errorText);
      return false;
    }

    console.log(`[EmailJS] OTP email successfully sent to ${email}`);
    return true;
  } catch (error: any) {
    console.error("[EmailJS Exception] Failed to send OTP email:", error.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetLink: string
): Promise<boolean> => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId =
    process.env.EMAILJS_TEMPLATE_ID_RESET ||
    process.env.EMAILJS_TEMPLATE_ID_OTP ||
    process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  const templateParams: EmailParams = {
    to_email: email,
    email: email,
    user_email: email,
    reply_to: email,
    recipient_email: email,
    to_name: name,
    name: name,
    passcode: resetLink,
    reset_link: resetLink,
    message: `You requested a password reset. Click the following link to reset your password: ${resetLink}. This link expires in 1 hour.`,
  };

  if (!serviceId || !templateId || !publicKey) {
    console.log(
      `\n=========================================\n` +
        `[EmailJS Dev Fallback] Password Reset Link for ${email}:\n` +
        `Reset Link: ${resetLink}\n` +
        `(To send real emails, set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_RESET, and EMAILJS_PUBLIC_KEY in .env)\n` +
        `=========================================\n`
    );
    return true;
  }

  try {
    const payload: Record<string, any> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    };

    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[EmailJS Error] Failed to send Password Reset email:",
        errorText
      );
      return false;
    }

    console.log(`[EmailJS] Password reset email successfully sent to ${email}`);
    return true;
  } catch (error: any) {
    console.error(
      "[EmailJS Exception] Failed to send Password Reset email:",
      error.message
    );
    return false;
  }
};
