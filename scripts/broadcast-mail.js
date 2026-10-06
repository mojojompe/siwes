const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ayomiposiemmanuel9_db_user:1rPP07xZc1jN5j2Y@mysiwes.agl8itd.mongodb.net/siwesApp?retryWrites=true&w=majority";

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_USER = "support.waltiklabs@gmail.com";
const SMTP_PASS = "ggst kmxm imna cbdq"; // App password provided by user

async function broadcastMail() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
      email: String,
      name: String
    }));

    const users = await User.find({ email: { $exists: true, $ne: null, $ne: "" } });
    console.log(`Found ${users.length} users with emails.`);

    if (users.length === 0) {
      console.log("No users found. Exiting.");
      process.exit(0);
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const alreadySent = [
      "ayomiposiemmanuel9@gmail.com", "folabas2@gmail.com", "ajiyobiojoaisha4@gmail.com",
      "danieltito445@gmail.com", "preciouschukwuemeka006@gmail.com", "teoayotomide@gmail.com",
      "devambassador@gmail.com", "quadriadewale001@gmail.com", "taiwooyedepo54@gmail.com",
      "answerboy247@gmail.com", "prevailojo@gmail.com", "omorinsolaloisolayeni@gmail.com",
      "mofiyinfoluwa433@gmail.com", "hammeddurojaiye689@gmail.com", "adekoyadasola@gmail.com"
    ];

    console.log("Sending emails...");
    
    let successCount = 0;
    for (const user of users) {
      if (alreadySent.includes(user.email)) {
        continue; // Skip the ones we already successfully sent to
      }
      try {
        // Sleep for 2 seconds to avoid aggressive rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

        await transporter.sendMail({
          from: '"Waltik Labs" <support.waltiklabs@gmail.com>',
          to: user.email,
          subject: "🚀 Massive AI Updates & The Launch of iléSure!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                
                <!-- Header -->
                <div style="background-color: #058789; padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Waltik Labs</h1>
                  <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 15px;">Empowering your digital experience.</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #111111; margin-top: 0; font-size: 22px;">Hello ${user.name ? user.name.split(' ')[0] : 'there'},</h2>
                  <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    We are thrilled to bring you two massive updates from <strong>Waltik Labs</strong>, the proud parent company behind SIWES Tracker, and many more innovative applications.
                  </p>
                  
                  <div style="background-color: #f8fcfc; border-left: 4px solid #058789; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                    <h3 style="color: #111111; margin-top: 0; font-size: 18px; display: flex; align-items: center;">
                      <span style="font-size: 24px; margin-right: 8px;">✨</span> AI SIWES Reports & Presentations
                    </h3>
                    <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.5;">
                      Tired of writing reports from scratch? You can now use your daily logs in <strong>SIWES Tracker</strong> to instantly generate a full <strong>SIWES Report Draft</strong> and <strong>Presentation Slides</strong>! Head over to the Context-Aware AI Chat and tap the new generation buttons to let AI do the heavy lifting.
                    </p>
                  </div>

                  <div style="background-color: #f8fcfc; border-left: 4px solid #058789; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                    <h3 style="color: #111111; margin-top: 0; font-size: 18px; display: flex; align-items: center;">
                      <span style="font-size: 24px; margin-right: 8px;">🏡</span> iléSure is LIVE!
                    </h3>
                    <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.5; margin-bottom: 16px;">
                      Be among the first to experience a smarter way to discover and secure housing. As a waitlist member, you'll receive early access to the platform, exclusive product updates, and priority notifications.
                    </p>
                    <a href="https://users.ilesure.com" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Join the iléSure Waitlist</a>
                  </div>
                  
                  <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Together, we're building a future where discovering solutions—whether it's managing your academics or finding a home—is simpler, safer, and built on trust.
                  </p>

                  <p style="color: #111111; font-weight: 600; margin: 0;">Best Regards,</p>
                  <p style="color: #555555; margin: 5px 0 0 0;">The Waltik Labs Team</p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f1f5f5; padding: 30px; text-align: center; border-top: 1px solid #eaeaea;">
                  <p style="color: #888888; font-size: 13px; margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} Waltik Labs. All rights reserved.
                  </p>
                  <p style="margin: 0;">
                    <a href="https://waltiklabs.vercel.app" style="color: #058789; text-decoration: none; font-size: 13px; font-weight: 600;">Visit Waltik Labs</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        successCount++;
        console.log(`Sent to ${user.email}`);
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err.message);
      }
    }

    console.log(`\n✅ Broadcast complete! Successfully sent ${successCount}/${users.length} emails.`);
  } catch (err) {
    console.error("Error during broadcast:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

broadcastMail();
