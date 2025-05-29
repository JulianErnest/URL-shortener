import dotenv from "dotenv";
import express, { Router } from "express";
import cors from "cors";
import { db } from "./db/knex";
import { redis } from "./db/redis";
import { nanoid } from "nanoid";
import {
  CreateShortUrlRequest,
  CreateShortUrlResponse,
  AnalyticsResponse,
  PreviewResponse,
  ErrorResponse
} from "../../shared/types";

dotenv.config();

const app = express();
const router = Router();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate short code
const generateShortCode = () => nanoid(8);

// Helper function to anonymize IP
const anonymizeIp = (ip: string) => ip.replace(/\.\d+$/, '.0');

/*
##################################################
||                                              ||
||              Example endpoints               ||
||                                              ||
##################################################
*/

// Root endpoint - Returns a simple hello world message and default client port
router.get("/", (_req, res) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

// 1. Create short URL
router.post("/api/shorten", async (req, res) => {
  const body = req.body as CreateShortUrlRequest;
  const { originalUrl, customCode, expiresAt, preview, utmParams } = body;
  console.log('body rest api create', body);
  console.log('preview', preview)

  // Validate URL
  try {
    new URL(originalUrl);
  } catch (err) {
    res.status(400).json({ error: "Invalid URL" });
    return
  }

  // Start transaction
  const trx = await db.transaction();

  try {
    const [url] = await trx('urls').insert({
      original_url: originalUrl,
      short_code: customCode || generateShortCode(),
      expires_at: expiresAt,
      utm_parameters: JSON.stringify(utmParams || []),
      preview: preview ? JSON.stringify(preview) : null
    }).returning('*');

    await trx.commit();

    const response: CreateShortUrlResponse = {
      shortUrl: `${process.env.BASE_URL || 'http://localhost:8000'}/${url.short_code}`,
      expiresAt: url.expires_at
    };
    res.json(response);

  } catch (error: any) {
    await trx.rollback();
    
    // Check if it's a duplicate key error
    if (error.code === '23505' && error.constraint === 'urls_short_code_unique') {
      const errorResponse: ErrorResponse = { 
        error: "This custom short code is already taken. Please try a different one." 
      };
      res.status(409).json(errorResponse);
      return;
    }

    console.error(error);
    const errorResponse: ErrorResponse = { error: "Failed to create short URL" };
    res.status(500).json(errorResponse);
  }
});

// 2. Redirect to original URL
router.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Try cache first
    const cacheKey = `shorturl:${shortCode}`;
    let url: any = await redis.get(cacheKey);
    if (url) {
      url = JSON.parse(url);
    } else {
      url = await db('urls')
        .where('short_code', shortCode)
        .first();
      if (url) {
        await redis.set(cacheKey, JSON.stringify(url), 'EX', 60 * 60); // cache for 1 hour
      }
    }

    if (!url) {
      res.status(404).send('URL not found');
      return
    }

    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      res.status(410).send('URL has expired');
      return
    }

    // Parse UTM parameters if they exist
    let redirectUrl = url.original_url;
    if (url.utm_parameters) {
      try {
        const utmParams = url.utm_parameters;
        if (utmParams && utmParams.length > 0) {
          const urlObj = new URL(redirectUrl);
          utmParams.forEach((param: { key: string; value: string }) => {
            urlObj.searchParams.append(param.key, param.value);
          });
          redirectUrl = urlObj.toString();
        }
      } catch (parseError) {
        // console.error('Error parsing UTM parameters:', parseError);
        // Continue with original URL if parsing fails
      }
    }

    await db('clicks').insert({
      url_id: url.id,
      ip_address: anonymizeIp(req.ip || '0.0.0.0'),
      user_agent: req.headers['user-agent'] || 'Unknown',
      referrer: req.headers.referer || null
    });

    res.redirect(redirectUrl);

  } catch (error) {
    res.status(500).send('Error processing request');
  }
});

// 3. Get URL analytics
router.get("/api/analytics/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await db('urls')
      .where('short_code', shortCode)
      .first();
    
    console.log('url', url);

    if (!url) {
      const errorResponse: ErrorResponse = { error: "URL not found" };
      res.status(404).json(errorResponse);
      return
    }

    const clicks = await db('clicks')
      .where('url_id', url.id)
      .count('* as total_clicks')
      .first();

    const recentClicks = await db('clicks')
      .where('url_id', url.id)
      .orderBy('clicked_at', 'desc')
      .limit(10);

    const response: AnalyticsResponse = {
      shortCode,
      originalUrl: url.original_url,
      expiresAt: url.expires_at,
      totalClicks: Number(clicks?.total_clicks) || 0,
      recentClicks
    };
    res.json(response);

  } catch (error) {
    const errorResponse: ErrorResponse = { error: "Failed to fetch analytics" };
    res.status(500).json(errorResponse);
  }
});

// 4. Get URL preview data
router.get("/api/preview/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await db('urls')
      .where('short_code', shortCode)
      .first();

    if (!url) {
      const errorResponse: ErrorResponse = { error: "URL not found" };
      res.status(404).json(errorResponse);
      return;
    }

    let preview = null;
    if (url.preview) {
      try {
        preview = url.preview;
      } catch (parseError) {
        preview = null;
      }
    }

    const response: PreviewResponse = {
      shortCode,
      originalUrl: url.original_url,
      preview
    };
    res.json(response);

  } catch (error) {
    console.error('Error fetching preview:', error);
    const errorResponse: ErrorResponse = { error: "Failed to fetch preview data" };
    res.status(500).json(errorResponse);
  }
});

// Mount the router
app.use(router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
