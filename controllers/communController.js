// controllers/communController.js
import communSchema from "../models/Commun.js";

const ALLOWED_TYPES = ["enums", "cars", "drivers", "users"];

export const getsharedList = async (req, res) => {
  try {
    const { type } = req.params;

    // Simple filters: status=true/false; any query starting with "data." maps to nested filter
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
      ...rest
    } = req.query;

    const filter = { type };

    if (typeof status !== "undefined") {
      // accept "true"/"false"/"1"/"0"
      filter.status = ["true", "1", true, 1, "on"].includes(status);
    }

    // Allow queries like ?data.brand=Toyota&data.year=2020
    Object.keys(rest).forEach((k) => {
      if (k.startsWith("data.")) {
        filter[k] = rest[k];
      }
    });

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      communSchema.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      communSchema.countDocuments(filter),
    ]);

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

export const getsharedById = async (req, res) => {
  try {
    const result = await communSchema.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: req.params.type + " non trouvé" });
    }
    // Optional: ensure requested :type matches the document's type (prevents cross-type reads)
    if (req.params.type && result.type !== req.params.type) {
      return res.status(404).json({ message: req.params.type + " non trouvé" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const createShared = async (req, res) => {
  if (!req.body.type || !ALLOWED_TYPES.includes(req.body.type)) {
    return res.status(400).json({ message: "type inconnue" });
  }
  if (typeof req.body.data === "undefined") {
    return res.status(400).json({ message: "empty data" });
  }
  try {
    const shared = new communSchema(req.body);
    await shared.save();
    res.status(201).json(shared);
  } catch (error) {
    res.status(400).json({ message: "Erreur création", error: error.message });
  }
};

export const updateShared = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {};

    // Only allow certain fields to be updated
    if (typeof req.body.status !== "undefined")
      payload.status = !!req.body.status;
    if (typeof req.body.data !== "undefined") payload.data = req.body.data;

    // Prevent changing type via update (keep entities consistent)
    if (typeof req.body.type !== "undefined" && req.body.type !== undefined) {
      // if you want to allow changing type, remove this block
      return res
        .status(400)
        .json({ message: "Modification du type non autorisée" });
    }

    const updated = await communSchema.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Elément non trouvé" });
    }

    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur mise à jour", error: error.message });
  }
};

export const deleteShared = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await communSchema.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Elément non trouvé" });
    }

    // (optional) ensure the :type matches the deleted doc’s type
    // if (req.params.type && deleted.type !== req.params.type) {
    //   return res.status(404).json({ message: req.params.type + " non trouvé" });
    // }

    res.json({ message: "Supprimé" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur suppression", error: error.message });
  }
};
