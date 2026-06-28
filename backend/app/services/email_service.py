import os
import smtplib
import secrets
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger("purrfect_match_ai")

# Load SMTP configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "purrfectmatchai.app@gmail.com").strip()
DEBUG_MODE = os.getenv("DEBUG", "true").lower() == "true"

# Log configuration status on startup
logger.info(f"EmailService initialized - SMTP_HOST: {SMTP_HOST if SMTP_HOST else '(NOT CONFIGURED)'}")
logger.info(f"EmailService - SMTP_USER: {SMTP_USER if SMTP_USER else '(NOT CONFIGURED)'}")
logger.info(f"EmailService - DEBUG_MODE: {DEBUG_MODE}")

class EmailService:
    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure random verification token."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def is_smtp_configured() -> bool:
        """Check if SMTP is properly configured."""
        configured = bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)
        if not configured:
            logger.warning("SMTP not fully configured. Falling back to file logging.")
        return configured

    @staticmethod
    def send_email(to_email: str, subject: str, body_html: str, body_text: str) -> bool:
        """
        Sends an email using SMTP if configured. Otherwise, logs to a local file.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body_html: HTML version of email body
            body_text: Plain text version of email body
            
        Returns:
            bool: True if email was sent/logged successfully, False otherwise
        """
        try:
            logger.info(f"[EMAIL] Starting email send process to: {to_email}, subject: {subject}")
            
            # If not fully configured, log to a local file (sandbox fallback)
            if not EmailService.is_smtp_configured():
                logger.warning(f"[EMAIL] SMTP not configured. Using file logging fallback.")
                log_entry = f"========================================\n" \
                            f"TIMESTAMP: {__import__('datetime').datetime.utcnow()}\n" \
                            f"TO: {to_email}\n" \
                            f"FROM: {SENDER_EMAIL}\n" \
                            f"SUBJECT: {subject}\n" \
                            f"----------------------------------------\n" \
                            f"TEXT VERSION:\n{body_text}\n" \
                            f"----------------------------------------\n" \
                            f"HTML VERSION:\n{body_html}\n" \
                            f"========================================\n\n"
                
                # Write to a file in the backend root
                try:
                    with open("email_logs.txt", "a", encoding="utf-8") as f:
                        f.write(log_entry)
                    logger.info(f"[EMAIL] Successfully logged email to email_logs.txt: {subject} to {to_email}")
                except Exception as e:
                    logger.error(f"[EMAIL] Failed to write mock email to file: {e}", exc_info=True)
                    return False
                    
                return True

            # Send actual SMTP email
            logger.info(f"[EMAIL] Attempting to send via SMTP to {to_email} using {SMTP_HOST}:{SMTP_PORT}")
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Purrfect Match AI | Kizuna Paws <{SENDER_EMAIL}>"
            msg["To"] = to_email

            part1 = MIMEText(body_text, "plain")
            part2 = MIMEText(body_html, "html")

            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                logger.debug(f"[EMAIL] SMTP connection established to {SMTP_HOST}:{SMTP_PORT}")
                
                server.starttls()
                logger.debug(f"[EMAIL] STARTTLS successful")
                
                server.login(SMTP_USER, SMTP_PASSWORD)
                logger.debug(f"[EMAIL] Authentication successful for user {SMTP_USER}")
                
                server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
                logger.info(f"[EMAIL] Successfully sent email to {to_email}: {subject}")
            
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"[EMAIL] SMTP Authentication failed for {SMTP_USER}: {e}")
            logger.error(f"[EMAIL] Please verify your SMTP credentials in .env file")
            logger.error(f"[EMAIL] For Gmail, use an App Password from: https://myaccount.google.com/apppasswords")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"[EMAIL] SMTP error occurred: {e}")
            logger.error(f"[EMAIL] Full traceback: {traceback.format_exc()}")
            return False
        except Exception as e:
            logger.error(f"[EMAIL] Unexpected error sending email to {to_email}: {e}")
            logger.error(f"[EMAIL] Full traceback: {traceback.format_exc()}")
            return False

    @staticmethod
    def send_welcome_email(user_email: str, name: str, role: str, verification_token: str = None) -> bool:
        """
        Send welcome email with optional email verification link.
        
        Args:
            user_email: User's email address
            name: User's name
            role: User's role (adopter, shelter, admin)
            verification_token: Optional verification token for email verification
            
        Returns:
            bool: True if sent successfully
        """
        try:
            logger.info(f"[EMAIL] Preparing welcome email for {user_email} (role: {role})")
            
            subject = "Welcome to Kizuna Paws - Purrfect Match AI! 🐾"
            
            # Get verification URL from environment
            verification_base_url = os.getenv("VERIFICATION_BASE_URL", "http://localhost:3000")
            verify_link = f"{verification_base_url}/auth/verify-email?token={verification_token}" if verification_token else None
            
            body_text = f"Hi {name},\n\n" \
                        f"Welcome to Kizuna Paws! Your account as a {role} has been successfully registered.\n\n"
            
            if verify_link:
                body_text += f"Please verify your email by clicking the link below or copying it into your browser:\n" \
                            f"{verify_link}\n\n" \
                            f"This link will expire in 24 hours.\n\n"
            
            body_text += f"If you are an adopter, complete your lifestyle questionnaire to find the perfect feline companion.\n" \
                        f"If you are a shelter, you can start managing your shelter's cat registrations and adoption request ledgers.\n\n" \
                        f"Warm regards,\nThe Kizuna Paws Team"

            verification_section = f"""
                    <div style="background-color: #fef3e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #ef4444;">📧 Verify Your Email</p>
                        <p style="margin: 0 0 15px 0; font-size: 13px;">Please verify your email address by clicking the button below. This link expires in 24 hours.</p>
                        <a href="{verify_link}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify Email Address</a>
                        <p style="margin-top: 15px; font-size: 11px; color: #666;">Or copy this link: <br><code style="background: #f0f0f0; padding: 5px;">{verify_link}</code></p>
                    </div>
            """ if verification_token else ""

            body_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5d8cd;">
                        <h2 style="color: #ef4444; margin-top: 0;">Welcome to Kizuna Paws! 🐾</h2>
                        <p>Hi <strong>{name}</strong>,</p>
                        <p>Your account as a <strong>{role}</strong> has been successfully registered on the Purrfect Match AI platform.</p>
                        {verification_section}
                        <p><strong>Next steps:</strong></p>
                        <ul>
                            <li>If you are an <strong>adopter</strong>, complete your compatibility questionnaire to run the AI matching engine!</li>
                            <li>If you are a <strong>shelter</strong>, start managing your cat registrations, upload videos, and review adoption requests.</li>
                        </ul>
                        <hr style="border: 0; border-top: 1px solid #e8dcd0; margin: 20px 0;">
                        <p style="font-size: 11px; color: #8c7975;">Warm regards,<br><strong>The Kizuna Paws Team</strong></p>
                    </div>
                </body>
            </html>
            """
            
            result = EmailService.send_email(user_email, subject, body_html, body_text)
            logger.info(f"[EMAIL] Welcome email result for {user_email}: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[EMAIL] Error sending welcome email to {user_email}: {e}", exc_info=True)
            return False

    @staticmethod
    def send_email_verification_reminder(user_email: str, name: str, verification_token: str) -> bool:
        """
        Send a verification reminder email if user hasn't verified yet.
        
        Args:
            user_email: User's email address
            name: User's name
            verification_token: Verification token for email verification
            
        Returns:
            bool: True if sent successfully
        """
        try:
            logger.info(f"[EMAIL] Preparing verification reminder email for {user_email}")
            
            subject = "Verify Your Email Address - Purrfect Match AI 🐾"
            verification_base_url = os.getenv("VERIFICATION_BASE_URL", "http://localhost:3000")
            verify_link = f"{verification_base_url}/auth/verify-email?token={verification_token}"
            
            body_text = f"Hi {name},\n\n" \
                        f"We noticed you haven't verified your email yet.\n\n" \
                        f"Please verify your email address by visiting this link:\n" \
                        f"{verify_link}\n\n" \
                        f"This link will expire in 24 hours.\n\n" \
                        f"If you did not create an account, please ignore this email.\n\n" \
                        f"Warm regards,\nThe Kizuna Paws Team"
            
            body_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5d8cd;">
                        <h2 style="color: #ef4444; margin-top: 0;">Verify Your Email 🐾</h2>
                        <p>Hi <strong>{name}</strong>,</p>
                        <p>We noticed you haven't verified your email address yet. Please do so now to activate your account.</p>
                        <div style="background-color: #fef3e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <a href="{verify_link}" style="background-color: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">Verify Email Now</a>
                        </div>
                        <p style="font-size: 12px; color: #666;">This link expires in 24 hours.</p>
                        <hr style="border: 0; border-top: 1px solid #e8dcd0; margin: 20px 0;">
                        <p style="font-size: 11px; color: #8c7975;">Warm regards,<br><strong>The Kizuna Paws Team</strong></p>
                    </div>
                </body>
            </html>
            """
            
            result = EmailService.send_email(user_email, subject, body_html, body_text)
            logger.info(f"[EMAIL] Verification reminder result for {user_email}: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[EMAIL] Error sending verification reminder to {user_email}: {e}", exc_info=True)
            return False

    @staticmethod
    def send_password_reset_email(to_email: str, reset_code: str) -> bool:
        """Send password reset email with verification code."""
        try:
            logger.info(f"[EMAIL] Preparing password reset email for {to_email}")
            
            subject = "Purrfect Match AI - Password Reset Request 🐾"
            
            body_text = f"Hello,\n\nYou requested a password reset. Your verification code is: {reset_code}\n\n" \
                        f"Please enter this code on the application to reset your password. If you did not make this request, please ignore."

            body_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e5d8cd; text-align: center;">
                        <h2 style="color: #ef4444; margin-top: 0; margin-bottom: 20px;">Password Reset Verification</h2>
                        <p style="font-size: 14px;">You requested a password reset for your Purrfect Match AI account.</p>
                        <p style="font-size: 14px;">Please enter the following 6-digit verification code to reset your password:</p>
                        <div style="background-color: #f7f1eb; border: 1.5px dashed #ef4444; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3d2d2a; display: inline-block; margin: 20px 0; border-radius: 8px;">
                            {reset_code}
                        </div>
                        <p style="font-size: 11px; color: #7f7f7f;">If you did not request this password reset, you can safely ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #e5d8cd; margin: 30px 0;">
                        <p style="font-size: 10px; color: #a3a3a3;">Kizuna Paws Team • Purrfect Match AI</p>
                    </div>
                </body>
            </html>
            """
            
            result = EmailService.send_email(to_email, subject, body_html, body_text)
            logger.info(f"[EMAIL] Password reset email result for {to_email}: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[EMAIL] Error sending password reset email to {to_email}: {e}", exc_info=True)
            return False

    @staticmethod
    def send_adoption_filed_email(adopter_email: str, adopter_name: str, cat_name: str, shelter_email: str) -> bool:
        """Send adoption filed notification to both adopter and shelter."""
        try:
            logger.info(f"[EMAIL] Preparing adoption filed emails - adopter: {adopter_email}, shelter: {shelter_email}")
            
            # 1. Email to Adopter
            adopter_subject = f"Adoption Request Filed for {cat_name}! 🐈"
            adopter_text = f"Hi {adopter_name},\n\n" \
                           f"Your adoption request for {cat_name} has been successfully submitted to the shelter.\n" \
                           f"The shelter team will review your compatibility report and questionnaire to evaluate the match.\n\n" \
                           f"You will receive an email update once they update the status.\n\n" \
                           f"Warm regards,\nThe Kizuna Paws Team"
            
            adopter_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5d8cd;">
                    <h2 style="color: #ef4444; margin-top: 0;">Adoption Request Submitted! 🐈</h2>
                    <p>Hi <strong>{adopter_name}</strong>,</p>
                    <p>Your adoption application for <strong>{cat_name}</strong> has been successfully registered and sent to the shelter.</p>
                    <p>The shelter's adoption manager will review your questionnaire answers and compatibility breakdown.</p>
                    <p>We will email you as soon as the shelter reviews and updates the status of your application.</p>
                    <hr style="border: 0; border-top: 1px solid #e8dcd0; margin: 20px 0;">
                    <p style="font-size: 11px; color: #8c7975;">Best of luck,<br><strong>The Kizuna Paws Team</strong></p>
                </div>
            </body>
        </html>
        """
            
            adopter_result = EmailService.send_email(adopter_email, adopter_subject, adopter_html, adopter_text)
            logger.info(f"[EMAIL] Adoption filed email to adopter {adopter_email}: {adopter_result}")

            # 2. Email to Shelter
            shelter_subject = f"New Adoption Request Received for {cat_name}! 🐾"
            shelter_text = f"Hello,\n\n" \
                           f"A new adoption request has been submitted for {cat_name} by {adopter_name} ({adopter_email}).\n" \
                           f"Please log in to your Shelter Dashboard to review the application and compatibility metrics.\n\n" \
                           f"Warm regards,\nThe Kizuna Paws Team"

            shelter_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5d8cd;">
                    <h2 style="color: #ef4444; margin-top: 0;">New Adoption Request 🐾</h2>
                    <p>Hello,</p>
                    <p>A new adoption application has been submitted for <strong>{cat_name}</strong>.</p>
                    <p><strong>Applicant details:</strong></p>
                    <ul>
                        <li>Name: {adopter_name}</li>
                        <li>Email: {adopter_email}</li>
                    </ul>
                    <p>Please log in to your <strong>Shelter Control Panel</strong> to review their compatibility scores, lifestyle answers, and approve/reject the request.</p>
                    <hr style="border: 0; border-top: 1px solid #e8dcd0; margin: 20px 0;">
                    <p style="font-size: 11px; color: #8c7975;">Warm regards,<br><strong>The Kizuna Paws Team</strong></p>
                </div>
            </body>
        </html>
        """
            
            shelter_result = EmailService.send_email(shelter_email, shelter_subject, shelter_html, shelter_text)
            logger.info(f"[EMAIL] Adoption filed email to shelter {shelter_email}: {shelter_result}")
            
            return adopter_result and shelter_result
            
        except Exception as e:
            logger.error(f"[EMAIL] Error sending adoption filed emails: {e}", exc_info=True)
            return False

    @staticmethod
    def send_adoption_status_email(adopter_email: str, adopter_name: str, cat_name: str, status: str) -> bool:
        """Send adoption request status update email."""
        try:
            logger.info(f"[EMAIL] Preparing adoption status email for {adopter_email}: {status}")
            
            subject = f"Update on your adoption request for {cat_name}! 🐾"
            status_text = "APPROVED 🎉" if status == "approved" else "DECLINED"
            
            body_text = f"Hi {adopter_name},\n\n" \
                        f"The shelter has updated the status of your adoption request for {cat_name} to: {status_text}.\n\n"
            if status == "approved":
                body_text += f"Congratulations! The shelter team will contact you shortly to coordinate the next steps of the adoption process.\n\n"
            else:
                body_text += f"Thank you for your interest. Unfortunately, the shelter has chosen another placement at this time. We encourage you to browse other profiles on our platform.\n\n"
            body_text += f"Warm regards,\nThe Kizuna Paws Team"

            body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5d8cd;">
                    <h2 style="color: #ef4444; margin-top: 0;">Adoption Request Update 🐾</h2>
                    <p>Hi <strong>{adopter_name}</strong>,</p>
                    <p>The shelter has reviewed your application for <strong>{cat_name}</strong> and updated the status to:</p>
                    <div style="padding: 15px; margin: 15px 0; background: { '#d1e7dd' if status == 'approved' else '#f8d7da' }; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; color: { '#0f5132' if status == 'approved' else '#842029' };">
                        {status_text}
                    </div>
        """
            if status == "approved":
                body_html += f"""
                    <p><strong>Congratulations!</strong> The shelter staff will reach out to you shortly at <strong>{adopter_email}</strong> to coordinate a meet-and-greet and adoption finalization schedules.</p>
            """
            else:
                body_html += f"""
                    <p>Thank you for submitting your application. Unfortunately, the shelter has decided to go with another fit for {cat_name} at this time. Please don't be discouraged—we have many other cats available that would love to meet you!</p>
            """
            
            body_html += f"""
                    <hr style="border: 0; border-top: 1px solid #e8dcd0; margin: 20px 0;">
                    <p style="font-size: 11px; color: #8c7975;">Warm regards,<br><strong>The Kizuna Paws Team</strong></p>
                </div>
            </body>
        </html>
        """
            
            result = EmailService.send_email(adopter_email, subject, body_html, body_text)
            logger.info(f"[EMAIL] Adoption status email result for {adopter_email}: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[EMAIL] Error sending adoption status email to {adopter_email}: {e}", exc_info=True)
            return False
