/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Midtrans Snap
  // We use lazy initialization to avoid crashing if keys are missing
  let snap: any = null;
  const getSnap = () => {
    if (!snap) {
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      if (!serverKey) {
        console.warn("MIDTRANS_SERVER_KEY is not set. Payment features will fail.");
        return null;
      }
      snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        serverKey: serverKey,
        clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
      });
    }
    return snap;
  };

  // API Routes
  app.post("/api/payment/create", async (req, res) => {
    try {
      const { ticketCode, amount, plateNumber, vehicleType } = req.body;
      
      const snapInstance = getSnap();
      if (!snapInstance) {
        return res.status(500).json({ error: "Payment gateway not configured" });
      }

      const parameter = {
        transaction_details: {
          order_id: `${ticketCode}-${Date.now()}`,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
        item_details: [{
          id: ticketCode,
          price: amount,
          quantity: 1,
          name: `Parking Fare - ${plateNumber} (${vehicleType})`,
        }],
        customer_details: {
          first_name: "Parking Customer",
          email: "customer@example.com",
        }
      };

      const transaction = await snapInstance.createTransaction(parameter);
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (error: any) {
      console.error("Midtrans Error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
