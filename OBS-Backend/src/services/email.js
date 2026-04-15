// Email Service Sends transactional emails using Gmail SMTP via Nodemailer
 
var nodemailer = require("nodemailer");

var transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  var email = process.env.SMTP_EMAIL;
  var password = process.env.SMTP_PASSWORD;

  if (!email || !password) {
    console.warn("SMTP credentials not configured. Emails will not be sent.");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  return transporter;
}

/**
 * Send an email
 */
async function sendEmail(to, subject, html) {
  var transport = getTransporter();
  if (!transport) {
    console.log("Email skipped (no SMTP config):", subject, "->", to);
    return { success: false, error: "SMTP not configured" };
  }

  try {
    var info = await transport.sendMail({
      from: '"OBS Platform" <' + process.env.SMTP_EMAIL + ">",
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Email sent:", info.messageId, "->", to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Welcome email for new users
 */
async function sendWelcomeEmail(email, name, role) {
  var roleText = role === "provider" ? "Service Provider" : "Job Poster";

  var html =
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: #e87b1c; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">' +
    '<h1 style="color: white; margin: 0;">Welcome to OBS</h1>' +
    '<p style="color: #ffe0c2; margin: 5px 0 0;">Online Bidding System</p>' +
    "</div>" +
    '<div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">' +
    "<h2>Hi " + name + ",</h2>" +
    "<p>Thank you for joining OBS! Your account has been created successfully.</p>" +
    '<p><strong>Account type:</strong> ' + roleText + "</p>" +
    "<p>Here is what you can do next:</p>" +
    (role === "poster"
      ? "<ul>" +
        "<li>Post your first job and describe the service you need</li>" +
        "<li>Receive competitive bids from service providers</li>" +
        "<li>Compare bids and choose the best provider</li>" +
        "<li>Use our AI chatbot for guided assistance</li>" +
        "</ul>"
      : "<ul>" +
        "<li>Browse available jobs in your area</li>" +
        "<li>Place competitive bids on jobs that match your skills</li>" +
        "<li>Build your reputation through ratings and reviews</li>" +
        "<li>Use our AI chatbot for guided assistance</li>" +
        "</ul>") +
    '<p>If you need help navigating the platform, our AI chatbot assistant is available on every page.</p>' +
    "<p>Best regards,<br>The OBS Team</p>" +
    "</div>" +
    '<div style="text-align: center; padding: 15px; color: #999; font-size: 12px;">' +
    "<p>This email was sent by OBS (Online Bidding System).</p>" +
    "</div>" +
    "</div>";

  return await sendEmail(email, "Welcome to OBS - Your account is ready", html);
}

/**
 * OTP email for password reset
 */
async function sendOTPEmail(email, name, otp) {
  var html =
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: #e87b1c; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">' +
    '<h1 style="color: white; margin: 0;">Password Reset</h1>' +
    "</div>" +
    '<div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">' +
    "<h2>Hi " + (name || "there") + ",</h2>" +
    "<p>You requested a password reset for your OBS account. Use the following code to reset your password:</p>" +
    '<div style="background: #f8f9fa; border: 2px dashed #e87b1c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">' +
    '<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e87b1c;">' + otp + "</span>" +
    "</div>" +
    "<p>This code will expire in <strong>10 minutes</strong>.</p>" +
    "<p>If you did not request this password reset, please ignore this email. Your account is safe.</p>" +
    "<p>Best regards,<br>The OBS Team</p>" +
    "</div>" +
    '<div style="text-align: center; padding: 15px; color: #999; font-size: 12px;">' +
    "<p>This email was sent by OBS (Online Bidding System). Do not share this code with anyone.</p>" +
    "</div>" +
    "</div>";

  return await sendEmail(email, "OBS - Password Reset Code: " + otp, html);
}

/**
 * Bid accepted notification email
 */
async function sendBidAcceptedEmail(providerEmail, providerName, jobTitle, bidAmount) {
  var html =
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: #27ae60; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">' +
    '<h1 style="color: white; margin: 0;">Bid Accepted!</h1>' +
    "</div>" +
    '<div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">' +
    "<h2>Congratulations " + providerName + "!</h2>" +
    "<p>Your bid has been accepted for the following job:</p>" +
    '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">' +
    "<strong>Job:</strong> " + jobTitle + "<br>" +
    "<strong>Your bid:</strong> " + bidAmount + " pounds" +
    "</div>" +
    "<p>Please get in touch with the job poster to arrange the work schedule.</p>" +
    "<p>Best regards,<br>The OBS Team</p>" +
    "</div>" +
    "</div>";

  return await sendEmail(providerEmail, "OBS - Your bid on '" + jobTitle + "' has been accepted", html);
}

/**
 * Job completed notification email
 */
async function sendJobCompletedEmail(providerEmail, providerName, jobTitle, amount, paymentMethod) {
  var paymentText = "";
  if (paymentMethod === "wallet") {
    paymentText = amount + " pounds has been credited to your OBS Wallet.";
  } else if (paymentMethod === "cash") {
    paymentText = "Payment of " + amount + " pounds was made in cash.";
  } else {
    paymentText = "Please confirm payment with the job poster.";
  }

  var html =
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: #3498db; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">' +
    '<h1 style="color: white; margin: 0;">Job Completed</h1>' +
    "</div>" +
    '<div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">' +
    "<h2>Well done " + providerName + "!</h2>" +
    "<p>The following job has been marked as completed:</p>" +
    '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">' +
    "<strong>Job:</strong> " + jobTitle + "<br>" +
    "<strong>Payment:</strong> " + paymentText +
    "</div>" +
    "<p>Please take a moment to rate the job poster. Your review helps build trust on the platform.</p>" +
    "<p>Best regards,<br>The OBS Team</p>" +
    "</div>" +
    "</div>";

  return await sendEmail(providerEmail, "OBS - Job '" + jobTitle + "' completed", html);
}

/**
 * New bid notification email to poster
 */
async function sendNewBidEmail(posterEmail, posterName, providerName, jobTitle, bidAmount) {
  var html =
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: #e87b1c; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">' +
    '<h1 style="color: white; margin: 0;">New Bid Received</h1>' +
    "</div>" +
    '<div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">' +
    "<h2>Hi " + posterName + ",</h2>" +
    "<p>You have received a new bid on your job:</p>" +
    '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">' +
    "<strong>Job:</strong> " + jobTitle + "<br>" +
    "<strong>Bidder:</strong> " + providerName + "<br>" +
    "<strong>Bid amount:</strong> " + bidAmount + " pounds" +
    "</div>" +
    "<p>Log in to your OBS account to review and compare bids.</p>" +
    "<p>Best regards,<br>The OBS Team</p>" +
    "</div>" +
    "</div>";

  return await sendEmail(posterEmail, "OBS - New bid on '" + jobTitle + "'", html);
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendBidAcceptedEmail,
  sendJobCompletedEmail,
  sendNewBidEmail,
};