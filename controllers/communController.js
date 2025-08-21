// controllers/communController.js
import mongoose from "mongoose";
import communSchema from "../models/Commun.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { transporter } from "../config/mailer.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET;

const ALLOWED_TYPES = [
  "enums",
  "cars",
  "drivers",
  "users",
  "affectations",
  "lists",
]; // +affectations
const isId = (v) => mongoose.Types.ObjectId.isValid(v);

// --- helpers (affectations) ---
async function requireShared(id, type, label) {
  if (!isId(id)) throw new Error(`${label} id invalide`);
  const doc = await communSchema.findById(id).lean();
  if (!doc) throw new Error(`${label} introuvable`);
  if (doc.type !== type) throw new Error(`${label} n'est pas du type ${type}`);
  if ((type === "cars" || type === "drivers") && doc.status !== true)
    throw new Error(`${label} inactif`);
  return doc;
}

async function validateAffectationOnCreateOrUpdate(body, excludeId = null) {
  // Normalize ids into ObjectId
  const d = body.data || {};
  if (!d.carId || !d.driverId) {
    // allow PATCH where only status changes; keep current ids
    if (!excludeId) throw new Error("carId et driverId requis");
  } else {
    if (typeof d.carId === "string")
      d.carId = new mongoose.Types.ObjectId(d.carId);
    if (typeof d.driverId === "string")
      d.driverId = new mongoose.Types.ObjectId(d.driverId);
  }

  // if ids supplied, check existence/actifs
  if (d.carId) await requireShared(d.carId, "cars", "Véhicule");
  if (d.driverId) await requireShared(d.driverId, "drivers", "Chauffeur");

  // Figure out which ids we should use during conflict check (payload or current)
  let carId = d.carId;
  let driverId = d.driverId;

  if (!carId || !driverId) {
    // load current doc to get missing ids
    const current = await communSchema.findById(excludeId).lean();
    if (!current) throw new Error("Affectation introuvable");
    if (current.type !== "affectations") throw new Error("Type incorrect");
    carId = carId || current.data?.carId;
    driverId = driverId || current.data?.driverId;
  }

  // When status is true (start/active) we must ensure uniqueness
  const nextStatus = typeof body.status === "boolean" ? body.status : true; // create -> true by default
  if (nextStatus === true) {
    const [carBusy, driverBusy] = await Promise.all([
      communSchema
        .findOne({
          _id: { $ne: excludeId },
          type: "affectations",
          status: true,
          "data.carId": carId,
        })
        .lean(),
      communSchema
        .findOne({
          _id: { $ne: excludeId },
          type: "affectations",
          status: true,
          "data.driverId": driverId,
        })
        .lean(),
    ]);
    if (carBusy) throw new Error("Véhicule déjà affecté");
    if (driverBusy) throw new Error("Chauffeur déjà affecté");
  }

  // auto timestamps in data.*
  if (!excludeId && !d.startAt) body.data.startAt = new Date();
  if (typeof body.status === "boolean" && body.status === false) {
    if (!body.data) body.data = {};
    if (!body.data.endAt) body.data.endAt = new Date();
  }

  body.data = { ...(body.data || {}), carId, driverId }; // ensure both are kept
  return body;
}

// ----- LIST -----
export const getsharedList = async (req, res) => {
  try {
    const { type } = req.params;
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
      populate,
      ...rest
    } = req.query;

    const filter = { type };
    if (typeof status !== "undefined") {
      filter.status = ["true", "1", true, 1, "on"].includes(status);
    }
    Object.keys(rest).forEach((k) => {
      if (k.startsWith("data.")) filter[k] = rest[k];
    });

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      communSchema.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      communSchema.countDocuments(filter),
    ]);

    // Optional populate for affectations
    if (type === "affectations" && String(populate) === "true") {
      const ids = {
        cars: items.map((i) => i?.data?.carId).filter(Boolean),
        drivers: items.map((i) => i?.data?.driverId).filter(Boolean),
      };
      const [cars, drivers] = await Promise.all([
        communSchema
          .find(
            { _id: { $in: ids.cars }, type: "cars" },
            { data: 1, status: 1 }
          )
          .lean(),
        communSchema
          .find(
            { _id: { $in: ids.drivers }, type: "drivers" },
            { data: 1, status: 1 }
          )
          .lean(),
      ]);
      const carMap = new Map(cars.map((c) => [String(c._id), c]));
      const driverMap = new Map(drivers.map((d) => [String(d._id), d]));
      items.forEach((i) => {
        i = i.toObject ? i.toObject() : i;
        i.car = carMap.get(String(i?.data?.carId)) || null;
        i.driver = driverMap.get(String(i?.data?.driverId)) || null;
      });
    }

    res.json({
      data: items,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit || 1)),
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ----- GET BY ID -----
export const getsharedById = async (req, res) => {
  try {
    const result = await communSchema.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: req.params.type + " non trouvé" });
    }
    if (req.params.type && result.type !== req.params.type) {
      return res.status(404).json({ message: req.params.type + " non trouvé" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ----- CREATE -----
export const createShared = async (req, res) => {
  if (!req.body.type || !ALLOWED_TYPES.includes(req.body.type)) {
    return res.status(400).json({ message: "type inconnue" });
  }
  if (typeof req.body.data === "undefined") {
    return res.status(400).json({ message: "empty data" });
  }

  try {
    const body = { ...req.body };

    if (body.type === "affectations") {
      if (typeof body.status === "undefined") body.status = true;
      await validateAffectationOnCreateOrUpdate(body, null);
    }

    const shared = new communSchema(body);
    await shared.save();

    // ✅ Envoi email uniquement pour un nouvel utilisateur
    if (body.type === "users" && body.data?.email) {
      try {
        const token = jwt.sign({ id: shared._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        // 🔹 Définir le lien avec encodage correct du token
        const FRONTEND_URL = process.env.FRONTEND_URL;
        const link = `${FRONTEND_URL}/set-password?token=${encodeURIComponent(
          token
        )}`;
        await transporter.sendMail({
          from: `"Smart Fleet" <${process.env.SMTP_USER}>`,
          to: body.data.email, // ✅ ici on met la vraie adresse de l'utilisateur
          subject: "Bienvenue sur Smart Fleet",
          html: `
            <p>Félicitations 🎉, vous avez été ajouté à Smart Fleet avec le rôle <b>${body.data.type}</b>.</p>
            <p>Veuillez <a href="${link}">cliquer ici</a> pour créer votre mot de passe.</p>
          `,
        });

        console.log(`📧 Email envoyé à ${body.data.email}`);
      } catch (mailErr) {
        console.error("Erreur envoi email:", mailErr);
        // On ne bloque pas la création si l'email échoue
      }
    }

    res.status(201).json(shared);
  } catch (error) {
    res.status(400).json({ message: "Erreur création", error: error.message });
  }
};

// ----- UPDATE -----
export const updateShared = async (req, res) => {
  try {
    const { id } = req.params;

    const current = await communSchema.findById(id);
    if (!current)
      return res.status(404).json({ message: "Elément non trouvé" });
    if (req.params.type && current.type !== req.params.type)
      return res.status(404).json({ message: req.params.type + " non trouvé" });

    // prevent changing type
    if (typeof req.body.type !== "undefined") {
      return res
        .status(400)
        .json({ message: "Modification du type non autorisée" });
    }

    const payload = {};
    if (typeof req.body.status !== "undefined")
      payload.status = !!req.body.status;
    if (typeof req.body.data !== "undefined") payload.data = req.body.data;

    // Affectations: validate conflicts & set dates
    if (current.type === "affectations") {
      const bodyForValidate = {
        status:
          typeof payload.status === "boolean" ? payload.status : current.status,
        data: { ...(current.data || {}), ...(payload.data || {}) },
      };
      await validateAffectationOnCreateOrUpdate(bodyForValidate, id);
      payload.status = bodyForValidate.status;
      payload.data = bodyForValidate.data;
    }

    const updated = await communSchema.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur mise à jour", error: error.message });
  }
};

// ----- DELETE (hard) -----
export const deleteShared = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await communSchema.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Elément non trouvé" });
    res.json({ message: "Supprimé" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur suppression", error: error.message });
  }
};
