import net from "node:net";
import tls from "node:tls";

/**
 * Minimal dependency-free SMTP client (STARTTLS + AUTH LOGIN) for Brevo.
 * Single-shot send per call — fine for low-volume transactional auth mail.
 * Throws on any non-2xx SMTP step so the caller can fall back to another transport.
 */

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

export type Mail = {
  fromEmail: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
};

function expect(lines: string[], code: string, step: string) {
  const last = lines[lines.length - 1] ?? "";
  if (!last.startsWith(code)) {
    throw new Error(`SMTP ${step} failed: ${lines.join(" | ")}`);
  }
}

function encodeHeader(value: string) {
  // RFC 2047 for non-ASCII subject/sender names.
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

export async function sendMailViaSmtp(cfg: SmtpConfig, mail: Mail): Promise<void> {
  const timeoutMs = 15000;

  function readReply(stream: NodeJS.ReadWriteStream): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let buf = "";
      const onData = (d: Buffer) => {
        buf += d.toString("utf8");
        const lines = buf.split(/\r\n/).filter(Boolean);
        const last = lines[lines.length - 1];
        if (last && /^\d{3} /.test(last)) {
          stream.removeListener("data", onData);
          resolve(lines);
        }
      };
      stream.on("data", onData);
      stream.once("error", reject);
    });
  }

  const sock = net.createConnection({ host: cfg.host, port: cfg.port });
  sock.setTimeout(timeoutMs);
  let secure: tls.TLSSocket | null = null;

  try {
    await new Promise<void>((resolve, reject) => {
      sock.once("connect", () => resolve());
      sock.once("timeout", () => reject(new Error("SMTP connect timeout")));
      sock.once("error", reject);
    });

    expect(await readReply(sock), "220", "greeting");
    sock.write("EHLO bolao.local\r\n");
    await readReply(sock);
    sock.write("STARTTLS\r\n");
    expect(await readReply(sock), "220", "STARTTLS");

    secure = tls.connect({ socket: sock, servername: cfg.host });
    await new Promise<void>((resolve, reject) => {
      secure!.once("secureConnect", () => resolve());
      secure!.once("error", reject);
    });
    secure.setTimeout(timeoutMs);

    secure.write("EHLO bolao.local\r\n");
    await readReply(secure);
    secure.write("AUTH LOGIN\r\n");
    await readReply(secure);
    secure.write(Buffer.from(cfg.user).toString("base64") + "\r\n");
    await readReply(secure);
    secure.write(Buffer.from(cfg.pass).toString("base64") + "\r\n");
    expect(await readReply(secure), "235", "AUTH");

    secure.write(`MAIL FROM:<${mail.fromEmail}>\r\n`);
    expect(await readReply(secure), "250", "MAIL FROM");
    secure.write(`RCPT TO:<${mail.to}>\r\n`);
    expect(await readReply(secure), "250", "RCPT TO");
    secure.write("DATA\r\n");
    expect(await readReply(secure), "354", "DATA");

    const headers = [
      `From: ${encodeHeader(mail.fromName)} <${mail.fromEmail}>`,
      `To: <${mail.to}>`,
      `Subject: ${encodeHeader(mail.subject)}`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
    ].join("\r\n");

    // base64 body avoids dot-stuffing / bare-CRLF issues entirely.
    const body = Buffer.from(mail.html, "utf8")
      .toString("base64")
      .replace(/(.{76})/g, "$1\r\n");

    secure.write(`${headers}\r\n\r\n${body}\r\n.\r\n`);
    expect(await readReply(secure), "250", "send");

    secure.write("QUIT\r\n");
  } finally {
    try {
      (secure ?? sock).end();
    } catch {
      /* ignore */
    }
    try {
      sock.destroy();
    } catch {
      /* ignore */
    }
  }
}
