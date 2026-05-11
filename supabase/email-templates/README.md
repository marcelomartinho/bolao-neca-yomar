# Email templates

Templates aplicados via Supabase Management API (`PATCH /v1/projects/{ref}/config/auth`).

## Aplicar manualmente (Supabase Dashboard)

1. `Authentication` → `Email Templates`
2. Selecione **Magic Link** / **Confirm signup** / **Reset password**
3. Cole o conteúdo de `magic-link.html` em cada um
4. Subjects sugeridos:
   - Magic link: `Sua cartela do Bolão te espera — Copa 2026`
   - Confirmation: `Confirma sua entrada no Bolão`
   - Recovery: `Bolão — link pra recuperar acesso`

## Aplicar via Management API

```python
PATCH https://api.supabase.com/v1/projects/{ref}/config/auth
Authorization: Bearer <PAT>
Content-Type: application/json
User-Agent: <any-non-curl>   # Cloudflare bloqueia UA padrão

{
  "mailer_subjects_magic_link": "...",
  "mailer_templates_magic_link_content": "<!doctype html>...",
  "mailer_subjects_confirmation": "...",
  "mailer_templates_confirmation_content": "...",
  "mailer_subjects_recovery": "...",
  "mailer_templates_recovery_content": "..."
}
```

## Variáveis Supabase

| Var | Significado |
|---|---|
| `{{ .ConfirmationURL }}` | URL única do magic-link (1h validade) |
| `{{ .Token }}` | OTP code (6 dígitos) — não usado neste fluxo |
| `{{ .TokenHash }}` | Hash do OTP |
| `{{ .Email }}` | E-mail do destinatário |
| `{{ .SiteURL }}` | Site URL configurada em Auth → URL Configuration |

## Design system

- Paper bg `#fbfaf4`, ink `#0b2c5c`, grass `#0b6b3a`, gold `#c79410`
- TriRule top: verde/dourado/azul (Brasil flag stripes)
- Fontes: `Arial Narrow` fallback do Condensed; Georgia para corpo (serif imitando boletim impresso)
- CTA: bloco verde sólido com texto uppercase + tracking

Clientes email não suportam web fonts confiavelmente — por isso fallback ao sistema. Email é HTML inline (table-based) pra Gmail/Outlook/Apple Mail/AOL.

## SMTP

Configurado via Resend (100 emails/dia free). Ver `docs/SUPABASE_SETUP.md` se precisar trocar.
