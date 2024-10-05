import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const jwtToken = process.env.JWT_TOKEN;
const app = express();
const port = process.env.PORT;
const domain = "http://localhost:3001";
app.use(
  cors({
    origin: domain,
    credentials: true, // Allow cookies to be sent
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

app.post("/incoming_request", async (req, res) => {
  console.log("incoming request", req.body);

  const {
    form,
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
  } = req.body;

  const { data, error } = await supabase.from(`incoming_${form}`).insert({
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
  });

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error fetching data" + JSON.stringify(error));
  }

  return res.send("Data Saved");
});

app.post("/login", async (req, res) => {
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
    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      jwtToken,
      { expiresIn: "8h" }
    );
    console.log(jwtToken);
    //!!IMPORTANT
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false, // Set to true in production (for HTTPS)
      sameSite: "Strict",
    });

    // Send back session and user information
    res
      .status(200)
      .json({ message: "Logged in successfully", user: data.user });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out successfully" });
});
