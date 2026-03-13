package email

import (
	"fmt"
	"net/smtp"
	"strings"

	"github.com/oshanavishkapiries/sinhalasub/backend/internal/pkg/utils"
)

type SMTPConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
	FromName string
}

func LoadSMTPConfig() SMTPConfig {
	return SMTPConfig{
		Host:     strings.TrimSpace(utils.GetEnv("SMTP_HOST", "")),
		Port:     strings.TrimSpace(utils.GetEnv("SMTP_PORT", "587")),
		Username: strings.TrimSpace(utils.GetEnv("SMTP_USERNAME", "")),
		Password: utils.GetEnv("SMTP_PASSWORD", ""),
		From:     strings.TrimSpace(utils.GetEnv("SMTP_FROM", "")),
		FromName: strings.TrimSpace(utils.GetEnv("SMTP_FROM_NAME", "SinhalaSub")),
	}
}

func SendVerificationCode(toEmail, code string) error {
	subject := "Verify your SinhalaSub account"
	body := fmt.Sprintf("Your verification code is: %s\n\nThis code will expire soon.", code)
	return sendMail(toEmail, subject, body)
}

func SendPasswordResetCode(toEmail, code string) error {
	subject := "Reset your SinhalaSub password"
	body := fmt.Sprintf("Your password reset code is: %s\n\nIf you did not request this, ignore this email.", code)
	return sendMail(toEmail, subject, body)
}

func sendMail(toEmail, subject, body string) error {
	cfg := LoadSMTPConfig()
	if cfg.Host == "" || cfg.Port == "" || cfg.From == "" {
		return fmt.Errorf("smtp is not configured (SMTP_HOST/SMTP_PORT/SMTP_FROM)")
	}

	addr := cfg.Host + ":" + cfg.Port
	var auth smtp.Auth
	if cfg.Username != "" && cfg.Password != "" {
		auth = smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)
	}

	message := buildMessage(cfg.FromName, cfg.From, toEmail, subject, body)
	if err := smtp.SendMail(addr, auth, cfg.From, []string{toEmail}, []byte(message)); err != nil {
		return fmt.Errorf("sending email failed: %w", err)
	}

	return nil
}

func buildMessage(fromName, from, to, subject, body string) string {
	displayFrom := from
	if fromName != "" {
		displayFrom = fmt.Sprintf("%s <%s>", fromName, from)
	}

	headers := []string{
		"From: " + displayFrom,
		"To: " + to,
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
	}

	return strings.Join(headers, "\r\n") + "\r\n\r\n" + body + "\r\n"
}
