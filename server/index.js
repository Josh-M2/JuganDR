import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

config();
const supabaseUrlWss = process.env.SUPABASE_URL_WSS;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("supabaseUrlWss", supabaseUrlWss);

const app = express();
const port = process.env.PORT;
const domain = process.env.SERVER_URL || "http://localhost:3001";
app.use(
  cors({
    origin: domain,
    credentials: true, // Allow cookies to be sent
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted.cdn.com"],
      styleSrc: ["'self'", "https://trusted.cdn.com"],
      imgSrc: ["'self'", "https://images.example.com"],
      // Disallow inline JavaScript and only allow scripts from 'self' and trusted CDNs
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      connectSrc: [
        "'self'",
        supabaseUrl, // For HTTPS requests
        supabaseUrlWss, // For WebSocket connections
      ],
    },
  })
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/get-access-token", async (req, res) => {
  const accessToken = req.cookies.accessToken;

  return res.status(200).json(accessToken);
});

app.get("/get-images", async (req, res) => {
  const { front_id, back_id } = req.query.selectedDatas;
  const accessToken = req.cookies.accessToken;
  console.log(front_id, back_id);
  console.log("req.query.selectedDatas", req.query.selectedDatas);

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }
  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  let frontId, backId;

  try {
    const { data: front, error: errorfront } =
      await supabaseForAuthenticated.storage
        .from("uploads")
        .createSignedUrl(front_id, 32400);

    if (errorfront) {
      console.error("error fetching images:", errorfront);
    }

    if (front) {
      console.log("data_get_images:", front.signedUrl);
      frontId = front.signedUrl;
    }
  } catch (error) {
    console.error("yawaanimal", error);
  }

  const { data: back, error: errorback } =
    await supabaseForAuthenticated.storage
      .from("uploads")
      .createSignedUrl(back_id, 32400);

  if (errorback) {
    console.error("error fetching images1:", errorback);
  }

  if (back) {
    console.log("data_get_images1:", back.signedUrl);
    backId = back.signedUrl;
  }

  return res.send({ frontId, backId });
});

const incoming_requestRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    errorAttempt: "Too many requests from this IP, please try again later.",
  },
});

app.post("/incoming_request", incoming_requestRateLimiter, async (req, res) => {
  console.log("incoming request", req.body);

  const {
    document,
    first_name,
    middle_name,
    last_name,
    ext_name,
    age,
    mobile_num,
    street,
    barangay,
    province,
    city,
    frontID,
    backID,
  } = req.body;

  const namePattern = /^[a-zA-Z\s]+$/; // only letters and spaces
  const alphanumericPattern = /^[a-zA-Z0-9\s]+$/; // alphanumeric with spaces
  const numberPattern = /^\d+$/; // digits only
  const phonePattern = /^\d{10,15}$/; // digits, 10-15 length

  // Initialize an errors object to collect errors
  let errors = {};

  // Validate each field
  if (!namePattern.test(first_name))
    errors.first_name = "Invalid first name format";
  if (!namePattern.test(middle_name))
    errors.middle_name = "Invalid middle name format";
  if (!namePattern.test(last_name))
    errors.last_name = "Invalid last name format";
  if (ext_name && !namePattern.test(ext_name))
    errors.ext_name = "Invalid extension name format";

  if (!numberPattern.test(age) || age < 1 || age > 120)
    errors.age = "Age must be a valid number between 1 and 120";

  if (!phonePattern.test(mobile_num))
    errors.mobile_num = "Mobile number must be 10-15 digits";

  if (!alphanumericPattern.test(street))
    errors.street = "Invalid street format";
  if (!alphanumericPattern.test(barangay))
    errors.barangay = "Invalid barangay format";
  if (!alphanumericPattern.test(province))
    errors.province = "Invalid province format";
  if (!alphanumericPattern.test(city)) errors.city = "Invalid city format";

  // Validate frontID and backID (if they are files, you might check if they were uploaded)
  if (!frontID) errors.frontID = "Front ID is required";
  if (!backID) errors.backID = "Back ID is required";

  // Check if there are any errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: errors });
  }

  const { data, error } = await supabase.from(`incoming`).insert({
    first_name,
    middle_name,
    last_name,
    ext_name,
    age,
    mobile_num,
    street,
    barangay,
    province,
    city,
    document,
    front_id: frontID,
    back_id: backID,
  });

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error inserting data" + JSON.stringify(error));
  }

  return res.send("Data Saved");
});

// app.post("/save-image", upload.single("file"), async (req, res) => {
//   console.log("save-image:", req.body);
//   const path = req.body.path;
//   const file = req.file; // Get the file from req.file instead of req.body
//   console.log("Received file:", req.file);

//   try {
//     const { data, error } = await supabase.storage
//       .from("uploads")
//       .upload(path, file, {
//         contentType: file.mimetype, // Set the correct MIME type from the file
//         cacheControl: "3600", // Optional: Cache control for the uploaded file
//         upsert: false, // Prevent overwriting existing files
//       }); // Use file.buffer for binary data

//     if (error) {
//       console.error("error saving image", error);
//       return res.status(500).send("Error saving image");
//     }
//     if (data) {
//       console.log("image saved");
//       return res.status(200).json(data);
//     }
//   } catch (error) {
//     console.error("internal save-image error: ", error);
//     return res.status(500).send("Internal server error");
//   }
// });

app.post("/deletefromincoming", async (req, res) => {
  console.log("incoming delete id", req.body);
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { id } = req.body;

  const { data, error } = await supabaseForAuthenticated
    .from("incoming")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error deleting data" + JSON.stringify(error));
  }

  return res.send("Data deleted");
});

app.post("/outgoing_request", async (req, res) => {
  console.log("outgoing request", req.body);
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data, error } = await supabaseForAuthenticated
    .from(`outgoing`)
    .insert(req.body);

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error inserting data" + JSON.stringify(error));
  }

  return res.send("Data Saved");
});

app.post("/sendtoreleased", async (req, res) => {
  console.log("released request", req.body);
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data: FrontDeleteImage, error: errorFrontDeleteImage } =
    await supabaseForAuthenticated.storage
      .from("uploads")
      .remove(req.body.front_id);

  if (errorFrontDeleteImage) {
    console.error("Error deleting front_id file:", error.errorFrontDeleteImage);
    return res.send(
      "Error deleting front_id file:" + JSON.stringify(errorFrontDeleteImage)
    );
  }

  const { data: BackDeleteImage, error: errorBackDeleteImage } =
    await supabaseForAuthenticated.storage
      .from("uploads")
      .remove(req.body.back_id);

  if (errorBackDeleteImage) {
    console.error("Error deleting back_id file:", error.errorBackDeleteImage);
    return res.send(
      "Error deleting back_id file:" + JSON.stringify(errorBackDeleteImage)
    );
  }

  const { data, error } = await supabaseForAuthenticated
    .from(`released`)
    .insert(req.body);

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error inserting data" + JSON.stringify(error));
  }

  return res.send("Data Saved");
});

app.post("/deletefromoutgoing", async (req, res) => {
  console.log("outgoing delete id", req.body);
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { id } = req.body;

  const { data, error } = await supabaseForAuthenticated
    .from("outgoing")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error deleting data" + JSON.stringify(error));
  }

  return res.send("Data deleted");
});

app.get("/fetchincoming", async (req, res) => {
  // console.log(req.cookies.accessToken);
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  try {
    const { data: released, error: errorReleased } =
      await supabaseForAuthenticated.from("incoming").select("*");
    if (errorReleased) {
      throw new Error(`Incoming Indigency Error: ${errorReleased.message}`);
    }

    return res.status(200).json(released);
  } catch (error) {
    console.error("Error fetching incoming data:", error);
    return res.status(500).json({ error: "server error fetching data" });
  }
});

app.get("/fetchoutgoing", async (req, res) => {
  // console.log(req.cookies.accessToken);
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  try {
    const { data: outgoingIndigency, error: errorOutgoingIndigency } =
      await supabaseForAuthenticated.from("outgoing").select("*");

    if (errorOutgoingIndigency) {
      return res.status(500).json({
        error: `outgoing Indigency Error: ${errorOutgoingIndigency.message}`,
      });
    }

    return res.status(200).json(outgoingIndigency);
  } catch (error) {
    console.error("Error fetching outgoing data:", error);
    return res.status(500).json({ error });
  }
});

app.get("/fetchreleased", async (req, res) => {
  // console.log(req.cookies.accessToken);
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  try {
    const { data: outgoingIndigency, error: errorOutgoingIndigency } =
      await supabaseForAuthenticated.from("released").select("*");
    if (errorOutgoingIndigency) {
      throw new Error(
        `released Indigency Error: ${errorOutgoingIndigency.message}`
      );
    }

    return res.status(200).json(outgoingIndigency);
  } catch (error) {
    console.error("Error fetching outgoing data:", error);
    return res.status(500).json({ error: "server error fetching data" });
  }
});

app.post("/updatedata", async (req, res) => {
  // console.log(req.cookies.accessToken);
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found" });
  }

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  console.log(req.body);

  try {
    const { data: updatedData, error: errorUpdatedData } =
      await supabaseForAuthenticated
        .from("incoming")
        .update(req.body)
        .eq("id", req.body.id);
    if (errorUpdatedData) {
      throw new Error(`Incoming update Error: ${errorUpdatedData.message}`);
    }

    return res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error update incoming data:", error);
    return res.status(500).json({ error: "server update incoming data" });
  }
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    errorAttempt:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
});

app.post("/login", loginRateLimiter, async (req, res) => {
  const isProduction = process.env.DEVELOPMENT === "PRODUCTION";
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error.message);
      return res.status(401).json({ error: error.message });
    }

    // Create JWT
    const token = data.session.access_token;

    //!!IMPORTANT
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction, // Set to true in production (for HTTPS)
      sameSite: "Strict",
      maxAge: 32400000,
    });

    // Send back session and user information
    res.status(200).json({
      message: "Logged in successfully",
      // token,
      user: data.user,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/email-change-password", async (req, res) => {
  console.log("email-change-password", req.body);
  const { email } = req.body;

  let { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${domain}/reset-password"`,
  });
  if (error) {
    console.log(error.message);
    return res.send(data);
  }
  res.status(200).json({ message: "Password reset email sent!" });
});

app.post("/change-password", async (req, res) => {
  console.log("change-password", req.body);
  const { currentPassword, newPassword, email } = req.body;
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(200).json(null);
  }

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email, // assuming `req.user` contains the authenticated user's info
      password: currentPassword,
    });

    if (signInError) {
      return res.send({ message: signInError.code });
    }

    const { error: errorUpdatePassword } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (errorUpdatePassword) {
      return res
        .status(500)
        .json({ error: "Failed to update password. Please try again later." });
    }
  } catch (error) {
    console.error("internal error change-password", error);
    return res.status(500).json("internal error change-password", error);
  }

  res.status(200).json({ message: "Succesfull" });
});

app.post("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out successfully" });
});
