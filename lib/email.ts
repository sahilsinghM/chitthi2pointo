import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION
});

type SendEmailParams = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, from, subject, html, text }: SendEmailParams) {
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Html: { Data: html },
        Text: text ? { Data: text } : undefined
      },
      Subject: { Data: subject }
    },
    Source: from
  });

  return sesClient.send(command);
}
