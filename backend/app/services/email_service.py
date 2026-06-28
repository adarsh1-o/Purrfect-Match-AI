import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger("purrfect_match_ai")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@kizunapaws.com")

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body_html: str, body_text: str) -> bool:
        """
        Sends an email using SMTP if configured. Otherwise, logs to a local file.
        """
        # If not fully configured, log to a local file (sandbox fallback)
        if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
            log_entry = f"========================================\n" \
                        f"TO: {to_email}\n" \
                        f"SUBJECT: {subject}\n" \
                        f"----------------------------------------\n" \
                        f"{body_text}\n" \
                        f"========================================\n\n"
            
            # Write to a file in the backend root
            try:
                # Resolve paths relative to backend root
                with open("email_logs.txt", "a") as f:
                    f.write(log_entry)
            except Exception as e:
                logger.error(f"Failed to write mock email to file: {e}")
                
            logger.info(f"[MOCK EMAIL] Written to email_logs.txt: {subject} to {to_email}")
            return True

        # Send actual SMTP email
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Kizuna Paws <{SENDER_EMAIL}>"
            msg["To"] = to_email

            part1 = MIMEText(body_text, "plain")
            part2 = MIMEText(body_html, "html")

            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
            
            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    @staticmethod
    def send_welcome_email(user_email: str, name: str, role: str) -> bool:
        subject = "Welcome to Kizuna Paws - Purrfect Match AI! 🐾"
        
        body_text = f"Hi {name},\n\n" \
                    f"Welcome to Kizuna Paws! Your account as a {role} has been successfully registered.\n\n" \
                    f"If you are an adopter, complete your lifestyle questionnaire to find the perfect feline companion.\n" \
                    f"If you are a shelter, you can start managing your shelter's cat registrations and adoption request ledgers.\n\n" \
                    f"Warm regards,\nThe Kizuna Paws Team"

        body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f7f1eb; color: #3d2d2a; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5d8cd;">
                    <h2 style="color: #ef4444; margin-top: 0;">Welcome to Kizuna Paws! 🐾</h2>
                    <p>Hi <strong>{name}</strong>,</p>
                    <p>Your account as a <strong>{role}</strong> has been successfully registered on the Purrfect Match AI platform.</p>
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
        return EmailService.send_email(user_email, subject, body_html, body_text)

    @staticmethod
    def send_adoption_filed_email(adopter_email: str, adopter_name: str, cat_name: str, shelter_email: str) -> bool:
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
        EmailService.send_email(adopter_email, adopter_subject, adopter_html, adopter_text)

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
        EmailService.send_email(shelter_email, shelter_subject, shelter_html, shelter_text)
        return True

    @staticmethod
    def send_adoption_status_email(adopter_email: str, adopter_name: str, cat_name: str, status: str) -> bool:
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
        return EmailService.send_email(adopter_email, subject, body_html, body_text)
