import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  } = req.body;

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
  });

  if (error) {
    console.log(JSON.stringify(error));
    return res.send("Error inserting data" + JSON.stringify(error));
  }

  return res.send("Data Saved");
});

app.post("/deletefromincoming", async (req, res) => {
  console.log("incoming delete id", req.body);
  const accessToken = req.cookies.accessToken;

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

  const supabaseForAuthenticated = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

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
      throw new Error(
        `outgoing Indigency Error: ${errorOutgoingIndigency.message}`
      );
    }

    return res.status(200).json(outgoingIndigency);
  } catch (error) {
    console.error("Error fetching outgoing data:", error);
    return res.status(500).json({ error: "server error fetching data" });
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
    const token = data.session.access_token;

    //!!IMPORTANT
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false, // Set to true in production (for HTTPS)
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

app.post("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out successfully" });
});
