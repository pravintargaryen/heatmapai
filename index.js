import express from "express";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const API_KEY = process.env.STABILITY_API_KEY;

app.post("/generate", async (req, res) => {
  const { rows, columns } = req.body;
  const prompt = `A heatmap visualization with ${rows} rows and ${columns} columns, color-coded from blue to red, in a scientific style.`;

  const payload = { prompt, output_format: "webp" };

  try {
    const response = await axios.postForm(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      axios.toFormData(payload, new FormData()),
      {
        responseType: "arraybuffer",
        headers: { Authorization: `Bearer ${API_KEY}`, Accept: "image/*" },
      }
    );

    if (response.status === 200) {
      const filename = `./public/heatmap.webp`;
      fs.writeFileSync(filename, Buffer.from(response.data));
      res.json({ imageUrl: "/heatmap.webp" });
    } else {
      throw new Error(`${response.status}: ${response.data.toString()}`);
    }
  } catch (error) {
    res.status(500).send(error.message);
    console.error(error);
  }
});

app.use(express.static("public"));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
