import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { supabase } from "@/app/utils/dbconnect";
import { formatFullDate } from "@/lib/utils";

// Initialize R2 client
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    console.log(0)
    const { ZEPTO_API_KEY, EMAIL_FROM } = process.env;

    if (!ZEPTO_API_KEY || !EMAIL_FROM) {
      return Response.json({ message: "Server configuration error" }, { status: 500 });
    }
    console.log(1)

    const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const year = istNow.getFullYear();
    const month = String(istNow.getMonth() + 1).padStart(2, "0");
    const day = String(istNow.getDate()).padStart(2, "0");
    const normalizedDate = `2000-${month}-${day}`;
    const today = formatFullDate(`${year}-${month}-${day}`);
    console.log(today);

    const [birthdayData, spouseBirthdays, anniversaries] = await Promise.all([
      fetchByType(normalizedDate, "member"),
      fetchByType(normalizedDate, "spouse"),
      fetchByType(normalizedDate, "anniversary"),
    ]);

    const allRecipients = [
      ...birthdayData.map((r) => ({ ...r, type: "member" })),
      ...spouseBirthdays.map((r) => ({ ...r, type: "spouse" })),
      ...anniversaries.map((r) => ({ ...r, type: "anniversary" })),
    ];

    let sentCount = 0;

    for (const user of allRecipients) {
      const userEmail = user.email;
      if (!userEmail) continue;

      const imageName =
        user.type === "anniversary"
          ? user.annposter
            ? `${user.id}_anniv.jpg`
            : `${user.partner.id}_anniv.jpg`
          : `${user.id}_poster.jpg`;

      const buffer = await getCompressedImageBuffer(imageName);

      const attachments = [];
      let cid = "";
      if (buffer) {
        cid = `poster-${user.id}`;
        attachments.push({
          filename: imageName,
          content: buffer.toString('base64'),
          content_type: 'image/jpeg',
          cid,
        });
      }

      const name = toTitleCase(user.name);
      const partnerName = toTitleCase(user?.partner?.name || "");
      const isAnniv = user.type === "anniversary";

      const posterImg = cid
        ? `<img src="cid:${cid}" style="width: 300px; max-width: 100%; border-radius: 12px; margin: 20px 0;" alt="Poster" />`
        : "";

      const message = isAnniv
        ? `
        <p>Dear ${name} & ${partnerName},</p>
        <p>Greetings !!!</p>
        <p>On behalf of the entire Rotary family of District 3012, We extend our warmest wishes and heartfelt blessings while you celebrate the beautiful milestone of your Wedding Anniversary today.</p>
        <p>May this special day remind you of the sacred vows you once made — promises of love, loyalty, and unwavering support. Through every season, We pray that your journey together continues to inspire all who witness the grace, strength, and joy you share in blissful togetherness.</p>
        <p>May your bond grow deeper with time, and may every anniversary bring you closer in heart and soul.</p>
        ${posterImg}
        <p>With affection and admiration,<br/>
        Your Rotary Family – District 3012<br/>
        <strong>Dr.Amita  Mohindru AKS- Chair Circle</strong><br/>
        <strong>Capt.Dr.Anil K.Mohindru AKS- Chair Circle</strong></p>
      `
        : `
        <p>Dear ${name},</p>
        <p>Greetings ! Happy Birthday</p>
        <p>On behalf of Rotary District 3012, we extend our warmest greetings and heartfelt blessings to you on your special day.</p>
        <p>Your unwavering commitment to Service Above Self has touched countless lives and brought hope and happiness to many people around you in your communities. Today, we celebrate your spirit, your service, and the radiant light you bring to the Rotary family and the world around you.</p>
        <p>May your life be filled with robust health, boundless joy, and an inspiring journey ahead. We pray for your long life, enduring happiness, and continued strength to serve with the same passion, purpose, and pride that truly define a Rotarian.</p>
        ${posterImg}
        <p>Happy Birthday! May this year be your most impactful and fulfilling yet.</p>
        <p>With deep respect and warm regards,<br/>
        Rotary District 3012<br/>
        <strong>Dr.Amita Mohindru AKS - Chair Circle</strong><br/>
        <strong>Capt.Dr.Anil K.Mohindru AKS- Chair Circle</strong></p>
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: left;">
          ${message}
        </div>
      `;

      const subject = isAnniv
        ? `Happy Anniversary, ${name} & ${partnerName}!`
        : `Happy Birthday, ${name}!`;

      // Prepare ZeptoMail payload
      const zeptoPayload = {
        from: {
          address: EMAIL_FROM,
          name: "DG Dr. Amita Mohindru"
        },
        to: [
          {
            email_address: {
              //address: userEmail
              address: "bansalaryan2000@gmail.com"
            }
          }
        ],
        //bcc: [
        //  {
        //    email_address: {
        //      address: "prateekbhargava1002@yahoo.com"
        //    }
        //  }
        //],
        reply_to: [
          {
            address: "amitadg2526rid3012@gmail.com",
            name: "DG Dr. Amita Mohindru"
          }
        ],
        subject: subject,
        htmlbody: html,
        attachments: attachments
      };

      // Send email via ZeptoMail API
      const response = await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': ZEPTO_API_KEY
        },
        body: JSON.stringify(zeptoPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ZeptoMail API error for ${userEmail}:`, errorText);
        continue;
      }

      console.log(`Email sent to ${userEmail}`);
      sentCount++;
    }

    return Response.json({
      message: "Emails sent successfully",
      count: sentCount,
      dateUsed: normalizedDate,
    });
  } catch (error) {
    console.error("Send email error:", error);
    return Response.json({ message: error.message || "Failed to send email" }, { status: 500 });
  }
}

async function getCompressedImageBuffer(fileName) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: fileName,
    });

    const response = await s3.send(command);
    const stream = response.Body;

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Compress using sharp
    return await sharp(buffer)
      .resize({ width: 1000 })
      .jpeg({ quality: 75 })
      .toBuffer();
  } catch (err) {
    console.error("R2 image fetch/compression error:", err);
    return null;
  }
}

async function fetchByType(date, type) {
  try {
    let query = supabase.from("user");
    let processedData = [];

    if (type === "member") {
      query = query
        .select("id, name, club, phone, email, role")
        .eq("type", "member")
        .eq("dob", date)
        .eq("poster", true)
        .eq("active", true);
    } else if (type === "spouse") {
      query = query
        .select("id, name, club, phone, email, partner:partner_id (id, name)")
        .eq("type", "spouse")
        .eq("dob", date)
        .eq("poster", true)
        .eq("active", true);
    } else if (type === "anniversary") {
      query = query
        .select(
          "id, name, club, email, phone, role, annposter, partner:partner_id (id, name, club, email, phone, active, annposter)"
        )
        .eq("anniversary", date)
        .eq("active", true);
    } else {
      throw new Error("Invalid type provided");
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) return [];

    processedData = data;

    if (type === "anniversary") {
      processedData = data.filter((item) => item.partner?.active === true);
    }

    return processedData;
  } catch (err) {
    console.error("fetchByType error:", err);
    return [];
  }
}

function toTitleCase(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "pdg") return "PDG";
      if (lower === "ca") return "CA";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}